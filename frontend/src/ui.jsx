// Mindspark — komponen UI bersama

import { Icon } from "./icons.jsx";

// Toggle bahasa konten AI (EN / ID) — dipasang di header tiap halaman.
export const LangToggle = ({ lang, setLang }) => (
  <div className="lang-toggle" title="Content language">
    {["en", "id"].map((l) => (
      <button
        key={l}
        className={`lang-toggle__btn ${lang === l ? "is-active" : ""}`}
        onClick={() => setLang(l)}
      >
        {l.toUpperCase()}
      </button>
    ))}
  </div>
);

// Tampilan layar kosong (dipakai Quiz & Flashcards saat tak ada materi/soal).
export const ScreenEmpty = ({ kicker, title, msg, go }) => (
  <div>
    <div className="page-hd">
      <div>
        {kicker && <div className="kicker">{kicker}</div>}
        <h1>{title}</h1>
      </div>
      <button className="btn btn--ghost" onClick={() => go("library")}>
        <Icon.cross width={14} height={14} /> Exit
      </button>
    </div>
    <div className="card card--pad" style={{ textAlign: "center", padding: 56 }}>
      <p className="muted" style={{ margin: 0 }}>{msg}</p>
    </div>
  </div>
);
