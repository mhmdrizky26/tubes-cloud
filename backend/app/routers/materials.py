"""Materials: upload file → simpan ke bucket → kirim ke AI Service untuk
ekstraksi teks, chunk+embedding (RAG), ringkasan, dan generate quiz."""

import base64

import httpx
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..deps import get_current_user, owned_material
from ..extract import extract_text, is_image
from ..i18n import dump, pick_text
from ..models import Material, Quiz, User
from ..schemas import MaterialOut
from ..storage import upload_bytes

router = APIRouter(prefix="/materials", tags=["materials"])


def _material_out(m: Material, lang: str) -> MaterialOut:
    """MaterialOut dengan summary diambil sesuai bahasa (summary disimpan dwibahasa)."""
    out = MaterialOut.model_validate(m)
    out.summary = pick_text(m.summary, lang)
    return out


def _bi(value) -> dict:
    """Normalisasi field teks jadi dict dwibahasa {en,id}; isi yang kosong dari yang ada."""
    if isinstance(value, dict):
        en = value.get("en") or value.get("id") or ""
        idn = value.get("id") or value.get("en") or ""
        return {"en": str(en), "id": str(idn)}
    s = str(value or "")
    return {"en": s, "id": s}


def _bi_options(value) -> dict | None:
    """Normalisasi opsi jadi {en:[...], id:[...]} dengan panjang sama; None jika tak valid."""
    if isinstance(value, dict):
        en = value.get("en") or value.get("id") or []
        idn = value.get("id") or value.get("en") or []
    elif isinstance(value, list):  # satu bahasa
        en = idn = value
    else:
        return None
    if not (isinstance(en, list) and isinstance(idn, list) and len(en) >= 2):
        return None
    if len(idn) != len(en):  # samakan panjang biar answer_index konsisten
        idn = en
    return {"en": [str(o) for o in en], "id": [str(o) for o in idn]}


@router.get("", response_model=list[MaterialOut])
def list_materials(lang: str = "en", db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    materials = (
        db.query(Material)
        .filter(Material.owner_id == current.id)
        .order_by(Material.created_at.desc())
        .all()
    )
    return [_material_out(m, lang) for m in materials]


@router.get("/{material_id}", response_model=MaterialOut)
def get_material(material_id: int, lang: str = "en", db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    return _material_out(owned_material(db, material_id, current), lang)


@router.post("", response_model=MaterialOut, status_code=201)
async def upload_material(
    file: UploadFile = File(...),
    subject: str = Form(""),
    lang: str = Form("en"),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    data = await file.read()
    filename = file.filename or "upload"
    storage_uri = upload_bytes(filename, data, file.content_type or "application/octet-stream")
    text = extract_text(filename, data, file.content_type)
    img = is_image(filename, file.content_type)

    material = Material(
        owner_id=current.id,
        title=filename,
        subject=subject,
        file_type=(filename.rsplit(".", 1)[-1].upper() if "." in filename else "FILE"),
        storage_uri=storage_uri,
        status="processing",
    )
    db.add(material)
    db.commit()
    db.refresh(material)

    # Bukan gambar & tak ada teks (mis. file rusak) → jangan buang kuota AI.
    if not text.strip() and not img:
        material.status = "ready"
        material.summary = (
            "No text could be extracted from this file. "
            "Upload a PDF/DOCX/PPTX/text or a photo containing writing to get a summary & quiz."
        )
        db.commit()
        db.refresh(material)
        return _material_out(material, lang)

    # Gambar → kirim bytes (base64) supaya dibaca Gemini vision di AI Service.
    image_b64 = base64.b64encode(data).decode() if (img and not text.strip()) else None

    # Panggil AI Service (VPC terpisah) untuk ingest: (vision/ekstrak) → chunk → embed → ringkas + quiz.
    try:
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                f"{settings.ai_service_url}/ingest",
                json={
                    "material_id": material.id,
                    "filename": filename,
                    "content_type": file.content_type,
                    # teks hasil ekstraksi (PDF/DOCX/PPTX/txt). Gambar → image_b64.
                    "raw_text": text[:200_000],
                    "image_b64": image_b64,
                },
            )
            resp.raise_for_status()
            result = resp.json()

        summary = result.get("summary")
        material.summary = dump(_bi(summary)) if summary else ""
        material.pages = result.get("pages", 0)
        material.status = "ready"

        for q in result.get("quiz", []):
            # Lewati item malformed agar 1 soal rusak tidak menggagalkan seluruh materi.
            options = _bi_options(q.get("options"))
            question = _bi(q.get("question"))
            if options is None or not (question["en"] or question["id"]):
                continue
            ans = q.get("answer_index", 0)
            if not isinstance(ans, int) or not (0 <= ans < len(options["en"])):
                ans = 0  # clamp ke index valid
            db.add(
                Quiz(
                    material_id=material.id,
                    question=dump(question),
                    options=dump(options),
                    answer_index=ans,
                    explanation=dump(_bi(q.get("explanation"))),
                    difficulty=str(q.get("difficulty", "medium")),
                )
            )
        db.commit()
        db.refresh(material)
    except Exception as exc:  # AI service down → material still saved, status failed
        material.status = "failed"
        material.summary = f"AI processing failed: {exc}"
        db.commit()
        db.refresh(material)

    return _material_out(material, lang)
