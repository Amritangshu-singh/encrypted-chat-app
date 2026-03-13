"""Encryption utilities (server-side).

The server deliberately never decrypts messages.  This module only provides
helpers for validating that public keys submitted by clients look well-formed
(32-byte Curve25519 keys encoded as base64).
"""
import base64


def is_valid_public_key(key: str) -> bool:
    """Return True when *key* is a valid base64-encoded 32-byte public key."""
    try:
        raw = base64.b64decode(key)
        return len(raw) == 32
    except Exception:
        return False
