from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.auth.jwt import create_access_token, create_refresh_token
from app.auth.password import get_password_hash, verify_password
from app.config import settings
from app.database import clean_doc, next_id, users
from app.schemas.auth import Token
from app.schemas.user import UserCreate

router = APIRouter()


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
    }


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = clean_doc(users.find_one({"email": form_data.username.lower()}))
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

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


@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}
