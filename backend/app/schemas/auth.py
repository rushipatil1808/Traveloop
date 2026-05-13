from pydantic import BaseModel
from typing import Optional
from app.schemas.user import User


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: dict  # Simplified user info


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str