# Dựa trên bản Python nhẹ
FROM python:3.10-slim

# Tạo thư mục làm việc
WORKDIR /backend_ai

# Cài đặt các thư viện hệ thống cần thiết cho OpenCV và PyTorch
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    curl \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libglib2.0-0 \
    libgtk2.0-dev \
    ffmpeg \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    && rm -rf /var/lib/apt/lists/*


# Copy file requirements.txt và cài đặt gói Python
COPY first.txt .
RUN pip install --no-cache-dir -r first.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn vào trong container
COPY . .

# Expose cổng mặc định của uvicorn
EXPOSE 8000

# Chạy ứng dụng FastAPI bằng uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]