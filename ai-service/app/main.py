"""Mindspark AI Service (AI Service VPC).

Tanggung jawab:
  • /ingest — chunk teks materi → embedding self-hosted (bge-m3) → simpan ke
              pgvector, lalu ringkas + generate quiz via Gemini.
  • /rag    — embed pertanyaan → retrieve top-k chunk → jawab via Gemini,
              lengkap dengan sitasi.

Hanya service ini yang memegang API key Gemini & model embedding — sesuai
isolasi VPC pada proposal.
"""

from fastapi import FastAPI
from pydantic import BaseModel, Field

from .chunking import chunk_text
from .config import settings
from .db import save_chunks, search
from .embeddings import embed, embed_one
from .llm import answer_with_context, summarize_and_quiz, transcribe_image

app = FastAPI(
    title="Mindspark AI Service",
    description="RAG engine: embedding self-hosted (bge-m3) + Gemini.",
    version="0.1.0",
)


# ── Schemas ────────────────────────────────────────────────────────
class IngestRequest(BaseModel):
    material_id: int
    filename: str = ""
    content_type: str | None = None
    raw_text: str = ""
    image_b64: str | None = None  # gambar/foto (base64) → dibaca Gemini vision


class IngestResponse(BaseModel):
    material_id: int
    chunks: int
    pages: int
    summary: dict | str = ""   # dwibahasa {en,id} atau string (mode kosong)
    quiz: list[dict] = Field(default_factory=list)


class RagRequest(BaseModel):
    question: str
    material_ids: list[int] = Field(default_factory=list)
    top_k: int = settings.top_k
    lang: str = "en"  # bahasa jawaban: "en" | "id"


class Citation(BaseModel):
    source: str
    quote: str


class RagResponse(BaseModel):
    answer: str
    citations: list[Citation] = Field(default_factory=list)


# ── Endpoints ──────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "ai-service", "embedding_model": settings.embedding_model}


@app.post("/ingest", response_model=IngestResponse, tags=["rag"])
def ingest(req: IngestRequest):
    text = req.raw_text

    # Gambar/foto → baca pakai Gemini vision (OCR + deskripsi) jadi teks.
    if not text.strip() and req.image_b64:
        import base64

        try:
            img = base64.b64decode(req.image_b64)
            text = transcribe_image(img, req.content_type)
        except Exception:
            text = ""

    # Tetap kosong → tidak ada yang bisa diproses; hindari panggilan AI sia-sia.
    if not text.strip():
        return IngestResponse(
            material_id=req.material_id, chunks=0, pages=0,
            summary="No text/content could be processed from this file.", quiz=[],
        )

    chunks = chunk_text(text)
    if chunks:
        vectors = embed(chunks)
        save_chunks(req.material_id, chunks, vectors)

    result = summarize_and_quiz(text)
    pages = max(1, len(text) // 1800)

    return IngestResponse(
        material_id=req.material_id,
        chunks=len(chunks),
        pages=pages,
        summary=result.get("summary", ""),
        quiz=result.get("quiz", []),
    )


# Penanda jawaban "tidak ditemukan di materi" → jangan tampilkan sitasi
# (mis. saat user menyapa "halo"), supaya kotak sitasi tidak menyesatkan.
_NOT_FOUND_MARKERS = (
    "not in the material",
    "not in the context",
    "not found in the material",
    "cannot be answered",
    "no relevant context",
    "tidak ada di materi",
    "tidak ada dalam materi",
    "tidak ada di konteks",
    "tidak ditemukan",
)


@app.post("/rag", response_model=RagResponse, tags=["rag"])
def rag(req: RagRequest):
    query_vec = embed_one(req.question)
    hits = search(query_vec, req.material_ids, req.top_k)
    answer = answer_with_context(req.question, hits, req.lang)

    low = answer.lower()
    grounded = not any(m in low for m in _NOT_FOUND_MARKERS)
    citations = (
        [
            Citation(
                source=f"Materi #{h['material_id']} · bagian {h['chunk_index']}",
                quote=h["content"][:240],
            )
            for h in hits[:3]
        ]
        if grounded
        else []
    )
    return RagResponse(answer=answer, citations=citations)
