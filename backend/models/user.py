"""User model helpers."""
import datetime
from bson import ObjectId


def serialize_user(doc: dict) -> dict:
    """Convert a MongoDB user document to a JSON-serialisable dict."""
    now = datetime.datetime.now(datetime.timezone.utc)
    result = {
        "id": str(doc["_id"]),
        "username": doc.get("username", ""),
        "email": doc.get("email", ""),
        "phone": doc.get("phone", ""),
        "publicKey": doc.get("public_key", ""),
        "createdAt": doc.get("created_at", now).isoformat(),
        "lastSeen": doc.get("last_seen", now).isoformat(),
    }
    return result


def build_user_document(username: str, email: str, phone: str,
                         password_hash: bytes, public_key: str) -> dict:
    now = datetime.datetime.now(datetime.timezone.utc)
    return {
        "username": username,
        "email": email.lower() if email else "",
        "phone": phone if phone else "",
        "password_hash": password_hash,
        "public_key": public_key,
        "created_at": now,
        "last_seen": now,
    }
