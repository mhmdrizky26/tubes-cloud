"""Konfigurasi AI Service."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://mindspark:mindspark@db:5432/mindspark"

    embedding_model: str = "BAAI/bge-m3"
    embedding_dim: int = 1024
    # true = embedding deterministik tanpa download model (untuk test lokal cepat).
    # Bila model gagal di-load, otomatis fallback ke mock juga.
    use_mock_embedding: bool = False

    # Bisa diisi beberapa API key dipisah koma. Saat key pertama habis kuotanya
    # (semua modelnya 429), otomatis pindah ke key berikutnya → kuota berlipat.
    gemini_api_key: str = ""
    # Bisa diisi beberapa model dipisah koma. Kalau model pertama kena limit
    # (429), otomatis dicoba model berikutnya → kuota harian efektif berlipat.
    gemini_model: str = "gemini-2.5-flash-lite"

    top_k: int = 6

    @property
    def gemini_models(self) -> list[str]:
        return [m.strip() for m in self.gemini_model.split(",") if m.strip()]

    @property
    def gemini_api_keys(self) -> list[str]:
        return [k.strip() for k in self.gemini_api_key.split(",") if k.strip()]


settings = Settings()
