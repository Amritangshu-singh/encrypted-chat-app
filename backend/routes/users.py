"""User routes: /api/users"""
from flask import Blueprint, jsonify, current_app
from models.user import serialize_user
from routes.middleware import require_auth

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("", methods=["GET"])
@require_auth
def get_users(current_user_id):
    mongo = current_app.extensions["pymongo"]
    db = mongo.cx.get_default_database()
    docs = list(db.users.find({}, {"password_hash": 0}))
    return jsonify([serialize_user(d) for d in docs]), 200


@users_bp.route("/<user_id>/public-key", methods=["GET"])
@require_auth
def get_public_key(current_user_id, user_id):
    from bson import ObjectId
    mongo = current_app.extensions["pymongo"]
    db = mongo.cx.get_default_database()
    try:
        doc = db.users.find_one({"_id": ObjectId(user_id)}, {"public_key": 1})
    except Exception:
        return jsonify({"error": "Invalid user id."}), 400
    if not doc:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"publicKey": doc["public_key"]}), 200
