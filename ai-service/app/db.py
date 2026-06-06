"""Akses pgvector untuk simpan/cari chunk embedding.

Memakai psycopg2 langsung (tanpa ORM) supaya operasi vektor pgvector eksplisit.
"""

from contextlib import closing

import psycopg2

from .config import settings


def _conn():
    return psycopg2.connect(settings.database_url)


def _vec_literal(vec: list[float]) -> str:
    # Format literal pgvector: '[0.1,0.2,...]'
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"


def save_chunks(material_id: int, chunks: list[str], vectors: list[list[float]]) -> None:
    # closing() memastikan koneksi DITUTUP (with psycopg2 hanya commit/rollback,
    # tidak menutup koneksi → tanpa ini koneksi bocor sampai "too many clients").
    with closing(_conn()) as conn:
        with conn.cursor() as cur:
            # Hapus chunk lama materi ini (idempotent saat re-ingest)
            cur.execute("DELETE FROM chunks WHERE material_id = %s", (material_id,))
            for idx, (text, vec) in enumerate(zip(chunks, vectors)):
                cur.execute(
                    "INSERT INTO chunks (material_id, chunk_index, content, embedding) "
                    "VALUES (%s, %s, %s, %s::vector)",
                    (material_id, idx, text, _vec_literal(vec)),
                )
        conn.commit()


def search(query_vec: list[float], material_ids: list[int], top_k: int) -> list[dict]:
    """Cari top-k chunk paling mirip (cosine distance) dalam materi tertentu."""
    if not material_ids:
        return []
    with closing(_conn()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT material_id, chunk_index, content, "
                "1 - (embedding <=> %s::vector) AS score "
                "FROM chunks "
                "WHERE material_id = ANY(%s) "
                "ORDER BY embedding <=> %s::vector "
                "LIMIT %s",
                (_vec_literal(query_vec), material_ids, _vec_literal(query_vec), top_k),
            )
            rows = cur.fetchall()
    return [
        {"material_id": r[0], "chunk_index": r[1], "content": r[2], "score": float(r[3])}
        for r in rows
    ]
