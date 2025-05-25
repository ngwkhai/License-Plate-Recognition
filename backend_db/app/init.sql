-- LƯU Ý: PostgreSQL không hỗ trợ CREATE DATABASE IF NOT EXISTS trong file init.sql
-- Bạn phải tạo database thủ công trước hoặc qua docker-compose environment

-- DROP TABLE nếu tồn tại (theo thứ tự tránh vi phạm FK nếu có)
DROP TABLE IF EXISTS lookup_logs;
DROP TABLE IF EXISTS license_plates;
DROP TABLE IF EXISTS users;

-- Bảng biển số xe
CREATE TABLE license_plates (
    id CHAR(36) PRIMARY KEY NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    image_path TEXT,
    processed_path TEXT,
    coordinates JSON,
    source_type VARCHAR(50)
);

-- Bảng lịch sử tra cứu
CREATE TABLE lookup_logs (
    id CHAR(36) PRIMARY KEY NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    lookup_time TIMESTAMP NOT NULL,
    user_ip VARCHAR(45)
);

-- Bảng người dùng
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dữ liệu mẫu

INSERT INTO users (id, username, password_hash, role, created_at) VALUES
('22222222-2222-2222-2222-222222222221', 'reyn', '$2b$12$q9/4/iwLerwyTTRvnD8XgulOycrkmC/S4BqNjJ5yCqulVqp/E/OWm', 'admin', NOW() - INTERVAL '11 days'),
('22222222-2222-2222-2222-222222222222', 'user1', 'hashed_password_456', 'user', NOW()),
('33333333-3333-3333-3333-333333333333', 'user2', 'hashed_password_789', 'user', NOW()),
('44444444-4444-4444-4444-444444444444', 'user3', 'hashed_password_abc', 'user', NOW()),
('55555555-5555-5555-5555-555555555555', 'user4', 'hashed_password_def', 'user', NOW()),
('66666666-6666-6666-6666-666666666666', 'user5', 'hashed_password_ghi', 'user', NOW()),
('77777777-7777-7777-7777-777777777777', 'user6', 'hashed_password_jkl', 'user', NOW()),
('88888888-8888-8888-8888-888888888888', 'user7', 'hashed_password_mno', 'user', NOW()),
('99999999-9999-9999-9999-999999999999', 'user8', 'hashed_password_pqr', 'user', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user9', 'hashed_password_stu', 'user', NOW());

INSERT INTO license_plates (id, plate_number, timestamp, image_path, processed_path, coordinates, source_type) VALUES
('aaa11111-1111-1111-1111-111111111111', '30A-12345', NOW() - INTERVAL '10 days', '/images/raw/30A12345_1.jpg', '/images/processed/30A12345_1.jpg', '{"x":100,"y":200}', 'camera'),
('bbb22222-2222-2222-2222-222222222222', '29B-67890', NOW() - INTERVAL '9 days', '/images/raw/29B67890_1.jpg', '/images/processed/29B67890_1.jpg', '{"x":150,"y":250}', 'upload'),
('ccc33333-3333-3333-3333-333333333333', '30A-12345', NOW() - INTERVAL '8 days', '/images/raw/30A12345_2.jpg', '/images/processed/30A12345_2.jpg', '{"x":110,"y":210}', 'camera'),
('ddd44444-4444-4444-4444-444444444444', '31C-54321', NOW() - INTERVAL '7 days', '/images/raw/31C54321_1.jpg', '/images/processed/31C54321_1.jpg', '{"x":120,"y":220}', 'camera'),
('eee55555-5555-5555-5555-555555555555', '29B-67890', NOW() - INTERVAL '6 days', '/images/raw/29B67890_2.jpg', '/images/processed/29B67890_2.jpg', '{"x":160,"y":260}', 'upload'),
('fff66666-6666-6666-6666-666666666666', '32D-98765', NOW() - INTERVAL '5 days', '/images/raw/32D98765_1.jpg', '/images/processed/32D98765_1.jpg', '{"x":130,"y":230}', 'camera'),
('ggg77777-7777-7777-7777-777777777777', '31C-54321', NOW() - INTERVAL '4 days', '/images/raw/31C54321_2.jpg', '/images/processed/31C54321_2.jpg', '{"x":125,"y":225}', 'camera'),
('hhh88888-8888-8888-8888-888888888888', '30A-12345', NOW() - INTERVAL '3 days', '/images/raw/30A12345_3.jpg', '/images/processed/30A12345_3.jpg', '{"x":105,"y":205}', 'upload'),
('iii99999-9999-9999-9999-999999999999', '32D-98765', NOW() - INTERVAL '2 days', '/images/raw/32D98765_2.jpg', '/images/processed/32D98765_2.jpg', '{"x":135,"y":235}', 'camera'),
('jjjaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33E-11111', NOW() - INTERVAL '1 day', '/images/raw/33E11111_1.jpg', '/images/processed/33E11111_1.jpg', '{"x":140,"y":240}', 'upload');

INSERT INTO lookup_logs (id, plate_number, lookup_time, user_ip) VALUES
('log11111-1111-1111-1111-111111111111', '30A-12345', NOW() - INTERVAL '9 days', '192.168.1.10'),
('log22222-2222-2222-2222-222222222222', '29B-67890', NOW() - INTERVAL '8 days', '192.168.1.20'),
('log33333-3333-3333-3333-333333333333', '31C-54321', NOW() - INTERVAL '7 days', '192.168.1.30'),
('log44444-4444-4444-4444-444444444444', '32D-98765', NOW() - INTERVAL '6 days', '192.168.1.40'),
('log55555-5555-5555-5555-555555555555', '30A-12345', NOW() - INTERVAL '5 days', '192.168.1.50'),
('log66666-6666-6666-6666-666666666666', '33E-11111', NOW() - INTERVAL '4 days', '192.168.1.60'),
('log77777-7777-7777-7777-777777777777', '29B-67890', NOW() - INTERVAL '3 days', '192.168.1.70'),
('log88888-8888-8888-8888-888888888888', '31C-54321', NOW() - INTERVAL '2 days', '192.168.1.80'),
('log99999-9999-9999-9999-999999999999', '32D-98765', NOW() - INTERVAL '1 day', '192.168.1.90'),
('logaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '30A-12345', NOW(), '192.168.1.100');
