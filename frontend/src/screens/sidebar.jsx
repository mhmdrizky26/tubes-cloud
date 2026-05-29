// Mindspark — sidebar + top shell

import { SparkMark, Icon } from "../icons.jsx";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "library",   label: "Library",   icon: "book", count: 12 },
  { id: "upload",    label: "Add material", icon: "upload" },
];
const studyItems = [
  { id: "quiz",       label: "Quiz arena",  icon: "quiz" },
  { id: "flashcards", label: "Flashcards",  icon: "cards", count: 38 },
  { id: "chat",       label: "Ask my notes", icon: "chat" },
];

const Sidebar = ({ route, setRoute }) => {
  const streakDays = [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0];
  const week = streakDays.slice(0, 7);
  return (
    <aside className="sb">
      <div className="sb__brand">
        <SparkMark size={36} />
        <div className="sb__brand-name">Mind<b>spark</b></div>
      </div>

      <nav className="sb__nav">
        <div className="sb__group">Workspace</div>
        {navItems.map(it => {
          const I = Icon[it.icon];
          const active = route === it.id;
          return (
            <button key={it.id}
              className={`sb__item ${active ? "is-active" : ""}`}
              onClick={() => setRoute(it.id)}>
              <I className="sb__icon" />
              <span>{it.label}</span>
              {it.count != null && <span className="sb__count">{it.count}</span>}
            </button>
          );
        })}

        <div className="sb__group">Study</div>
        {studyItems.map(it => {
          const I = Icon[it.icon];
          const active = route === it.id;
          return (
            <button key={it.id}
              className={`sb__item ${active ? "is-active" : ""}`}
              onClick={() => setRoute(it.id)}>
              <I className="sb__icon" />
              <span>{it.label}</span>
              {it.count != null && <span className="sb__count">{it.count}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sb__streak">
        <h4>
          <Icon.fire width={16} height={16} style={{ color: "var(--spark-500)" }} />
          13-day streak
        </h4>
        <p>Study today to keep the spark going.</p>
        <div className="sb__streak-bar" aria-hidden="true">
          {week.map((d, i) => <span key={i} className={d ? "on" : ""} />)}
        </div>
      </div>

      <div className="sb__user">
        <div className="sb__avatar">R</div>
        <div>
          <div className="sb__user-name">Rangga Maulana</div>
          <div className="sb__user-meta">ITB · CS '25</div>
        </div>
      </div>
    </aside>
  );
};

export { Sidebar };
