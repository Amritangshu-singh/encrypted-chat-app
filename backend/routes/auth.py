"""Authentication routes: /api/auth/register and /api/auth/login."""
import re
import bcrypt
from flask import Blueprint, request, jsonify, current_app
from models.user import serialize_user, build_user_document
from utils.jwt_handler import generate_token
from utils.encryption import is_valid_public_key

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")


def _validate_registration(data: dict) -> str | None:
    """Return an error string or None when valid."""
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""
    public_key = data.get("publicKey") or ""

    if not username or len(username) < 3:
        return "Username must be at least 3 characters."
    if not email and not phone:
        return "Either email or phone is required."
    if email and not _EMAIL_RE.match(email):
        return "Invalid email address."
    if phone and not _PHONE_RE.match(phone):
        return "Invalid phone number."
    if len(password) < 6:
        return "Password must be at least 6 characters."
    if not public_key:
        return "Public key is required."
    if not is_valid_public_key(public_key):
        return "Invalid public key format."
    return None


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    error = _validate_registration(data)
    if error:
        return jsonify({"error": error}), 400

    mongo = current_app.extensions["pymongo"]
    db = mongo.cx.get_default_database()
    users = db.users

    username = data["username"].strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    password = data["password"]
    public_key = data["publicKey"]

    # Uniqueness checks
    if email and users.find_one({"email": email}):
        return jsonify({"error": "Email already registered."}), 409
    if phone and users.find_one({"phone": phone}):
        return jsonify({"error": "Phone number already registered."}), 409
    if users.find_one({"username": username}):
        return jsonify({"error": "Username already taken."}), 409

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    doc = build_user_document(username, email, phone, password_hash, public_key)
    result = users.insert_one(doc)
    doc["_id"] = result.inserted_id

    token = generate_token(str(result.inserted_id))
    return jsonify({"token": token, "user": serialize_user(doc)}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("email") or data.get("phone") or "").strip()
    password = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "Email/phone and password are required."}), 400

    mongo = current_app.extensions["pymongo"]
    db = mongo.cx.get_default_database()
    users = db.users

    # Try email first, then phone
    user = users.find_one({"email": identifier.lower()})
    if not user:
        user = users.find_one({"phone": identifier})
    if not user:
        return jsonify({"error": "Invalid credentials."}), 401

    if not bcrypt.checkpw(password.encode(), user["password_hash"]):
        return jsonify({"error": "Invalid credentials."}), 401

    import datetime
    users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_seen": datetime.datetime.now(datetime.timezone.utc)}},
    )

    token = generate_token(str(user["_id"]))
    return jsonify({"token": token, "user": serialize_user(user)}), 200
