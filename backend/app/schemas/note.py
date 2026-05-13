from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class NoteType(str, Enum):
    JOURNAL = "journal"
    TIP = "tip"
    MEMORY = "memory"
    GENERAL = "general"


class NoteBase(BaseModel):
    title: Optional[str] = None
    content: str
    note_type: NoteType = NoteType.GENERAL


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    note_type: Optional[NoteType] = None


class Note(NoteBase):
    id: int
    trip_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True