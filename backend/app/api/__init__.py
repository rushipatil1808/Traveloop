# API routes
from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.trips import router as trips_router
from app.api.ai import router as ai_router
from app.api.search import router as search_router
from app.api.budget import router as budget_router
from app.api.weather import router as weather_router
from app.api.expenses import router as expenses_router
from app.api.group_expenses import router as group_expenses_router

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/user", tags=["users"])
api_router.include_router(trips_router, prefix="/trips", tags=["trips"])
api_router.include_router(ai_router, prefix="/ai", tags=["ai"])
api_router.include_router(search_router, prefix="/search", tags=["search"])
api_router.include_router(budget_router, prefix="/budget", tags=["budget"])
api_router.include_router(weather_router, prefix="/weather", tags=["weather"])
api_router.include_router(expenses_router, prefix="/expenses", tags=["expenses"])
api_router.include_router(group_expenses_router, prefix="/group-expenses", tags=["group-expenses"])