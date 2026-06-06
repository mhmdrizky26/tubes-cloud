import os

from .config import settings


def _local_fallback(filename: str, data: bytes) -> str:
    os.makedirs(settings.local_storage_dir, exist_ok=True)
    path = os.path.join(settings.local_storage_dir, filename)
    with open(path, "wb") as f:
        f.write(data)
    return f"file://{path}"


def upload_bytes(filename: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """Simpan file, kembalikan URI penyimpanan (gcs://... atau file://...)."""
    if not settings.google_application_credentials:
        return _local_fallback(filename, data)

    try:
        from google.cloud import storage

        client = storage.Client()
        bucket = client.bucket(settings.gcs_bucket)
        blob = bucket.blob(filename)
        blob.upload_from_string(data, content_type=content_type)
        return f"gcs://{settings.gcs_bucket}/{filename}"
    except Exception:
        return _local_fallback(filename, data)
