from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TripCreate(BaseModel):
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    start_odometer: float = 0.0


class TripComplete(BaseModel):
    end_odometer: float


class TripResponse(BaseModel):
    id: int
    vehicle_id: int
    driver_id: Optional[int] = None
    cargo_weight: float
    status: str
    start_odometer: float
    end_odometer: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
