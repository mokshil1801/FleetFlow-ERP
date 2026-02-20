from typing import List
from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User with role '{user_role}' does not have sufficient permissions."
            )
        return current_user

# Pre-defined role dependencies
manager_only = RoleChecker(["Manager"])
dispatcher_or_manager = RoleChecker(["Manager", "Dispatcher"])
safety_or_manager = RoleChecker(["Manager", "Safety"])
analyst_or_manager = RoleChecker(["Manager", "Analyst"])
any_authenticated = RoleChecker(["Manager", "Dispatcher", "Safety", "Analyst"])
