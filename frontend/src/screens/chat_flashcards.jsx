// Mindspark — Q&A Chat (RAG) + Flashcards

import React from "react";
import { api } from "../api.js";
import { SparkBolt, Icon } from "../icons.jsx";
import { ScreenEmpty, LangToggle } from "../ui.jsx";

const CHAT_KEY = "ms_chat"; // riwayat chat disimpan di localStorage

const Chat = ({ material, lang, setLang }) => {
  // Inisialisasi dari localStorage → riwayat tetap ada saat pindah halaman / refresh.
  const [messages, setMessages] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(CHAT_KEY)) || []; } catch { return []; }
  });
  const [input, setInput] = React.useState("");
  const [sources, setSources] = React.useState([]); // materi milik user
  const [active, setActive] = React.useState([]);    // id materi yang dipakai konteks
  const [sending, setSending] = React.useState(false);
  const streamRef = React.useRef(null);

  // Simpan riwayat tiap kali berubah.
  React.useEffect(() => {
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  const clearChat = () => { setMessages([]); try { localStorage.removeItem(CHAT_KEY); } catch {} };

  // Muat daftar materi nyata sebagai sumber konteks.
  React.useEffect(() => {
    api.listMaterials()
      .then((data) => {
        setSources(data);
        // default: materi aktif (kalau dibuka dari Material), atau semua materi.
        setActive(material?.id ? [material.id] : data.map(m => m.id));
      })
      .catch(() => {});
  }, [material]);

  React.useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [messages, sending]);

  const toggle = (id) =>
    setActive(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);

  const send = async () => {
    const question = input.trim();
    if (!question || sending) return;
    setMessages(prev => [...prev, { role: "me", text: question }]);
    setInput("");
    setSending(true);
    try {
      const res = await api.chat(question, active, 6, lang);
      setMessages(prev => [...prev, { role: "bot", text: res.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "bot",
        text: `Sorry, couldn't reach the AI Service: ${err.message}. Make sure the backend & ai-service are running.`,
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">Ask my notes · grounded RAG</div>
          <h1>Talk to your materials</h1>
          <p className="sub">Mindspark answers from chunks of <i>your</i> documents — every answer is grounded in your material.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LangToggle lang={lang} setLang={setLang} />
          {messages.length > 0 && (
            <button className="btn btn--ghost" onClick={clearChat}>
              <Icon.refresh width={14} height={14} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="chat">
        <aside className="chat__src">
          <h4>Sources in context</h4>
          {sources.length === 0 && (
            <p className="muted" style={{ fontSize: 13 }}>No materials yet. Upload one from "Add material" first.</p>
          )}
          {sources.map(s => (
            <div key={s.id}
              className={`src-item ${active.includes(s.id) ? "on" : ""}`}
              onClick={() => toggle(s.id)}>
              <Icon.file width={14} height={14} />
              <div style={{ flex: 1 }}>
                <div>{s.title}</div>
                <div className="mono" style={{ fontSize: 10.5, opacity: .7 }}>{s.file_type} · {s.pages}p</div>
              </div>
              {active.includes(s.id) && <Icon.check width={14} height={14} />}
            </div>
          ))}

          <div className="card" style={{ padding: 12, marginTop: 18, background: "var(--cream-3)", borderColor: "#E5C99B" }}>
            <div className="kicker">Retrieval</div>
            <div className="mono" style={{ fontSize: 11, marginTop: 6, color: "var(--ink-700)" }}>
              top_k = 6<br />
              embed = bge-m3<br />
              answer = gemini-2.5-flash
            </div>
          </div>
        </aside>

        <div className="chat__main">
          <div className="chat__stream" ref={streamRef}>
            {messages.length === 0 && !sending && (
              <div className="muted" style={{ textAlign: "center", padding: 40 }}>
                <SparkBolt size={28} color="var(--spark-500)" />
                <p style={{ marginTop: 10 }}>Ask anything about your materials. Answers come from the document content.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            {sending && (
              <div className="msg">
                <div className="msg__av"><SparkBolt size={14} color="var(--ember-500)" /></div>
                <div>
                  <div className="bubble">
                    <span className="pulse">▍</span>
                  </div>
                  <div className="mono" style={{ marginTop: 6, fontSize: 11, color: "var(--ink-500)" }}>
                    retrieving · {active.length} source(s) · gemini-2.5-flash
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat__input">
            <textarea
              placeholder="Ask anything about your materials… e.g. 'Explain the CI/CD flow'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button className="btn btn--spark" onClick={send} disabled={sending}>
              <Icon.send width={14} height={14} /> Spark
            </button>
          </div>
        </div>
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

const FcEmpty = ({ go, msg }) => (
  <ScreenEmpty kicker="Spaced repetition" title="Flashcards" msg={msg} go={go} />
);

const Flashcards = ({ go, material, lang, setLang }) => {
  const [cards, setCards] = React.useState(null); // null = loading
  const [i, setI] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    if (!material?.id) { setCards([]); return; }
    api.flashcardsForMaterial(material.id, lang)
      .then((data) => { setCards(data); setI(0); setFlipped(false); })
      .catch(() => setCards([]));
  }, [material, lang]);

  const grade = (q) => {
    if (!cards || cards.length === 0) return;
    setHistory(h => [...h, { i, q }]);
    setFlipped(false);
    setI(n => (n + 1) % cards.length);
  };

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
  }, [flipped, i, cards]);

  if (!material?.id) return <FcEmpty go={go} msg="Open a material from the Library, then choose Flashcards." />;
  if (cards === null) return <FcEmpty go={go} msg="Loading flashcards…" />;
  if (cards.length === 0) return <FcEmpty go={go} msg="This material has no flashcards yet. Make sure its quiz has been generated." />;

  const card = cards[i];

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="kicker">Spaced repetition · daily deck</div>
          <h1>Flashcards</h1>
          <p className="sub">Tap to flip · grade yourself to schedule the next review.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LangToggle lang={lang} setLang={setLang} />
          <button className="btn btn--ghost"><Icon.shuffle width={14} height={14} /> Shuffle</button>
          <button className="btn btn--ghost" onClick={() => go("library")}><Icon.cross width={14} height={14} /> Exit</button>
        </div>
      </div>

      {/* Top progress */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
        <span className="chip">{i + 1} / {cards.length} cards</span>
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
        <span>Reviewed · <b>{history.length}</b></span>
        <span>Again · <b>{history.filter(h => h.q === "again").length}</b></span>
        <span>Good · <b>{history.filter(h => h.q === "good").length}</b></span>
        <span>Easy · <b>{history.filter(h => h.q === "easy").length}</b></span>
      </div>
    </div>
  );
};

export { Chat, Flashcards };
