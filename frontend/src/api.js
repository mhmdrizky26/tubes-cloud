// Mindspark — klien API ringan ke Backend.
// Base URL diinjeksi saat build via Vite (VITE_API_URL); default ke localhost:8000.

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const tokenStore = {
  get: () => localStorage.getItem("ms_token"),
  set: (t) => localStorage.setItem("ms_token", t),
  clear: () => localStorage.removeItem("ms_token"),
};

async function request(path, { method = "GET", body, form, auth = true } = {}) {
  const headers = {};
  if (auth && tokenStore.get()) headers["Authorization"] = `Bearer ${tokenStore.get()}`;

  let payload;
  if (form) {
    payload = form; // FormData — biarkan browser set Content-Type
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  if (!res.ok) {
    // Token kadaluarsa/invalid → bersihkan & balik ke onboarding (hindari stuck).
    if (res.status === 401 && auth && tokenStore.get()) {
      tokenStore.clear();
      window.location.reload();
    }
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  token: tokenStore,

  // Auth
  async register(email, name, password) {
    const data = await request("/auth/register", { method: "POST", auth: false, body: { email, name, password } });
    tokenStore.set(data.access_token);
    return data.user;
  },
  async login(email, password) {
    // /auth/login memakai form OAuth2 (username = email)
    const form = new URLSearchParams({ username: email, password });
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) throw new Error("Login gagal");
    const data = await res.json();
    tokenStore.set(data.access_token);
    return data.user;
  },
  logout: () => tokenStore.clear(),

  // Materials (lang = en | id untuk konten dwibahasa)
  listMaterials: (lang = "en") => request(`/materials?lang=${lang}`),
  getMaterial: (id, lang = "en") => request(`/materials/${id}?lang=${lang}`),
  uploadMaterial: (file, subject = "", lang = "en") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("subject", subject);
    fd.append("lang", lang);
    return request("/materials", { method: "POST", form: fd });
  },

  // Quiz
  quizForMaterial: (id, lang = "en") => request(`/quiz/material/${id}?lang=${lang}`),
  flashcardsForMaterial: (id, lang = "en") => request(`/quiz/material/${id}/flashcards?lang=${lang}`),
  submitAnswer: (quizId, chosenIndex, lang = "en") =>
    request("/quiz/submit", { method: "POST", body: { quiz_id: quizId, chosen_index: chosenIndex, lang } }),

  // Dashboard
  stats: (lang = "en") => request(`/stats?lang=${lang}`),

  // Chat (RAG)
  chat: (question, materialIds = [], topK = 6, lang = "en") =>
    request("/chat", { method: "POST", body: { question, material_ids: materialIds, top_k: topK, lang } }),
};
