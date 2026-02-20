"""
FleetFlow Backend – FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.database.base import Base
from app.database.session import engine

# Import all models so Base.metadata knows about them
from app.models.user import User  # noqa: F401
from app.models.vehicle import Vehicle  # noqa: F401
from app.models.driver import Driver  # noqa: F401
from app.models.trip import Trip  # noqa: F401
from app.models.maintenance import MaintenanceLog  # noqa: F401
from app.models.fuel_log import FuelLog  # noqa: F401
from app.models.expense import Expense  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401

# Import routers
from app.routes import auth, vehicles, drivers, trips, maintenance, fuel, analytics, audit_logs

settings = get_settings()

# ── Create app ───────────────────────────────────────────────
app = FastAPI(
    title="FleetFlow API",
    description=(
        "A rule-enforced, relational, lifecycle-driven fleet management engine. "
        "Powered by FastAPI and MySQL."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception Logging Middleware ──────────────────────────────
from fastapi import Request
import traceback
import sys

@app.middleware("http")
async def log_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        traceback.print_exc()
        raise e

# ── Include routers ──────────────────────────────────────────
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(drivers.router)
app.include_router(trips.router)
app.include_router(maintenance.router)
app.include_router(fuel.router)
app.include_router(analytics.router)
app.include_router(audit_logs.router)


# ── Startup: auto-create tables ──────────────────────────────
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


# ── Health check ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health():
    return {
        "success": True,
        "message": "FleetFlow API is running.",
        "data": {"version": "1.0.0"},
    }
