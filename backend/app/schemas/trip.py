from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class TripStatus(str, Enum):
    PLANNING = "planning"
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ActivityType(str, Enum):
    SIGHTSEEING = "sightseeing"
    FOOD = "food"
    ADVENTURE = "adventure"
    CULTURAL = "cultural"
    ACCOMMODATION = "accommodation"
    TRANSPORT = "transport"


class NoteType(str, Enum):
    JOURNAL = "journal"
    TIP = "tip"
    MEMORY = "memory"
    GENERAL = "general"


class TripBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: TripStatus = TripStatus.PLANNING
    total_budget: Optional[float] = None
    currency: str = "INR"
    travel_style: Optional[str] = None
    group_type: Optional[str] = None
    group_size: int = 1
    ai_suggestions: List[str] = []
    destinations: List[str] = []


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[TripStatus] = None
    total_budget: Optional[float] = None
    currency: Optional[str] = None
    travel_style: Optional[str] = None
    group_type: Optional[str] = None
    group_size: Optional[int] = None
    ai_suggestions: Optional[List[str]] = None
    destinations: Optional[List[str]] = None


class TripStopBase(BaseModel):
    city_name: str
    country: str
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    order_index: int


class TripStopCreate(TripStopBase):
    pass


class TripStopUpdate(BaseModel):
    city_name: Optional[str] = None
    country: Optional[str] = None
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    order_index: Optional[int] = None


class ActivityBase(BaseModel):
    name: str
    description: Optional[str] = None
    activity_type: ActivityType = ActivityType.SIGHTSEEING
    time: Optional[str] = None  # HH:MM format
    duration_minutes: Optional[int] = None
    cost: Optional[float] = None
    location: Optional[str] = None
    is_completed: bool = False


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    activity_type: Optional[ActivityType] = None
    time: Optional[str] = None
    duration_minutes: Optional[int] = None
    cost: Optional[float] = None
    location: Optional[str] = None
    is_completed: Optional[bool] = None


class Activity(ActivityBase):
    id: int
    itinerary_day_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ItineraryDayBase(BaseModel):
    day_number: int
    date: Optional[date] = None
    theme: Optional[str] = None


class ItineraryDayCreate(ItineraryDayBase):
    activities: List[ActivityCreate] = []


class ItineraryDayUpdate(BaseModel):
    day_number: Optional[int] = None
    date: Optional[date] = None
    theme: Optional[str] = None


class ItineraryDay(ItineraryDayBase):
    id: int
    trip_stop_id: int
    activities: List[Activity] = []
    created_at: datetime

    class Config:
        from_attributes = True


class TripStop(TripStopBase):
    id: int
    trip_id: int
    itinerary_days: List[ItineraryDay] = []
    city_completed: bool = False
    ai_recommendations: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


class Trip(TripBase):
    id: int
    user_id: int
    stops: List[TripStop] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TripList(BaseModel):
    id: int
    name: str
    start_date: Optional[date]
    end_date: Optional[date]
    status: TripStatus
    total_budget: Optional[float]
    currency: str
    travel_style: Optional[str] = None
    group_type: Optional[str] = None
    group_size: int = 1
    cities: List[str] = []
    destinations: List[str] = []

    class Config:
        from_attributes = True