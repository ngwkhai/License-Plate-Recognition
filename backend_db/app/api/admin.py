from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime, date, timedelta
from sqlalchemy import func, and_
import pytz

from app.db.database import get_db
from app.db.models import LookupLog, User
from app.utils.security import get_current_user  # hàm lấy user từ token, bạn cần cài đặt

router = APIRouter(prefix="/admin", tags=["admin"])

# Schema phản hồi cho lookup log, đã bỏ user_ip và user
class LookupLogResponse(BaseModel):
    id: int
    plate_number: str
    lookup_time: datetime

    class Config:
        orm_mode = True

# Schema phản hồi cho user
class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        orm_mode = True

# Dependency kiểm tra quyền admin
def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ admin mới truy cập được"
        )
    return current_user

@router.get("/lookup_logs", response_model=List[LookupLogResponse])
def get_admin_lookup_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    # Truy vấn logs mới nhất, giới hạn theo limit
    logs = (
        db.query(LookupLog)
        .order_by(LookupLog.lookup_time.desc())
        .limit(limit)
        .all()
    )

    return logs


@router.get("/users", response_model=List[UserResponse])
def get_admin_users(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    users = db.query(User).limit(limit).all()
    return users

@router.get("/lookup_stats")
def get_lookup_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    from sqlalchemy import cast, Date

    results = (
        db.query(
            cast(LookupLog.lookup_time, Date).label("date"),
            func.count(LookupLog.id).label("count"),
        )
        .group_by("date")
        .order_by("date")
        .all()
    )

    return [{"time": str(r.date), "count": r.count} for r in results]

@router.get("/lookup_count_today")
def get_lookup_count_today(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    tz = pytz.timezone("Asia/Ho_Chi_Minh")
    now = datetime.now(tz)
    today_start = tz.localize(datetime(now.year, now.month, now.day)) 
    tomorrow_start = today_start + timedelta(days=1)

    count = (
        db.query(func.count(LookupLog.id))
        .filter(LookupLog.lookup_time >= today_start, LookupLog.lookup_time < tomorrow_start)
        .scalar()
    )

    return {"count_today": count}

@router.delete("/lookup_logs/{log_id}", status_code=204)
def delete_lookup_log(
    log_id: int = Path(..., description="ID của lookup log cần xóa"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    log = db.query(LookupLog).filter(LookupLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Lookup log không tồn tại")
    
    db.delete(log)
    db.commit()
    return