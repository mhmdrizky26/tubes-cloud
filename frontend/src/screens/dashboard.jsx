// Mindspark — Dashboard (data nyata dari /stats)

import React from "react";
import { api } from "../api.js";
import { Icon, SparkBolt } from "../icons.jsx";
import { LangToggle } from "../ui.jsx";

const Dashboard = ({ go, openMaterial, lang, setLang }) => {
  const [stats, setStats] = React.useState(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api.stats(lang).then(setStats).catch((e) => setError(e.message || "Failed to load"));
  }, [lang]);

  const cards = [
    { kick: "Materials", val: stats ? stats.materials : "—", sub: "total uploaded", deco: "stack" },
    { kick: "Questions answered", val: stats ? stats.quizzes_answered : "—", sub: "all attempts", deco: "card" },
    { kick: "Correct answers", val: stats ? stats.correct : "—", sub: "cumulative", deco: "bolt" },
    { kick: "Accuracy", val: stats ? `${stats.accuracy}%` : "—", sub: "correct / total", deco: "ring" },
  ];

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">Dashboard</div>
          <h1>Welcome to <span className="hl">Mindspark</span>.</h1>
          <p className="sub">Your learning at a glance — every number comes from real activity.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LangToggle lang={lang} setLang={setLang} />
          <button className="btn btn--ghost" onClick={() => go("library")}>
            <Icon.book width={16} height={16} /> Library
          </button>
          <button className="btn btn--spark" onClick={() => go("upload")}>
            <Icon.plus width={16} height={16} /> Add material
          </button>
        </div>
      </div>

      {error && <p className="mono" style={{ color: "var(--bad)" }}>{error}</p>}

      {/* Hero */}
      <div className="card" style={{ padding: 24, position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, var(--ink-900) 0%, #2A180A 100%)", color: "var(--cream)", borderColor: "var(--ink-900)", marginBottom: 18 }}>
        <div className="kicker" style={{ color: "var(--ember-500)" }}>Get started</div>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 28, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "8px 0 6px", maxWidth: 520 }}>
          Upload material, then test your understanding with an <span style={{ color: "var(--ember-500)" }}>adaptive quiz</span> & Q&A.
        </h2>
        <p style={{ color: "#D9C3A3", margin: "0 0 18px", maxWidth: 520, fontSize: 14 }}>
          Mindspark reads your documents, writes summaries and quizzes, and answers questions from their content.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn--ember" onClick={() => go("library")}>
            <SparkBolt size={14} color="var(--ink-900)" /> Open materials
          </button>
          <button className="btn" style={{ color: "var(--cream)", border: "1px solid #5a3d22" }} onClick={() => go("upload")}>
            Add material
          </button>
        </div>
        <svg style={{ position: "absolute", right: -20, top: -20, opacity: .25 }} width="220" height="220" viewBox="0 0 200 200">
          <path d="M108 20 L60 110 H92 L80 190 L150 80 H110 L122 20 Z" fill="var(--ember-500)" />
        </svg>
      </div>

      {/* Stat cards (nyata) */}
      <div className="cols-4">
        {cards.map((s, i) => (
          <div className="stat" key={i}>
            <div className="stat__kick">{s.kick}</div>
            <div className="stat__val">{s.val}</div>
            <div className="stat__sub">{s.sub}</div>
            <svg className="stat__deco" width="90" height="90" viewBox="0 0 24 24">
              {s.deco === "bolt" && <path d="M13 2 L4 14 H10 L8 22 L20 9 H13 L15 2 H13 Z" fill="var(--spark-500)" />}
              {s.deco === "ring" && <circle cx="12" cy="12" r="8" stroke="var(--spark-500)" strokeWidth="3" fill="none" />}
              {s.deco === "stack" && <><rect x="4" y="6" width="14" height="13" rx="2" stroke="var(--spark-500)" strokeWidth="2" fill="none" /><path d="M7 3h12v15" stroke="var(--spark-500)" strokeWidth="2" fill="none" /></>}
              {s.deco === "card" && <rect x="4" y="6" width="16" height="12" rx="2" stroke="var(--spark-500)" strokeWidth="2" fill="none" />}
            </svg>
          </div>
        ))}
      </div>

      {/* Materi terbaru (nyata) */}
      <div className="card card--pad" style={{ marginTop: 18 }}>
        <div className="kicker">Recent materials</div>
        <h3 style={{ fontFamily: "var(--display)", fontSize: 20, margin: "4px 0 14px", letterSpacing: "-0.01em" }}>
          Pick up where you left off
        </h3>
        {!stats && <p className="muted">Loading…</p>}
        {stats && stats.recent.length === 0 && (
          <p className="muted">No materials yet. Click "Add material" to start.</p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stats && stats.recent.map((m) => (
            <div key={m.id} style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}
              onClick={() => openMaterial(m)}>
              <span className="spark-mark"><Icon.file width={16} height={16} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>{m.subject || "General"} · {m.file_type}</div>
              </div>
              <span className={`chip chip--${m.status === "ready" ? "ok" : m.status === "failed" ? "bad" : "ember"}`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
