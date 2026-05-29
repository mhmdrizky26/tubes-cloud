// Mindspark — onboarding / signup

import React from "react";
import { SparkMark, SparkBolt, Icon } from "../icons.jsx";

const Onboarding = ({ onEnter }) => {
  const [mode, setMode] = React.useState("signup"); // signup | login
  const [step, setStep] = React.useState(0); // 0 form, 1 picking interest, 2 ready

  // step 1 interests
  const interests = [
    "Computer Science", "Medicine", "Law", "Engineering",
    "Economics", "Design", "Psychology", "Biology",
    "Mathematics", "Languages", "History", "Other",
  ];
  const [picked, setPicked] = React.useState(["Computer Science", "Mathematics"]);
  const togglePick = (i) => setPicked(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const onSubmit = (e) => { e.preventDefault(); setStep(1); };

  return (
    <div className="onb">
      <div className="onb__left">
        <div className="onb__brand">
          <SparkMark size={40} />
          <div className="onb__brand-name">Mind<b>spark</b></div>
          <span className="chip chip--ember" style={{ marginLeft: 8 }}>
            <SparkBolt size={12} /> beta
          </span>
        </div>

        <div className="onb__features">
          <div className="kicker">For curious minds</div>
          <h1 className="onb__title">
            Turn any material into an <em>active</em> way to learn.
          </h1>
          <p className="onb__sub">
            Upload your slides, notes, even handwritten scans — Mindspark turns them into
            summaries, adaptive quizzes, flashcards, and a tutor that only answers from
            <i> your</i> material.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
            {[
              { i: <Icon.upload width={18} height={18} />, t: "Drop a PDF, slide deck, or photo of notes" },
              { i: <Icon.bolt width={18} height={18} />,   t: "Get an instant summary + a quiz that adapts" },
              { i: <Icon.chat width={18} height={18} />,   t: "Ask anything — answers cite your material" },
            ].map((f, k) => (
              <div className="onb__feat" key={k}>
                <span className="onb__feat-dot">{f.i}</span>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{f.t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="onb__foot mono">
          v0.4.2 — built for students · sdg 4 · multi-cloud
        </div>
      </div>

      <div className="onb__right">
        {/* deco floating sparks */}
        <div className="onb__deco" aria-hidden="true">
          <svg style={{ left: 24, top: 36, width: 36 }} viewBox="0 0 24 24" className="float">
            <path d="M13 2 L4 14 H10 L8 22 L20 9 H13 L15 2 H13 Z" fill="var(--ember-500)" />
          </svg>
          <svg style={{ right: 36, top: 120, width: 22 }} viewBox="0 0 24 24" className="float" >
            <path d="M13 2 L4 14 H10 L8 22 L20 9 H13 L15 2 H13 Z" fill="var(--spark-500)" />
          </svg>
          <svg style={{ left: 60, bottom: 60, width: 28 }} viewBox="0 0 24 24" className="float">
            <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" fill="var(--ember-500)" />
          </svg>
          <svg style={{ right: 80, bottom: 100, width: 18 }} viewBox="0 0 24 24" className="float">
            <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" fill="var(--spark-300)" />
          </svg>
        </div>

        {step === 0 && (
          <div className="onb__panel rise">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h2>{mode === "signup" ? "Spark your first session" : "Welcome back, learner"}</h2>
            </div>
            <p>{mode === "signup" ? "Free for students. No credit card." : "Pick up your streak where you left off."}</p>

            <form onSubmit={onSubmit}>
              {mode === "signup" && (
                <div className="field">
                  <label>Full name</label>
                  <input type="text" defaultValue="Rangga Maulana" />
                </div>
              )}
              <div className="field">
                <label>Email</label>
                <input type="email" defaultValue="rangga@student.itb.ac.id" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" defaultValue="••••••••••" />
              </div>

              <button type="submit" className="btn btn--spark btn--lg" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
                <SparkBolt size={16} color="white" />
                {mode === "signup" ? "Create my Mindspark" : "Sign in"}
              </button>

              <div className="divider">or continue with</div>

              <div className="social-row">
                <button type="button" className="social-btn">
                  <Icon.google width={18} height={18} /> Google
                </button>
                <button type="button" className="social-btn">
                  <Icon.book width={18} height={18} /> SSO Kampus
                </button>
              </div>

              <p className="muted" style={{ fontSize: 12.5, textAlign: "center", marginTop: 18 }}>
                {mode === "signup" ? "Already have an account? " : "New here? "}
                <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                  style={{ color: "var(--spark-600)", fontWeight: 700, padding: 0 }}>
                  {mode === "signup" ? "Sign in" : "Create one"}
                </button>
              </p>
            </form>
          </div>
        )}

        {step === 1 && (
          <div className="onb__panel rise" style={{ maxWidth: 500 }}>
            <div className="kicker">Step 2 of 2</div>
            <h2 style={{ marginTop: 6 }}>What do you study?</h2>
            <p>We'll tune your daily prompts and example questions. Pick a few.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, margin: "8px 0 18px" }}>
              {interests.map(i => (
                <button type="button" key={i} onClick={() => togglePick(i)}
                  style={{
                    padding: "10px 12px", borderRadius: 12, fontSize: 13.5, fontWeight: 600,
                    border: "1.5px solid",
                    borderColor: picked.includes(i) ? "var(--spark-500)" : "var(--line)",
                    background: picked.includes(i) ? "#FFEFD9" : "var(--cream)",
                    color: "var(--ink-900)", textAlign: "left",
                  }}>
                  {i}
                </button>
              ))}
            </div>

            <button className="btn btn--spark btn--lg" style={{ width: "100%", justifyContent: "center" }}
              onClick={() => onEnter()}>
              Light it up <Icon.arrow width={16} height={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { Onboarding };
