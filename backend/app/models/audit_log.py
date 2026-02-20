from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from app.database.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    event = Column(String(100), nullable=False)  # Login | Registration | Logout | Failed Login | Password Reset
    status = Column(String(50), nullable=False)  # Success | Failure
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    timestamp = Column(DateTime, server_default=func.now())
