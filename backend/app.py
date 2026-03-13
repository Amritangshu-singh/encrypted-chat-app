"""Flask application entry point."""
import datetime
import bson
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_pymongo import PyMongo
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
from routes.users import users_bp
from routes.messages import messages_bp
from models.message import build_message_document, serialize_message
from utils.jwt_handler import decode_token
import jwt

app = Flask(__name__)
app.config["SECRET_KEY"] = Config.SECRET_KEY
app.config["MONGO_URI"] = Config.MONGO_URI

CORS(app, origins=Config.CORS_ORIGINS.split(","))

mongo = PyMongo(app)

socketio = SocketIO(
    app,
    cors_allowed_origins=Config.CORS_ORIGINS.split(","),
    async_mode="eventlet",
)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(messages_bp)

# ---------- WebSocket events ----------

# Map socket_id -> user_id
_socket_to_user: dict[str, str] = {}
# Map user_id -> set of socket_ids (user may have multiple tabs)
_user_to_sockets: dict[str, set] = {}


def _auth_socket(token: str) -> str | None:
    """Validate socket JWT and return user_id, or None."""
    try:
        payload = decode_token(token)
        return payload["sub"]
    except (jwt.InvalidTokenError, KeyError):
        return None


@socketio.on("connect")
def handle_connect():
    # Token can be sent as query param or in auth header
    token = request.args.get("token") or (
        request.headers.get("Authorization", "").replace("Bearer ", "") or None
    )
    if not token:
        return False  # Reject connection

    user_id = _auth_socket(token)
    if not user_id:
        return False

    sid = request.sid
    _socket_to_user[sid] = user_id
    _user_to_sockets.setdefault(user_id, set()).add(sid)

    # Join a personal room for targeted messages
    join_room(user_id)

    # Update last_seen & broadcast online status
    with app.app_context():
        db = mongo.cx.get_default_database()
        db.users.update_one(
            {"_id": bson.ObjectId(user_id)},
            {"$set": {"last_seen": datetime.datetime.now(datetime.timezone.utc)}},
        )

    emit("user_online", {"userId": user_id, "online": True}, broadcast=True)


@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    user_id = _socket_to_user.pop(sid, None)
    if user_id:
        sockets = _user_to_sockets.get(user_id, set())
        sockets.discard(sid)
        if not sockets:
            _user_to_sockets.pop(user_id, None)
            emit("user_online", {"userId": user_id, "online": False}, broadcast=True)


@socketio.on("send_message")
def handle_send_message(data):
    sid = request.sid
    sender_id = _socket_to_user.get(sid)
    if not sender_id:
        return

    recipient_id = data.get("recipientId", "")
    encrypted_content = data.get("encryptedContent", "")
    nonce = data.get("nonce", "")

    if not recipient_id or not encrypted_content or not nonce:
        return

    doc = build_message_document(sender_id, recipient_id, encrypted_content, nonce)
    with app.app_context():
        db = mongo.cx.get_default_database()
        result = db.messages.insert_one(doc)
        doc["_id"] = result.inserted_id

    msg = serialize_message(doc)

    # Deliver to recipient's room and back to sender
    emit("receive_message", msg, room=recipient_id)
    emit("receive_message", msg, room=sender_id)


@socketio.on("user_typing")
def handle_typing(data):
    sid = request.sid
    sender_id = _socket_to_user.get(sid)
    if not sender_id:
        return
    recipient_id = data.get("recipientId", "")
    if recipient_id:
        emit(
            "user_typing",
            {"senderId": sender_id, "typing": data.get("typing", False)},
            room=recipient_id,
        )


@app.route("/health")
def health():
    return {"status": "ok"}, 200


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=Config.DEBUG)
