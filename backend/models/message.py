"""Message model helpers."""
import datetime


def serialize_message(doc: dict) -> dict:
    """Convert a MongoDB message document to a JSON-serialisable dict."""
    now = datetime.datetime.now(datetime.timezone.utc)
    return {
        "id": str(doc["_id"]),
        "senderId": str(doc.get("sender_id", "")),
        "recipientId": str(doc.get("recipient_id", "")),
        "encryptedContent": doc.get("encrypted_content", ""),
        "nonce": doc.get("nonce", ""),
        "timestamp": doc.get("timestamp", now).isoformat(),
        "read": doc.get("read", False),
    }


def build_message_document(sender_id: str, recipient_id: str,
                            encrypted_content: str, nonce: str) -> dict:
    return {
        "sender_id": sender_id,
        "recipient_id": recipient_id,
        "encrypted_content": encrypted_content,
        "nonce": nonce,
        "timestamp": datetime.datetime.now(datetime.timezone.utc),
        "read": False,
    }
