from sqlalchemy import Column, Integer, String, Float, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    license_expiry = Column(Date, nullable=False)
    safety_score = Column(Float, default=100.0)
    trip_completion_rate = Column(Float, default=100.0)
    status = Column(String(20), nullable=False, default="Off Duty")  # On Duty | Off Duty | Suspended
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    trips = relationship("Trip", back_populates="driver")
