from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Plate, LookupLog, User
from app.utils.security import verify_password, hash_password  # Cập nhật đường dẫn
from pydantic import BaseModel
from jose import jwt
import os
from datetime import datetime

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"

router = APIRouter()

# Model cho tra cứu
class LookupRequest(BaseModel):
    plate_number: str
    user_ip: str

# Lấy danh sách biển số
@router.get("/plates")
def get_plates(
    plate_number: str = None,
    from_time: str = None,
    to_time: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(Plate)
    if plate_number:
        query = query.filter(Plate.plate_number.ilike(f"%{plate_number}%"))
    if from_time:
        query = query.filter(Plate.timestamp >= datetime.fromisoformat(from_time))
    if to_time:
        query = query.filter(Plate.timestamp <= datetime.fromisoformat(to_time))
    total = query.count()
    plates = query.offset((page - 1) * limit).limit(limit).all()
    return {"total": total, "page": page, "limit": limit, "data": plates}

# Lưu kết quả nhận diện
@router.post("/save_result")
def save_result(
    plate_number: str,
    timestamp: str,
    image_path: str,
    processed_path: str,
    coordinates: list,
    source_type: str,
    db: Session = Depends(get_db)
):
    plate = Plate(
        plate_number=plate_number,
        timestamp=datetime.fromisoformat(timestamp),
        image_path=image_path,
        processed_path=processed_path,
        coordinates=coordinates,
        source_type=source_type
    )
    db.add(plate)
    db.commit()
    db.refresh(plate)
    return {"id": plate.id}

# Lấy thông tin biển số theo ID
@router.get("/plates/{id}")
def get_plate(id: str, db: Session = Depends(get_db)):
    plate = db.query(Plate).filter(Plate.id == id).first()
    if not plate:
        raise HTTPException(status_code=404, detail="Biển số không tìm thấy")
    return plate

# Lưu nhật ký tra cứu và hỗ trợ tra cứu phạt nguội
@router.post("/lookup_log")
def save_lookup_log(request: LookupRequest, db: Session = Depends(get_db)):
    log = LookupLog(
        plate_number=request.plate_number,
        lookup_time=datetime.utcnow(),
        user_ip=request.user_ip
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return {
        "id": log.id,
        "lookup_url": "https://csgt.vn",
        "instructions": "Sao chép biển số, dán vào trang csgt.vn và nhập CAPTCHA để tra cứu."
    }

# Lấy danh sách nhật ký tra cứu
@router.get("/lookup_logs")
def get_lookup_logs(db: Session = Depends(get_db)):
    logs = db.query(LookupLog).all()
    return logs

# Đăng nhập
@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thông tin đăng nhập không hợp lệ",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token_data = {"sub": user.username, "role": user.role}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}