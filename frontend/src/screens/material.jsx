// Mindspark — Material detail (summary + explain-again)

import React from "react";
import { Icon, SparkBolt } from "../icons.jsx";

const Material = ({ go }) => {
  const [tab, setTab] = React.useState("summary");
  const [explainMode, setExplainMode] = React.useState(null); // null | "simple" | "analogy" | "example"

  const explainTexts = {
    simple: {
      title: "Like you're 12",
      body: "Imagine your school has different buildings: one for classrooms (frontend), one for the principal's office (backend), one for the library (database), and one for the IT room (AI). They all do different jobs but they're all on the same campus, with walls and security gates between them. That's basically a VPC.",
    },
    analogy: {
      title: "Analogy",
      body: "A VPC is like an apartment in a giant building. The building is the cloud (AWS). Your apartment has its own door, key, and rooms — nobody else can walk in. Multi-cloud means you also rent a storage unit in a different building across the street (GCP), so even if your main building loses power, your stuff isn't all in one place.",
    },
    example: {
      title: "Concrete example",
      body: "When a student uploads notes, the file travels: Browser → CDN → Frontend VPC (React) → Backend VPC (REST) → AI Service VPC (Gemini wrapper) → Storage VPC → GCS bucket. Each hop crosses a network boundary the security team can audit.",
    },
  };

  return (
    <div>
      <div className="page-hd">
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => go("library")} style={{ marginBottom: 10 }}>
            <Icon.back width={14} height={14} /> Library
          </button>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
            <span className="chip chip--ink">PDF · 9p</span>
            <span className="kicker" style={{ color: "var(--ink-500)" }}>Cloud Computing</span>
          </div>
          <h1 style={{ maxWidth: 720 }}>CerdasBelajar Proposal — Cloud Computing</h1>
          <p className="sub">Last opened 2 hours ago · 72% studied · 47 chunks indexed for Q&A</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn--ghost"><Icon.more width={16} height={16} /></button>
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
          { id: "source",     label: "Source",     icon: "file" },
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
              <h3><SparkBolt size={16} color="var(--spark-500)" /> Spark notes · the 30-second version</h3>
              <p style={{ lineHeight: 1.65, margin: 0 }}>
                CerdasBelajar (now <b>Mindspark</b>) is a cloud-native learning app that turns any uploaded
                material into active study tools — summaries, adaptive quizzes, flashcards, and a
                tutor that answers from <i>your</i> own documents.
                The architecture isolates each component in its own <span className="mono">VPC</span> and
                runs compute on AWS while object storage lives on GCS, satisfying the multi-cloud
                requirement.
              </p>
            </div>

            <div className="summary-block">
              <h3><Icon.star width={16} height={16} style={{ color: "var(--ember-500)" }} /> Key points</h3>
              <ul>
                {[
                  ["The AI layer", "Google Gemini Flash handles multimodal input (PDF, slides, handwriting), structured JSON output for quizzes, and long-context summarisation."],
                  ["Why isolate AI", "A separate AI Service VPC contains API keys, caching, and rate limits — heavy AI traffic can't bring down the main API."],
                  ["Multi-cloud split", "Compute (frontend, backend, AI, DB) on AWS · object storage on Google Cloud Storage. Demonstrates vendor independence."],
                  ["Adaptive quiz logic", "User answers are stored in the DB; the system raises or lowers difficulty and focuses on weak topics — the heart of adaptive learning."],
                  ["RAG with self-hosted embeddings", "Material is chunked, embedded with an open-source model (bonus +5), retrieved at query time, and only then handed to Gemini for grounded answers."],
                ].map(([t, b], i) => (
                  <li key={i}>
                    <SparkBolt size={14} color="var(--spark-500)" />
                    <div><b>{t}.</b> {b}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="summary-block" style={{ background: "var(--ink-900)", color: "var(--cream)", borderColor: "var(--ink-900)" }}>
              <h3 style={{ color: "var(--cream)" }}>
                <Icon.brain width={16} height={16} style={{ color: "var(--ember-500)" }} /> Quotable
              </h3>
              <p style={{ margin: 0, fontFamily: "var(--display)", fontSize: 22, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                "AI isn't a sticker — it's the engine. Every core feature uses one of four Gemini capabilities:
                multimodal input, structured JSON output, long context, embeddings."
              </p>
              <div className="mono" style={{ color: "var(--ember-500)", fontSize: 12, marginTop: 12, letterSpacing: ".12em" }}>
                — bab 5, p. 5
              </div>
            </div>

            {/* Explain again */}
            <div className="explain-row">
              <span className="kicker" style={{ alignSelf: "center" }}>Explain again…</span>
              {[
                { id: "simple",  l: "Like I'm 12",   i: "🪁" },
                { id: "analogy", l: "Give an analogy", i: "🔗" },
                { id: "example", l: "Concrete example", i: "🧪" },
              ].map(b => (
                <button key={b.id} className={`btn ${explainMode === b.id ? "btn--spark" : "btn--ghost"}`}
                  onClick={() => setExplainMode(explainMode === b.id ? null : b.id)}>
                  {b.l}
                </button>
              ))}
              <button className="btn btn--ghost" onClick={() => setExplainMode(null)}>
                <Icon.refresh width={14} height={14} /> Original
              </button>
            </div>

            {explainMode && (
              <div className="summary-block rise" style={{ borderColor: "var(--spark-500)", background: "#FFF7EB", marginTop: 12 }}>
                <h3><SparkBolt size={16} color="var(--spark-500)" /> {explainTexts[explainMode].title}</h3>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{explainTexts[explainMode].body}</p>
              </div>
            )}
          </div>

          {/* Right rail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card card--pad">
              <div className="kicker">Outline</div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 18, margin: "4px 0 12px" }}>9 pages · 10 sections</h3>
              <ol style={{ paddingLeft: 18, margin: 0, color: "var(--ink-700)", lineHeight: 1.9, fontSize: 13.5 }}>
                <li>Latar Belakang Masalah</li>
                <li>Konsep & Solusi Aplikasi</li>
                <li>Fitur Aplikasi</li>
                <li><b style={{ color: "var(--spark-600)" }}>Arsitektur Cloud</b></li>
                <li>Integrasi AI (Gemini)</li>
                <li>Pipeline CI/CD</li>
                <li>Pembagian Tugas Tim</li>
                <li>Target Bonus Penilaian</li>
                <li>Pemetaan ke Rubrik</li>
              </ol>
            </div>

            <div className="card card--pad">
              <div className="kicker">Topics detected</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {["VPC", "Multi-cloud", "AWS", "GCS", "Gemini", "RAG", "embeddings", "Docker", "GitHub Actions", "Terraform", "monitoring"].map(t => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </div>

            <div className="card card--pad" style={{ background: "var(--ink-900)", color: "var(--cream)", borderColor: "var(--ink-900)" }}>
              <div className="kicker" style={{ color: "var(--ember-500)" }}>Quick actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                <button className="btn btn--ember" onClick={() => go("quiz")} style={{ justifyContent: "flex-start" }}>
                  <Icon.quiz width={14} height={14} /> 10-q quiz (Medium)
                </button>
                <button className="btn btn--ember" onClick={() => go("flashcards")} style={{ justifyContent: "flex-start" }}>
                  <Icon.cards width={14} height={14} /> Study 22 new cards
                </button>
                <button className="btn btn--ember" onClick={() => go("chat")} style={{ justifyContent: "flex-start" }}>
                  <Icon.chat width={14} height={14} /> Ask this material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "source" && (
        <div className="card card--pad" style={{ display: "grid", placeItems: "center", padding: 80 }}>
          <Icon.pdf width={48} height={48} style={{ color: "var(--ink-500)" }} />
          <p className="muted" style={{ marginTop: 10 }}>Original PDF viewer — 9 pages</p>
        </div>
      )}

      {tab === "quiz" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <button className="btn btn--spark btn--lg" onClick={() => go("quiz")}>Start quiz now <Icon.arrow width={16} height={16} /></button>
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
