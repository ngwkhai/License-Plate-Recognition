from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from datetime import datetime, date
from sqlalchemy import func, and_

from app.db.database import get_db
from app.db.models import LookupLog, User
from app.utils.security import get_current_user  # hàm lấy user từ token, bạn cần cài đặt

router = APIRouter(prefix="/admin", tags=["admin"])

# Schema phản hồi cho lookup log có user info
class LookupLogWithUser(BaseModel):
    id: str
    plate_number: str
    lookup_time: datetime
    user_ip: str
    user: Optional[dict] = None

    class Config:
        orm_mode = True

# Schema phản hồi cho user
class UserResponse(BaseModel):
    id: str
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

@router.get("/lookup_logs", response_model=List[LookupLogWithUser])
def get_admin_lookup_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    # 1. Truy vấn log trước
    logs = (
        db.query(LookupLog)
        .order_by(LookupLog.lookup_time.desc())
        .limit(limit)
        .all()
    )

    # 2. Lấy danh sách IP xuất hiện trong logs
    user_ips = list({log.user_ip for log in logs})

    # 3. Truy vấn tất cả user có username trùng user_ip
    users = (
        db.query(User)
        .filter(User.username.in_(user_ips))
        .all()
    )
    user_dict = {user.username: user for user in users}

    # 4. Kết hợp dữ liệu log và user (nếu có)
    results = []
    for log in logs:
        user = user_dict.get(log.user_ip)
        user_data = None
        if user:
            user_data = {
                "id": user.id,
                "username": user.username,
                "role": user.role,
            }
        results.append({
            "id": log.id,
            "plate_number": log.plate_number,
            "lookup_time": log.lookup_time,
            "user_ip": log.user_ip,
            "user": user_data,
        })

    return results


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
    # Giả sử tính theo ngày, group by ngày và count biển số
    from sqlalchemy import func, cast, Date

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
    today_start = datetime.combine(date.today(), datetime.min.time())  # 00:00:00 hôm nay
    today_end = datetime.combine(date.today(), datetime.max.time())    # 23:59:59.999999 hôm nay

    count = (
        db.query(func.count(LookupLog.id))
        .filter(and_(LookupLog.lookup_time >= today_start, LookupLog.lookup_time <= today_end))
        .scalar()
    )

    return {"count_today": count}