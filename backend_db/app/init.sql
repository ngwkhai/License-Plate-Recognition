DROP TABLE IF EXISTS lookup_logs;
DROP TABLE IF EXISTS license_plates;
DROP TABLE IF EXISTS users;

-- Bảng biển số xe
CREATE TABLE license_plates (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    image_path TEXT,
    processed_path TEXT
);

-- Bảng lịch sử tra cứu
CREATE TABLE lookup_logs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL,
    lookup_time TIMESTAMP NOT NULL
);

-- Bảng người dùng
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dữ liệu mẫu
INSERT INTO users (username, password_hash, role, created_at) VALUES
('reyn', '$2b$12$q9/4/iwLerwyTTRvnD8XgulOycrkmC/S4BqNjJ5yCqulVqp/E/OWm', 'admin', NOW() - INTERVAL '11 days');
