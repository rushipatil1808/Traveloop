from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChecklistItemBase(BaseModel):
    item_name: str
    category: Optional[str] = None
    is_completed: bool = False


class ChecklistItemCreate(ChecklistItemBase):
    pass


class ChecklistItemUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    is_completed: Optional[bool] = None


class ChecklistItem(ChecklistItemBase):
    id: int
    trip_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChecklistSummary(BaseModel):
    total_items: int
    completed_items: int
    categories: List[str] = []
    items: List[ChecklistItem] = []