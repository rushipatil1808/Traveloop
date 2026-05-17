from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ==================================================
# 1. TRIP MEMBER SCHEMAS
# ==================================================

class TripMemberBase(BaseModel):
    trip_id: int
    name: str
    avatar: Optional[str] = None
    total_paid: float = 0.0
    balance: float = 0.0

class TripMemberCreate(BaseModel):
    trip_id: int
    name: str
    avatar: Optional[str] = None

class TripMember(TripMemberBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==================================================
# 2. GROUP EXPENSE SCHEMAS
# ==================================================

class GroupExpenseBase(BaseModel):
    trip_id: int
    title: str
    amount: float
    category: str  # Food | Hotel | Transport | Activities | Shopping | Misc
    paid_by: str   # Name of the member who paid
    split_between: List[str]  # List of member names the expense is split between
    notes: Optional[str] = None
    date: Optional[str] = None

class GroupExpenseCreate(GroupExpenseBase):
    pass

class GroupExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    paid_by: Optional[str] = None
    split_between: Optional[List[str]] = None
    notes: Optional[str] = None
    date: Optional[str] = None

class GroupExpense(GroupExpenseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==================================================
# 3. SETTLEMENT SCHEMAS
# ==================================================

class SettlementBase(BaseModel):
    trip_id: int
    from_user: str  # Member name paying
    to_user: str    # Member name receiving
    amount: float

class SettlementCreate(SettlementBase):
    pass

class Settlement(SettlementBase):
    id: int
    settled_at: datetime

    class Config:
        from_attributes = True

# ==================================================
# 4. AGGREGATED RESPONSE SCHEMAS
# ==================================================

class GroupExpensesOverview(BaseModel):
    trip_id: int
    trip_name: str
    total_members: int
    total_expenses: float
    expenses_count: int
    budget: float
    spent: float
    remaining: float
    overspending: bool
