from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BudgetBase(BaseModel):
    category: str
    planned_amount: float
    actual_amount: float = 0
    currency: str = "INR"


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    planned_amount: Optional[float] = None
    actual_amount: Optional[float] = None
    currency: Optional[str] = None


class Budget(BudgetBase):
    id: int
    trip_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BudgetSummary(BaseModel):
    total_planned: float
    total_actual: float
    currency: str
    categories: List[Budget] = []