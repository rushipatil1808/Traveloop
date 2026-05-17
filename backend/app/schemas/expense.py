from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ExpenseCategory(str):
    pass


EXPENSE_CATEGORIES = ["Food", "Hotel", "Transport", "Activities", "Shopping", "Misc"]


class ExpenseBase(BaseModel):
    title: str
    amount: float
    category: str  # Food | Hotel | Transport | Activities | Shopping | Misc
    city: str
    paid_by: Optional[str] = None
    notes: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    city: Optional[str] = None
    paid_by: Optional[str] = None
    notes: Optional[str] = None


class Expense(ExpenseBase):
    id: int
    trip_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseListResponse(BaseModel):
    expenses: List[Expense] = []
    total_amount: float = 0.0
    by_city: dict = {}
    by_category: dict = {}
