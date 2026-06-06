// Mindspark — sidebar + top shell

import { SparkMark, Icon } from "../icons.jsx";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "library",   label: "Library",   icon: "book" },
  { id: "upload",    label: "Add material", icon: "upload" },
];
const studyItems = [
  { id: "quiz",       label: "Quiz arena",  icon: "quiz" },
  { id: "flashcards", label: "Flashcards",  icon: "cards" },
  { id: "chat",       label: "Ask my notes", icon: "chat" },
];

const Sidebar = ({ route, setRoute, user, onLogout }) => {
  const name = user?.name || "Learner";
  const initial = name.trim().charAt(0).toUpperCase() || "M";
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

      <div style={{ flex: 1 }} />

      <div className="sb__user">
        <div className="sb__avatar">{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sb__user-name">{name}</div>
          <div className="sb__user-meta">{user?.email || "Mindspark"}</div>
        </div>
        <Icon.arrow className="sb__user-caret" width={14} height={14} />
        {onLogout && (
          <div className="sb__user-pop">
            <button className="sb__logout" onClick={onLogout}>
              <Icon.back width={14} height={14} /> Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export { Sidebar };
