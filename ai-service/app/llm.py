"""Wrapper Gemini untuk generation (jawaban RAG, ringkasan, quiz).

Jika GEMINI_API_KEY kosong → mode mock (tetap jalan untuk dev/demo tanpa key).
Jika Gemini error (quota 429, jaringan, dll) → fallback anggun berbasis konteks,
sehingga API tidak pernah balas 500 saat demo.
Hanya service inilah yang memegang API key Gemini (isolasi di AI Service VPC).
"""

from __future__ import annotations

import json

from .config import settings


def _candidates():
    """Urutan percobaan: tiap API KEY × tiap MODEL.
    Habiskan semua model satu key dulu, baru pindah ke key berikutnya."""
    for key in settings.gemini_api_keys:
        for model in settings.gemini_models:
            yield key, model


def _generate(prompt: str, json_mode: bool = False) -> str:
    import google.generativeai as genai
    from google.api_core.exceptions import ResourceExhausted

    generation_config = {"response_mime_type": "application/json"} if json_mode else None
    last_err = None
    for key, name in _candidates():
        try:
            genai.configure(api_key=key)
            model = genai.GenerativeModel(name, generation_config=generation_config)
            return model.generate_content(prompt).text
        except ResourceExhausted as e:
            last_err = e  # key/model ini habis → coba kombinasi berikutnya
            continue
    raise last_err or RuntimeError("Semua API key & model Gemini habis kuotanya")


# ── Baca gambar / foto (Gemini multimodal — OCR + deskripsi) ────────
def transcribe_image(image_bytes: bytes, mime_type: str | None = None) -> str:
    """Ekstrak teks & deskripsi dari gambar/foto memakai Gemini vision.
    Tanpa API key → kembalikan string kosong (OCR butuh model)."""
    if not settings.gemini_api_keys:
        return ""
    import google.generativeai as genai
    from google.api_core.exceptions import ResourceExhausted

    prompt = (
        "Read this image. Transcribe ALL visible text (including handwriting) as "
        "accurately as possible, then briefly describe the content/context in English. "
        "If there is no text, just describe what the image shows."
    )
    part = {"mime_type": mime_type or "image/png", "data": image_bytes}
    for key, name in _candidates():
        try:
            genai.configure(api_key=key)
            return genai.GenerativeModel(name).generate_content([prompt, part]).text or ""
        except ResourceExhausted:
            continue  # key/model habis → coba berikutnya
        except Exception:
            return ""
    return ""


# ── Jawaban RAG ────────────────────────────────────────────────────
def _context_only_answer(question: str, contexts: list[dict], note: str) -> str:
    if not contexts:
        return f"{note}\nNo relevant context found in your material for: {question}"
    joined = "\n\n".join(f"• {c['content'][:300]}…" for c in contexts[:3])
    return f"{note}\nQuestion: {question}\n\nMost relevant excerpts from your material:\n{joined}"


def answer_with_context(question: str, contexts: list[dict], lang: str = "en") -> str:
    if not settings.gemini_api_key:
        return _context_only_answer(
            question, contexts, "[MOCK — set GEMINI_API_KEY for real answers]"
        )

    lang_name = "Indonesian" if lang == "id" else "English"
    context_block = "\n\n".join(
        f"[Material #{c['material_id']} section {c['chunk_index']}]\n{c['content']}"
        for c in contexts
    )
    prompt = (
        "Answer the question using ONLY the context below. "
        "If it is not in the context, say it is not in the material. "
        f"Reply in {lang_name} and include brief reasoning.\n\n"
        f"=== CONTEXT ===\n{context_block}\n\n=== QUESTION ===\n{question}"
    )
    try:
        return _generate(prompt)
    except Exception as exc:  # quota/limit/network → still answer from context
        return _context_only_answer(
            question, contexts, f"[Gemini unavailable ({type(exc).__name__}); answer from material context]"
        )


# ── Ringkasan + quiz dari materi ───────────────────────────────────
def _mock_summary_quiz(note_en: str, note_id: str) -> dict:
    return {
        "summary": {
            "en": f"{note_en} The material was received and embedded for RAG.",
            "id": f"{note_id} Materi diterima dan sudah di-embed untuk RAG.",
        },
        "quiz": [
            {
                "question": {
                    "en": "Sample question (fallback) — what is the main topic of this material?",
                    "id": "Contoh soal (fallback) — apa topik utama materi ini?",
                },
                "options": {
                    "en": ["Option A", "Option B", "Option C", "Option D"],
                    "id": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
                },
                "answer_index": 0,
                "explanation": {
                    "en": "Fallback question; enable Gemini (with quota) for real ones.",
                    "id": "Soal fallback; aktifkan Gemini (kuota cukup) untuk soal nyata.",
                },
                "difficulty": "easy",
            }
        ],
    }


def summarize_and_quiz(text: str, n_questions: int = 5) -> dict:
    """Hasilkan ringkasan + quiz DWIBAHASA (en & id) dalam satu panggilan."""
    if not settings.gemini_api_key:
        return _mock_summary_quiz(
            "[MOCK] A summary will be generated by Gemini once GEMINI_API_KEY is set.",
            "[MOCK] Ringkasan akan dibuat Gemini setelah GEMINI_API_KEY di-set.",
        )

    prompt = (
        "From the material below, produce JSON with this EXACT structure. "
        "Provide EVERY text field in BOTH English (en) and Indonesian (id):\n"
        '{"summary": {"en": string, "id": string}, '
        '"quiz": [{"question": {"en": string, "id": string}, '
        '"options": {"en": [4 strings], "id": [4 strings]}, '
        '"answer_index": int 0-3, "explanation": {"en": string, "id": string}, '
        '"difficulty": "easy"|"medium"|"hard"}]}\n'
        "The summary is 2-3 paragraphs. The en and id options must be in the SAME order "
        f"(answer_index applies to both). Create {n_questions} multiple-choice questions. "
        f"Return ONLY JSON.\n\n=== MATERIAL ===\n{text[:30000]}"
    )
    try:
        raw = _generate(prompt, json_mode=True)
    except Exception as exc:  # quota/limit → fallback so upload still succeeds
        return _mock_summary_quiz(
            f"[Gemini unavailable ({type(exc).__name__}); fallback summary.]",
            f"[Gemini tidak tersedia ({type(exc).__name__}); ringkasan fallback.]",
        )
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        snippet = raw[:2000]
        return {"summary": {"en": snippet, "id": snippet}, "quiz": []}
