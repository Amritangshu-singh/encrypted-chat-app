import datetime
import jwt
from config import Config


def generate_token(user_id: str) -> str:
    """Generate a JWT token for the given user_id."""
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + datetime.timedelta(hours=Config.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token.  Returns the payload or raises."""
    return jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
