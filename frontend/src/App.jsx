// Mindspark — App shell + routing

import React from "react";
import { Onboarding } from "./screens/onboarding.jsx";
import { Sidebar } from "./screens/sidebar.jsx";
import { Dashboard } from "./screens/dashboard.jsx";
import { Library, Upload } from "./screens/library_upload.jsx";
import { Material } from "./screens/material.jsx";
import { Quiz } from "./screens/quiz.jsx";
import { Chat, Flashcards } from "./screens/chat_flashcards.jsx";

const App = () => {
  const [signedIn, setSignedIn] = React.useState(false);
  const [route, setRoute] = React.useState("dashboard");

  if (!signedIn) {
    return <Onboarding onEnter={() => setSignedIn(true)} />;
  }

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} />
      <main className="main">
        <div key={route} className="rise">
          {route === "dashboard"  && <Dashboard go={setRoute} />}
          {route === "library"    && <Library  go={setRoute} openMaterial={() => setRoute("material")} />}
          {route === "upload"     && <Upload   go={setRoute} />}
          {route === "material"   && <Material go={setRoute} />}
          {route === "quiz"       && <Quiz     go={setRoute} />}
          {route === "chat"       && <Chat     go={setRoute} />}
          {route === "flashcards" && <Flashcards go={setRoute} />}
        </div>
      </main>
    </div>
  );
};

export default App;
