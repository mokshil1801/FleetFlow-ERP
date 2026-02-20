"""
FleetFlow Analytics Service – Computed metrics for the dashboard.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance import MaintenanceLog
from app.models.fuel_log import FuelLog
from app.schemas.analytics_schema import DashboardAnalytics


def get_dashboard_analytics(db: Session) -> DashboardAnalytics:
    """Compute all dashboard KPIs in a single service call."""

    # ── Vehicle metrics ──────────────────────────────────────
    total_vehicles = db.query(func.count(Vehicle.id)).scalar() or 0
    available = db.query(func.count(Vehicle.id)).filter(Vehicle.status == "Available").scalar() or 0
    on_trip = db.query(func.count(Vehicle.id)).filter(Vehicle.status == "On Trip").scalar() or 0
    in_shop = db.query(func.count(Vehicle.id)).filter(Vehicle.status == "In Shop").scalar() or 0

    fleet_utilization = (on_trip / total_vehicles * 100) if total_vehicles > 0 else 0.0

    # ── Driver metrics ───────────────────────────────────────
    total_drivers = db.query(func.count(Driver.id)).scalar() or 0
    on_duty = db.query(func.count(Driver.id)).filter(Driver.status == "On Duty").scalar() or 0

    # ── Trip metrics ─────────────────────────────────────────
    total_trips = db.query(func.count(Trip.id)).scalar() or 0
    active_trips = db.query(func.count(Trip.id)).filter(Trip.status == "Dispatched").scalar() or 0
    completed_trips = db.query(func.count(Trip.id)).filter(Trip.status == "Completed").scalar() or 0

    # ── Cost metrics ─────────────────────────────────────────
    total_fuel_cost = db.query(func.coalesce(func.sum(FuelLog.cost), 0.0)).scalar()
    total_maintenance_cost = db.query(func.coalesce(func.sum(MaintenanceLog.cost), 0.0)).scalar()
    total_operational_cost = total_fuel_cost + total_maintenance_cost

    # ── Fuel efficiency ──────────────────────────────────────
    # Average km/liter across completed trips that have fuel logs
    completed = (
        db.query(Trip)
        .filter(Trip.status == "Completed", Trip.end_odometer.isnot(None))
        .all()
    )
    total_km = sum((t.end_odometer - t.start_odometer) for t in completed if t.end_odometer and t.start_odometer)
    total_liters = db.query(func.coalesce(func.sum(FuelLog.liters), 0.0)).scalar()
    avg_fuel_efficiency = round(total_km / total_liters, 2) if total_liters > 0 else None

    return DashboardAnalytics(
        total_vehicles=total_vehicles,
        available_vehicles=available,
        on_trip_vehicles=on_trip,
        in_shop_vehicles=in_shop,
        fleet_utilization=round(fleet_utilization, 1),
        total_drivers=total_drivers,
        on_duty_drivers=on_duty,
        total_trips=total_trips,
        active_trips=active_trips,
        completed_trips=completed_trips,
        total_fuel_cost=round(total_fuel_cost, 2),
        total_maintenance_cost=round(total_maintenance_cost, 2),
        total_operational_cost=round(total_operational_cost, 2),
        avg_fuel_efficiency=avg_fuel_efficiency,
    )
