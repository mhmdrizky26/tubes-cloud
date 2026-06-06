// Mindspark — Material detail (ringkasan nyata dari backend)

import React from "react";
import { api } from "../api.js";
import { Icon, SparkBolt } from "../icons.jsx";
import { LangToggle } from "../ui.jsx";

const Material = ({ go, material, lang, setLang }) => {
  const [tab, setTab] = React.useState("summary");
  const [detail, setDetail] = React.useState(material || null);

  React.useEffect(() => {
    setDetail(material || null);
    if (material?.id) {
      api.getMaterial(material.id, lang).then(setDetail).catch(() => {});
    }
  }, [material, lang]);

  // Tanpa materi aktif → arahkan ke library.
  if (!material?.id) {
    return (
      <div>
        <div className="page-hd">
          <div><div className="kicker">Material</div><h1>No material selected</h1></div>
        </div>
        <div className="card card--pad" style={{ textAlign: "center", padding: 56 }}>
          <p className="muted">Pick a material from the Library to see its summary.</p>
          <button className="btn btn--spark" onClick={() => go("library")}>
            <Icon.book width={16} height={16} /> Open Library
          </button>
        </div>
      </div>
    );
  }

  const title = detail?.title || material.title || "Materi";
  const summary = detail?.summary;

  return (
    <div>
      <div className="page-hd">
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => go("library")} style={{ marginBottom: 10 }}>
            <Icon.back width={14} height={14} /> Library
          </button>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
            <span className="chip chip--ink">{detail?.file_type || material.file_type} · {detail?.pages ?? material.pages ?? 0}p</span>
            <span className="kicker" style={{ color: "var(--ink-500)" }}>{detail?.subject || material.subject || "General"}</span>
          </div>
          <h1 style={{ maxWidth: 720 }}>{title}</h1>
          <p className="sub">Status: {detail?.status || material.status || "—"}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LangToggle lang={lang} setLang={setLang} />
          <button className="btn btn--ghost" onClick={() => go("chat")}>
            <Icon.chat width={14} height={14} /> Ask
          </button>
          <button className="btn btn--prim" onClick={() => go("quiz")}>
            <SparkBolt size={14} color="var(--ember-500)" /> Start quiz
          </button>
        </div>
      </div>

      <div className="tabs">
        {[
          { id: "summary",    label: "Summary",    icon: "book" },
          { id: "quiz",       label: "Quiz",       icon: "quiz" },
          { id: "flashcards", label: "Flashcards", icon: "cards" },
          { id: "chat",       label: "Ask",        icon: "chat" },
        ].map(t => {
          const I = Icon[t.icon];
          return (
            <button key={t.id} className={`tab ${tab === t.id ? "is-active" : ""}`} onClick={() => setTab(t.id)}>
              <I width={14} height={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "summary" && (
        <div className="cols-2" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
          <div>
            <div className="summary-block">
              <h3><SparkBolt size={16} color="var(--spark-500)" /> Summary</h3>
              {summary ? (
                <p style={{ lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{summary}</p>
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  {detail?.status === "processing"
                    ? "Being processed by AI… reload in a moment."
                    : "No summary available for this material yet."}
                </p>
              )}
            </div>
          </div>

          {/* Right rail: info + quick actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card card--pad">
              <div className="kicker">Material info</div>
              <div style={{ marginTop: 10, fontSize: 14, lineHeight: 2, color: "var(--ink-700)" }}>
                <div>Type · <b>{detail?.file_type || material.file_type}</b></div>
                <div>Pages · <b>{detail?.pages ?? material.pages ?? 0}</b></div>
                <div>Subject · <b>{detail?.subject || material.subject || "General"}</b></div>
                <div>Status · <b>{detail?.status || material.status}</b></div>
              </div>
            </div>

            <div className="card card--pad" style={{ background: "var(--ink-900)", color: "var(--cream)", borderColor: "var(--ink-900)" }}>
              <div className="kicker" style={{ color: "var(--ember-500)" }}>Quick actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                <button className="btn btn--ember" onClick={() => go("quiz")} style={{ justifyContent: "flex-start" }}>
                  <Icon.quiz width={14} height={14} /> Take the quiz
                </button>
                <button className="btn btn--ember" onClick={() => go("flashcards")} style={{ justifyContent: "flex-start" }}>
                  <Icon.cards width={14} height={14} /> Open flashcards
                </button>
                <button className="btn btn--ember" onClick={() => go("chat")} style={{ justifyContent: "flex-start" }}>
                  <Icon.chat width={14} height={14} /> Ask about this material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "quiz" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <button className="btn btn--spark btn--lg" onClick={() => go("quiz")}>Start quiz <Icon.arrow width={16} height={16} /></button>
        </div>
      )}
      {tab === "flashcards" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <button className="btn btn--spark btn--lg" onClick={() => go("flashcards")}>Open flashcards <Icon.arrow width={16} height={16} /></button>
        </div>
      )}
      {tab === "chat" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <button className="btn btn--spark btn--lg" onClick={() => go("chat")}>Open chat <Icon.arrow width={16} height={16} /></button>
        </div>
      )}
    </div>
  );
};

export { Material };
