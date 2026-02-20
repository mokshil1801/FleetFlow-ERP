from sqlalchemy import Column, Integer, String, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    license_plate = Column(String(20), unique=True, nullable=False, index=True)
    max_capacity = Column(Float, nullable=False)
    odometer = Column(Float, default=0.0)
    status = Column(String(20), nullable=False, default="Available")  # Available | On Trip | In Shop | Retired
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    trips = relationship("Trip", back_populates="vehicle", cascade="all, delete-orphan")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle", cascade="all, delete-orphan")
    fuel_logs = relationship("FuelLog", back_populates="vehicle", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="vehicle", cascade="all, delete-orphan")
