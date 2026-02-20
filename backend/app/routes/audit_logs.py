from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit_schema import AuditLogResponse
from app.core.rbac import manager_only

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

@router.get("/logs", response_model=dict, dependencies=[Depends(manager_only)])
def get_audit_logs(db: Session = Depends(get_db)):
    """Retrieve all audit logs. Restricted to Managers."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    
    return {
        "success": True,
        "data": [AuditLogResponse.model_validate(log) for log in logs]
    }
