"""
Search Service - Handles destination and activity search.
"""

from typing import List
from app.schemas.search import CitySearchResponse, ActivitySearchResponse
from app.utils.logger import logger


# Mock data for demonstration
CITIES_DB = [
    {"name": "Bali", "country": "Indonesia", "cost_index": "Budget", "daily_cost": 2500},
    {"name": "Kyoto", "country": "Japan", "cost_index": "Mid-range", "daily_cost": 8500},
    {"name": "Paris", "country": "France", "cost_index": "Luxury", "daily_cost": 12000},
    {"name": "Goa", "country": "India", "cost_index": "Budget", "daily_cost": 3000},
    {"name": "Tokyo", "country": "Japan", "cost_index": "Mid-range", "daily_cost": 9000},
]

ACTIVITIES_DB = {
    "Bali": [
        {"name": "Monkey Forest", "type": "sightseeing", "cost": 400},
        {"name": "Rice Terraces", "type": "sightseeing", "cost": 0},
        {"name": "Temple Visit", "type": "cultural", "cost": 300},
        {"name": "Surfing", "type": "adventure", "cost": 500},
    ],
    "Kyoto": [
        {"name": "Fushimi Inari", "type": "sightseeing", "cost": 0},
        {"name": "Bamboo Grove", "type": "sightseeing", "cost": 0},
        {"name": "Tea Ceremony", "type": "cultural", "cost": 5000},
        {"name": "Temple Tour", "type": "cultural", "cost": 1500},
    ],
}


class SearchService:
    """Service for search operations"""
    
    async def search_cities(self, query: str, limit: int = 10) -> List[CitySearchResponse]:
        """
        Search cities by name or country.
        
        In production, this would query Elasticsearch or similar.
        """
        try:
            logger.info(f"Searching cities with query: {query}")
            
            query_lower = query.lower()
            results = []
            
            for city in CITIES_DB:
                if (query_lower in city["name"].lower() or 
                    query_lower in city["country"].lower()):
                    results.append(CitySearchResponse(
                        name=city["name"],
                        country=city["country"],
                        cost_index=city["cost_index"],
                        daily_cost=city["daily_cost"]
                    ))
            
            return results[:limit]
        except Exception as e:
            logger.error(f"Error searching cities: {str(e)}")
            raise
    
    async def search_activities(
        self,
        city: str,
        activity_type: str = None,
        limit: int = 20
    ) -> List[ActivitySearchResponse]:
        """
        Search activities in a city, optionally filtered by type.
        
        In production, this would query a database or external API.
        """
        try:
            logger.info(f"Searching activities for {city} (type: {activity_type})")
            
            activities = ACTIVITIES_DB.get(city, [])
            results = []
            
            for activity in activities:
                if activity_type is None or activity["type"].lower() == activity_type.lower():
                    results.append(ActivitySearchResponse(
                        name=activity["name"],
                        type=activity["type"],
                        estimated_cost=activity["cost"],
                        city=city
                    ))
            
            return results[:limit]
        except Exception as e:
            logger.error(f"Error searching activities: {str(e)}")
            raise
