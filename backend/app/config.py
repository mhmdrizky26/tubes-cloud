"""Konfigurasi terpusat (dibaca dari environment / .env)."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql+psycopg2://mindspark:mindspark@db:5432/mindspark"

    # Auth
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # AI Service (VPC terpisah)
    ai_service_url: str = "http://ai-service:8001"

    # Object storage (multi-cloud bucket)
    gcs_bucket: str = "mindspark-materials"
    google_application_credentials: str = ""
    local_storage_dir: str = "/data/uploads"

    # CORS
    frontend_origin: str = "http://localhost:5173"


settings = Settings()
