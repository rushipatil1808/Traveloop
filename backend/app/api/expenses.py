"""
Expenses API routes backed by MongoDB.
Provides full CRUD for trip expenses with city-wise and category-wise aggregation.
"""

from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.database import clean_doc, clean_docs, expenses, next_id, trips
from app.schemas.expense import Expense, ExpenseCreate, ExpenseListResponse, ExpenseUpdate
from app.utils.logger import logger

router = APIRouter()


def require_trip(trip_id: int, user_id: int) -> dict:
    trip = clean_doc(trips.find_one({"id": trip_id, "user_id": user_id}))
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


def build_expense_summary(expense_list: list) -> dict:
    total = sum(float(e.get("amount", 0)) for e in expense_list)
    by_city: Dict[str, float] = {}
    by_category: Dict[str, float] = {}
    for e in expense_list:
        city = e.get("city", "Other")
        cat = e.get("category", "Misc")
        by_city[city] = by_city.get(city, 0.0) + float(e.get("amount", 0))
        by_category[cat] = by_category.get(cat, 0.0) + float(e.get("amount", 0))
    return {"total_amount": total, "by_city": by_city, "by_category": by_category}


@router.post("/{trip_id}", response_model=Expense)
async def create_expense(
    trip_id: int,
    expense_data: ExpenseCreate,
    current_user: object = Depends(get_current_user),
):
    """Add a new expense to a trip."""
    try:
        require_trip(trip_id, current_user.id)
        now = datetime.utcnow()
        doc = expense_data.dict()
        doc.update({
            "id": next_id("expenses"),
            "trip_id": trip_id,
            "created_at": now,
        })
        expenses.insert_one(doc)
        return clean_doc(doc)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating expense: {e}")
        raise HTTPException(status_code=500, detail="Failed to create expense")


@router.get("/{trip_id}", response_model=ExpenseListResponse)
async def get_expenses(
    trip_id: int,
    current_user: object = Depends(get_current_user),
):
    """Get all expenses for a trip with city/category summaries."""
    try:
        require_trip(trip_id, current_user.id)
        expense_list = clean_docs(
            expenses.find({"trip_id": trip_id}).sort("created_at", -1)
        )
        summary = build_expense_summary(expense_list)
        return {
            "expenses": expense_list,
            **summary,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching expenses: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch expenses")


@router.put("/{expense_id}", response_model=Expense)
async def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    current_user: object = Depends(get_current_user),
):
    """Update an expense by ID."""
    try:
        expense = clean_doc(expenses.find_one({"id": expense_id}))
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        # Verify trip ownership
        require_trip(expense["trip_id"], current_user.id)

        update_data = {k: v for k, v in expense_update.dict(exclude_unset=True).items() if v is not None}
        expenses.update_one({"id": expense_id}, {"$set": update_data})
        updated = clean_doc(expenses.find_one({"id": expense_id}))
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating expense: {e}")
        raise HTTPException(status_code=500, detail="Failed to update expense")


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: int,
    current_user: object = Depends(get_current_user),
):
    """Delete an expense by ID."""
    try:
        expense = clean_doc(expenses.find_one({"id": expense_id}))
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        require_trip(expense["trip_id"], current_user.id)

        result = expenses.delete_one({"id": expense_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Expense not found")
        return {"message": "Expense deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting expense: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete expense")
