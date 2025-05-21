from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import time

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME")

print(f"Connecting to database: {DB_NAME}")  # Debug để xác nhận tên database

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Thêm retry logic
max_retries = 20
retry_delay = 10  # Giây
engine = None

for i in range(max_retries):
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print(f"Successfully connected to MySQL on attempt {i+1}")
            break
    except Exception as e:
        print(f"Attempt {i+1}/{max_retries} failed: {e}")
        if i < max_retries - 1:
            time.sleep(retry_delay)
        else:
            raise Exception("Failed to connect to MySQL after maximum retries")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()