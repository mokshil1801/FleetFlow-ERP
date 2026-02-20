from sqlalchemy import Column, Integer, Float, ForeignKey, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    liters = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="fuel_logs")
