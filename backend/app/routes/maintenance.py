from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.maintenance import MaintenanceLog
from app.models.vehicle import Vehicle
from app.schemas.maintenance_schema import MaintenanceCreate, MaintenanceResponse
from app.services.rule_engine import on_maintenance_created
from app.dependencies.role_checker import RoleChecker
from app.core.security import get_current_user

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

allow_write = RoleChecker(["Manager", "Dispatcher"])


@router.get("/", response_model=dict)
def list_maintenance(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get all maintenance logs."""
    logs = db.query(MaintenanceLog).all()
    return {
        "success": True,
        "message": f"Found {len(logs)} maintenance logs.",
        "data": [MaintenanceResponse.model_validate(l).model_dump() for l in logs],
    }


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_maintenance(
    payload: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_write),
):
    """Log a maintenance event. Automatically sets vehicle to 'In Shop'."""
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    log = MaintenanceLog(**payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)

    # Rule engine hook: vehicle → In Shop
    on_maintenance_created(db, payload.vehicle_id)

    return {
        "success": True,
        "message": "Maintenance logged. Vehicle status set to 'In Shop'.",
        "data": MaintenanceResponse.model_validate(log).model_dump(),
    }
