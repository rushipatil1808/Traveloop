"""
Schemas for search operations
"""

from pydantic import BaseModel
from typing import List, Optional


class CitySearchResponse(BaseModel):
    name: str
    country: str
    cost_index: str
    daily_cost: float


class ActivitySearchResponse(BaseModel):
    name: str
    type: str
    city: str
    estimated_cost: float