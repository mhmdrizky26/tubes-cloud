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

Pemetaan ke **komponen wajib** tugas:

| Wajib | Implementasi |
|---|---|
| Frontend | `frontend/` — React + Vite, build → nginx |
| Backend / API | `backend/` — FastAPI |
| Database | PostgreSQL (`database/schema.sql`) |
| Object Storage | Google Cloud Storage (`backend/app/storage.py`) |
| Docker | Dockerfile tiap service + `docker-compose.yml` |
| CDN | nginx (frontend); siap di depan CDN cloud |
| VPC | segmentasi via network terpisah di compose (Frontend/Backend/AI/DB) |
| AI Service | `ai-service/` — RAG: bge-m3 + Gemini |

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

## Status & langkah berikutnya
- [x] Frontend (UI React + Vite)
- [x] Backend API + AI Service + Database + Docker Compose
- [x] UI frontend tersambung ke API (`frontend/src/api.js` + semua screen, data mock → REST)
- [x] Dockerisasi frontend (Dockerfile + nginx + `.dockerignore`)
- [x] Manajemen secret via `.env` / `.env.example` (rahasia tidak ter-commit)
- [ ] CI/CD GitHub Actions (Build → Test → Dockerize → Push → Deploy)
- [ ] Deploy ke cloud + VPC nyata + CDN; bonus: Terraform, monitoring, K8s
