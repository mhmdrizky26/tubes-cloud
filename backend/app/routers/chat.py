"""Chat (RAG): proxy ke AI Service yang melakukan retrieval + generation.

Backend API tidak menyimpan API key Gemini — itu hanya ada di AI Service VPC.
"""

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..deps import get_current_user
from ..models import Material, User
from ..schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    # Validasi: hanya boleh bertanya pada materi milik user.
    if payload.material_ids:
        owned = (
            db.query(Material.id)
            .filter(Material.owner_id == current.id, Material.id.in_(payload.material_ids))
            .all()
        )
        owned_ids = {row[0] for row in owned}
        if not owned_ids:
            raise HTTPException(status_code=404, detail="Materi tidak ditemukan")
        material_ids = list(owned_ids)
    else:
        material_ids = [row[0] for row in db.query(Material.id).filter(Material.owner_id == current.id).all()]

    # Belum ada materi → jawab langsung, jangan buang kuota AI.
    if not material_ids:
        return ChatResponse(
            answer="You don't have any materials yet. Upload one from 'Add material', "
            "then ask about its content here.",
            citations=[],
        )

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{settings.ai_service_url}/rag",
                json={
                    "question": payload.question,
                    "material_ids": material_ids,
                    "top_k": payload.top_k,
                    "lang": payload.lang,
                },
            )
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"AI Service tidak tersedia: {exc}")
