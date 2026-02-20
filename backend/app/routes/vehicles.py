from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle_schema import VehicleCreate, VehicleUpdate, VehicleResponse
from app.dependencies.role_checker import RoleChecker
from app.core.security import get_current_user

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

allow_manager = RoleChecker(["Manager"])


@router.get("/", response_model=dict)
def list_vehicles(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get all vehicles."""
    vehicles = db.query(Vehicle).all()
    return {
        "success": True,
        "message": f"Found {len(vehicles)} vehicles.",
        "data": [VehicleResponse.model_validate(v).model_dump() for v in vehicles],
    }


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_manager),
):
    """Create a new vehicle (Manager only)."""
    existing = db.query(Vehicle).filter(Vehicle.license_plate == payload.license_plate).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vehicle with plate '{payload.license_plate}' already exists.",
        )

    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    return {
        "success": True,
        "message": "Vehicle created successfully.",
        "data": VehicleResponse.model_validate(vehicle).model_dump(),
    }


@router.put("/{vehicle_id}", response_model=dict)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_manager),
):
    """Update a vehicle (Manager only)."""
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)

    return {
        "success": True,
        "message": "Vehicle updated successfully.",
        "data": VehicleResponse.model_validate(vehicle).model_dump(),
    }


@router.delete("/{vehicle_id}", response_model=dict)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_manager),
):
    """Delete a vehicle (Manager only)."""
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    db.delete(vehicle)
    db.commit()

    return {"success": True, "message": "Vehicle deleted successfully.", "data": None}
