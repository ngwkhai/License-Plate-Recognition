from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.database import get_db, Base, engine
from app.db.models import LookupLog
from pydantic import BaseModel

# Tạo bảng nếu chưa có
Base.metadata.create_all(bind=engine)

app = FastAPI()

class LookupLogIn(BaseModel):
    plate_number: str
    lookup_time: datetime

@app.post("/log_lookup")
def log_lookup(entry: LookupLogIn, db: Session = Depends(get_db)):
    log = LookupLog(
        plate_number=entry.plate_number,
        lookup_time=entry.lookup_time
    )
    db.add(log)
    db.commit()
    return {"message": "Lookup log đã được lưu"}
