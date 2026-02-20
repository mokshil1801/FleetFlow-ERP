from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class FuelLogCreate(BaseModel):
    vehicle_id: int
    liters: float
    cost: float
    date: date


class FuelLogResponse(BaseModel):
    id: int
    vehicle_id: int
    liters: float
    cost: float
    date: date
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ExpenseCreate(BaseModel):
    vehicle_id: int
    type: str
    amount: float
    date: date


class ExpenseResponse(BaseModel):
    id: int
    vehicle_id: int
    type: str
    amount: float
    date: date
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
