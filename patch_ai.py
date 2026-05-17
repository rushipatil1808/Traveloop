import sys
import json

file_path = r'e:\Traveloop\backend\app\services\ai_service.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '                # Initialize Ollama with DeepSeek model (lazy import)'
end_marker = '            except Exception as e:'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

new_code = """                import requests
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
"""

new_content = content[:start_idx] + new_code + content[end_idx:]
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Successfully patched ai_service.py")
