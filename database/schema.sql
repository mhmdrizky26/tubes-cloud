-- ════════════════════════════════════════════════════════════════
-- Mindspark — PostgreSQL schema (Database VPC)
-- Dijalankan otomatis saat container db pertama kali init
-- (lihat docker-compose: mount ke /docker-entrypoint-initdb.d).
-- ════════════════════════════════════════════════════════════════

-- pgvector untuk RAG (penyimpanan & pencarian embedding)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Users ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    name          VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Materials ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materials (
    id          SERIAL PRIMARY KEY,
    owner_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    subject     VARCHAR(120) NOT NULL DEFAULT '',
    file_type   VARCHAR(20)  NOT NULL DEFAULT 'PDF',
    pages       INTEGER      NOT NULL DEFAULT 0,
    storage_uri TEXT         NOT NULL DEFAULT '',   -- gcs://... (multi-cloud bucket)
    summary     TEXT         NOT NULL DEFAULT '',
    status      VARCHAR(20)  NOT NULL DEFAULT 'processing',  -- processing|ready|failed
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_materials_owner ON materials(owner_id);

-- ── Chunks + embedding (RAG / pgvector) ─────────────────────────
-- Dimensi 1024 = output bge-m3 (self-hosted embedding).
CREATE TABLE IF NOT EXISTS chunks (
    id          SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content     TEXT    NOT NULL,
    embedding   VECTOR(1024)
);
CREATE INDEX IF NOT EXISTS idx_chunks_material ON chunks(material_id);
-- Index ANN cosine (dibuat setelah ada data agar optimal; aman dibuat di awal).
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
    ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ── Quizzes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
    id           SERIAL PRIMARY KEY,
    material_id  INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    question     TEXT NOT NULL,
    options      TEXT NOT NULL,            -- JSON array string: ["A","B","C","D"]
    answer_index INTEGER NOT NULL,
    explanation  TEXT NOT NULL DEFAULT '',
    difficulty   VARCHAR(10) NOT NULL DEFAULT 'medium'  -- easy|medium|hard
);
CREATE INDEX IF NOT EXISTS idx_quizzes_material ON quizzes(material_id);

-- ── Attempts (riwayat jawaban → adaptive scoring) ───────────────
CREATE TABLE IF NOT EXISTS attempts (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id      INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    chosen_index INTEGER NOT NULL,
    correct      BOOLEAN NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
