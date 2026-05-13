from fastapi import APIRouter, Depends
from typing import List
from app.api.deps import get_current_user
from app.schemas.search import CitySearchResponse, ActivitySearchResponse
from app.services.search_service import SearchService

router = APIRouter()
search_service = SearchService()


@router.get("/cities", response_model=List[CitySearchResponse])
async def search_cities(
    q: str,
    limit: int = 10,
    current_user: object = Depends(get_current_user)
):
    return await search_service.search_cities(q, limit)


@router.get("/activities", response_model=List[ActivitySearchResponse])
async def search_activities(
    city: str,
    type: str = None,
    limit: int = 20,
    current_user: object = Depends(get_current_user)
):
    return await search_service.search_activities(city, type, limit)
