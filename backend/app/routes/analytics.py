from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.analytics_service import get_dashboard_analytics
from app.dependencies.role_checker import RoleChecker

router = APIRouter(prefix="/analytics", tags=["Analytics"])

allow_analytics = RoleChecker(["Manager", "Analyst"])


@router.get("/dashboard", response_model=dict)
def dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(allow_analytics),
):
    """Get dashboard analytics: fleet utilization, costs, fuel efficiency."""
    analytics = get_dashboard_analytics(db)
    return {
        "success": True,
        "message": "Dashboard analytics computed.",
        "data": analytics.model_dump(),
    }
