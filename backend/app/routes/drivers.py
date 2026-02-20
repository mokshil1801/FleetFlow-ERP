from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.driver import Driver
from app.schemas.driver_schema import DriverCreate, DriverUpdate, DriverResponse
from app.dependencies.role_checker import RoleChecker
from app.core.security import get_current_user

router = APIRouter(prefix="/drivers", tags=["Drivers"])

allow_manager_safety = RoleChecker(["Manager", "Safety"])


@router.get("/", response_model=dict)
def list_drivers(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get all drivers."""
    drivers = db.query(Driver).all()
    return {
        "success": True,
        "message": f"Found {len(drivers)} drivers.",
        "data": [DriverResponse.model_validate(d).model_dump() for d in drivers],
    }


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_manager_safety),
):
    """Create a new driver (Manager or Safety only)."""
    driver = Driver(**payload.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)

    return {
        "success": True,
        "message": "Driver created successfully.",
        "data": DriverResponse.model_validate(driver).model_dump(),
    }


@router.put("/{driver_id}", response_model=dict)
def update_driver(
    driver_id: int,
    payload: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_manager_safety),
):
    """Update a driver (Manager or Safety only)."""
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(driver, field, value)

    db.commit()
    db.refresh(driver)

    return {
        "success": True,
        "message": "Driver updated successfully.",
        "data": DriverResponse.model_validate(driver).model_dump(),
    }
