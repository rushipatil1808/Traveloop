from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from app.auth.jwt import create_access_token, create_refresh_token
from app.auth.password import get_password_hash, verify_password
from app.config import settings
from app.database import clean_doc, next_id, users
from app.schemas.auth import Token
from app.schemas.user import UserCreate

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    email: EmailStr
    full_name: str | None = None
    google_id: str | None = None


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
    }


def token_response_for_user(user: dict) -> dict:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"])},
        expires_delta=access_token_expires,
    )
    refresh_token = create_refresh_token(data={"sub": str(user["id"])})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": public_user(user),
    }


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = clean_doc(users.find_one({"email": form_data.username.lower()}))
    password_hash = user.get("password_hash") if user else None
    if not user or not password_hash or not verify_password(form_data.password, password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    return token_response_for_user(user)


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    email = user_data.email.lower()
    if users.find_one({"email": email}):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    now = datetime.utcnow()
    user = {
        "id": next_id("users"),
        "email": email,
        "full_name": user_data.full_name,
        "password_hash": get_password_hash(user_data.password),
        "created_at": now,
        "updated_at": now,
        "is_active": True,
    }
    users.insert_one(user)

    return token_response_for_user(user)


@router.post("/google", response_model=Token)
async def google_login(profile: GoogleAuthRequest):
    email = profile.email.lower()
    user = clean_doc(users.find_one({"email": email}))
    now = datetime.utcnow()

    if not user:
        user = {
            "id": next_id("users"),
            "email": email,
            "full_name": profile.full_name or email.split("@")[0],
            "google_id": profile.google_id,
            "password_hash": "",
            "created_at": now,
            "updated_at": now,
            "is_active": True,
        }
        users.insert_one(user)
    else:
        users.update_one(
            {"id": user["id"]},
            {"$set": {"google_id": profile.google_id, "updated_at": now}},
        )

    return token_response_for_user(user)


@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}
