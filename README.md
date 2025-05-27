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
- 23020376 – Nguyễn Đức Huy  
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
- Tích hợp API tra cứu phạt nguội từ trang chính thức **[Tra cứu phạt nguội tại csgt.vn](https://www.csgt.vn)**
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

- Có thể tải ảnh, video hoặc truyền luồng camera để nhận diện biển số xe.  
- Xem danh sách biển số được nhận dạng trong phiên làm việc hoặc trong ngày.  
- Hỗ trợ sao chép nhanh biển số để tra cứu phạt nguội và các vi phạm liên quan trên trang CSGT.  
- Có nút chuyển sang giao diện quản trị viên (Admin), yêu cầu đăng nhập bằng tài khoản và mật khẩu để truy cập.  

#### Quản trị viên / Kỹ thuật viên

- Đăng nhập bằng tài khoản và mật khẩu do hệ thống cấp trước để đảm bảo an toàn và bảo mật.  
- Giám sát hoạt động hệ thống nhận diện biển số xe theo thời gian thực.  
- Xem **tổng số biển số xe đã nhận diện**, bao gồm:  
  - Tổng số biển số xe nhận dạng được trong ngày.  
  - Biểu đồ thống kê số lượng biển số theo khoảng thời gian tùy chọn (theo ngày, tuần, tháng).
  - Hỗ trợ lọc và thống kê dữ liệu nhận diện biển số theo các khoảng thời gian linh hoạt: ngày, tuần, tháng hoặc khoảng thời gian tùy chọn.  
- Cho phép tìm kiếm lịch sử tra cứu biển số xe theo khoảng thời gian và hỗ trợ xóa các bản ghi tra cứu theo kết quả tìm kiếm đó.  

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
  Giao diện dành cho người dùng cuối, cho phép tải lên ảnh, video hoặc truyền trực tiếp luồng camera. Hiển thị kết quả nhận diện biển số xe theo thời gian thực, hỗ trợ sao chép nhanh biển số để tra cứu phạt nguội, đồng thời lưu lại lịch sử tra cứu tiện lợi.  
  Ngoài ra, giao diện còn có nút chuyển sang chế độ quản trị (Admin), yêu cầu người dùng nhập tài khoản và mật khẩu được cấp trước để đăng nhập và truy cập các chức năng quản trị hệ thống.


- **Backend AI**  
  Xử lý nhận diện biển số xe bằng mô hình YOLOv5 và OCR, đảm bảo tốc độ và độ chính xác cao trong thời gian thực. Trả kết quả về frontend và lưu vào backend DB.

- **Backend DB**  
  Lưu trữ dữ liệu biển số, ảnh, lịch sử tra cứu và quản lý người dùng. Cung cấp API RESTful cho các thành phần truy cập dữ liệu.

- **Frontend Admin**  
  Giao diện quản trị hỗ trợ giám sát hoạt động hệ thống, tìm kiếm, thống kê và xuất báo cáo. Tìm kiếm lịch sử tra nhận diện biển số và xóa lịch sử tra cứu trên hệ thống
  Hệ thống bao gồm trang đăng nhập bảo mật, yêu cầu nhập tài khoản và mật khẩu hợp lệ trước khi truy cập các tính năng quản trị.

### Giao tiếp hệ thống

- Sử dụng **API RESTful** làm kênh giao tiếp chính giữa frontend và backend.  
- Dùng **WebSocket** để cập nhật dữ liệu nhận diện theo thời gian thực tới frontend.  
- Mỗi dịch vụ chạy trong **Docker container** đảm bảo môi trường vận hành đồng nhất, dễ dàng triển khai và mở rộng.  
- **Giao diện người dùng (User)** có thêm nút chuyển sang giao diện **Admin**, khi đó yêu cầu đăng nhập với tài khoản và mật khẩu được cấp sẵn mới có thể truy cập được khu vực quản trị. 

---

## Liên kết Docker Hub



## Hướng dẫn chạy Docker Compose
