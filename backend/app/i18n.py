import json

LANGS = ("en", "id")


def normalize(lang: str | None) -> str:
    return "id" if lang == "id" else "en"


def dump(value) -> str:
    """Serialize ke JSON (UTF-8 aman) untuk disimpan di kolom TEXT."""
    return json.dumps(value, ensure_ascii=False)


def pick_text(raw, lang: str) -> str:
    """Ambil teks bahasa terpilih dari nilai tersimpan.
    Dukung: dict {en,id} (JSON string), atau string biasa (data lama)."""
    lang = normalize(lang)
    if isinstance(raw, dict):
        data = raw
    else:
        try:
            data = json.loads(raw) if isinstance(raw, str) else raw
        except (json.JSONDecodeError, TypeError):
            return raw or ""
    if isinstance(data, dict):
        return data.get(lang) or data.get("en") or next(iter(data.values()), "")
    return raw or ""


def pick_options(raw, lang: str) -> list[str]:
    """Ambil daftar opsi bahasa terpilih. Dukung dict {en:[],id:[]} atau list biasa."""
    lang = normalize(lang)
    try:
        data = json.loads(raw) if isinstance(raw, str) else raw
    except (json.JSONDecodeError, TypeError):
        return []
    if isinstance(data, dict):
        opts = data.get(lang) or data.get("en") or next(iter(data.values()), [])
        return [str(o) for o in opts] if isinstance(opts, list) else []
    if isinstance(data, list):
        return [str(o) for o in data]
    return []
