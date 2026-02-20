from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.schemas.trip_schema import TripCreate, TripComplete, TripResponse
from app.services.rule_engine import (
    validate_capacity,
    validate_driver_license,
    validate_vehicle_available,
    validate_driver_available,
    dispatch_trip,
    complete_trip,
    cancel_trip,
)
from app.dependencies.role_checker import RoleChecker
from app.core.security import get_current_user

router = APIRouter(prefix="/trips", tags=["Trips"])

allow_dispatch = RoleChecker(["Manager", "Dispatcher"])


@router.get("/", response_model=dict)
def list_trips(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get all trips."""
    trips = db.query(Trip).all()
    return {
        "success": True,
        "message": f"Found {len(trips)} trips.",
        "data": [TripResponse.model_validate(t).model_dump() for t in trips],
    }


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_dispatch),
):
    """
    Create a new trip in Draft status.
    Validates capacity and driver license upfront.
    """
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    driver = db.get(Driver, payload.driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found.")

    # Pre-flight validation
    validate_capacity(payload.cargo_weight, vehicle)
    validate_driver_license(driver)

    trip = Trip(**payload.model_dump(), status="Draft")
    db.add(trip)
    db.commit()
    db.refresh(trip)

    return {
        "success": True,
        "message": "Trip created as Draft.",
        "data": TripResponse.model_validate(trip).model_dump(),
    }


@router.put("/{trip_id}/dispatch", response_model=dict)
def dispatch(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_dispatch),
):
    """Dispatch a draft trip. Triggers vehicle & driver status transitions."""
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    updated = dispatch_trip(db, trip)

    return {
        "success": True,
        "message": "Trip dispatched successfully.",
        "data": TripResponse.model_validate(updated).model_dump(),
    }


@router.put("/{trip_id}/complete", response_model=dict)
def complete(
    trip_id: int,
    payload: TripComplete,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_dispatch),
):
    """Complete a dispatched trip. Updates odometer and releases assets."""
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    updated = complete_trip(db, trip, payload.end_odometer)

    return {
        "success": True,
        "message": "Trip completed successfully.",
        "data": TripResponse.model_validate(updated).model_dump(),
    }


@router.put("/{trip_id}/cancel", response_model=dict)
def cancel(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_dispatch),
):
    """Cancel a trip. Releases assets if dispatched."""
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    updated = cancel_trip(db, trip)

    return {
        "success": True,
        "message": "Trip cancelled.",
        "data": TripResponse.model_validate(updated).model_dump(),
    }
