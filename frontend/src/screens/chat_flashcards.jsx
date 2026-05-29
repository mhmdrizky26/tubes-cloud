// Mindspark — Q&A Chat (RAG) + Flashcards

import React from "react";
import { SparkBolt, Icon } from "../icons.jsx";

const SOURCES = [
  { id: "m1", t: "CerdasBelajar Proposal", n: 9 },
  { id: "m2", t: "Distributed Systems · L04", n: 42 },
  { id: "m3", t: "RAG Notes (handwritten)", n: 6 },
  { id: "m4", t: "Database Indexing", n: 24 },
];

const SEED_MESSAGES = [
  { role: "me", text: "What's the difference between the AI Service VPC and the Backend VPC in our architecture?" },
  {
    role: "bot",
    text: "Good one. Both are private network segments, but they serve different concerns:\n\n• **Backend VPC** holds the REST API and the bulk of business logic — auth, materials, scoring, adaptive logic. It talks to the database and to the AI Service.\n• **AI Service VPC** is a thin wrapper that only handles calls to Google Gemini. It owns the API key, applies caching and rate-limits, and absorbs latency spikes from the model.\n\nIsolating them means: (1) credentials are scoped to one service, (2) an AI rate-limit event won't pause the main API, (3) you can scale them independently when traffic patterns differ.",
    cites: [
      { src: "CerdasBelajar Proposal · Bab 4, p. 5", quote: "Dengan mengisolasi pemanggilan Gemini di service tersendiri, kunci API tidak tersebar, dapat diberi caching dan rate-limit khusus, dan beban AI yang tinggi tidak mengganggu API utama." },
    ],
  },
  { role: "me", text: "And how does the RAG flow actually work end-to-end?" },
];

const Chat = () => {
  const [messages, setMessages] = React.useState(SEED_MESSAGES);
  const [input, setInput] = React.useState("");
  const [active, setActive] = React.useState(["m1"]);
  const [streaming, setStreaming] = React.useState(true);
  const [streamText, setStreamText] = React.useState("");
  const streamRef = React.useRef(null);

  const FULL_ANSWER = "Sure — here's the RAG path the proposal describes:\n\n1. On upload, the document is chunked (semantic + size-based splits).\n2. Each chunk is embedded with a self-hosted open-source model (bge-m3) and the vectors are stored.\n3. When you ask a question, your query is embedded the same way and the top-k most-similar chunks are retrieved.\n4. Those chunks are stitched into the prompt as context, then sent to Gemini Flash for generation.\n5. The model answers only from the supplied chunks — so it can't make things up about your material.\n\nThe self-hosted embedding step is what unlocks the +5 'Self-hosted AI Model' bonus while keeping Gemini for the text generation.";

  React.useEffect(() => {
    if (!streaming) return;
    let i = 0;
    setStreamText("");
    const id = setInterval(() => {
      i += 3;
      setStreamText(FULL_ANSWER.slice(0, i));
      if (i >= FULL_ANSWER.length) {
        clearInterval(id);
        setStreaming(false);
        setMessages(prev => [...prev, {
          role: "bot", text: FULL_ANSWER,
          cites: [
            { src: "CerdasBelajar Proposal · Bab 3, p. 3", quote: "Materi dipecah menjadi potongan, diubah menjadi embedding, lalu potongan paling relevan dikirim ke Gemini sebagai konteks — sehingga AI tidak mengarang." },
            { src: "CerdasBelajar Proposal · Bab 5, p. 5", quote: "Pada fitur RAG, model embedding di-host sendiri (open-source) sehingga memenuhi kriteria bonus 'Self-hosted AI Model'." },
          ],
        }]);
      }
    }, 30);
    return () => clearInterval(id);
  }, [streaming]);

  React.useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [streamText, messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "me", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "I'd answer from your material — but in this prototype I've already covered the architecture, RAG flow, and multi-cloud rationale above. Try asking about the CI/CD pipeline, or the adaptive-quiz logic.",
        cites: [],
      }]);
    }, 700);
  };

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">Ask my notes · grounded RAG</div>
          <h1>Talk to your materials</h1>
          <p className="sub">Mindspark answers from chunks of <i>your</i> documents — every claim cites the source.</p>
        </div>
      </div>

      <div className="chat">
        <aside className="chat__src">
          <h4>Sources in context</h4>
          {SOURCES.map(s => (
            <div key={s.id}
              className={`src-item ${active.includes(s.id) ? "on" : ""}`}
              onClick={() => setActive(a => a.includes(s.id) ? a.filter(x => x !== s.id) : [...a, s.id])}>
              <Icon.file width={14} height={14} />
              <div style={{ flex: 1 }}>
                <div>{s.t}</div>
                <div className="mono" style={{ fontSize: 10.5, opacity: .7 }}>{s.n} pages</div>
              </div>
              {active.includes(s.id) && <Icon.check width={14} height={14} />}
            </div>
          ))}

          <button className="btn btn--ghost btn--sm" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>
            <Icon.plus width={14} height={14} /> Add material
          </button>

          <div className="card" style={{ padding: 12, marginTop: 18, background: "var(--cream-3)", borderColor: "#E5C99B" }}>
            <div className="kicker">Retrieval</div>
            <div className="mono" style={{ fontSize: 11, marginTop: 6, color: "var(--ink-700)" }}>
              top_k = 6<br />
              model = bge-m3<br />
              answer = gemini-1.5-flash
            </div>
          </div>
        </aside>

        <div className="chat__main">
          <div className="chat__stream" ref={streamRef}>
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            {streaming && (
              <div className="msg">
                <div className="msg__av"><SparkBolt size={14} color="var(--ember-500)" /></div>
                <div>
                  <div className="bubble">
                    {streamText}<span className="pulse" style={{ display: "inline-block", marginLeft: 2 }}>▍</span>
                  </div>
                  <div className="mono" style={{ marginTop: 6, fontSize: 11, color: "var(--ink-500)" }}>
                    retrieving · 6 chunks from 1 source · gemini-1.5-flash
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat__input">
            <button className="btn btn--ghost btn--sm"><Icon.paperclip width={14} height={14} /></button>
            <textarea
              placeholder="Ask anything about your materials… e.g. 'Compare adaptive quiz logic with spaced repetition'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button className="btn btn--spark" onClick={send}>
              <Icon.send width={14} height={14} /> Spark
            </button>
          </div>
        </div>
      </div>

      {/* suggestion chips below */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <span className="kicker" style={{ alignSelf: "center" }}>Try asking…</span>
        {[
          "Summarise the CI/CD pipeline in 3 bullets",
          "How does the adaptive quiz decide difficulty?",
          "Quote the section about multi-cloud",
          "Generate a 5-q quiz on VPC segmentation",
        ].map((p, i) => (
          <button key={i} className="chip" style={{ cursor: "pointer" }}
            onClick={() => setInput(p)}>{p}</button>
        ))}
      </div>
    </div>
  );
};

const Bubble = ({ msg }) => {
  if (msg.role === "me") {
    return (
      <div className="msg msg--me">
        <div className="bubble">{msg.text}</div>
        <div className="msg__av">R</div>
      </div>
    );
  }
  return (
    <div className="msg">
      <div className="msg__av"><SparkBolt size={14} color="var(--ember-500)" /></div>
      <div>
        <div className="bubble" style={{ whiteSpace: "pre-wrap" }}>{renderRich(msg.text)}</div>
        {msg.cites && msg.cites.map((c, i) => (
          <div className="cite" key={i}>
            <div className="cite__head">cited · {c.src}</div>
            "{c.quote}"
          </div>
        ))}
      </div>
    </div>
  );
};

function renderRich(text) {
  // bold via **x**
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((p, i) => p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : p);
}

// =================== Flashcards ===================

const CARDS = [
  { q: "Why does Mindspark place the AI Service in its own VPC?",
    a: "To isolate the Gemini API key, apply caching & rate-limits, and prevent AI load spikes from impacting the main API.",
    tag: "Cloud Architecture" },
  { q: "What model handles embeddings in the RAG pipeline?",
    a: "A self-hosted open-source embedding model (e.g. bge-m3). Gemini Flash is used only for the final answer generation.",
    tag: "RAG" },
  { q: "What constitutes the multi-cloud split in the proposal?",
    a: "Compute (frontend, backend, AI, DB) runs on AWS while object storage uses Google Cloud Storage.",
    tag: "Multi-Cloud" },
  { q: "Name three Gemini capabilities the system depends on.",
    a: "Multimodal input (PDF/slides/handwriting), structured JSON output (quizzes), long context (summaries). Embeddings are self-hosted.",
    tag: "AI Integration" },
  { q: "What happens after CI tests pass in the GitHub Actions pipeline?",
    a: "Build → Test → Dockerize → Push image to container registry → Deploy to cloud.",
    tag: "CI/CD" },
];

const Flashcards = ({ go }) => {
  const [i, setI] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [history, setHistory] = React.useState([]);

  const grade = (q) => {
    setHistory(h => [...h, { i, q }]);
    setFlipped(false);
    setI(n => (n + 1) % CARDS.length);
  };

  const card = CARDS[i];

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") { e.preventDefault(); setFlipped(f => !f); }
      if (!flipped) return;
      if (e.key === "1") grade("again");
      if (e.key === "2") grade("hard");
      if (e.key === "3") grade("good");
      if (e.key === "4") grade("easy");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, i]);

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">Spaced repetition · daily deck</div>
          <h1>Flashcards</h1>
          <p className="sub">Tap to flip · grade yourself to schedule the next review.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn--ghost"><Icon.shuffle width={14} height={14} /> Shuffle</button>
          <button className="btn btn--ghost" onClick={() => go("library")}><Icon.cross width={14} height={14} /> Exit</button>
        </div>
      </div>

      {/* Top progress */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
        <span className="chip chip--ok">22 due today</span>
        <span className="chip">{i + 1} / {CARDS.length} this session</span>
        <span className="chip chip--ember">streak +1</span>
      </div>

      <div className="fc-stage">
        <div className={`fc ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped(f => !f)}>
          <div className="fc__inner">
            <div className="fc__face">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="fc__kick">{card.tag}</span>
                <SparkBolt size={18} color="var(--spark-500)" />
              </div>
              <div className="fc__q">{card.q}</div>
              <div className="fc__hint">tap to flip · or press <span className="mono">space</span></div>
            </div>
            <div className="fc__face fc__face--back">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="fc__kick">Answer</span>
                <SparkBolt size={18} color="var(--ember-500)" />
              </div>
              <div className="fc__a">{card.a}</div>
              <div className="fc__hint">grade with 1-2-3-4 keys</div>
            </div>
          </div>
        </div>
      </div>

      <div className="fc-controls">
        {[
          { id: "again", label: "Again",  k: "1", next: "<1m" },
          { id: "hard",  label: "Hard",   k: "2", next: "8m" },
          { id: "good",  label: "Good",   k: "3", next: "1d" },
          { id: "easy",  label: "Easy",   k: "4", next: "4d" },
        ].map(b => (
          <button key={b.id} className="fc-btn" data-q={b.id}
            onClick={() => flipped && grade(b.id)}
            style={{ opacity: flipped ? 1 : .4, cursor: flipped ? "pointer" : "not-allowed" }}>
            <span>{b.label}</span>
            <small>{b.k} · {b.next}</small>
          </button>
        ))}
      </div>

      <div className="fc-deck-meta">
        <span>Reviewed today · <b>14</b></span>
        <span>Again · <b>{history.filter(h => h.q === "again").length}</b></span>
        <span>Good · <b>{history.filter(h => h.q === "good").length}</b></span>
        <span>Easy · <b>{history.filter(h => h.q === "easy").length}</b></span>
        <span>Next session in <b>4h 30m</b></span>
      </div>
    </div>
  );
};

export { Chat, Flashcards };
