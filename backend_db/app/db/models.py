from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime

class Plate(Base):
    __tablename__ = "plates"
    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String(20), nullable=False, index=True)
    time = Column(DateTime, nullable=False)
    camera = Column(String(100))
    image_url = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    violations = relationship("Violation", back_populates="plate")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('admin', 'user'), default='user')
    created_at = Column(DateTime, default=datetime.utcnow)

class Violation(Base):
    __tablename__ = "violations"
    id = Column(Integer, primary_key=True)
    plate_id = Column(Integer, ForeignKey('plates.id'), nullable=False)
    violation_type = Column(String(100), nullable=False)
    time = Column(DateTime, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    plate = relationship("Plate", back_populates="violations")

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True)
    event_type = Column(String(50))
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Camera(Base):
    __tablename__ = "cameras"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    location = Column(String(255))
    ip_address = Column(String(50))
    status = Column(Enum('active', 'inactive'), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
