from sqlalchemy import Column, Integer, String, DateTime, func
from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False, default="Manager")  # Manager | Dispatcher | Safety | Analyst
    created_at = Column(DateTime, server_default=func.now())
