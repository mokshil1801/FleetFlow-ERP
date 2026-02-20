from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VehicleCreate(BaseModel):
    name: str
    license_plate: str
    max_capacity: float
    odometer: float = 0.0
    status: str = "Available"


class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    license_plate: Optional[str] = None
    max_capacity: Optional[float] = None
    odometer: Optional[float] = None
    status: Optional[str] = None


class VehicleResponse(BaseModel):
    id: int
    name: str
    license_plate: str
    max_capacity: float
    odometer: float
    status: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
