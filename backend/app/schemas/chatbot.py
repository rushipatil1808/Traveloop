from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatbotMessage(BaseModel):
    session_id: str
    user_message: str
    trip_id: Optional[int] = None


class ChatbotResponse(BaseModel):
    response: str
    suggestions: Optional[list] = []


class ChatbotHistoryBase(BaseModel):
    session_id: str
    trip_id: Optional[int] = None
    user_message: str
    ai_response: str


class ChatbotHistory(ChatbotHistoryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True