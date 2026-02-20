from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="expenses")
