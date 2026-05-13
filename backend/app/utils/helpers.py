"""
Helper utilities for Traveloop backend.
"""

from typing import List, Dict, Any
from datetime import datetime, date
import json


def serialize_datetime(dt: datetime) -> str:
    """Convert datetime to ISO format string"""
    return dt.isoformat() if dt else None


def serialize_date(d: date) -> str:
    """Convert date to ISO format string"""
    return d.isoformat() if d else None


def calculate_trip_duration(start_date: date, end_date: date) -> int:
    """Calculate duration in days"""
    delta = end_date - start_date
    return delta.days + 1  # Include both start and end days


def format_currency(amount: float, currency: str = "INR") -> str:
    """Format amount with currency symbol"""
    symbols = {
        "INR": "₹",
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
    }
    symbol = symbols.get(currency, currency)
    return f"{symbol}{amount:,.2f}"


def calculate_daily_budget(total_budget: float, duration: int) -> float:
    """Calculate per-day budget"""
    return total_budget / duration if duration > 0 else 0


def group_activities_by_type(activities: List[Dict[str, Any]]) -> Dict[str, List]:
    """Group activities by type"""
    grouped = {}
    for activity in activities:
        activity_type = activity.get("activity_type", "other")
        if activity_type not in grouped:
            grouped[activity_type] = []
        grouped[activity_type].append(activity)
    return grouped


def merge_dicts(*dicts) -> Dict:
    """Merge multiple dictionaries"""
    result = {}
    for d in dicts:
        if d:
            result.update(d)
    return result
