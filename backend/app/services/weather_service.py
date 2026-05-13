"""
Weather Service - Handles fetching weather data for travel destinations.
"""

from typing import Dict, Any, Optional
import httpx
from app.config import settings
from app.utils.logger import logger

class WeatherService:
    """Service for weather operations"""
    
    @staticmethod
    async def get_weather(city: str) -> Dict[str, Any]:
        """
        Get current weather and forecast for a city.
        
        Note: In a production app, you would use a real API key from OpenWeatherMap or similar.
        For this project, we provide a robust mock if no API key is present.
        """
        try:
            # If we had an API key, we would do this:
            # api_key = settings.WEATHER_API_KEY
            # if api_key:
            #     async with httpx.AsyncClient() as client:
            #         resp = await client.get(f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric")
            #         return resp.json()
            
            # Smart mock for demonstration
            logger.info(f"Fetching weather for {city}")
            
            # Simulated data based on common Indian destinations or general defaults
            city_weather_data = {
                "Goa": {"temp": 30, "condition": "Sunny", "humidity": 70, "wind": 12, "forecast": "Clear skies for the next 5 days. Perfect for beach activities."},
                "Manali": {"temp": 12, "condition": "Cloudy", "humidity": 45, "wind": 8, "forecast": "Light rain expected tomorrow. Pack warm clothes."},
                "Kerala": {"temp": 28, "condition": "Humid", "humidity": 85, "wind": 10, "forecast": "Monsoon showers likely in the afternoon. Lush greenery."},
                "Mumbai": {"temp": 32, "condition": "Hazy", "humidity": 65, "wind": 15, "forecast": "Warm and humid. Evening breeze expected."},
                "Delhi": {"temp": 38, "condition": "Hot", "humidity": 30, "wind": 20, "forecast": "Heatwave conditions. Stay hydrated and avoid afternoon travel."},
                "Jaipur": {"temp": 35, "condition": "Dry", "humidity": 25, "wind": 18, "forecast": "Clear skies. Great for evening sightseeing at forts."},
            }
            
            data = city_weather_data.get(city, {
                "temp": 25,
                "condition": "Pleasant",
                "humidity": 50,
                "wind": 10,
                "forecast": "Stable weather conditions expected for the next week."
            })
            
            return {
                "city": city,
                "current": {
                    "temp_c": data["temp"],
                    "condition": data["condition"],
                    "humidity": data["humidity"],
                    "wind_kph": data["wind"]
                },
                "forecast_summary": data["forecast"],
                "best_time_to_visit": "October to March",
                "clothing_recommendation": "Light cotton clothes" if data["temp"] > 25 else "Warm layers"
            }
        except Exception as e:
            logger.error(f"Error fetching weather: {str(e)}")
            raise
