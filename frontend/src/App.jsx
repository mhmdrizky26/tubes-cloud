// Mindspark — App shell + routing

import React from "react";
import { api } from "./api.js";
import { Onboarding } from "./screens/onboarding.jsx";
import { Sidebar } from "./screens/sidebar.jsx";
import { Dashboard } from "./screens/dashboard.jsx";
import { Library, Upload } from "./screens/library_upload.jsx";
import { Material } from "./screens/material.jsx";
import { Quiz } from "./screens/quiz.jsx";
import { Chat, Flashcards } from "./screens/chat_flashcards.jsx";

const App = () => {
  // Auto sign-in bila token masih tersimpan dari sesi sebelumnya.
  const [signedIn, setSignedIn] = React.useState(() => !!api.token.get());
  const [user, setUser] = React.useState(null);
  const [route, setRoute] = React.useState("dashboard");
  // Materi yang sedang dibuka (dipakai Material/Quiz/Chat). null = belum pilih.
  const [activeMaterial, setActiveMaterial] = React.useState(null);
  // Bahasa konten AI (en | id) — disimpan di localStorage, dipakai di tiap halaman.
  const [lang, setLangState] = React.useState(() => localStorage.getItem("ms_lang") || "en");
  const setLang = (l) => { localStorage.setItem("ms_lang", l); setLangState(l); };

  const openMaterial = (material) => {
    setActiveMaterial(material || null);
    setRoute("material");
  };

  const logout = () => {
    api.logout();
    try { localStorage.removeItem("ms_chat"); } catch {} // jangan bawa riwayat ke user lain
    setSignedIn(false);
    setUser(null);
    setActiveMaterial(null);
    setRoute("dashboard");
  };

  if (!signedIn) {
    return (
      <Onboarding
        onEnter={(u) => {
          setUser(u || null);
          setSignedIn(true);
        }}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} user={user} onLogout={logout} />
      <main className="main">
        <div key={route} className="rise">
          {route === "dashboard"  && <Dashboard go={setRoute} openMaterial={openMaterial} lang={lang} setLang={setLang} />}
          {route === "library"    && <Library  go={setRoute} openMaterial={openMaterial} lang={lang} setLang={setLang} />}
          {route === "upload"     && <Upload   go={setRoute} openMaterial={openMaterial} lang={lang} setLang={setLang} />}
          {route === "material"   && <Material go={setRoute} material={activeMaterial} lang={lang} setLang={setLang} />}
          {route === "quiz"       && <Quiz     go={setRoute} material={activeMaterial} lang={lang} setLang={setLang} />}
          {route === "chat"       && <Chat     go={setRoute} material={activeMaterial} lang={lang} setLang={setLang} />}
          {route === "flashcards" && <Flashcards go={setRoute} material={activeMaterial} lang={lang} setLang={setLang} />}
        </div>
      </main>
    </div>
  );
};

export default App;
