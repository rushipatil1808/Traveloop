from datetime import datetime
import secrets
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.database import clean_doc, clean_docs, encode_doc, next_id, trips
from app.schemas.trip import (
    Activity,
    ActivityCreate,
    ItineraryDay,
    ItineraryDayCreate,
    Trip,
    TripCreate,
    TripList,
    TripStop,
    TripStopCreate,
    TripUpdate,
)

router = APIRouter()


def trip_for_response(trip: dict) -> dict:
    doc = clean_doc(trip)
    doc.setdefault("stops", [])
    doc.setdefault("destinations", [])
    doc.setdefault("ai_suggestions", [])
    return doc


def find_user_trip(trip_id: int, user_id: int) -> dict:
    trip = clean_doc(trips.find_one({"id": trip_id, "user_id": user_id}))
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


def stops_from_destinations(trip_id: int, destinations: list[str], start_date=None, end_date=None) -> list[dict]:
    stops = []
    for index, destination in enumerate(destinations):
        stops.append({
            "id": next_id("trip_stops"),
            "trip_id": trip_id,
            "city_name": destination,
            "country": "Unknown",
            "arrival_date": start_date,
            "departure_date": end_date,
            "order_index": index,
            "itinerary_days": [],
            "created_at": datetime.utcnow(),
        })
    return stops


@router.get("/", response_model=List[TripList])
async def read_trips(
    skip: int = 0,
    limit: int = 100,
    current_user: object = Depends(get_current_user),
):
    user_trips = clean_docs(
        trips.find({"user_id": current_user.id}).sort("created_at", -1).skip(skip).limit(limit)
    )
    result = []
    for trip in user_trips:
        result.append({
            "id": trip["id"],
            "name": trip["name"],
            "start_date": trip.get("start_date"),
            "end_date": trip.get("end_date"),
            "status": trip.get("status", "planning"),
            "total_budget": trip.get("total_budget"),
            "currency": trip.get("currency", "INR"),
            "travel_style": trip.get("travel_style"),
            "group_type": trip.get("group_type"),
            "group_size": trip.get("group_size", 1),
            "cities": [stop["city_name"] for stop in trip.get("stops", [])],
            "destinations": trip.get("destinations", []),
        })
    return result


@router.post("/", response_model=Trip)
async def create_trip(
    trip: TripCreate,
    current_user: object = Depends(get_current_user),
):
    now = datetime.utcnow()
    trip_doc = encode_doc(trip.dict())
    trip_doc.update({
        "id": next_id("trips"),
        "user_id": current_user.id,
        "stops": [],
        "created_at": now,
        "updated_at": now,
    })
    if trip.destinations:
        trip_doc["stops"] = stops_from_destinations(
            trip_doc["id"],
            trip.destinations,
            trip_doc.get("start_date"),
            trip_doc.get("end_date"),
        )
    trips.insert_one(trip_doc)

    if trip.total_budget and trip.total_budget > 0:
        from app.api.budget import create_default_budgets

        create_default_budgets(trip_doc["id"], float(trip.total_budget), trip.currency)

    return trip_for_response(trip_doc)


@router.post("/create", response_model=Trip)
async def create_trip_compat(
    trip: TripCreate,
    current_user: object = Depends(get_current_user),
):
    return await create_trip(trip, current_user)


@router.get("/{trip_id}", response_model=Trip)
async def read_trip(
    trip_id: int,
    current_user: object = Depends(get_current_user),
):
    return trip_for_response(find_user_trip(trip_id, current_user.id))


@router.put("/{trip_id}", response_model=Trip)
async def update_trip(
    trip_id: int,
    trip_update: TripUpdate,
    current_user: object = Depends(get_current_user),
):
    find_user_trip(trip_id, current_user.id)
    update_data = encode_doc(trip_update.dict(exclude_unset=True))
    update_data["updated_at"] = datetime.utcnow()
    trips.update_one({"id": trip_id, "user_id": current_user.id}, {"$set": update_data})
    return trip_for_response(find_user_trip(trip_id, current_user.id))


@router.delete("/{trip_id}")
async def delete_trip(
    trip_id: int,
    current_user: object = Depends(get_current_user),
):
    result = trips.delete_one({"id": trip_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip deleted successfully"}


@router.post("/{trip_id}/share")
async def share_trip(
    trip_id: int,
    current_user: object = Depends(get_current_user),
):
    find_user_trip(trip_id, current_user.id)
    share_token = secrets.token_urlsafe(32)
    trips.update_one({"id": trip_id, "user_id": current_user.id}, {"$set": {"share_token": share_token}})
    return {"share_token": share_token}


@router.post("/{trip_id}/stops", response_model=TripStop)
async def create_trip_stop(
    trip_id: int,
    stop: TripStopCreate,
    current_user: object = Depends(get_current_user),
):
    trip = find_user_trip(trip_id, current_user.id)
    stop_doc = encode_doc(stop.dict())
    stop_doc.update({
        "id": next_id("trip_stops"),
        "trip_id": trip_id,
        "itinerary_days": [],
        "created_at": datetime.utcnow(),
    })
    trips.update_one({"id": trip_id, "user_id": current_user.id}, {"$push": {"stops": stop_doc}})
    return stop_doc


def find_stop_for_user(stop_id: int, user_id: int) -> tuple[dict, dict]:
    trip = clean_doc(trips.find_one({"user_id": user_id, "stops.id": stop_id}))
    if not trip:
        raise HTTPException(status_code=404, detail="Trip stop not found")
    stop = next(item for item in trip.get("stops", []) if item["id"] == stop_id)
    return trip, stop


@router.post("/stops/{stop_id}/days", response_model=ItineraryDay)
async def create_itinerary_day(
    stop_id: int,
    day: ItineraryDayCreate,
    current_user: object = Depends(get_current_user),
):
    trip, stop = find_stop_for_user(stop_id, current_user.id)
    day_doc = encode_doc(day.dict(exclude={"activities"}))
    day_doc.update({
        "id": next_id("itinerary_days"),
        "trip_stop_id": stop_id,
        "activities": [],
        "created_at": datetime.utcnow(),
    })
    for activity_data in day.activities:
        activity_doc = encode_doc(activity_data.dict())
        activity_doc.update({
            "id": next_id("activities"),
            "itinerary_day_id": day_doc["id"],
            "created_at": datetime.utcnow(),
        })
        day_doc["activities"].append(activity_doc)

    for item in trip["stops"]:
        if item["id"] == stop_id:
            item.setdefault("itinerary_days", []).append(day_doc)
            break
    trips.update_one({"id": trip["id"], "user_id": current_user.id}, {"$set": {"stops": trip["stops"]}})
    return day_doc


@router.post("/days/{day_id}/activities", response_model=Activity)
async def create_activity(
    day_id: int,
    activity: ActivityCreate,
    current_user: object = Depends(get_current_user),
):
    trip = clean_doc(trips.find_one({"user_id": current_user.id, "stops.itinerary_days.id": day_id}))
    if not trip:
        raise HTTPException(status_code=404, detail="Itinerary day not found")

    activity_doc = encode_doc(activity.dict())
    activity_doc.update({
        "id": next_id("activities"),
        "itinerary_day_id": day_id,
        "created_at": datetime.utcnow(),
    })

    for stop in trip.get("stops", []):
        for day in stop.get("itinerary_days", []):
            if day["id"] == day_id:
                day.setdefault("activities", []).append(activity_doc)
                trips.update_one({"id": trip["id"], "user_id": current_user.id}, {"$set": {"stops": trip["stops"]}})
                return activity_doc

    raise HTTPException(status_code=404, detail="Itinerary day not found")


# ─── Stop Completion State endpoint ─────────────────────────────────────────

@router.put("/{trip_id}/stops/{stop_id}/checklist")
async def save_checklist(
    trip_id: int,
    stop_id: int,
    body: dict,
    current_user: object = Depends(get_current_user),
):
    """Save completion state for a city stop."""
    trip = find_user_trip(trip_id, current_user.id)
    completed = body.get("completed", False)

    updated_stops = trip.get("stops", [])
    for stop in updated_stops:
        if stop["id"] == stop_id:
            stop["city_completed"] = completed
            break
    trips.update_one(
        {"id": trip_id, "user_id": current_user.id},
        {"$set": {"stops": updated_stops, "updated_at": datetime.utcnow()}},
    )
    return {"message": "Stop status updated", "stop_id": stop_id}


# ─── AI city recommendations per stop ──────────────────────────────────────

@router.put("/{trip_id}/stops/{stop_id}/ai-recommendations")
async def save_ai_recommendations(
    trip_id: int,
    stop_id: int,
    body: dict,
    current_user: object = Depends(get_current_user),
):
    """Persist AI-generated recommendations for a city stop."""
    trip = find_user_trip(trip_id, current_user.id)
    recommendations = body.get("recommendations", [])
    updated_stops = trip.get("stops", [])
    for stop in updated_stops:
        if stop["id"] == stop_id:
            stop["ai_recommendations"] = recommendations
            break
    trips.update_one(
        {"id": trip_id, "user_id": current_user.id},
        {"$set": {"stops": updated_stops, "updated_at": datetime.utcnow()}},
    )
    return {"message": "Recommendations saved"}
