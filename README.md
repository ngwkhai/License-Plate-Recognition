# Hệ thống nhận diện biển số xe và hỗ trợ tra cứu phạt nguội

## Overview

- [Thành viên nhóm](#thành-viên-nhóm)
- [Mô tả dự án](#mô-tả-dự-án)
  - [Tổng quan mục tiêu](#tổng-quan-mục-tiêu)
  - [Nhiệm vụ chính](#nhiệm-vụ-chính)
  - [Trường hợp sử dụng tiêu biểu](#trường-hợp-sử-dụng-tiêu-biểu)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
  - [Các thành phần chính](#các-thành-phần-chính)
  - [Giao tiếp hệ thống](#giao-tiếp-hệ-thống)
- [Liên kết Docker Hub](#liên-kết-docker-hub)
- [Hướng dẫn chạy Docker Compose](#hướng-dẫn-chạy-docker-compose)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)

---

## Thành viên nhóm

- 23020384 – Nguyễn Đình Khải  
- 23020388 – Nguyễn Thế Khôi  
- 23020414 – Võ Duy Quang  
- 223020376 – Nguyễn Đức Huy  
- 230200344 – Ngô Quang Dũng

---

## Mô tả dự án

### Tổng quan mục tiêu

Dự án phát triển hệ thống nhận diện biển số xe thời gian thực sử dụng AI nhằm nâng cao hiệu quả quản lý giao thông và hỗ trợ người dân tra cứu vi phạm phạt nguội một cách tiện lợi.

Hệ thống được thiết kế để:

- Nhận dạng biển số từ ảnh, video, hoặc luồng camera trực tiếp.
- Xử lý đa dạng nguồn dữ liệu với hiệu suất thời gian thực.
- Lưu trữ thông tin biển số và hình ảnh đã xử lý.
- Cung cấp giao diện cho người dùng cuối và quản trị viên.
- Tích hợp tra cứu phạt nguội thông qua trang chính thức csgt.vn.
- Hệ thống được triển khai theo kiến trúc microservices với các thành phần riêng biệt, sử dụng Docker để đảm bảo khả năng mở rộng, bảo trì dễ dàng và hiệu suất xử lý cao trong môi trường thực tế.

### Nhiệm vụ chính

- Phát triển mô hình AI sử dụng YOLOv5 và OCR để nhận diện biển số xe.
- Xử lý dữ liệu đầu vào từ ảnh, video và camera trực tiếp.
- Lưu trữ hiệu quả các thông tin nhận dạng trong cơ sở dữ liệu.
- Xây dựng giao diện người dùng và quản trị rõ ràng, dễ sử dụng.
- Đảm bảo hệ thống hoạt động ổn định với Docker và microservices.

### Trường hợp sử dụng tiêu biểu

**Người dân / Người dùng cuối:**
- Tải lên ảnh/video hoặc sử dụng camera để hệ thống nhận diện biển số xe.
- Nhận kết quả nhanh chóng và tra cứu phạt nguội.
- Tra cứu thông tin vi phạm giao thông (phạt nguội) dựa trên biển số đã nhận dạng, thông qua cơ chế hỗ trợ bán tự động.

**Quản trị viên / Kỹ thuật viên:**
- Giám sát hoạt động của hệ thống.
- Truy cập dữ liệu nhận diện, thống kê theo thời gian/địa điểm.
- Quản lý xe đặc biệt, xuất báo cáo dữ liệu.

**Backend AI:**
- Nhận dữ liệu từ frontend, xử lý phát hiện và nhận dạng biển số xe.
- Đảm bảo độ chính xác và tốc độ xử lý đáp ứng thời gian thực.

**Backend DB:**
- Lưu trữ dữ liệu nhận dạng, lịch sử tra cứu và các thông tin liên quan.
- Cung cấp API cho frontend và backend AI để truy xuất và cập nhật dữ liệu

---

## Kiến trúc hệ thống

Hệ thống nhận diện biển số xe thời gian thực được xây dựng theo kiến trúc **microservices**, mỗi thành phần được đóng gói trong Docker container, giao tiếp qua API và message broker, giúp dễ dàng mở rộng và bảo trì.

### Các thành phần chính

- **Frontend User**:  
  Giao diện cho người dân hoặc thiết bị gửi ảnh, video, luồng camera trực tiếp. Hiển thị kết quả nhận dạng và hỗ trợ tra cứu phạt nguội qua trang csgt.vn. Lưu trữ lịch sử tra cứu cũng như gửi hình ảnh/video cho hệ thống nhận diện.

- **Backend AI**:  
  Xử lý nhận diện biển số bằng mô hình YOLOv5 và OCR. Trả kết quả nhận dạng và gửi dữ liệu về Backend DB.

- **Backend DB**:  
  Lưu trữ và quản lý dữ liệu biển số, lịch sử tra cứu, người dùng. Cung cấp API cho frontend và backend.

- **Frontend Admin**:  
  Giao diện quản trị giúp giám sát, lọc dữ liệu, quản lý xe đặc biệt, cảnh báo và xuất báo cáo.

### Giao tiếp hệ thống

- REST API và WebSocket cho giao tiếp thời gian thực.
- Kafka hoặc Redis đóng vai trò message broker giữa các backend, hỗ trợ xử lý bất đồng bộ.

---

## Liên kết Docker Hub



---

## Hướng dẫn chạy Docker Compose


