from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    event: str
    status: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}

class AuditLogListResponse(BaseModel):
    success: bool
    data: List[AuditLogResponse]
