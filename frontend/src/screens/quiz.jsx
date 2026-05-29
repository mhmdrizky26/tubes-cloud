// Mindspark — Adaptive Quiz (in-progress + results)

import React from "react";
import { Icon, SparkBolt } from "../icons.jsx";

const QUESTIONS = [
  {
    topic: "VPC segmentation",
    diff: 3,
    q: "Why does CerdasBelajar place the AI Service in its own VPC instead of inside the Backend VPC?",
    opts: [
      "It's required by Google Gemini's terms of service.",
      "It isolates API keys, applies caching & rate-limits, and prevents AI load from impacting the main API.",
      "It reduces total cloud cost because VPCs are billed per service.",
      "Multi-cloud rules require AI to live in a separate VPC.",
    ],
    correct: 1,
    explain: "Isolating the AI layer protects credentials and lets you cap rate/cost without affecting the user-facing API. Multi-cloud and Gemini ToS aren't the reason.",
    cite: "Bab 4, p. 5 — 'Mengapa AI dipisah ke service sendiri'",
  },
  {
    topic: "Multi-cloud",
    diff: 3,
    q: "Which split does the proposal use to satisfy the multi-cloud requirement?",
    opts: [
      "Compute on AWS · Object storage on GCS",
      "Compute on GCS · Object storage on AWS",
      "Frontend on Vercel · Backend on AWS",
      "Database on Azure · Everything else on AWS",
    ],
    correct: 0,
    explain: "Compute runs on AWS while object storage uses Google Cloud Storage — that's the explicit multi-cloud boundary.",
    cite: "Bab 4, p. 5 — 'Multi-Cloud'",
  },
  {
    topic: "RAG",
    diff: 4,
    q: "In the Q&A feature, why are chunks embedded with a self-hosted open-source model rather than Gemini's embedding API?",
    opts: [
      "Gemini doesn't expose an embeddings endpoint.",
      "To satisfy the 'Self-hosted AI Model' bonus while keeping Gemini for generation.",
      "Self-hosted embeddings are always more accurate.",
      "Embeddings cannot legally be sent to a third party.",
    ],
    correct: 1,
    explain: "The proposal explicitly notes this earns the +5 bonus and keeps Gemini free for text generation.",
    cite: "Bab 5, p. 5 — 'Self-hosted AI Model'",
  },
];

const KEY_LETTERS = ["A", "B", "C", "D"];

const Quiz = ({ go }) => {
  const [idx, setIdx] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [revealed, setRevealed] = React.useState(false);
  const [answers, setAnswers] = React.useState([]); // {correct: bool, topic}
  const [phase, setPhase] = React.useState("playing"); // playing | results

  const q = QUESTIONS[idx % QUESTIONS.length];

  const submit = () => {
    if (selected == null) return;
    setRevealed(true);
  };
  const next = () => {
    const correct = selected === q.correct;
    const newAnswers = [...answers, { correct, topic: q.topic, diff: q.diff }];
    setAnswers(newAnswers);
    setSelected(null);
    setRevealed(false);
    if (idx + 1 >= 10) {
      setPhase("results");
    } else {
      setIdx(idx + 1);
    }
  };

  // simulate adaptive: difficulty changes based on last answer
  const nextDiff = React.useMemo(() => {
    const last = answers[answers.length - 1];
    if (!last) return q.diff;
    return Math.max(1, Math.min(5, q.diff + (last.correct ? 1 : -1)));
  }, [answers]);

  if (phase === "results") return <QuizResults answers={answers} go={go} retry={() => { setAnswers([]); setIdx(0); setPhase("playing"); }} />;

  const progressPct = ((idx) / 10) * 100;

  return (
    <div>
      <div className="page-hd">
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => go("library")} style={{ marginBottom: 10 }}>
            <Icon.cross width={14} height={14} /> Exit
          </button>
          <h1 style={{ fontSize: 28 }}>Adaptive Quiz · Cloud Architecture</h1>
          <p className="sub">From CerdasBelajar Proposal — Bab 4 & 5</p>
        </div>
        <div className="diff">
          <span className="diff__name">Difficulty</span>
          <div className="diff__lvl">
            {[1,2,3,4,5].map(n => <span key={n} className={n <= q.diff ? "on" : ""} />)}
          </div>
        </div>
      </div>

      <div className="quiz">
        <div className="quiz__head">
          <span className="kicker">Question {idx + 1} of 10</span>
          <span className="mono muted" style={{ fontSize: 12 }}>topic · {q.topic}</span>
        </div>
        <div className="quiz__progress"><i style={{ width: `${progressPct + 10}%` }} /></div>

        <h2 className="quiz__q">{q.q}</h2>

        <div className="opts">
          {q.opts.map((o, i) => {
            const isSel = selected === i;
            let cls = "opt";
            if (revealed) {
              if (i === q.correct) cls += " is-correct";
              else if (isSel) cls += " is-wrong";
            } else if (isSel) cls += " is-sel";
            return (
              <button key={i} className={cls} onClick={() => !revealed && setSelected(i)} disabled={revealed}>
                <span className="opt__key">{KEY_LETTERS[i]}</span>
                <span>{o}</span>
                <span>
                  {revealed && i === q.correct && <Icon.check width={18} height={18} style={{ color: "var(--ok)" }} />}
                  {revealed && isSel && i !== q.correct && <Icon.cross width={18} height={18} style={{ color: "var(--bad)" }} />}
                </span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="rise" style={{ marginTop: 18, padding: 16, borderRadius: 14,
            background: selected === q.correct ? "var(--ok-soft)" : "var(--bad-soft)",
            border: `1px solid ${selected === q.correct ? "#BFE3CD" : "#F0BFB0"}` }}>
            <div className="kicker" style={{ color: selected === q.correct ? "var(--ok)" : "var(--bad)" }}>
              {selected === q.correct ? "Nice spark!" : "Not quite."}
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.55 }}>{q.explain}</p>
            <div className="mono" style={{ fontSize: 11, marginTop: 8, color: "var(--ink-500)" }}>
              cited · {q.cite}
            </div>
          </div>
        )}

        <div className="quiz__foot">
          <div className="muted" style={{ fontSize: 12.5 }}>
            {revealed
              ? <>Next question will be <b>{nextDiff > q.diff ? "harder" : nextDiff < q.diff ? "easier" : "similar"}</b> based on your answer.</>
              : <>Press <kbd className="mono" style={{ padding: "1px 6px", border: "1px solid var(--line)", borderRadius: 4 }}>{selected != null ? "Enter" : "A–D"}</kbd> to {selected != null ? "submit" : "answer"}.</>
            }
          </div>
          {!revealed && (
            <button className="btn btn--prim" disabled={selected == null} onClick={submit}
              style={{ opacity: selected == null ? .4 : 1 }}>
              Submit answer <Icon.arrow width={16} height={16} />
            </button>
          )}
          {revealed && (
            <button className="btn btn--spark" onClick={next}>
              {idx + 1 >= 10 ? "See results" : "Next question"} <Icon.arrow width={16} height={16} />
            </button>
          )}
        </div>
      </div>

      {/* progress dots below */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = answers[i];
          let bg = "var(--line-2)";
          if (a) bg = a.correct ? "var(--ok)" : "var(--bad)";
          else if (i === idx) bg = "var(--spark-500)";
          return <i key={i} style={{ width: 14, height: 14, borderRadius: 4, background: bg, display: "block" }} />;
        })}
      </div>
    </div>
  );
};

// ---------- Results ----------
const QuizResults = ({ answers, retry, go }) => {
  // Pad mock answers if user didn't finish (during demo)
  const real = answers.length ? answers : Array.from({ length: 10 }, (_, i) => ({ correct: i !== 2 && i !== 6, topic: ["VPC","Multi-cloud","RAG","CI/CD","Docker"][i%5], diff: 2 + (i%3) }));
  const correctN = real.filter(a => a.correct).length;
  const pct = Math.round((correctN / real.length) * 100);

  // group by topic
  const byTopic = {};
  real.forEach(a => {
    byTopic[a.topic] = byTopic[a.topic] || { ok: 0, total: 0 };
    byTopic[a.topic].total++;
    if (a.correct) byTopic[a.topic].ok++;
  });

  const C = 220, R = 90, CIRC = 2 * Math.PI * R;
  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">Quiz complete</div>
          <h1>{pct >= 80 ? "Big spark." : pct >= 60 ? "Solid effort." : "Keep at it."}</h1>
          <p className="sub">From CerdasBelajar Proposal — Cloud Architecture set</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn--ghost" onClick={() => go("dashboard")}>Back to dashboard</button>
          <button className="btn btn--spark" onClick={retry}><Icon.refresh width={14} height={14} /> Try again</button>
        </div>
      </div>

      <div className="cols-3" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
        {/* Score */}
        <div className="card card--pad" style={{ display: "grid", placeItems: "center", textAlign: "center", padding: 28 }}>
          <div style={{ position: "relative", width: C, height: C }}>
            <svg className="score-ring" viewBox={`0 0 ${C} ${C}`}>
              <circle cx={C/2} cy={C/2} r={R} stroke="var(--line-2)" strokeWidth="14" fill="none" />
              <circle cx={C/2} cy={C/2} r={R} stroke="url(#sg2)" strokeWidth="14" fill="none"
                strokeLinecap="round" strokeDasharray={CIRC}
                strokeDashoffset={CIRC - (pct/100)*CIRC}
                transform={`rotate(-90 ${C/2} ${C/2})`} />
              <defs>
                <linearGradient id="sg2" x1="0" x2="1">
                  <stop offset="0" stopColor="var(--spark-500)" />
                  <stop offset="1" stopColor="var(--ember-500)" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 56, letterSpacing: "-0.03em", lineHeight: 1 }}>{pct}%</div>
                <div className="mono muted" style={{ fontSize: 11, letterSpacing: ".15em" }}>{correctN}/{real.length} correct</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            <div><b style={{ fontFamily: "var(--display)", fontSize: 22 }}>+{correctN * 12}</b><div className="mono muted" style={{ fontSize: 11 }}>SPARKS</div></div>
            <div><b style={{ fontFamily: "var(--display)", fontSize: 22 }}>{Math.round((correctN/real.length)*100) >= 80 ? "🔥" : "✨"}</b><div className="mono muted" style={{ fontSize: 11 }}>VIBE</div></div>
            <div><b style={{ fontFamily: "var(--display)", fontSize: 22 }}>{real.length * 38}s</b><div className="mono muted" style={{ fontSize: 11 }}>TIME</div></div>
          </div>
        </div>

        {/* Per-topic */}
        <div className="card card--pad" style={{ gridColumn: "span 2" }}>
          <div className="kicker">By topic</div>
          <h3 style={{ fontFamily: "var(--display)", fontSize: 20, margin: "4px 0 14px" }}>How each pocket of knowledge held up</h3>
          {Object.entries(byTopic).map(([name, v]) => {
            const p = Math.round((v.ok/v.total)*100);
            const status = p >= 80 ? "ok" : p >= 50 ? "ember" : "bad";
            return (
              <div className="topic" key={name}>
                <span className={`chip chip--${status}`} style={{ minWidth: 60, justifyContent: "center" }}>{p >= 80 ? "strong" : p >= 50 ? "ok" : "weak"}</span>
                <div className="topic__name">{name}<div className="muted" style={{ fontSize: 12, fontWeight: 400 }}>{v.ok}/{v.total} correct</div></div>
                <div className="topic__bar"><i style={{ width: `${p}%` }} /></div>
                <div className="topic__pct">{p}%</div>
              </div>
            );
          })}

          <div className="card" style={{ padding: 14, marginTop: 14, background: "var(--cream-3)", borderStyle: "dashed", borderColor: "#E5C99B", display: "flex", gap: 12, alignItems: "center" }}>
            <SparkBolt size={18} color="var(--spark-600)" />
            <div style={{ flex: 1 }}>
              <b>Mindspark added 8 cards on weak topics to your deck.</b>
              <div className="muted" style={{ fontSize: 13 }}>Review them tomorrow to lock it in.</div>
            </div>
            <button className="btn btn--prim btn--sm" onClick={() => go("flashcards")}>
              Open deck
            </button>
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      <h3 style={{ fontFamily: "var(--display)", fontSize: 20, margin: "28px 0 12px", letterSpacing: "-0.01em" }}>Question-by-question</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {real.map((a, i) => (
          <div className="result-card" key={i}>
            <span className="key mono">Q{(i+1).toString().padStart(2,"0")}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{a.topic} <span className="muted" style={{ fontWeight: 400, fontSize: 12.5 }}>· difficulty {a.diff}/5</span></div>
              <div className="muted" style={{ fontSize: 13 }}>{a.correct ? "Answered correctly on the first try" : "Mindspark will resurface this in 2 days"}</div>
            </div>
            <span className={`chip chip--${a.correct ? "ok" : "bad"}`}>
              {a.correct ? <Icon.check width={12} height={12} /> : <Icon.cross width={12} height={12} />}
              {a.correct ? "correct" : "missed"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Quiz, QuizResults };
