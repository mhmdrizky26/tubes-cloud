// Mindspark — Library + Upload

import React from "react";
import { Icon, SparkSplash } from "../icons.jsx";

const LIBRARY = [
  { id: "m1", title: "CerdasBelajar Proposal — Cloud Computing", type: "PDF", pages: 9, subj: "Cloud Computing", progress: 72, cover: "", updated: "2h ago", chips: ["multi-cloud", "VPC"] },
  { id: "m2", title: "Distributed Systems · Lecture 04", type: "PPTX", pages: 42, subj: "Distributed Systems", progress: 100, cover: "blue", updated: "yesterday", chips: ["consensus", "raft"] },
  { id: "m3", title: "Handwritten Notes — RAG & Embeddings", type: "Photo", pages: 6, subj: "Machine Learning", progress: 38, cover: "violet", updated: "2d ago", chips: ["RAG", "vectors"] },
  { id: "m4", title: "Database Systems · Indexing Deep Dive", type: "PDF", pages: 24, subj: "Databases", progress: 55, cover: "green", updated: "3d ago", chips: ["B-tree", "LSM"] },
  { id: "m5", title: "Operating Systems · Memory Mgmt", type: "PDF", pages: 18, subj: "OS", progress: 12, cover: "pink", updated: "4d ago", chips: ["paging", "TLB"] },
  { id: "m6", title: "Algoritma — Catatan Tutorial", type: "Photo", pages: 4, subj: "Algorithms", progress: 0, cover: "blue", updated: "1w ago", chips: ["DP", "graph"] },
  { id: "m7", title: "Computer Networks · OSI to QUIC", type: "PPTX", pages: 30, subj: "Networks", progress: 88, cover: "green", updated: "1w ago", chips: ["TCP", "HTTP/3"] },
  { id: "m8", title: "Linear Algebra Crash Notes", type: "PDF", pages: 12, subj: "Math", progress: 64, cover: "violet", updated: "2w ago", chips: ["SVD", "eigen"] },
];

const Library = ({ openMaterial, go }) => {
  const [filter, setFilter] = React.useState("All");
  const filters = ["All", "Cloud Computing", "Distributed Systems", "Machine Learning", "Databases", "OS", "Networks"];
  const list = filter === "All" ? LIBRARY : LIBRARY.filter(l => l.subj === filter);

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">12 materials · 4 active subjects</div>
          <h1>Library</h1>
          <p className="sub">Everything you've fed to Mindspark. Open a material to study, quiz, or ask.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
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

      <div className="cols-4" style={{ gap: 18 }}>
        {list.map(m => (
          <div className="lib-card" key={m.id} onClick={() => openMaterial(m)}>
            <div className={`lib-card__cover ${m.cover ? `lib-card__cover--${m.cover}` : ""}`}>
              <svg style={{ position: "absolute", right: 10, top: 10, opacity: .55 }} width="44" height="44" viewBox="0 0 24 24">
                {m.type === "PDF"   && <Icon.pdf width={32} height={32} style={{ color: "var(--ink-900)" }} />}
                {m.type === "PPTX"  && <Icon.slide width={32} height={32} style={{ color: "var(--ink-900)" }} />}
                {m.type === "Photo" && <Icon.img   width={32} height={32} style={{ color: "var(--ink-900)" }} />}
              </svg>
              <span className="lib-card__type">{m.type} · {m.pages}p</span>
            </div>
            <div className="lib-card__body">
              <div className="lib-card__title">{m.title}</div>
              <div className="lib-card__meta">
                <span>{m.subj}</span><span>·</span><span>{m.updated}</span>
              </div>
              <div className="lib-card__progress"><i style={{ width: `${m.progress}%` }} /></div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {m.chips.map(c => <span key={c} className="chip" style={{ fontSize: 11, padding: "2px 7px" }}>{c}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Upload ----------

const Upload = ({ go }) => {
  const [phase, setPhase] = React.useState("drop"); // drop | processing | done
  const [hover, setHover] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = [
    { l: "Uploading to Object Storage (GCS)", s: "CerdasBelajar_Proposal.pdf · 2.1 MB", t: "0:02" },
    { l: "Extracting text + scanning structure", s: "Gemini multimodal · 9 pages · 1 figure", t: "0:08" },
    { l: "Chunking + embedding for Q&A", s: "Self-hosted bge-m3 · 47 chunks", t: "0:14" },
    { l: "Generating summary & first quiz set", s: "Gemini Flash · structured JSON", t: "0:21" },
  ];

  // Auto-advance
  React.useEffect(() => {
    if (phase !== "processing") return;
    if (activeStep >= steps.length) { setPhase("done"); return; }
    const t = setTimeout(() => setActiveStep(s => s + 1), 1300);
    return () => clearTimeout(t);
  }, [phase, activeStep]);

  const startProcessing = () => { setPhase("processing"); setActiveStep(0); };

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">New material</div>
          <h1>Feed it to the <span className="hl">spark</span>.</h1>
          <p className="sub">PDF, slides, or a photo of your notes — even messy handwriting works.</p>
        </div>
        <button className="btn btn--ghost" onClick={() => go("library")}><Icon.back width={16} height={16} /> Back to library</button>
      </div>

      {phase === "drop" && (
        <>
          <div className={`dropzone ${hover ? "is-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setHover(true); }}
            onDragLeave={() => setHover(false)}
            onDrop={(e) => { e.preventDefault(); setHover(false); startProcessing(); }}>
            <div style={{ display: "inline-block" }} className="float">
              <SparkSplash className="" />
            </div>
            <h2>Drop your material here</h2>
            <p>or paste a link to a Google Drive / Notion page</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn--spark btn--lg" onClick={startProcessing}>
                <Icon.upload width={16} height={16} /> Choose file
              </button>
              <button className="btn btn--ghost btn--lg">
                <Icon.paperclip width={16} height={16} /> Paste link
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
            <p className="muted">Mindspark is reading <b>CerdasBelajar_Proposal.pdf</b>. This usually takes ~20 seconds.</p>
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
              Your file lives in <span className="mono">gcs://mindspark-materials</span> while compute runs on AWS — that's
              what makes Mindspark <b>multi-cloud</b>.
            </p>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div style={{ maxWidth: 680, margin: "40px auto", textAlign: "center" }}>
          <div className="rise" style={{ display: "inline-block" }}>
            <SparkSplash />
          </div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 36, letterSpacing: "-0.02em", margin: "12px 0 6px" }}>
            <span className="hl">Spark ready.</span>
          </h2>
          <p className="muted" style={{ maxWidth: 460, margin: "0 auto 20px" }}>
            We summarised 9 pages into a 2-minute read and prepared a 10-question adaptive quiz.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn--spark btn--lg" onClick={() => go("material")}>
              <Icon.book width={16} height={16} /> Read summary
            </button>
            <button className="btn btn--prim btn--lg" onClick={() => go("quiz")}>
              <SparkBolt size={16} color="white" /> Start quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { Library, Upload };
