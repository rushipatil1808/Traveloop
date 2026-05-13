"""
Validation utilities for Traveloop backend.
"""

from datetime import date
from email_validator import validate_email, EmailNotValidError
from app.core.exceptions import ValidationError


def validate_email_format(email: str) -> bool:
    """Validate email format"""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    Returns (is_valid, message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    if not (has_upper and has_lower and has_digit):
        return False, "Password must contain uppercase, lowercase, and digits"
    
    return True, "Password is strong"


def validate_date_range(start_date: date, end_date: date) -> bool:
    """Validate that end date is after start date"""
    return end_date > start_date


def validate_budget(budget: float) -> bool:
    """Validate budget is positive"""
    return budget > 0


def validate_group_size(size: int) -> bool:
    """Validate group size"""
    return 1 <= size <= 20
