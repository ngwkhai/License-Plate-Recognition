from sqlalchemy import Column, Text, DateTime, Integer
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Plate(Base):
    __tablename__ = "license_plates"
    id = Column(Integer, primary_key=True, autoincrement=True)
    plate_number = Column(Text, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False)
    image_path = Column(Text)
    processed_path = Column(Text)


class LookupLog(Base):
    __tablename__ = "lookup_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    plate_number = Column(Text, nullable=False)
    lookup_time = Column(DateTime, nullable=False)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(Text, nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    role = Column(Text, default='admin')
    created_at = Column(DateTime, default=datetime.utcnow)
