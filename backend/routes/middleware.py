"""Auth middleware for route decorators."""
import functools
from flask import request, jsonify
from utils.jwt_handler import decode_token
import jwt


def require_auth(f):
    """Decorator that validates the Bearer JWT and injects current_user_id."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization header."}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token."}), 401
        return f(payload["sub"], *args, **kwargs)
    return decorated
