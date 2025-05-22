-- Kích hoạt extension uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng biển số xe
CREATE TABLE license_plates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    image_path TEXT,
    processed_path TEXT,
    coordinates JSONB,
    source_type TEXT
);

-- Dữ liệu mẫu cho license_plates
INSERT INTO license_plates (plate_number, timestamp, image_path, processed_path, coordinates, source_type)
VALUES 
    ('30A-12345', CURRENT_TIMESTAMP, '/images/raw/30A12345.jpg', '/images/processed/30A12345.jpg', '{"x": 100, "y": 200}', 'camera'),
    ('29B-67890', CURRENT_TIMESTAMP, '/images/raw/29B67890.jpg', '/images/processed/29B67890.jpg', '{"x": 150, "y": 250}', 'upload');

-- Bảng lịch sử tra cứu
CREATE TABLE lookup_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number TEXT NOT NULL,
    lookup_time TIMESTAMP NOT NULL,
    user_ip TEXT
);

-- Dữ liệu mẫu cho lookup_logs
INSERT INTO lookup_logs (plate_number, lookup_time, user_ip)
VALUES 
    ('30A-12345', CURRENT_TIMESTAMP, '192.168.1.10'),
    ('29B-67890', CURRENT_TIMESTAMP, '192.168.1.20');

-- Bảng người dùng
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dữ liệu mẫu cho users
INSERT INTO users (username, password_hash, role)
VALUES 
    ('admin', 'hashed_password_123', 'admin'),
    ('user1', 'hashed_password_456', 'user');
