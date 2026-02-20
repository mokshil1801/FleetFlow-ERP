"""
FleetFlow Rule Engine – Deterministic Business Logic Layer

All validations and state transitions live here.
Routes call these functions; they never contain business logic directly.
"""
from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip


# ── Guard: Capacity ──────────────────────────────────────────
def validate_capacity(cargo_weight: float, vehicle: Vehicle) -> None:
    """Raises HTTP 400 if cargo exceeds vehicle capacity."""
    if cargo_weight > vehicle.max_capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Cargo weight ({cargo_weight} kg) exceeds "
                f"vehicle max capacity ({vehicle.max_capacity} kg)."
            ),
        )


# ── Guard: Driver License ───────────────────────────────────
def validate_driver_license(driver: Driver) -> None:
    """Raises HTTP 400 if the driver's license has expired."""
    if driver.license_expiry < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Driver '{driver.name}' has an expired license "
                f"(expired {driver.license_expiry}). Cannot dispatch."
            ),
        )


# ── Guard: Vehicle Availability ──────────────────────────────
def validate_vehicle_available(vehicle: Vehicle) -> None:
    """Raises HTTP 400 if vehicle is not Available."""
    if vehicle.status != "Available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Vehicle '{vehicle.name}' is currently '{vehicle.status}'. "
                f"Only 'Available' vehicles can be dispatched."
            ),
        )


# ── Guard: Driver Availability ───────────────────────────────
def validate_driver_available(driver: Driver) -> None:
    """Raises HTTP 400 if the driver is not Off Duty (available)."""
    if driver.status not in ("Off Duty",):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Driver '{driver.name}' is currently '{driver.status}'. "
                f"Only 'Off Duty' drivers can be assigned."
            ),
        )


# ── Transition: Dispatch Trip ────────────────────────────────
def dispatch_trip(db: Session, trip: Trip) -> Trip:
    """
    Dispatch a draft trip:
    - Vehicle → 'On Trip'
    - Driver  → 'On Duty'
    - Trip    → 'Dispatched'
    """
    if trip.status != "Draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only 'Draft' trips can be dispatched. Current: '{trip.status}'.",
        )

    vehicle = db.get(Vehicle, trip.vehicle_id)
    driver = db.get(Driver, trip.driver_id)

    # Run all guards
    validate_vehicle_available(vehicle)
    validate_driver_available(driver)
    validate_driver_license(driver)
    validate_capacity(trip.cargo_weight, vehicle)

    # State transitions
    vehicle.status = "On Trip"
    driver.status = "On Duty"
    trip.status = "Dispatched"
    trip.start_odometer = vehicle.odometer

    db.commit()
    db.refresh(trip)
    return trip


# ── Transition: Complete Trip ────────────────────────────────
def complete_trip(db: Session, trip: Trip, end_odometer: float) -> Trip:
    """
    Complete a dispatched trip:
    - Vehicle → 'Available', odometer updated
    - Driver  → 'Off Duty'
    - Trip    → 'Completed'
    """
    if trip.status != "Dispatched":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only 'Dispatched' trips can be completed. Current: '{trip.status}'.",
        )

    vehicle = db.get(Vehicle, trip.vehicle_id)
    driver = db.get(Driver, trip.driver_id)

    trip.end_odometer = end_odometer
    trip.status = "Completed"
    vehicle.odometer = end_odometer
    vehicle.status = "Available"
    if driver:
        driver.status = "Off Duty"

    db.commit()
    db.refresh(trip)
    return trip


# ── Transition: Cancel Trip ──────────────────────────────────
def cancel_trip(db: Session, trip: Trip) -> Trip:
    """
    Cancel a trip (Draft or Dispatched):
    - If Dispatched: release vehicle and driver
    - Trip → 'Cancelled'
    """
    if trip.status not in ("Draft", "Dispatched"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel a '{trip.status}' trip.",
        )

    if trip.status == "Dispatched":
        vehicle = db.get(Vehicle, trip.vehicle_id)
        driver = db.get(Driver, trip.driver_id)
        vehicle.status = "Available"
        if driver:
            driver.status = "Off Duty"

    trip.status = "Cancelled"
    db.commit()
    db.refresh(trip)
    return trip


# ── Hook: Maintenance → Vehicle "In Shop" ────────────────────
def on_maintenance_created(db: Session, vehicle_id: int) -> None:
    """Set vehicle status to 'In Shop' when maintenance is logged."""
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle:
        vehicle.status = "In Shop"
        db.commit()
