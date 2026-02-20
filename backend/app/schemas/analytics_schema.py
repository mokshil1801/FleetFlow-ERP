from pydantic import BaseModel
from typing import Optional


class DashboardAnalytics(BaseModel):
    total_vehicles: int = 0
    available_vehicles: int = 0
    on_trip_vehicles: int = 0
    in_shop_vehicles: int = 0
    fleet_utilization: float = 0.0

    total_drivers: int = 0
    on_duty_drivers: int = 0

    total_trips: int = 0
    active_trips: int = 0
    completed_trips: int = 0

    total_fuel_cost: float = 0.0
    total_maintenance_cost: float = 0.0
    total_operational_cost: float = 0.0

    avg_fuel_efficiency: Optional[float] = None
