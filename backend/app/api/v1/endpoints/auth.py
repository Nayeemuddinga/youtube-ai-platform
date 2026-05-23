from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.db.session import get_db
from app.models.user import User
from app.schemas import UserCreate, UserResponse, Token, TokenRefresh
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.config import get_settings

router = APIRouter(prefix="/auth", tags=["authentication"])
settings = get_settings()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(400, "Email already registered")
    if user_in.username and db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(400, "Username already taken")
    user = User(email=user_in.email, username=user_in.username, full_name=user_in.full_name, hashed_password=get_password_hash(user_in.password), is_active=True, is_verified=False)
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter((User.email == form_data.username) | (User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials", headers={"WWW-Authenticate": "Bearer"})
    if not user.is_active:
        raise HTTPException(400, "Inactive user")
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})
    user.last_login = datetime.now(timezone.utc); db.commit()
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer", "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, "user": {"id": user.id, "email": user.email, "username": user.username, "full_name": user.full_name, "is_active": user.is_active, "is_verified": user.is_verified, "created_at": user.created_at}}

@router.post("/refresh", response_model=Token)
def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    payload = decode_token(token_data.refresh_token, expected_type="refresh")
    if not payload:
        raise HTTPException(401, "Invalid refresh token")
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user or not user.is_active:
        raise HTTPException(401, "User not found or inactive")
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    return {"access_token": access_token, "refresh_token": token_data.refresh_token, "token_type": "bearer", "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60}
