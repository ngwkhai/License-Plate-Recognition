FROM python:3.9-slim

WORKDIR /app

# Cài đặt các phụ thuộc hệ thống cần thiết
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements trước để tận dụng cache Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ ứng dụng
COPY . .

# Lệnh khởi động
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]