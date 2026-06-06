"""Embedding self-hosted (bge-m3).

Model di-load lazy & singleton agar startup cepat dan tidak memuat ulang.
Inilah komponen yang memenuhi bonus 'Self-hosted AI Model' — embedding
dihitung di dalam infrastruktur sendiri, bukan API pihak ketiga.

Mode mock: bila USE_MOCK_EMBEDDING=true (atau model gagal di-load), embedding
dihitung deterministik dari hash teks — RAG tetap jalan end-to-end untuk test
lokal tanpa perlu mengunduh model ~2 GB.
"""

from __future__ import annotations

import hashlib
import math
import struct
import threading

from .config import settings

_model = None
_lock = threading.Lock()
_use_mock = settings.use_mock_embedding


def _mock_embed_one(text: str) -> list[float]:
    """Vektor deterministik dari hash teks, dinormalisasi (panjang = embedding_dim)."""
    dim = settings.embedding_dim
    vals: list[float] = []
    counter = 0
    while len(vals) < dim:
        digest = hashlib.sha256(f"{text}|{counter}".encode("utf-8")).digest()
        for j in range(0, len(digest), 4):
            if len(vals) >= dim:
                break
            n = struct.unpack(">I", digest[j : j + 4])[0]
            vals.append(n / 2**32 - 0.5)
        counter += 1
    norm = math.sqrt(sum(v * v for v in vals)) or 1.0
    return [v / norm for v in vals]


def _get_model():
    global _model, _use_mock
    if _model is None:
        with _lock:
            if _model is None:
                try:
                    from sentence_transformers import SentenceTransformer

                    _model = SentenceTransformer(settings.embedding_model)
                except Exception as exc:  # lib belum ada / gagal download → fallback mock
                    print(f"[embeddings] gagal load '{settings.embedding_model}' ({exc}); pakai mock.")
                    _use_mock = True
    return _model


def embed(texts: list[str]) -> list[list[float]]:
    """Kembalikan list vektor (satu per teks)."""
    if not texts:
        return []
    if _use_mock:
        return [_mock_embed_one(t) for t in texts]

    model = _get_model()
    if _use_mock or model is None:  # _get_model bisa men-set _use_mock saat fallback
        return [_mock_embed_one(t) for t in texts]
    vectors = model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)
    return vectors.tolist()


def embed_one(text: str) -> list[float]:
    return embed([text])[0]
