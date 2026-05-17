from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date


class ItineraryRequest(BaseModel):
    destinations: List[str]
    duration_days: int
    budget: float
    currency: str = "INR"
    travel_style: Optional[str] = None
    group_type: Optional[str] = None
    group_size: int = 1


class ActivityPlan(BaseModel):
    name: str
    time: str
    duration: str
    cost: float
    location: str
    description: str


class DayPlan(BaseModel):
    day: int
    date: date
    theme: str
    activities: List[ActivityPlan]


class CityPlan(BaseModel):
    city: str
    country: str
    arrival_date: date
    departure_date: date
    days: List[DayPlan]


class ItineraryResponse(BaseModel):
    itinerary: List[CityPlan]
    budget_breakdown: Dict[str, float]
    total_estimated_cost: float
    recommendations: List[str]


class BudgetPredictionRequest(BaseModel):
    destinations: List[str]
    duration_days: int = 1
    travel_style: Optional[str] = None
    group_size: int = 1
    currency: str = "INR"


class BudgetCategory(BaseModel):
    category: str
    estimated_amount: float
    confidence_score: float


class BudgetPredictionResponse(BaseModel):
    total_estimated_budget: float
    budget_breakdown: Dict[str, float]
    currency: str = "INR"
    confidence_score: float


class SearchRequest(BaseModel):
    query: str
    limit: int = 10


class SearchResponse(BaseModel):
    destination: str
    country: str = ""
    score: float
    reason: str
    tags: List[str] = []
    cost_index: str = ""
    avg_daily_cost: float = 0.0


class RecommendationsRequest(BaseModel):
    user_id: int


class Recommendation(BaseModel):
    destination: str
    reason: str
    confidence_score: float
    estimated_cost: float
    best_time: str


class RecommendationsResponse(BaseModel):
    recommendations: List[Recommendation]
    based_on_trips: int
