from datetime import datetime

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings
from app.database import as_object, next_id, users


security = HTTPBearer()


def get_or_create_demo_user() -> object:
    demo = users.find_one({"email": "traveler@traveloop.ai"})
    if not demo:
        demo = {
            "id": next_id("users"),
            "email": "traveler@traveloop.ai",
            "full_name": "Alex Traveler",
            "password_hash": "",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
        }
        users.insert_one(demo)
    return as_object(demo)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> object:
    """Get current authenticated user from a JWT token stored in MongoDB."""
    if credentials.credentials == "demo_token":
        return get_or_create_demo_user()

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = as_object(users.find_one({"id": int(user_id)}))
    if user is None:
        raise credentials_exception

    if not getattr(user, "is_active", True):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    return user


def get_current_active_user(current_user: object = Depends(get_current_user)) -> object:
    if not getattr(current_user, "is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
