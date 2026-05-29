# Mindspark — Frontend (React + Vite)

Frontend aplikasi pembelajaran adaptif **Mindspark**.

## Menjalankan

```bash
npm install        # install dependensi
npm run dev        # mode development (http://localhost:5173)
npm run build      # build produksi ke dist/
npm run preview    # pratinjau hasil build
```

## Struktur

```
frontend/
├── index.html              # entry HTML (memuat font + /src/main.jsx)
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx            # mount React root + import styles.css
    ├── App.jsx             # shell + routing antar layar
    ├── styles.css          # design system
    ├── icons.jsx           # ikon SVG + glyph "spark"
    └── screens/
        ├── onboarding.jsx       # Onboarding
        ├── sidebar.jsx          # Sidebar
        ├── dashboard.jsx        # Dashboard
        ├── library_upload.jsx   # Library + Upload
        ├── material.jsx         # Material
        ├── quiz.jsx             # Quiz + QuizResults
        └── chat_flashcards.jsx  # Chat (RAG) + Flashcards
```

## Catatan

- Seluruh data masih **mock/hardcoded** (sesuai prototipe). Langkah berikutnya:
  ganti dengan pemanggilan ke Backend API.
- Routing memakai state sederhana di `App.jsx` (`useState`), belum react-router.
  Cukup untuk demo; bisa ditingkatkan bila diperlukan.
