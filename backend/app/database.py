"""
MongoDB connection and small persistence helpers for Traveloop.
"""

from datetime import date, datetime
from types import SimpleNamespace
from typing import Any, Dict, Iterable, Optional

from pymongo import ASCENDING, MongoClient, ReturnDocument

from app.config import settings


client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
db = client[settings.MONGODB_DATABASE]

users = db["users"]
trips = db["trips"]
budgets = db["budgets"]
chatbot_history = db["chatbot_history"]
counters = db["counters"]


def init_db() -> None:
    """Create indexes used by the application."""
    users.create_index([("email", ASCENDING)], unique=True)
    trips.create_index([("user_id", ASCENDING)])
    budgets.create_index([("trip_id", ASCENDING), ("category", ASCENDING)], unique=True)
    chatbot_history.create_index([("user_id", ASCENDING), ("session_id", ASCENDING), ("created_at", ASCENDING)])


def get_db():
    """FastAPI dependency that yields the Mongo database."""
    yield db


def next_id(name: str) -> int:
    counter = counters.find_one_and_update(
        {"_id": name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(counter["seq"])


def encode_doc(value: Any) -> Any:
    """Convert Pydantic/date values into Mongo-friendly plain data."""
    if isinstance(value, dict):
        return {key: encode_doc(item) for key, item in value.items()}
    if isinstance(value, list):
        return [encode_doc(item) for item in value]
    if isinstance(value, date) and not isinstance(value, datetime):
        return datetime.combine(value, datetime.min.time())
    if hasattr(value, "value"):
        return value.value
    return value


def clean_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    cleaned = dict(doc)
    cleaned.pop("_id", None)
    return cleaned


def clean_docs(items: Iterable[Dict[str, Any]]) -> list[Dict[str, Any]]:
    return [clean_doc(item) for item in items]


def as_object(doc: Optional[Dict[str, Any]]) -> Optional[SimpleNamespace]:
    cleaned = clean_doc(doc)
    return SimpleNamespace(**cleaned) if cleaned else None
