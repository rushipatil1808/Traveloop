from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.auth.password import get_password_hash, verify_password
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


@router.put("/me/password")
async def update_password(
    password_update: dict,
    current_user: object = Depends(get_current_user),
):
    current_password = password_update.get("current_password")
    new_password = password_update.get("new_password")
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Current and new passwords are required")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    user = clean_doc(users.find_one({"id": current_user.id}))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    password_hash = user.get("password_hash") or ""
    if password_hash and not verify_password(current_password, password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    users.update_one(
        {"id": current_user.id},
        {"$set": {"password_hash": get_password_hash(new_password), "updated_at": datetime.utcnow()}},
    )
    return {"message": "Password updated successfully"}
