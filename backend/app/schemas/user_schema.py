from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Request Schemas ──────────────────────────────────────────
class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    role: str = "Manager"  # Manager | Dispatcher | Safety | Analyst


class UserLogin(BaseModel):
    email: str
    password: str


# ── Response Schemas ─────────────────────────────────────────
class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
