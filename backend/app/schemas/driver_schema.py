from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class DriverCreate(BaseModel):
    name: str
    license_expiry: date
    safety_score: float = 100.0
    trip_completion_rate: float = 100.0
    status: str = "Off Duty"


class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_expiry: Optional[date] = None
    safety_score: Optional[float] = None
    trip_completion_rate: Optional[float] = None
    status: Optional[str] = None


class DriverResponse(BaseModel):
    id: int
    name: str
    license_expiry: date
    safety_score: float
    trip_completion_rate: float
    status: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
