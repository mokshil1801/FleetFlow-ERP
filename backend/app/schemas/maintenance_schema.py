from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    service_type: str
    cost: float
    date: date
    notes: Optional[str] = None


class MaintenanceResponse(BaseModel):
    id: int
    vehicle_id: int
    service_type: str
    cost: float
    date: date
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
