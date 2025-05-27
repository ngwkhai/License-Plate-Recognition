# Hệ thống nhận diện biển số xe và hỗ trợ tra cứu phạt nguội

## Mục lục

1. [Thành viên nhóm](#thành-viên-nhóm)  
2. [Mô tả dự án](#mô-tả-dự-án)  
   - [Tổng quan mục tiêu](#tổng-quan-mục-tiêu)  
   - [Nhiệm vụ chính](#nhiệm-vụ-chính)  
   - [Trường hợp sử dụng tiêu biểu](#trường-hợp-sử-dụng-tiêu-biểu)  
3. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)  
   - [Các thành phần chính](#các-thành-phần-chính)  
   - [Giao tiếp hệ thống](#giao-tiếp-hệ-thống)  
4. [Liên kết Docker Hub](#liên-kết-docker-hub)  
5. [Hướng dẫn chạy Docker Compose](#hướng-dẫn-chạy-docker-compose)  
6. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)  

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

- Nhận diện biển số xe từ ảnh tĩnh, video đã ghi và luồng camera trực tiếp (real-time).  
- Xử lý dữ liệu theo thời gian thực, đảm bảo tốc độ và độ chính xác cao.  
- Lưu trữ thông tin biển số xe, hình ảnh gốc và ảnh vùng biển số đã xử lý cùng tọa độ biển số trên ảnh.  
- Hiển thị camera real-time kèm kết quả nhận diện tức thời.  
- Cung cấp hai giao diện web dành cho người dân và quản trị viên.  
- Tích hợp API tra cứu phạt nguội từ trang chính thức csgt.vn.  
- Thiết kế theo kiến trúc microservices, dễ dàng mở rộng và bảo trì.  
- Triển khai bằng Docker, thuận tiện trong nhiều môi trường thực tế.  

### Nhiệm vụ chính

- Phát triển mô hình AI (YOLOv5 + OCR) nhận diện biển số xe từ nhiều nguồn dữ liệu.  
- Xử lý, lưu trữ và quản lý dữ liệu nhận diện biển số cùng lịch sử tra cứu.  
- Xây dựng API RESTful phục vụ giao tiếp giữa các thành phần frontend và backend.  
- Phát triển giao diện quản trị giúp giám sát, thống kê và xuất báo cáo.  
- Đảm bảo hệ thống hoạt động ổn định, hiệu quả với khả năng mở rộng cao.  

### Trường hợp sử dụng tiêu biểu

#### Người dùng cuối (Người dân)

- Tải lên ảnh, video hoặc truyền luồng camera để hệ thống tự động nhận diện biển số xe nhanh chóng.  
- Nhận danh sách biển số xe được nhận dạng trong phiên làm việc hoặc trong ngày.  
- Sao chép nhanh biển số để tra cứu phạt nguội và các vi phạm liên quan trên trang CSGT một cách bán tự động.  
- Tra cứu thông tin vi phạm giao thông dựa trên biển số nhận dạng giúp tiện theo dõi và xử lý.  

#### Quản trị viên / Kỹ thuật viên

- Giám sát hoạt động hệ thống nhận diện biển số xe.  
- Lọc, tìm kiếm và thống kê dữ liệu nhận dạng theo ngày, tuần, tháng hoặc thời gian tùy chọn.  
- Xem danh sách biển số đã tra cứu trong ngày để kiểm soát truy vấn.  
- Quản lý danh sách xe đặc biệt (xe nội bộ, xe nghi vấn, xe vi phạm nhiều lần).  
- Xuất báo cáo dữ liệu theo định dạng Excel hoặc CSV phục vụ phân tích.  

#### Backend AI

- Tiếp nhận và xử lý dữ liệu đầu vào từ frontend hoặc camera.  
- Áp dụng mô hình YOLOv5 và OCR để nhận diện nhanh và chính xác.  
- Trả về kết quả nhận dạng cho frontend và lưu trữ vào backend DB.  

#### Backend DB

- Lưu trữ dữ liệu biển số xe nhận dạng, ảnh gốc, ảnh vùng biển số, tọa độ bounding box, thời gian nhận dạng.  
- Quản lý lịch sử tra cứu và thông tin người dùng.  
- Cung cấp API RESTful cho frontend và backend truy xuất, cập nhật dữ liệu hiệu quả.  

---

## Kiến trúc hệ thống

Hệ thống xây dựng theo kiến trúc **microservices** giúp tách biệt các chức năng, dễ bảo trì và mở rộng. Mỗi thành phần được đóng gói trong Docker container để triển khai đồng nhất trên nhiều môi trường.

### Các thành phần chính

- **Frontend User**  
  Giao diện người dùng cuối để tải ảnh, video hoặc truyền luồng camera trực tiếp. Hiển thị kết quả nhận diện theo thời gian thực, hỗ trợ sao chép biển số tra cứu phạt nguội và lưu lịch sử tra cứu.

- **Backend AI**  
  Xử lý nhận diện biển số xe bằng mô hình YOLOv5 và OCR, đảm bảo tốc độ và độ chính xác cao trong thời gian thực. Trả kết quả về frontend và lưu vào backend DB.

- **Backend DB**  
  Lưu trữ dữ liệu biển số, ảnh, lịch sử tra cứu và quản lý người dùng. Cung cấp API RESTful cho các thành phần truy cập dữ liệu.

- **Frontend Admin**  
  Giao diện quản trị hỗ trợ giám sát hoạt động hệ thống, tìm kiếm, thống kê và xuất báo cáo. Quản lý danh sách xe đặc biệt và quyền người dùng.

### Giao tiếp hệ thống

- Sử dụng **API RESTful** làm kênh giao tiếp chính giữa frontend và backend.  
- Dùng **WebSocket** để cập nhật dữ liệu nhận diện theo thời gian thực tới frontend.  
- Mỗi dịch vụ chạy trong **Docker container** đảm bảo môi trường vận hành đồng nhất, dễ dàng triển khai và mở rộng.  

---

## Liên kết Docker Hub



## Hướng dẫn chạy Docker Compose
