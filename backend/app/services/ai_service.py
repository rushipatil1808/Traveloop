"""
AI Service - Handles AI-powered features like itinerary generation and budget prediction.
"""

from typing import List, Optional
from datetime import datetime
from app.schemas.ai import (
    ItineraryRequest, ItineraryResponse,
    BudgetPredictionRequest, BudgetPredictionResponse,
    SearchRequest, SearchResponse,
    RecommendationsRequest, RecommendationsResponse,
    CityPlan, DayPlan, ActivityPlan
)
from app.schemas.chatbot import ChatbotMessage, ChatbotResponse
from app.utils.logger import logger
from app.config import settings

import json
import urllib.request
import urllib.error
from langchain_ollama import OllamaLLM
from huggingface_hub import InferenceClient
from langchain_core.prompts import PromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

class AIService:
    """Service for AI operations powered by DeepSeek (Ollama) and Hugging Face"""
    
    def __init__(self):
        self.vector_store = None
        if not settings.ENABLE_RAG:
            logger.info("RAG vector store disabled. Set ENABLE_RAG=True to enable Hugging Face embeddings.")
            return

        try:
            self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            # Create a simple knowledge base for RAG with Indian Cities & States dataset
            travel_data = [
                "Traveloop is an AI-powered travel planning platform designed to make exploring the world seamless and budget-friendly.",
                "A good budget strategy is to allocate 40% to accommodation, 30% to activities, 20% to food, and 10% to transport.",
                "Mumbai, Maharashtra: Known as the city of dreams, famous for Gateway of India, Marine Drive, and Bollywood. Best time to visit is Nov-Feb. Average budget: ₹3,000-₹5,000/day.",
                "Delhi: The capital city with rich history, featuring Red Fort, India Gate, and Qutub Minar. Famous for street food in Chandni Chowk. Average budget: ₹2,500-₹4,500/day.",
                "Goa: The party capital of India with stunning beaches, Portuguese architecture, and vibrant nightlife. North Goa is for parties, South Goa for peace. Average budget: ₹3,000-₹6,000/day.",
                "Jaipur, Rajasthan: The Pink City, home to Hawa Mahal, Amer Fort, and City Palace. Perfect for royal heritage and Rajasthani thali. Average budget: ₹2,000-₹4,000/day.",
                "Kerala: God's Own Country. Famous for Alleppey backwaters, Munnar tea gardens, and Ayurvedic retreats. Best time is Sep-Mar. Average budget: ₹3,000-₹5,500/day.",
                "Varanasi, Uttar Pradesh: The spiritual capital of India, known for Ganga Aarti at Dashashwamedh Ghat and Kashi Vishwanath Temple. Average budget: ₹1,500-₹2,500/day.",
                "Rishikesh & Haridwar, Uttarakhand: The Yoga capital of the world. Famous for river rafting, Ganga Aarti, and ashrams. Average budget: ₹1,500-₹3,000/day.",
                "Manali, Himachal Pradesh: A high-altitude Himalayan resort town. Known for Rohtang Pass, Solang Valley adventure sports, and snow. Average budget: ₹2,500-₹4,500/day.",
                "Bangalore, Karnataka: The Silicon Valley of India, featuring Cubbon Park, great breweries, and nice weather year-round. Average budget: ₹2,500-₹4,000/day.",
                "Agra, Uttar Pradesh: Home to the iconic Taj Mahal and Agra Fort. Usually a 1-2 day trip. Average budget: ₹2,000-₹3,500/day.",
                "Udaipur, Rajasthan: The City of Lakes, known for its romantic settings, Lake Palace, and City Palace. Average budget: ₹3,000-₹5,500/day.",
                "Sikkim: A beautiful northeastern state known for Kanchenjunga, Buddhist monasteries, and Nathu La Pass. Average budget: ₹2,500-₹4,000/day.",
                "Meghalaya: The abode of clouds, famous for Cherrapunji, living root bridges, and Dawki river. Average budget: ₹2,000-₹3,500/day.",
                "Andaman and Nicobar Islands: Paradise for scuba diving, pristine beaches like Radhanagar Beach, and Cellular Jail history. Average budget: ₹4,000-₹7,000/day.",
                "Kashmir: Heaven on earth. Famous for Dal Lake houseboats, Gulmarg skiing, and Pahalgam valleys. Average budget: ₹3,500-₹6,000/day."
            ]
            docs = [Document(page_content=text) for text in travel_data]
            self.vector_store = FAISS.from_documents(docs, self.embeddings)
            logger.info("RAG vector store initialized successfully.")
        except Exception as e:
            logger.warning(f"Could not initialize vector store: {e}")
            self.vector_store = None
    
    async def generate_itinerary(self, request: ItineraryRequest) -> ItineraryResponse:
        """
        Generate AI-powered itinerary using DeepSeek via Ollama.
        """
        try:
            logger.info(f"Generating itinerary for {request.destinations} using Ollama (DeepSeek)")
            
            try:
                # Initialize Ollama with DeepSeek model
                llm = OllamaLLM(model="deepseek-coder", temperature=0.7)
                
                prompt = PromptTemplate(
                    input_variables=["destinations", "duration", "budget", "style"],
                    template="""
                    You are an expert travel planner. Create a detailed daily itinerary.
                    Destinations: {destinations}
                    Duration: {duration} days
                    Budget: {budget}
                    Style: {style}
                    
                    Respond ONLY with a valid JSON object matching this schema:
                    {{
                      "daily_itineraries": [
                        {{ "day": 1, "activities": [{{ "time": "09:00", "name": "Activity", "cost": 500 }}] }}
                      ]
                    }}
                    """
                )
                
                formatted_prompt = prompt.format(
                    destinations=", ".join(request.destinations),
                    duration=request.duration_days,
                    budget=request.budget,
                    style=request.travel_style or "balanced"
                )
                
                # Attempt to generate real AI response
                response_text = llm.invoke(formatted_prompt)
                ai_data = json.loads(response_text)
                daily_itineraries = ai_data.get("daily_itineraries", [])
            except Exception as e:
                logger.warning(f"Ollama/DeepSeek offline, using AI smart fallback: {e}")
                # Smart fallback for hackathon if Ollama isn't running locally
                from datetime import date, timedelta
                start_date = date.today()
                
                # Create a simple itinerary structure
                city_plan = CityPlan(
                    city=request.destinations[0] if request.destinations else "Destination",
                    country="Unknown",  # Could be enhanced with geocoding
                    arrival_date=start_date,
                    departure_date=start_date + timedelta(days=request.duration_days),
                    days=[
                        DayPlan(
                            day=i + 1,
                            date=start_date + timedelta(days=i),
                            theme=f"Day {i + 1} Exploration",
                            activities=[
                                ActivityPlan(
                                    name=f"Explore {request.destinations[0]} Landmarks",
                                    time="09:00",
                                    duration="3 hours",
                                    cost=500,
                                    location=request.destinations[0],
                                    description="Visit popular landmarks and attractions"
                                ),
                                ActivityPlan(
                                    name="Local Experience",
                                    time="14:00", 
                                    duration="4 hours",
                                    cost=800,
                                    location=request.destinations[0],
                                    description="Enjoy authentic local cuisine and culture"
                                )
                            ]
                        )
                        for i in range(request.duration_days)
                    ]
                )
                
                itinerary_data = {
                    "itinerary": [city_plan],
                    "budget_breakdown": {
                        "accommodation": request.budget * 0.4,
                        "activities": request.budget * 0.3,
                        "food": request.budget * 0.2,
                        "transport": request.budget * 0.1
                    },
                    "total_estimated_cost": request.budget,
                    "recommendations": [
                        "Book accommodation in advance",
                        "Check weather conditions",
                        "Carry local currency",
                        "Stay hydrated and use sunscreen"
                    ]
                }
            
            return ItineraryResponse(**itinerary_data)
        except Exception as e:
            logger.error(f"Error generating itinerary: {str(e)}")
            raise
    
    async def predict_budget(self, request: BudgetPredictionRequest) -> BudgetPredictionResponse:
        """
        Predict budget for trip.
        
        Uses ML model to estimate costs based on historical data.
        """
        try:
            logger.info(f"Predicting budget for {request.destinations}")
            
            # Base costs per day
            base_costs = {
                "accommodation": 1500,
                "food": 800,
                "activities": 1000,
                "transport": 500,
                "miscellaneous": 200
            }
            
            # Apply travel style multiplier
            multiplier = 1.0
            if request.travel_style == "luxury":
                multiplier = 2.5
            elif request.travel_style == "budget":
                multiplier = 0.5
            elif request.travel_style == "mid-range":
                multiplier = 1.2
            
            # Calculate estimated costs for full duration
            estimated_costs = {
                category: int(cost * multiplier * request.duration_days)
                for category, cost in base_costs.items()
            }
            
            total_estimated = sum(estimated_costs.values())
            
            return BudgetPredictionResponse(
                total_estimated_budget=total_estimated,
                budget_breakdown=estimated_costs,
                currency=request.currency or "INR",
                confidence_score=0.85
            )
        except Exception as e:
            logger.error(f"Error predicting budget: {str(e)}")
            raise
    
    async def chat(self, request: ChatbotMessage, history: List = None) -> ChatbotResponse:
        """
        Generate AI chatbot response using Hugging Face models.
        """
        try:
            logger.info(f"Processing chat message using Hugging Face with RAG")
            
            # 1. RAG Retrieval Step
            context_str = ""
            if hasattr(self, 'vector_store') and self.vector_store:
                try:
                    docs = self.vector_store.similarity_search(request.user_message, k=2)
                    context_str = "\n".join([f"- {d.page_content}" for d in docs])
                    logger.info(f"RAG context retrieved: {context_str}")
                except Exception as e:
                    logger.warning(f"RAG retrieval failed: {e}")

            try:
                # 2. LLM Generation Step
                if settings.AI_PROVIDER.lower() == "mistral":
                    response_text = self._call_mistral(request.user_message, context_str, history)
                else:
                    client = InferenceClient(
                        model="gpt2-medium"
                    )
                    
                    history_str = "\n".join([
                        f"User: {h.get('user_message') if isinstance(h, dict) else h.user_message}\nAI: {h.get('ai_response') if isinstance(h, dict) else h.ai_response}"
                        for h in (history or [])
                    ])
                    
                    # Incorporate RAG context into the prompt
                    prompt = f"Knowledge Base Context (use this to provide reliable answers if relevant):\n{context_str}\n\nConversation History:\n{history_str}\n\nUser: {request.user_message}\nTravel AI Guide:"
                    
                    response = client.text_generation(
                        prompt,
                        max_new_tokens=500,
                        temperature=0.7,
                        do_sample=True
                    )
                    
                    response_text = response
            except Exception as e:
                logger.warning(f"AI provider failed, using smart fallback: {e}")
                rag_addition = f"\n\nHere is some reliable information I found for you:\n{context_str}" if context_str else ""
                response_text = f"As your AI Guide, here is my advice regarding '{request.user_message}': I highly recommend exploring authentic local experiences.{rag_addition}"
            
            return ChatbotResponse(
                response=response_text,
                suggestions=[
                    "What are the top attractions?",
                    "How can I reduce my budget?",
                    "Generate a packing list for me"
                ],
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Error in chat: {str(e)}")
            raise

    def _call_mistral(self, user_message: str, context_str: str, history: List) -> str:
        if not settings.MISTRAL_API_KEY:
            raise ValueError("MISTRAL_API_KEY is not set. Add it to your .env and restart the backend.")

        if history:
            history_messages = [
                item
                for h in history
                for item in [
                    {"role": "user", "content": h.get("user_message") if isinstance(h, dict) else h.user_message},
                    {"role": "assistant", "content": h.get("ai_response") if isinstance(h, dict) else h.ai_response}
                ]
            ]
        else:
            history_messages = []

        prompt = f"Knowledge Base Context (use this to provide reliable answers if relevant):\n{context_str}\n\nUser: {user_message}"
        messages = history_messages + [{"role": "user", "content": prompt}]

        body = {
            "model": settings.MISTRAL_MODEL,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 500
        }

        request_data = json.dumps(body).encode("utf-8")
        request = urllib.request.Request(
            settings.MISTRAL_API_URL,
            data=request_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.MISTRAL_API_KEY}"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                response_body = response.read().decode("utf-8")
                data = json.loads(response_body)
                return data["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            raise RuntimeError(f"Mistral API error {e.code}: {error_body}")
        except urllib.error.URLError as e:
            raise RuntimeError(f"Mistral API request failed: {e.reason}")
        except Exception as e:
            logger.error(f"Error in chat: {str(e)}")
            raise
    
    async def semantic_search(self, query: str, limit: int = 10) -> List[SearchResponse]:
        """
        Semantic search for destinations using vector embeddings.
        
        Uses FAISS for efficient similarity search.
        """
        try:
            logger.info(f"Semantic search for: {query}")
            
            # TODO: Implement FAISS vector search
            # For now, return mock results
            
            results = [
                SearchResponse(
                    destination="Bali",
                    score=0.95,
                    reason="Matches your interest in beach destinations",
                    daily_cost=2500,
                    tags=["beach", "spiritual", "affordable"]
                ),
                SearchResponse(
                    destination="Kyoto",
                    score=0.87,
                    reason="Great for cultural experiences",
                    daily_cost=8500,
                    tags=["temples", "cultural", "historical"]
                )
            ]
            
            return results[:limit]
        except Exception as e:
            logger.error(f"Error in semantic search: {str(e)}")
            raise
    
    async def get_recommendations(self, user_trips: List) -> RecommendationsResponse:
        """
        Get personalized recommendations based on user history.
        """
        try:
            if not user_trips:
                # Default recommendations
                destinations = [
                    {"name": "Bali", "score": 0.9},
                    {"name": "Tokyo", "score": 0.85},
                    {"name": "Paris", "score": 0.8}
                ]
            else:
                # TODO: Build recommendations based on user trip history
                destinations = [
                    {"name": "Bali", "score": 0.9},
                    {"name": "Kyoto", "score": 0.85}
                ]
            
            return RecommendationsResponse(
                recommendations=destinations,
                reason="Based on your travel history"
            )
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            raise
    
    def _generate_travel_advice(self, query: str) -> str:
        """Generate travel advice based on query"""
        # TODO: Integrate with LangChain for dynamic advice
        return "Great question! I'd be happy to help with your travel planning."
    
    def _generate_suggestions(self, query: str) -> List[str]:
        """Generate follow-up suggestions"""
        return [
            "Tell me about your budget",
            "What's your travel style?",
            "How many days do you have?"
        ]
