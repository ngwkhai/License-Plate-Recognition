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


---

## Thành viên nhóm

- 23020384 – Nguyễn Đình Khải  
- 23020388 – Nguyễn Thế Khôi  
- 23020414 – Võ Duy Quang  
- 23020376 – Nguyễn Đức Huy  
- 23020344 – Ngô Quang Dũng  

---

## Mô tả dự án

### Tổng quan mục tiêu

Dự án phát triển hệ thống nhận diện biển số xe thời gian thực sử dụng AI nhằm nâng cao hiệu quả quản lý giao thông và hỗ trợ người dân tra cứu vi phạm phạt nguội một cách tiện lợi.

Hệ thống được thiết kế để:

- Nhận diện biển số xe từ ảnh tĩnh, video có sẵn hoặc luồng camera trực tiếp (real-time).
- Xử lý dữ liệu theo thời gian thực, đảm bảo tốc độ và độ chính xác cao.  
- Lưu trữ thông tin biển số xe cùng với thời gian tra cứu .  
- Hiển thị luồng camera thời gian thực kèm kết quả nhận diện ngay lập tức. 
- Cung cấp hai giao diện web dành cho người dân và quản trị viên.  
- Tích hợp API tra cứu phạt nguội từ trang chính thức **[CSGT.vn](https://www.csgt.vn)**
- Thiết kế theo kiến trúc microservices, dễ dàng mở rộng và bảo trì.  
- Triển khai bằng Docker, thuận tiện trong nhiều môi trường thực tế.  

### Nhiệm vụ chính

- Phát triển mô hình AI (YOLOv5 + OCR) nhận diện biển số xe từ nhiều nguồn dữ liệu.  
- Xử lý, lưu trữ và quản lý dữ liệu nhận diện biển số cùng lịch sử tra cứu.  
- Xây dựng API RESTful phục vụ giao tiếp giữa các thành phần frontend và backend.  
- Phát triển giao diện quản trị giúp giám sát, thống kê .  
- Đảm bảo hệ thống hoạt động ổn định, hiệu quả với khả năng mở rộng cao.  

### Trường hợp sử dụng tiêu biểu

#### Đối với người dân

1. **Tra cứu vi phạm giao thông qua biển số**  
   Người dân có thể sử dụng hệ thống để tải ảnh, video hoặc truyền luồng camera nhằm nhận diện biển số xe. Sau khi nhận diện, hệ thống cho phép sao chép nhanh biển số và dẫn liên kết tới trang tra cứu phạt nguội chính thức (csgt.vn).

2. **Giám sát phương tiện ra vào khu vực**  
   Với khả năng nhận diện biển số theo thời gian thực từ camera, hệ thống giúp người dùng theo dõi các phương tiện ra vào khu dân cư, nhà riêng hoặc bãi đỗ xe. Danh sách các biển số đã nhận dạng được lưu lại và có thể kiểm tra bất cứ lúc nào.

3. **Lưu lịch sử tra cứu**  
   Hệ thống tự động ghi lại các biển số đã nhận diện trong phiên làm việc hoặc trong ngày. Người dùng có thể xem lại lịch sử để phục vụ việc đối chiếu hoặc tra cứu sau này.



#### Đối với quản trị viên / kỹ thuật viên

1. **Giám sát hoạt động nhận diện theo thời gian thực**  
   Quản trị viên có thể theo dõi trạng thái hệ thống và danh sách biển số xe được nhận diện tức thời từ camera, đảm bảo hệ thống hoạt động ổn định.

2. **Thống kê, phân tích dữ liệu biển số**  
   Giao diện quản trị hiển thị số lượng biển số đã nhận diện theo các mốc thời gian (ngày, tuần, tháng), kết hợp biểu đồ trực quan hỗ trợ việc theo dõi xu hướng và phân tích.

3. **Tìm kiếm và quản lý lịch sử nhận diện**  
   Hệ thống cho phép lọc và tìm kiếm biển số đã nhận dạng theo khoảng thời gian tùy chọn. Quản trị viên cũng có thể xóa các bản ghi không cần thiết để đảm bảo cơ sở dữ liệu được tối ưu.

---

## Kiến trúc hệ thống

Hệ thống xây dựng theo kiến trúc **microservices** giúp tách biệt các chức năng, dễ bảo trì và mở rộng. Mỗi thành phần được đóng gói trong Docker container để triển khai đồng nhất trên nhiều môi trường.

### Các thành phần chính

- **Frontend User**  
  Cho phép tải ảnh, video hoặc truyền trực tiếp luồng camera để nhận diện biển số. Hiển thị kết quả nhận diện biển số xe theo thời gian thực, hỗ trợ sao chép nhanh biển số để tra cứu phạt nguội, đồng thời lưu lại lịch sử tra cứu tiện lợi.  
  Giao diện bao gồm nút chuyển sang chế độ quản trị (Admin), yêu cầu người dùng đăng nhập để truy cập các chức năng quản trị.

- **Backend AI**  
  Xử lý nhận diện biển số xe bằng mô hình YOLOv5 và OCR, đảm bảo tốc độ và độ chính xác cao trong thời gian thực. Trả kết quả về frontend và lưu vào backend DB.

- **Backend DB**  
  - Lưu trữ dữ liệu biển số xe cùng với thời gian tra cứu  
  - Quản lý lịch sử tra cứu, thống kê và thông tin người dùng  

  Bảng `users` – Lưu thông tin đăng nhập và phân quyền người dùng:  
  - `id`: khóa chính  
  - `username`: tên tài khoản  
  - `password_hash`: mật khẩu đã được mã hóa (băm)  
  - `role`: phân quyền người dùng (`user`, `admin`)  
  - `created_at`: thời điểm tạo tài khoản  

  Bảng `lookup_logs` – Lưu lịch sử tra cứu biển số:  
  - `id`: khóa chính  
  - `plate_number`: biển số được tra cứu  
  - `lookup_time`: thời điểm thực hiện tra cứu  

- **Frontend Admin**  
  Giao diện quản trị hỗ trợ giám sát hoạt động hệ thống, tìm kiếm, thống kê . Tìm kiếm lịch sử nhận diện biển số xe và cho phép xóa các bản ghi theo thời gian cụ thể.
  Hệ thống bao gồm trang đăng nhập bảo mật, yêu cầu nhập tài khoản và mật khẩu hợp lệ trước khi truy cập các tính năng quản trị.

### Giao tiếp hệ thống

- Sử dụng **API RESTful** làm kênh giao tiếp chính giữa frontend và backend.  
- Mỗi dịch vụ chạy trong **Docker container** đảm bảo môi trường vận hành đồng nhất, dễ dàng triển khai và mở rộng.  
- **Giao diện người dùng (User)** có thêm nút chuyển sang giao diện **Admin**, khi đó yêu cầu đăng nhập với tài khoản và mật khẩu được cấp sẵn mới có thể truy cập được khu vực quản trị. 

---

## Liên kết Docker Hub

Image được build sẵn và lưu trữ tại Docker Hub:  
👉 [https://hub.docker.com/r/ntkreyn1103/btl_nhom_5conga/tags](https://hub.docker.com/r/ntkreyn1103/btl_nhom_5conga/tags)

Bao gồm các service:
- `ntkreyn1103/btl_nhom_5conga:backend_db`
- `ntkreyn1103/btl_nhom_5conga:backend_ai`
- `ntkreyn1103/btl_nhom_5conga:frontend_user`
- `ntkreyn1103/btl_nhom_5conga:frontend_admin`
- `ntkreyn1103/btl_nhom_5conga:postgres`
---

## Hướng dẫn chạy Docker Compose

Thực hiện các bước sau để khởi động toàn bộ hệ thống:

1. **Tải các image từ Docker Hub:**
```bash
docker pull ntkreyn1103/btl_nhom_5conga:backend_db
docker pull ntkreyn1103/btl_nhom_5conga:backend_ai
docker pull ntkreyn1103/btl_nhom_5conga:frontend_user
docker pull ntkreyn1103/btl_nhom_5conga:frontend_admin
docker pull ntkreyn1103/btl_nhom_5conga:postgres
````

2. **Lưu tệp `docker-compose.yml` được cung cấp** vào thư mục gốc của dự án.

3. **Chạy hệ thống bằng Docker Compose:**

```bash
docker-compose up -d
```

4. **Truy cập ứng dụng tại:**

*  Frontend user: [http://localhost:3000](http://localhost:3000)
*  Frontend admin: [http://localhost:5174](http://localhost:5174)
*  Backend AI API: [http://localhost:8000](http://localhost:8000)
*  Backend DB API: [http://localhost:8001](http://localhost:8001)

---
