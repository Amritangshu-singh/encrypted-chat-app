import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")
    JWT_SECRET = os.environ.get("JWT_SECRET", "jwt-secret-change-me")
    JWT_EXPIRY_HOURS = int(os.environ.get("JWT_EXPIRY_HOURS", 24))
    MONGO_URI = os.environ.get(
        "MONGO_URI", "mongodb://localhost:27017/encrypted_chat"
    )
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
    DEBUG = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
