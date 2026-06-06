// Mindspark — Library + Upload

import React from "react";
import { api } from "../api.js";
import { Icon, SparkSplash, SparkBolt } from "../icons.jsx";
import { LangToggle } from "../ui.jsx";

// Map materi dari API → bentuk kartu yang dipakai UI.
const fromApi = (m) => ({
  id: m.id,
  title: m.title,
  type: m.file_type || "FILE",
  pages: m.pages || 0,
  subj: m.subject || "General",
  progress: m.status === "ready" ? 100 : m.status === "failed" ? 0 : 40,
  cover: ["", "blue", "violet", "green", "pink"][m.id % 5],
  updated: m.status,
  _api: m, // objek asli untuk diteruskan ke Material
});

const Library = ({ openMaterial, go, lang, setLang }) => {
  const [filter, setFilter] = React.useState("All");
  const [items, setItems] = React.useState(null); // null = loading
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api.listMaterials(lang)
      .then((data) => setItems(data.map(fromApi)))
      .catch((e) => { setError(e.message || "Failed to load"); setItems([]); });
  }, [lang]);

  const loading = items === null;
  const source = items || [];
  // Filter subjek dibangun dari data nyata.
  const subjects = Array.from(new Set(source.map(s => s.subj)));
  const filters = ["All", ...subjects];
  const list = filter === "All" ? source : source.filter(l => l.subj === filter);

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">{source.length} materials · {new Set(source.map(s => s.subj)).size} active subjects</div>
          <h1>Library</h1>
          <p className="sub">Everything you've fed to Mindspark. Open a material to study, quiz, or ask.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LangToggle lang={lang} setLang={setLang} />
          <div className="search">
            <Icon.search width={16} height={16} style={{ color: "var(--ink-500)" }} />
            <input placeholder="Search materials, topics, citations…" />
            <kbd>⌘K</kbd>
          </div>
          <button className="btn btn--spark" onClick={() => go("upload")}>
            <Icon.plus width={16} height={16} /> Add
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`chip ${filter === f ? "chip--ink" : ""}`}
            style={{ cursor: "pointer" }}>
            {f}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <button className="chip"><Icon.chart width={12} height={12} /> Sort: Recent</button>
        <button className="chip">Grid · List</button>
      </div>

      {loading && <p className="muted">Loading materials…</p>}
      {error && <p className="mono" style={{ color: "var(--bad)" }}>{error}</p>}

      {!loading && source.length === 0 && (
        <div className="card card--pad" style={{ textAlign: "center", padding: 56 }}>
          <h3 style={{ marginTop: 0 }}>No materials yet</h3>
          <p className="muted">Upload a PDF, slides, or notes to start learning.</p>
          <button className="btn btn--spark" onClick={() => go("upload")}>
            <Icon.plus width={16} height={16} /> Add material
          </button>
        </div>
      )}

      <div className="cols-4" style={{ gap: 18 }}>
        {list.map(m => (
          <div className="lib-card" key={m.id} onClick={() => openMaterial(m._api || m)}>
            <div className={`lib-card__cover ${m.cover ? `lib-card__cover--${m.cover}` : ""}`}>
              <svg style={{ position: "absolute", right: 10, top: 10, opacity: .55 }} width="44" height="44" viewBox="0 0 24 24">
                {m.type === "PDF" && <Icon.pdf width={32} height={32} style={{ color: "var(--ink-900)" }} />}
                {m.type === "PPTX" && <Icon.slide width={32} height={32} style={{ color: "var(--ink-900)" }} />}
                {(m.type === "PNG" || m.type === "JPG" || m.type === "JPEG") && <Icon.img width={32} height={32} style={{ color: "var(--ink-900)" }} />}
              </svg>
              <span className="lib-card__type">{m.type} · {m.pages}p</span>
            </div>
            <div className="lib-card__body">
              <div className="lib-card__title">{m.title}</div>
              <div className="lib-card__meta">
                <span>{m.subj}</span><span>·</span><span>{m.updated}</span>
              </div>
              <div className="lib-card__progress"><i style={{ width: `${m.progress}%` }} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Upload ----------

const Upload = ({ go, openMaterial, lang, setLang }) => {
  const [phase, setPhase] = React.useState("drop"); // drop | processing | done
  const [hover, setHover] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState("");
  const fileInputRef = React.useRef(null);
  const steps = [
    { l: "Uploading to object storage", s: "multi-cloud bucket", t: "0:02" },
    { l: "Extracting text + scanning structure", s: "content extraction", t: "0:08" },
    { l: "Chunking + embedding for Q&A", s: "Self-hosted bge-m3", t: "0:14" },
    { l: "Generating summary & first quiz set", s: "Gemini · structured JSON", t: "0:21" },
  ];

  // Animasi langkah berjalan selama menunggu respons API (cosmetic).
  React.useEffect(() => {
    if (phase !== "processing") return;
    if (activeStep >= steps.length - 1) return; // langkah terakhir nunggu API
    const t = setTimeout(() => setActiveStep(s => s + 1), 1100);
    return () => clearTimeout(t);
  }, [phase, activeStep]);

  const pickFile = () => fileInputRef.current?.click();

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setError("");
    setPhase("processing");
    setActiveStep(0);
    try {
      const material = await api.uploadMaterial(file, "", lang);
      setActiveStep(steps.length);
      // Selesai → langsung buka halaman materi (tanpa layar "done").
      openMaterial(material);
    } catch (err) {
      setError(err.message || "Upload failed");
      setPhase("drop");
    }
  };

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">New material</div>
          <h1>Feed it to the <span className="hl">spark</span>.</h1>
          <p className="sub">PDF, slides, or a photo of your notes — even messy handwriting works.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LangToggle lang={lang} setLang={setLang} />
          <button className="btn btn--ghost" onClick={() => go("library")}><Icon.back width={16} height={16} /> Back to library</button>
        </div>
      </div>

      {phase === "drop" && (
        <>
          <div className={`dropzone ${hover ? "is-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setHover(true); }}
            onDragLeave={() => setHover(false)}
            onDrop={(e) => { e.preventDefault(); setHover(false); handleFile(e.dataTransfer.files?.[0]); }}>
            <input ref={fileInputRef} type="file" hidden
              accept=".pdf,.pptx,.docx,.txt,.md,.png,.jpg,.jpeg,.heic"
              onChange={(e) => handleFile(e.target.files?.[0])} />
            <div style={{ display: "inline-block" }} className="float">
              <SparkSplash className="" />
            </div>
            <h2>Drop your material here</h2>
            <p>or click to choose a file from your computer</p>
            {error && (
              <div className="mono" style={{ color: "var(--bad)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn--spark btn--lg" onClick={pickFile}>
                <Icon.upload width={16} height={16} /> Choose file
              </button>
            </div>
            <div className="mono muted" style={{ marginTop: 22, fontSize: 12 }}>
              accepts .pdf · .pptx · .docx · .png · .jpg · .heic — up to 100 MB
            </div>
          </div>

          <div className="cols-3" style={{ marginTop: 24 }}>
            {[
              { i: "pdf",   t: "Lecture PDF", s: "Slides, scanned books, research" },
              { i: "slide", t: "Slide decks", s: ".pptx, Keynote exports, Google Slides" },
              { i: "img",   t: "Photo of notes", s: "Even handwritten — Gemini reads it" },
            ].map((c, i) => {
              const I = Icon[c.i];
              return (
                <div className="card card--pad" key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span className="spark-mark"><I width={18} height={18} /></span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.t}</div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{c.s}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {phase === "processing" && (
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", padding: "20px 0 28px" }}>
            <div style={{ display: "inline-block" }} className="pulse">
              <SparkBolt size={56} color="var(--spark-500)" />
            </div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, letterSpacing: "-0.02em", margin: "12px 0 4px" }}>
              Lighting it up…
            </h2>
            <p className="muted">Mindspark is reading <b>{fileName || "your file"}</b>. Just a moment…</p>
          </div>

          <div className="proc">
            {steps.map((s, i) => (
              <div className="proc__row" key={i}>
                <span className={`proc__dot ${i < activeStep ? "is-done" : i === activeStep ? "is-active" : ""}`}>
                  {i < activeStep ? <Icon.check width={12} height={12} /> : i === activeStep ? "" : i + 1}
                </span>
                <div>
                  <div className="proc__label">{s.l}</div>
                  <div className="proc__sub">{s.s}</div>
                </div>
                <div className="proc__time">{i <= activeStep ? s.t : "—"}</div>
              </div>
            ))}
          </div>

          <div className="card card--pad" style={{ marginTop: 16, background: "var(--cream-3)", borderColor: "#E5C99B" }}>
            <div className="kicker">Did you know</div>
            <p style={{ margin: "4px 0 0" }}>
              Your file is stored in <b>object storage</b> (a separate cloud) while compute runs on the main cloud —
              that's what makes Mindspark <b>multi-cloud</b>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export { Library, Upload };
