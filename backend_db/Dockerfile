FROM python:3.9-slim

WORKDIR /app

# Cài đặt các phụ thuộc hệ thống
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy mã nguồn từ backend_db
COPY . .

# Lệnh khởi động
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]