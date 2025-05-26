DROP TABLE IF EXISTS lookup_logs;
DROP TABLE IF EXISTS license_plates;
DROP TABLE IF EXISTS users;

SET timezone = 'Asia/Ho_Chi_Minh';
-- Bảng biển số xe
CREATE TABLE license_plates (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL
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

-- Dữ liệu mẫu cho bảng license_plates
INSERT INTO license_plates (plate_number, timestamp) VALUES
('30A-12345', NOW() - INTERVAL '1 day'),
('29B-67890', NOW() - INTERVAL '2 days'),
('31C-11223', NOW() - INTERVAL '3 days'),
('88D-44556', NOW() - INTERVAL '4 days'),
('36E-77889', NOW() - INTERVAL '5 days'),
('51F-99001', NOW() - INTERVAL '6 days'),
('43G-22334', NOW() - INTERVAL '7 days'),
('79H-55667', NOW() - INTERVAL '8 days'),
('66K-88990', NOW() - INTERVAL '9 days'),
('11L-00112', NOW() - INTERVAL '10 days');

-- Dữ liệu mẫu cho bảng lookup_logs
INSERT INTO lookup_logs (plate_number, lookup_time) VALUES
('30A-12345', NOW() - INTERVAL '1 hour'),
('29B-67890', NOW() - INTERVAL '2 hours'),
('31C-11223', NOW() - INTERVAL '3 hours'),
('88D-44556', NOW() - INTERVAL '4 hours'),
('36E-77889', NOW() - INTERVAL '5 hours'),
('51F-99001', NOW() - INTERVAL '6 hours'),
('43G-22334', NOW() - INTERVAL '1 day'),
('79H-55667', NOW() - INTERVAL '2 days'),
('66K-88990', NOW() - INTERVAL '3 days'),
('11L-00112', NOW() - INTERVAL '4 days');
