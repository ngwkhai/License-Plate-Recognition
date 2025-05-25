from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from jose import jwt
from datetime import datetime, timedelta
import os

from app.db.database import get_db
from app.db.models import User
from app.utils.security import verify_password  # Hàm kiểm tra mật khẩu
# Bí mật và thuật toán JWT (cần giống backend chính)
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # token hợp lệ trong 60 phút

router = APIRouter()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    print("Đăng nhập với:", form_data.username)
    print("Tìm được user:", user)
    if not user:
        print("Không tìm thấy user trong DB")
    if not verify_password(form_data.password, user.password_hash):
        print("Mật khẩu không khớp với hash trong DB")

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Tên đăng nhập hoặc mật khẩu không đúng",
                            headers={"WWW-Authenticate": "Bearer"})
    
    #  Check role tại đây
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Tài khoản không có quyền truy cập")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},  # Không cần role nếu không decode ở frontend
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

