from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.services.weather_service import WeatherService

router = APIRouter()

@router.get("/{city}")
async def get_city_weather(
    city: str,
    current_user: object = Depends(get_current_user)
):
    """Get weather data for a specific city"""
    try:
        return await WeatherService.get_weather(city)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")
