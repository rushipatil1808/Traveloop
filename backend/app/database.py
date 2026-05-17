"""
MongoDB connection and persistence helpers for Traveloop.

MongoDB is used when available. During local development, if MongoDB is not
running, the API falls back to a small JSON-backed store so the app can still
start and exercise the trip flows.
"""

import copy
import json
from datetime import date, datetime
from pathlib import Path
from types import SimpleNamespace
from typing import Any, Dict, Iterable, Optional

from pymongo import ASCENDING, MongoClient, ReturnDocument
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

from app.config import settings
from app.utils.logger import logger


DATA_FILE = Path(__file__).resolve().parents[1] / "logs" / "local_store.json"


def _json_default(value: Any) -> str:
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return str(value)


def _values_for_path(doc: Any, parts: list[str]) -> list[Any]:
    if not parts:
        return [doc]
    if isinstance(doc, list):
        values: list[Any] = []
        for item in doc:
            values.extend(_values_for_path(item, parts))
        return values
    if not isinstance(doc, dict):
        return []
    return _values_for_path(doc.get(parts[0]), parts[1:])


def _get_value(doc: dict[str, Any], path: str) -> Any:
    values = _values_for_path(doc, path.split("."))
    return next((value for value in values if value is not None), None)


def _matches(doc: dict[str, Any], query: dict[str, Any]) -> bool:
    for key, expected in query.items():
        values = _values_for_path(doc, key.split("."))
        if isinstance(expected, dict):
            if "$ne" in expected and any(value == expected["$ne"] for value in values):
                return False
            continue
        if expected not in values:
            return False
    return True


def _set_path(doc: dict[str, Any], path: str, value: Any) -> None:
    parts = path.split(".")
    current = doc
    for part in parts[:-1]:
        current = current.setdefault(part, {})
    current[parts[-1]] = copy.deepcopy(value)


def _apply_update(doc: dict[str, Any], update: dict[str, Any], is_insert: bool) -> None:
    if "$setOnInsert" in update and is_insert:
        for key, value in update["$setOnInsert"].items():
            _set_path(doc, key, value)
    for key, value in update.get("$set", {}).items():
        _set_path(doc, key, value)
    for key, value in update.get("$inc", {}).items():
        _set_path(doc, key, (_get_value(doc, key) or 0) + value)
    for key, value in update.get("$push", {}).items():
        parts = key.split(".")
        current = doc
        for part in parts[:-1]:
            current = current.setdefault(part, {})
        current.setdefault(parts[-1], []).append(copy.deepcopy(value))


class LocalCursor:
    def __init__(self, items: list[dict[str, Any]]):
        self.items = items

    def sort(self, key: str, direction: int = 1):
        self.items.sort(key=lambda item: _get_value(item, key) or "", reverse=direction == -1)
        return self

    def skip(self, count: int):
        self.items = self.items[count:]
        return self

    def limit(self, count: int):
        self.items = self.items[:count]
        return self

    def __iter__(self):
        return iter(copy.deepcopy(self.items))


class LocalCollection:
    def __init__(self, store: "LocalStore", name: str):
        self.store = store
        self.name = name
        self.store.data.setdefault(name, [])

    @property
    def items(self) -> list[dict[str, Any]]:
        return self.store.data.setdefault(self.name, [])

    def create_index(self, *args, **kwargs):
        return None

    def find_one(self, query: dict[str, Any]) -> Optional[dict[str, Any]]:
        for item in self.items:
            if _matches(item, query):
                return copy.deepcopy(item)
        return None

    def find(self, query: Optional[dict[str, Any]] = None) -> LocalCursor:
        query = query or {}
        return LocalCursor([copy.deepcopy(item) for item in self.items if _matches(item, query)])

    def insert_one(self, doc: dict[str, Any]):
        self.items.append(copy.deepcopy(doc))
        self.store.save()
        return SimpleNamespace(inserted_id=doc.get("_id") or doc.get("id"))

    def update_one(self, query: dict[str, Any], update: dict[str, Any], upsert: bool = False):
        for item in self.items:
            if _matches(item, query):
                _apply_update(item, update, is_insert=False)
                self.store.save()
                return SimpleNamespace(matched_count=1, modified_count=1, upserted_id=None)

        if not upsert:
            return SimpleNamespace(matched_count=0, modified_count=0, upserted_id=None)

        doc = {key: value for key, value in query.items() if not isinstance(value, dict) and "." not in key}
        _apply_update(doc, update, is_insert=True)
        self.items.append(doc)
        self.store.save()
        return SimpleNamespace(matched_count=0, modified_count=0, upserted_id=doc.get("id"))

    def delete_one(self, query: dict[str, Any]):
        for index, item in enumerate(self.items):
            if _matches(item, query):
                del self.items[index]
                self.store.save()
                return SimpleNamespace(deleted_count=1)
        return SimpleNamespace(deleted_count=0)

    def count_documents(self, query: dict[str, Any]) -> int:
        return sum(1 for item in self.items if _matches(item, query))

    def find_one_and_update(self, query: dict[str, Any], update: dict[str, Any], upsert: bool = False, return_document=None):
        for item in self.items:
            if _matches(item, query):
                _apply_update(item, update, is_insert=False)
                self.store.save()
                return copy.deepcopy(item)

        if not upsert:
            return None

        doc = {key: value for key, value in query.items() if not isinstance(value, dict)}
        _apply_update(doc, update, is_insert=True)
        self.items.append(doc)
        self.store.save()
        return copy.deepcopy(doc)


class LocalStore:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if self.path.exists():
            try:
                self.data = json.loads(self.path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                logger.warning("Local JSON store was invalid; starting with an empty store.")
                self.data = {}
        else:
            self.data = {}

    def collection(self, name: str) -> LocalCollection:
        return LocalCollection(self, name)

    def save(self) -> None:
        self.path.write_text(json.dumps(self.data, indent=2, default=_json_default), encoding="utf-8")


client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1000)
using_local_store = False

try:
    client.admin.command("ping")
    db = client[settings.MONGODB_DATABASE]
except (PyMongoError, ServerSelectionTimeoutError) as exc:
    using_local_store = True
    logger.warning(f"MongoDB unavailable, using local JSON store at {DATA_FILE}: {exc}")
    local_store = LocalStore(DATA_FILE)
    db = SimpleNamespace(name="local-json-store")

if using_local_store:
    users = local_store.collection("users")
    trips = local_store.collection("trips")
    budgets = local_store.collection("budgets")
    chatbot_history = local_store.collection("chatbot_history")
    counters = local_store.collection("counters")
    expenses = local_store.collection("expenses")
else:
    users = db["users"]
    trips = db["trips"]
    budgets = db["budgets"]
    chatbot_history = db["chatbot_history"]
    counters = db["counters"]
    expenses = db["expenses"]


def init_db() -> None:
    """Create indexes used by the application."""
    users.create_index([("email", ASCENDING)], unique=True)
    trips.create_index([("user_id", ASCENDING)])
    budgets.create_index([("trip_id", ASCENDING), ("category", ASCENDING)], unique=True)
    chatbot_history.create_index([("user_id", ASCENDING), ("session_id", ASCENDING), ("created_at", ASCENDING)])
    expenses.create_index([("trip_id", ASCENDING), ("created_at", ASCENDING)])


def get_db():
    """FastAPI dependency that yields the active database object."""
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
    """Convert Pydantic/date values into persistence-friendly plain data."""
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
