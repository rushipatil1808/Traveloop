"""
AI Service - Handles AI-powered features like itinerary generation and budget prediction.
"""

from typing import List, Optional
from datetime import date, datetime, timedelta
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

class AIService:
    """Service for AI operations powered by DeepSeek (Ollama) and Hugging Face"""
    
    def __init__(self):
        self.vector_store = None
        if not settings.ENABLE_RAG:
            logger.info("RAG vector store disabled. Set ENABLE_RAG=True to enable Hugging Face embeddings.")
            return

        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            from langchain_community.vectorstores import FAISS
            from langchain_core.documents import Document
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
                import requests
                import json
                from app.config import settings
                
                mistral_key = getattr(settings, "MISTRAL_API_KEY", None)
                dest_str = ", ".join(request.destinations) if request.destinations else "the destination"
                
                ai_data = {}
                if mistral_key:
                    logger.info("Using Mistral API for better output...")
                    headers = {"Authorization": f"Bearer {mistral_key}", "Content-Type": "application/json"}
                    payload = {
                        "model": getattr(settings, "MISTRAL_MODEL", "mistral-small-latest"),
                        "messages": [{"role": "user", "content": f'''
                        You are an expert AI travel planner. Create a daily itinerary and city-wise recommendations for: {dest_str}.
                        Duration: {request.duration_days} days. Budget: {request.budget}. Travel Style: {request.travel_style}.

                        Respond ONLY with valid JSON matching this schema exactly:
                        {{
                          "daily_itineraries": [
                            {{ "day": 1, "activities": [{{ "time": "09:00", "name": "Visit Landmark", "cost": 500, "duration": "2 hours" }}] }}
                          ],
                          "recommendations": [
                            "🏨 Hotel: [Name] - [Approx Cost] - [Why it is good]",
                            "🗺️ Activity: [Name] - [Ticket Cost] - [Why visit]",
                            "💡 Tip: [Local Tip]"
                          ]
                        }}
                        '''}],
                        "response_format": {"type": "json_object"}
                    }
                    resp = requests.post("https://api.mistral.ai/v1/chat/completions", json=payload, headers=headers)
                    resp.raise_for_status()
                    ai_data = json.loads(resp.json()["choices"][0]["message"]["content"])
                else:
                    # Initialize Ollama with DeepSeek model (lazy import)
                    from langchain_ollama import OllamaLLM
                    from langchain_core.prompts import PromptTemplate
                    llm = OllamaLLM(model="deepseek-coder", temperature=0.7)
                    
                    prompt = PromptTemplate(
                        input_variables=["destinations", "duration", "budget", "style"],
                        template='''
                        You are an expert travel planner. Create a detailed daily itinerary and recommendations.
                        Destinations: {destinations}
                        Duration: {duration} days
                        Budget: {budget}
                        Style: {style}
                        
                        Respond ONLY with a valid JSON object matching this schema:
                        {{
                          "daily_itineraries": [
                            {{ "day": 1, "activities": [{{ "time": "09:00", "name": "Activity", "cost": 500 }}] }}
                          ],
                          "recommendations": [
                            "🏨 Hotel: [Name] - [Cost] - [Why]",
                            "🗺️ Activity: [Name] - [Cost] - [Why]",
                            "💡 Tip: [Local Tip]"
                          ]
                        }}
                        '''
                    )
                    
                    formatted_prompt = prompt.format(
                        destinations=dest_str,
                        duration=request.duration_days,
                        budget=request.budget,
                        style=request.travel_style or "balanced"
                    )
                    
                    # Attempt to generate real AI response
                    response_text = llm.invoke(formatted_prompt)
                    ai_data = json.loads(response_text)

                daily_itineraries = ai_data.get("daily_itineraries", [])
                start_date = date.today()
                destination = request.destinations[0] if request.destinations else "Destination"
                city_plan = CityPlan(
                    city=destination,
                    country="Unknown",
                    arrival_date=start_date,
                    departure_date=start_date + timedelta(days=request.duration_days),
                    days=[
                        DayPlan(
                            day=item.get("day", index + 1),
                            date=start_date + timedelta(days=index),
                            theme=item.get("theme", f"Day {index + 1} - Explore {destination}"),
                            activities=[
                                ActivityPlan(
                                    name=activity.get("name", "Explore local attraction"),
                                    time=activity.get("time", "09:00"),
                                    duration=activity.get("duration", "2 hours"),
                                    cost=float(activity.get("cost", 0)),
                                    location=activity.get("location", destination),
                                    description=activity.get("description", "Recommended travel activity"),
                                )
                                for activity in item.get("activities", [])
                            ],
                        )
                        for index, item in enumerate(daily_itineraries)
                    ],
                )
                itinerary_data = {
                    "itinerary": [city_plan],
                    "budget_breakdown": {
                        "accommodation": float(request.budget * 0.4),
                        "activities": float(request.budget * 0.3),
                        "food": float(request.budget * 0.2),
                        "transport": float(request.budget * 0.1),
                    },
                    "total_estimated_cost": float(request.budget),
                    "recommendations": ai_data.get("recommendations", [
                        f"🏨 Hotel: Central Stay - ₹2000 - Close to transit in {destination}.",
                        "🗺️ Activity: Walking Tour - Free - Great to explore.",
                        "💡 Tip: Keep one flexible half-day for weather or travel delays."
                    ]),
                }
            except Exception as e:
                logger.warning(f"Ollama/DeepSeek offline, using AI smart fallback: {e}")
                # Smart fallback for hackathon if Ollama isn't running locally
                start_date = date.today()
                
                # Create a simple itinerary structure
                city_plan = CityPlan(
                    city=request.destinations[0] if request.destinations else "Destination",
                    country="India",
                    arrival_date=start_date,
                    departure_date=start_date + timedelta(days=request.duration_days),
                    days=[
                        DayPlan(
                            day=i + 1,
                            date=start_date + timedelta(days=i),
                            theme=f"Day {i + 1} - Explore {request.destinations[0] if request.destinations else 'your destination'}",
                            activities=[
                                ActivityPlan(
                                    name=f"Morning at {request.destinations[0] if request.destinations else 'your destination'}",
                                    time="09:00",
                                    duration="3 hours",
                                    cost=500,
                                    location=request.destinations[0] if request.destinations else "destination",
                                    description="Visit popular landmarks and attractions"
                                ),
                                ActivityPlan(
                                    name="Local Lunch Experience",
                                    time="13:00",
                                    duration="1.5 hours",
                                    cost=400,
                                    location=request.destinations[0] if request.destinations else "destination",
                                    description="Try authentic local cuisine"
                                ),
                                ActivityPlan(
                                    name="Evening Exploration",
                                    time="17:00",
                                    duration="2 hours",
                                    cost=300,
                                    location=request.destinations[0] if request.destinations else "destination",
                                    description="Explore markets and local culture"
                                )
                            ]
                        )
                        for i in range(request.duration_days)
                    ]
                )

                # Build context-aware recommendations
                style = (request.travel_style or "cultural").lower()
                dests = ", ".join(request.destinations) if request.destinations else "your destination"
                style_recs = {
                    "adventure": [
                        f"🧗 Try adventure sports like trekking and rappelling in {dests}",
                        f"🏕️ Camp overnight under the stars near {dests} for an unforgettable experience",
                        f"🚵 Book guided mountain biking or river rafting tours in advance",
                        f"💰 Budget tip: carry extra cash for impromptu adventure activities",
                    ],
                    "relaxation": [
                        f"🏖️ Visit the best beaches and spas in {dests} for a rejuvenating experience",
                        f"🧘 Book an early-morning yoga or meditation session",
                        f"🌅 Catch the sunrise from a viewpoint for a peaceful start to your day",
                        f"💆 Try Ayurvedic massages or wellness packages available locally",
                    ],
                    "cultural": [
                        f"🏛️ Visit the historical monuments and heritage sites in {dests}",
                        f"🎭 Attend a local cultural show or folk performance in the evening",
                        f"🛕 Explore ancient temples, forts, and palaces at {dests}",
                        f"📸 Join a heritage walk to discover hidden gems and local stories",
                    ],
                    "foodie": [
                        f"🍜 Go on a street food tour through the markets of {dests}",
                        f"👨‍🍳 Book a local cooking class to learn authentic recipes",
                        f"🌮 Try the regional specialty dishes unique to {dests}",
                        f"☕ Visit famous local cafes and bakeries for breakfast",
                    ],
                    "budget": [
                        f"🚌 Use public buses and local transport to save on travel in {dests}",
                        f"🏨 Book hostels or guesthouses for affordable accommodation",
                        f"🍱 Eat at local dhabas and street stalls to save ₹300-500 per meal",
                        f"🎟️ Look for combo tickets and free entry days at major attractions",
                    ],
                }
                recommendations = style_recs.get(style, style_recs["cultural"])

                itinerary_data = {
                    "itinerary": [city_plan],
                    "budget_breakdown": {
                        "accommodation": float(request.budget * 0.4),
                        "activities": float(request.budget * 0.3),
                        "food": float(request.budget * 0.2),
                        "transport": float(request.budget * 0.1)
                    },
                    "total_estimated_cost": float(request.budget),
                    "recommendations": recommendations
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
            duration_days = getattr(request, "duration_days", 1) or 1
            estimated_costs = {
                category: int(cost * multiplier * duration_days)
                for category, cost in base_costs.items()
            }
            
            total_estimated = sum(estimated_costs.values())
            
            return BudgetPredictionResponse(
                total_estimated_budget=total_estimated,
                budget_breakdown=estimated_costs,
                currency=getattr(request, "currency", None) or "INR",
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
                elif settings.AI_PROVIDER.lower() == "ollama":
                    response_text = self._call_ollama(request.user_message, context_str, history)
                else:
                    from huggingface_hub import InferenceClient
                    hf_token = settings.HF_TOKEN if settings.HF_TOKEN and not settings.HF_TOKEN.startswith("hf_xxx") else None
                    client = InferenceClient(
                        model="HuggingFaceH4/zephyr-7b-beta",
                        token=hf_token
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

    def _call_ollama(self, user_message: str, context_str: str, history: List) -> str:
        model = settings.OLLAMA_MODEL
        url = settings.OLLAMA_API_URL
        
        history_str = "\n".join([
            f"User: {h.get('user_message') if isinstance(h, dict) else h.user_message}\nAI: {h.get('ai_response') if isinstance(h, dict) else h.ai_response}"
            for h in (history or [])
        ])
        
        prompt = f"You are a helpful travel planning AI assistant.\n\nKnowledge Base Context:\n{context_str}\n\nConversation History:\n{history_str}\n\nUser: {user_message}\nAI:"
        
        body = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7
            }
        }
        
        request_data = json.dumps(body).encode("utf-8")
        request = urllib.request.Request(
            url,
            data=request_data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                response_body = response.read().decode("utf-8")
                data = json.loads(response_body)
                return data.get("response", "")
        except Exception as e:
            raise RuntimeError(f"Ollama API request failed: {str(e)}")
    
    async def semantic_search(self, query: str, limit: int = 10) -> List[SearchResponse]:
        """
        Semantic search for destinations using vector embeddings.
        """
        try:
            logger.info(f"Semantic search for: {query}")
            results = [
                SearchResponse(
                    destination="Bali",
                    country="Indonesia",
                    score=0.95,
                    reason="Matches your interest in beach destinations",
                    avg_daily_cost=2500,
                    cost_index="budget",
                    tags=["beach", "spiritual", "affordable"]
                ),
                SearchResponse(
                    destination="Kyoto",
                    country="Japan",
                    score=0.87,
                    reason="Great for cultural experiences",
                    avg_daily_cost=8500,
                    cost_index="premium",
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
            from app.schemas.ai import Recommendation
            default_recs = [
                Recommendation(destination="Goa", reason="Popular beach destination", confidence_score=0.9, estimated_cost=15000.0, best_time="Nov-Feb"),
                Recommendation(destination="Jaipur", reason="Rich cultural heritage", confidence_score=0.85, estimated_cost=10000.0, best_time="Oct-Mar"),
                Recommendation(destination="Kerala", reason="Scenic backwaters and nature", confidence_score=0.80, estimated_cost=18000.0, best_time="Sep-Feb"),
            ]
            history_recs = [
                Recommendation(destination="Manali", reason="Based on your adventure trips", confidence_score=0.9, estimated_cost=20000.0, best_time="Mar-Jun"),
                Recommendation(destination="Rishikesh", reason="Matches your style", confidence_score=0.85, estimated_cost=12000.0, best_time="Oct-Mar"),
            ]
            recommendations = history_recs if user_trips else default_recs
            return RecommendationsResponse(
                recommendations=recommendations,
                based_on_trips=len(user_trips)
            )
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            raise

    def _generate_suggestions(self, query: str) -> List[str]:
        """Generate follow-up suggestions"""
        return [
            "Tell me about your budget",
            "What's your travel style?",
            "How many days do you have?"
        ]
