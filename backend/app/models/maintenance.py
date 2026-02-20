from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    service_type = Column(String(100), nullable=False)
    cost = Column(Float, nullable=False, default=0.0)
    date = Column(Date, nullable=False)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_logs")
