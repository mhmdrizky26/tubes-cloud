"""Abstraksi object storage (Azure Blob Storage — multi-cloud).

Multi-cloud: compute (API ini) berjalan di AWS, sementara file materi disimpan
di **Azure Blob Storage** (cloud berbeda → memenuhi syarat multi-cloud). Jika
kredensial Azure belum di-set, fallback ke disk lokal supaya tetap bisa
dev/demo tanpa cloud.
"""

import os

from .config import settings


def _local_fallback(filename: str, data: bytes) -> str:
    os.makedirs(settings.local_storage_dir, exist_ok=True)
    path = os.path.join(settings.local_storage_dir, filename)
    with open(path, "wb") as f:
        f.write(data)
    return f"file://{path}"


def upload_bytes(filename: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """Simpan file ke Azure Blob, kembalikan URL blob (atau file://... saat fallback)."""
    if not settings.azure_storage_connection_string:
        return _local_fallback(filename, data)

    try:
        # import lazy: hindari error kalau lib belum dipakai / kredensial kosong
        from azure.storage.blob import BlobServiceClient, ContentSettings

        service = BlobServiceClient.from_connection_string(settings.azure_storage_connection_string)
        container = service.get_container_client(settings.azure_storage_container)
        try:
            container.create_container()  # idempotent: aman kalau sudah ada
        except Exception:
            pass
        blob = container.get_blob_client(filename)
        blob.upload_blob(data, overwrite=True, content_settings=ContentSettings(content_type=content_type))
        # URL: https://<account>.blob.core.windows.net/<container>/<filename>
        return blob.url
    except Exception:
        # Kalau Azure gagal (kredensial salah, jaringan) jangan jatuhkan request demo.
        return _local_fallback(filename, data)
