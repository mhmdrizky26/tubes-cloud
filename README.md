# Mindspark — Platform Pembelajaran Adaptif (Cloud Native)

Tugas Besar **Cloud Computing** — SDG **Pendidikan** (pembelajaran adaptif berbasis AI).
Mindspark menerima materi kuliah (PDF/slide/foto catatan), lalu menyediakan **ringkasan**,
**quiz adaptif**, dan **chat tanya-jawab grounded (RAG)** dengan sitasi ke materi asli.

## Arsitektur

```
                 ┌─────────────┐
   Browser  ───► │  Frontend   │  React + Vite (nginx)        [Frontend VPC]
                 └──────┬──────┘
                        │ REST (JWT)
                 ┌──────▼──────┐
                 │  Backend    │  FastAPI — auth, materials,  [Backend VPC]
                 │   API       │  quiz, scoring, proxy chat
                 └──┬───────┬──┘
        httpx       │       │  SQL
            ┌───────▼──┐  ┌─▼─────────────┐
            │ AI       │  │  PostgreSQL   │               [Database VPC]
            │ Service  │  │  + pgvector   │
            │ (RAG)    │──┘ (chunks/users/…)
            └────┬─────┘  SQL                              [AI Service VPC]
                 │
          bge-m3 (self-hosted embedding) + Gemini (LLM)

   Object Storage: Google Cloud Storage (bucket)  ──► MULTI-CLOUD
   (compute di cloud utama, bucket di GCP)
```

## Menjalankan (Docker — semua service sekaligus)

```bash
cp .env.example .env          # isi GEMINI_API_KEY & JWT_SECRET (key opsional, ada mode mock)
docker compose up --build
```

> File `.env` berisi rahasia (API key, JWT secret) dan **tidak** ikut ter-commit
> (sudah masuk `.gitignore`). Gunakan `.env.example` sebagai template.

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API + Swagger | http://localhost:8000/docs |
| AI Service | internal (tidak diekspos) |
| PostgreSQL | internal (tidak diekspos) |

> Catatan: build pertama AI Service mengunduh model `bge-m3` (~2 GB) saat request
> pertama; di-cache di volume `hf_cache`.

## Menjalankan tanpa Docker (dev)

```bash
# Backend
cd backend && python -m venv .venv && .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# AI Service (terminal lain)
cd ai-service && python -m venv .venv && .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

# Frontend (terminal lain)
cd frontend && npm install && npm run dev   # http://localhost:5173
```
Perlu PostgreSQL + pgvector berjalan (lihat `database/schema.sql`).

## Struktur repo

```
app/
├── frontend/      # React + Vite (UI) + Dockerfile + nginx + api.js (klien REST)
├── backend/       # FastAPI — Backend VPC
├── ai-service/    # FastAPI — AI Service VPC (RAG: bge-m3 + Gemini)
├── database/      # schema.sql (PostgreSQL + pgvector)
├── .env.example   # template variabel lingkungan
└── docker-compose.yml
```

## Dokumentasi
- API + Swagger interaktif: http://localhost:8000/docs (saat service jalan)
- Klien REST frontend: [frontend/src/api.js](frontend/src/api.js)