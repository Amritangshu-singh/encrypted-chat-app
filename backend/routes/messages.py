"""Message routes: /api/messages"""
from flask import Blueprint, jsonify, current_app
from models.message import serialize_message
from routes.middleware import require_auth

messages_bp = Blueprint("messages", __name__, url_prefix="/api/messages")


@messages_bp.route("/<other_user_id>", methods=["GET"])
@require_auth
def get_messages(current_user_id, other_user_id):
    mongo = current_app.extensions["pymongo"]
    db = mongo.cx.get_default_database()

    docs = list(
        db.messages.find(
            {
                "$or": [
                    {"sender_id": current_user_id, "recipient_id": other_user_id},
                    {"sender_id": other_user_id, "recipient_id": current_user_id},
                ]
            }
        ).sort("timestamp", 1)
    )
    return jsonify([serialize_message(d) for d in docs]), 200
