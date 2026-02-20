from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user


class RoleChecker:
    """
    FastAPI dependency that enforces role-based access control.

    Usage:
        allow_manager = RoleChecker(["Manager"])

        @router.post("/", dependencies=[Depends(allow_manager)])
        def create_item(...):
            ...
    """

    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(self.allowed_roles)}",
            )
        return current_user
