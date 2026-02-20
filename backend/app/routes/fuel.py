from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.fuel_log import FuelLog
from app.models.expense import Expense
from app.models.vehicle import Vehicle
from app.schemas.fuel_schema import FuelLogCreate, FuelLogResponse, ExpenseCreate, ExpenseResponse
from app.dependencies.role_checker import RoleChecker
from app.core.security import get_current_user

router = APIRouter(tags=["Fuel & Expenses"])

allow_write = RoleChecker(["Manager", "Analyst"])


# ── Fuel Logs ────────────────────────────────────────────────
@router.get("/fuel", response_model=dict)
def list_fuel_logs(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get all fuel logs."""
    logs = db.query(FuelLog).all()
    return {
        "success": True,
        "message": f"Found {len(logs)} fuel logs.",
        "data": [FuelLogResponse.model_validate(l).model_dump() for l in logs],
    }


@router.post("/fuel", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_fuel_log(
    payload: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_write),
):
    """Log a fuel entry."""
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    log = FuelLog(**payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "success": True,
        "message": "Fuel log created.",
        "data": FuelLogResponse.model_validate(log).model_dump(),
    }


# ── Expenses ─────────────────────────────────────────────────
@router.get("/expenses", response_model=dict)
def list_expenses(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get all expenses."""
    expenses = db.query(Expense).all()
    return {
        "success": True,
        "message": f"Found {len(expenses)} expenses.",
        "data": [ExpenseResponse.model_validate(e).model_dump() for e in expenses],
    }


@router.post("/expenses", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_write),
):
    """Log an expense."""
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    expense = Expense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)

    return {
        "success": True,
        "message": "Expense logged.",
        "data": ExpenseResponse.model_validate(expense).model_dump(),
    }
