from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.database import chatbot_history, clean_docs, next_id, trips
from app.schemas.ai import (
    BudgetPredictionRequest,
    BudgetPredictionResponse,
    ItineraryRequest,
    ItineraryResponse,
    RecommendationsResponse,
    SearchRequest,
    SearchResponse,
)
from app.schemas.chatbot import ChatbotMessage, ChatbotResponse
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()


@router.post("/generate-itinerary", response_model=ItineraryResponse)
async def generate_itinerary(
    request: ItineraryRequest,
    current_user: object = Depends(get_current_user),
):
    try:
        return await ai_service.generate_itinerary(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/generate", response_model=ItineraryResponse)
async def generate_itinerary_compat(
    request: ItineraryRequest,
    current_user: object = Depends(get_current_user),
):
    return await generate_itinerary(request, current_user)


@router.post("/predict-budget", response_model=BudgetPredictionResponse)
async def predict_budget(
    request: BudgetPredictionRequest,
    current_user: object = Depends(get_current_user),
):
    try:
        return await ai_service.predict_budget(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/chat", response_model=ChatbotResponse)
async def chat_with_ai(
    request: ChatbotMessage,
    current_user: object = Depends(get_current_user),
):
    try:
        history = clean_docs(
            chatbot_history.find({
                "user_id": current_user.id,
                "session_id": request.session_id,
            }).sort("created_at", -1).limit(10)
        )
        history = list(reversed(history))

        result = await ai_service.chat(request, history)

        chatbot_history.insert_one({
            "id": next_id("chatbot_history"),
            "user_id": current_user.id,
            "session_id": request.session_id,
            "trip_id": request.trip_id,
            "user_message": request.user_message,
            "ai_response": result.response,
            "created_at": datetime.utcnow(),
        })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")


@router.post("/search", response_model=List[SearchResponse])
async def semantic_search(
    request: SearchRequest,
    current_user: object = Depends(get_current_user),
):
    try:
        return await ai_service.semantic_search(request.query, request.limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search service error: {str(e)}")


@router.get("/recommendations/{user_id}", response_model=RecommendationsResponse)
async def get_recommendations(
    user_id: int,
    current_user: object = Depends(get_current_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        user_trips = clean_docs(trips.find({"user_id": user_id}))
        return await ai_service.get_recommendations(user_trips)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation service error: {str(e)}")
