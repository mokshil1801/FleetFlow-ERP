from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.audit_service import log_event

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, request: Request, db: Session = Depends(get_db)):
    """Register a new user."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        log_event(db, "Registration", "Failure", request=request)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_event(db, "Registration", "Success", user_id=user.id, request=request)

    token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )

    return {
        "success": True,
        "message": "User registered successfully.",
        "data": TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        ).model_dump(),
    }


@router.post("/login", response_model=dict)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        # Log failure with the user_id if we found the user
        target_id = user.id if user else None
        log_event(db, "Login", "Failure", user_id=target_id, request=request)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    log_event(db, "Login", "Success", user_id=user.id, request=request)

    token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )

    return {
        "success": True,
        "message": "Login successful.",
        "data": TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        ).model_dump(),
    }
