from sqlalchemy import Column, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime
import uuid

class Plate(Base):
    __tablename__ = "license_plates"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plate_number = Column(Text, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False)
    image_path = Column(Text)
    processed_path = Column(Text)
    coordinates = Column(JSON)
    source_type = Column(Text)

class LookupLog(Base):
    __tablename__ = "lookup_logs"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plate_number = Column(Text, nullable=False)
    lookup_time = Column(DateTime, nullable=False)
    user_ip = Column(Text)

class User(Base):
    __tablename__ = "users"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(Text, nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    role = Column(Text, default='user')
    created_at = Column(DateTime, default=datetime.utcnow)