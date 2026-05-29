// Mindspark — Dashboard (analytics)

import { Icon, SparkBolt } from "../icons.jsx";

const Dashboard = ({ go }) => {
  // Mock data
  const stats = [
    { kick: "Accuracy this week", val: "84%", sub: "+6 pts vs last week", deco: "ring" },
    { kick: "Materials studied", val: "12", sub: "across 4 subjects", deco: "stack" },
    { kick: "Flashcards mastered", val: "127", sub: "of 248 total cards", deco: "card" },
    { kick: "Sparks earned", val: "1,420", sub: "Top 8% this month", deco: "bolt" },
  ];

  const topics = [
    { name: "Cloud Architecture",   pct: 92, n: 18, status: "strong" },
    { name: "Multi-Cloud & VPC",    pct: 78, n: 24, status: "good" },
    { name: "Containerization",     pct: 71, n: 14, status: "good" },
    { name: "RAG & Embeddings",     pct: 54, n: 16, status: "weak" },
    { name: "CI/CD with Actions",   pct: 41, n: 11, status: "weak" },
  ];

  // Generate calendar dots (last 26 weeks · 7 days = simplified to 26 cols)
  const heat = Array.from({ length: 26 * 7 }, (_, i) => {
    const r = Math.sin(i * 0.7) + Math.cos(i * 0.31) + 1.2;
    if (i < 14) return 0;
    if (r > 1.8) return 4;
    if (r > 1.1) return 3;
    if (r > 0.4) return 2;
    if (r > -0.4) return 1;
    return 0;
  });

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">Selamat pagi, Rangga ☀</div>
          <h1>Your spark is <span className="hl">growing</span>.</h1>
          <p className="sub">You're 3 quizzes away from mastering <b>Multi-Cloud architecture</b>. Keep going.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn--ghost" onClick={() => go("library")}>
            <Icon.book width={16} height={16} /> Open library
          </button>
          <button className="btn btn--spark" onClick={() => go("upload")}>
            <Icon.plus width={16} height={16} /> Add material
          </button>
        </div>
      </div>

      {/* Hero today card */}
      <div className="cols-3" style={{ gridTemplateColumns: "1.4fr 1fr 1fr" }}>
        <div className="card" style={{ padding: 24, position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, var(--ink-900) 0%, #2A180A 100%)", color: "var(--cream)", borderColor: "var(--ink-900)" }}>
          <div className="kicker" style={{ color: "var(--ember-500)" }}>Today's spark</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 30, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "8px 0 6px", maxWidth: 460 }}>
            10-question adaptive quiz on <span style={{ color: "var(--ember-500)" }}>VPC segmentation</span>.
          </h2>
          <p style={{ color: "#D9C3A3", margin: "0 0 18px", maxWidth: 480, fontSize: 14 }}>
            From your "CerdasBelajar Proposal — Bab 4". Difficulty starts at Medium based on your last 3 sessions.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn--ember" onClick={() => go("quiz")}>
              <SparkBolt size={14} color="var(--ink-900)" /> Start daily spark
            </button>
            <button className="btn" style={{ color: "var(--cream)", border: "1px solid #5a3d22" }}>
              Skip today
            </button>
          </div>

          {/* deco */}
          <svg style={{ position: "absolute", right: -20, top: -20, opacity: .25 }} width="220" height="220" viewBox="0 0 200 200">
            <path d="M108 20 L60 110 H92 L80 190 L150 80 H110 L122 20 Z" fill="var(--ember-500)" />
          </svg>
          <svg style={{ position: "absolute", right: 30, bottom: 18, opacity: .8 }} width="36" height="36" viewBox="0 0 24 24" className="pulse">
            <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" fill="var(--ember-500)" />
          </svg>
        </div>

        {/* streak card */}
        <div className="card card--pad" style={{ position: "relative", overflow: "hidden" }}>
          <div className="kicker" style={{ color: "var(--spark-600)" }}>Streak</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 56, letterSpacing: "-0.03em", lineHeight: 1 }}>13</div>
            <div className="muted">days</div>
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>Personal best: 21 days</div>
          <div className="sb__streak-bar" style={{ marginTop: 16 }}>
            {[1,1,1,1,1,1,1].map((d,i) => <span key={i} className={d ? "on" : ""} />)}
          </div>
          <div className="muted mono" style={{ fontSize: 11, marginTop: 6, letterSpacing: ".12em" }}>M T W T F S S</div>
          <svg style={{ position: "absolute", right: 10, top: 10, opacity: .6 }} width="42" height="42" viewBox="0 0 24 24">
            <path d="M12 3c1 3-2 4-2 7a4 4 0 0 0 8 0c0-2-1-3-1-5 0 2-2 3-3 3 0-3 2-3-2-5Z" fill="var(--spark-500)" />
          </svg>
        </div>

        {/* accuracy */}
        <div className="card card--pad" style={{ position: "relative" }}>
          <div className="kicker">Weekly accuracy</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 56, letterSpacing: "-0.03em", lineHeight: 1 }}>84<span style={{ fontSize: 28 }}>%</span></div>
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>+6 pts vs last week ↑</div>
          {/* sparkline */}
          <svg viewBox="0 0 200 60" style={{ width: "100%", height: 60, marginTop: 12 }}>
            <defs>
              <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--spark-500)" stopOpacity=".4" />
                <stop offset="1" stopColor="var(--spark-500)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,40 L20,38 L40,32 L60,35 L80,28 L100,30 L120,22 L140,25 L160,18 L180,14 L200,10 L200,60 L0,60 Z" fill="url(#spark-fill)" />
            <path d="M0,40 L20,38 L40,32 L60,35 L80,28 L100,30 L120,22 L140,25 L160,18 L180,14 L200,10" stroke="var(--spark-500)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="200" cy="10" r="4" fill="var(--ember-500)" stroke="var(--ink-900)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <div className="cols-2" style={{ gridTemplateColumns: "1.4fr 1fr", marginTop: 18 }}>
        {/* Topics */}
        <div className="card card--pad">
          <div className="flex between center" style={{ marginBottom: 8 }}>
            <div>
              <div className="kicker">Topic mastery</div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 22, margin: "4px 0 0", letterSpacing: "-0.01em" }}>
                Where to spend the next spark
              </h3>
            </div>
            <button className="btn btn--ghost btn--sm">All subjects ↓</button>
          </div>
          <div style={{ marginTop: 8 }}>
            {topics.map(t => (
              <div className="topic" key={t.name}>
                <span className={`chip ${t.status === "strong" ? "chip--ok" : t.status === "weak" ? "chip--bad" : "chip--ember"}`} style={{ minWidth: 64, justifyContent: "center" }}>
                  {t.status}
                </span>
                <div className="topic__name">{t.name}<div className="muted" style={{ fontSize: 12, fontWeight: 400 }}>{t.n} questions answered</div></div>
                <div className="topic__bar"><i style={{ width: `${t.pct}%` }} /></div>
                <div className="topic__pct">{t.pct}%</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 14, marginTop: 14, background: "var(--cream-3)", borderStyle: "dashed", borderColor: "#E5C99B" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <SparkBolt size={20} color="var(--spark-600)" />
              <div style={{ flex: 1 }}>
                <b>Suggested next: CI/CD with GitHub Actions.</b>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>You answered 4/11 in your last session. A 6-question warmup should help.</div>
              </div>
              <button className="btn btn--prim btn--sm" onClick={() => go("quiz")}>Start <Icon.arrow width={14} height={14} /></button>
            </div>
          </div>
        </div>

        {/* Activity heatmap + recents */}
        <div className="card card--pad">
          <div className="kicker">Last 6 months</div>
          <h3 style={{ fontFamily: "var(--display)", fontSize: 22, margin: "4px 0 14px", letterSpacing: "-0.01em" }}>Daily activity</h3>
          <div className="cal" aria-hidden="true">
            {heat.map((v, i) => <i key={i} className={`l${v}`} />)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 12 }} className="muted">
            <span>Less</span>
            <div style={{ display: "flex", gap: 3 }}>
              <i style={{ width: 10, height: 10, background: "var(--line-2)", borderRadius: 3, display: "block" }} />
              <i style={{ width: 10, height: 10, background: "#FFE0C2", borderRadius: 3, display: "block" }} />
              <i style={{ width: 10, height: 10, background: "#FFB07A", borderRadius: 3, display: "block" }} />
              <i style={{ width: 10, height: 10, background: "var(--spark-500)", borderRadius: 3, display: "block" }} />
              <i style={{ width: 10, height: 10, background: "var(--spark-700)", borderRadius: 3, display: "block" }} />
            </div>
            <span>More</span>
          </div>

          <hr style={{ border: 0, borderTop: "1px dashed var(--line)", margin: "20px 0 16px" }} />

          <div className="kicker">Recents</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {[
              { t: "Quiz · VPC segmentation", s: "9/10 correct · 2h ago", c: "ok" },
              { t: "Summary · CerdasBelajar Bab 4", s: "Read · 5h ago", c: "spark" },
              { t: "Flashcards · Multi-cloud terms", s: "12 cards · yesterday", c: "ember" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className={`chip chip--${r.c}`} style={{ width: 8, height: 8, padding: 0, borderRadius: 999 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.t}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{r.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: stats row */}
      <div className="cols-4" style={{ marginTop: 18 }}>
        {stats.map((s, i) => (
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
    </div>
  );
};

export { Dashboard };
