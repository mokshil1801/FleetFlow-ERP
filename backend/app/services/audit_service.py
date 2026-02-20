from sqlalchemy.orm import Session
from fastapi import Request
from app.models.audit_log import AuditLog
from typing import Optional

def log_event(
    db: Session,
    event: str,
    status: str,
    user_id: Optional[int] = None,
    request: Optional[Request] = None
):
    """
    Centralized service to log audit events.
    Captures IP address and User Agent if request object is provided.
    """
    ip_address = None
    user_agent = None
    
    if request:
        ip_address = request.client.host
        user_agent = request.headers.get("user-agent")
        
    new_log = AuditLog(
        user_id=user_id,
        event=event,
        status=status,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    db.add(new_log)
    try:
        db.commit()
        db.refresh(new_log)
    except Exception as e:
        db.rollback()
        # In a real production system, we'd log this error to a file or monitoring service
        print(f"Failed to save audit log: {e}")
    
    return new_log
