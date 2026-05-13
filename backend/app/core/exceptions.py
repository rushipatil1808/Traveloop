"""
Custom exception classes for Traveloop backend.
"""

class TraveloopException(Exception):
    """Base exception for Traveloop"""
    pass


class AuthenticationError(TraveloopException):
    """Raised when authentication fails"""
    pass


class TokenExpiredError(TraveloopException):
    """Raised when JWT token has expired"""
    pass


class InvalidTokenError(TraveloopException):
    """Raised when JWT token is invalid"""
    pass


class NotFoundError(TraveloopException):
    """Raised when resource is not found"""
    pass


class ValidationError(TraveloopException):
    """Raised when validation fails"""
    pass


class AIServiceError(TraveloopException):
    """Raised when AI service fails"""
    pass


class DatabaseError(TraveloopException):
    """Raised when database operation fails"""
    pass
