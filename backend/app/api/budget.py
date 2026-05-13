"""
Budget API routes backed by MongoDB.
"""

from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.database import budgets, clean_doc, clean_docs, next_id, trips
from app.utils.logger import logger

router = APIRouter()

DEFAULT_BUDGET_CATEGORIES = {
    "Accommodation": 0.4,
    "Food": 0.25,
    "Transport": 0.2,
    "Activities": 0.1,
    "Miscellaneous": 0.05,
}


def create_default_budgets(trip_id: int, total_budget: float, currency: str = "INR") -> None:
    now = datetime.utcnow()
    for category, ratio in DEFAULT_BUDGET_CATEGORIES.items():
        budgets.update_one(
            {"trip_id": trip_id, "category": category},
            {
                "$setOnInsert": {
                    "id": next_id("budgets"),
                    "trip_id": trip_id,
                    "category": category,
                    "actual_amount": 0,
                    "currency": currency,
                    "created_at": now,
                },
                "$set": {
                    "planned_amount": round(total_budget * ratio, 2),
                    "updated_at": now,
                },
            },
            upsert=True,
        )


def require_trip(trip_id: int, user_id: int) -> dict:
    trip = clean_doc(trips.find_one({"id": trip_id, "user_id": user_id}))
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip


def budget_breakdown(trip_id: int) -> Dict[str, Any]:
    categories = clean_docs(budgets.find({"trip_id": trip_id}).sort("category", 1))
    total_planned = sum(float(item.get("planned_amount", 0)) for item in categories)
    total_actual = sum(float(item.get("actual_amount", 0)) for item in categories)
    currency = categories[0].get("currency", "INR") if categories else "INR"
    return {
        "total_planned": total_planned,
        "total_actual": total_actual,
        "remaining": total_planned - total_actual,
        "currency": currency,
        "categories": categories,
    }


@router.get("/{trip_id}", response_model=Dict[str, Any])
async def get_trip_budget(
    trip_id: int,
    current_user: object = Depends(get_current_user),
):
    try:
        trip = require_trip(trip_id, current_user.id)
        if budgets.count_documents({"trip_id": trip_id}) == 0 and trip.get("total_budget"):
            create_default_budgets(trip_id, float(trip["total_budget"]), trip.get("currency", "INR"))
        return budget_breakdown(trip_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting trip budget: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get budget")


@router.put("/{trip_id}", response_model=Dict[str, Any])
async def update_trip_budget(
    trip_id: int,
    budget_update: Dict[str, Dict[str, float]],
    current_user: object = Depends(get_current_user),
):
    try:
        trip = require_trip(trip_id, current_user.id)
        now = datetime.utcnow()
        categories = budget_update.get("categories", {})
        for category, amount in categories.items():
            budgets.update_one(
                {"trip_id": trip_id, "category": category},
                {
                    "$setOnInsert": {
                        "id": next_id("budgets"),
                        "trip_id": trip_id,
                        "category": category,
                        "actual_amount": 0,
                        "currency": trip.get("currency", "INR"),
                        "created_at": now,
                    },
                    "$set": {"planned_amount": float(amount), "updated_at": now},
                },
                upsert=True,
            )
        return budget_breakdown(trip_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating trip budget: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update budget")


@router.post("/{trip_id}/expense")
async def add_expense(
    trip_id: int,
    expense_data: Dict[str, Any],
    current_user: object = Depends(get_current_user),
):
    try:
        trip = require_trip(trip_id, current_user.id)
        category = expense_data.get("category")
        amount = expense_data.get("amount")
        if not category or amount is None:
            raise HTTPException(status_code=400, detail="Missing category or amount")

        now = datetime.utcnow()
        budgets.update_one(
            {"trip_id": trip_id, "category": category},
            {
                "$setOnInsert": {
                    "id": next_id("budgets"),
                    "trip_id": trip_id,
                    "category": category,
                    "planned_amount": 0,
                    "currency": trip.get("currency", "INR"),
                    "created_at": now,
                },
                "$inc": {"actual_amount": float(amount)},
                "$set": {"updated_at": now},
            },
            upsert=True,
        )
        return budget_breakdown(trip_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding expense: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add expense")
