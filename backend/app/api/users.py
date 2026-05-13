from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.database import as_object, clean_doc, users
from app.schemas.user import User as UserSchema, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: object = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserSchema)
async def update_user_me(
    user_update: UserUpdate,
    current_user: object = Depends(get_current_user),
):
    update_data = user_update.dict(exclude_unset=True)
    if "email" in update_data and update_data["email"]:
        update_data["email"] = update_data["email"].lower()
        existing = users.find_one({"email": update_data["email"], "id": {"$ne": current_user.id}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

    update_data["updated_at"] = datetime.utcnow()
    users.update_one({"id": current_user.id}, {"$set": update_data})
    return as_object(clean_doc(users.find_one({"id": current_user.id})))
