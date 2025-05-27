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

####  Chức năng chính

- 🚘 Nhận diện biển số xe từ:
  - Ảnh tĩnh
  - Video đã ghi
  - **Camera trực tiếp (real-time stream)**

-  Xử lý dữ liệu theo **thời gian thực**, đảm bảo tốc độ và độ chính xác cao.

-  Lưu trữ thông tin gồm:
  - Biển số xe
  - Hình ảnh gốc và đã xử lý
  - Toạ độ vùng chứa biển số

-  **Hiển thị camera real-time** cùng kết quả nhận diện tức thời.

-  Cung cấp hai giao diện web:
  - Giao diện người dân: tra cứu vi phạm phạt nguội
  - Giao diện quản trị viên: thống kê, lọc, quản lý danh sách đặc biệt

- 🔗 **Tích hợp API phạt nguội** từ [csgt.vn](https://csgt.vn)

-  Thiết kế kiến trúc **microservices**, dễ mở rộng và bảo trì

-  **Triển khai bằng Docker**, linh hoạt với nhiều môi trường thực tế

### Nhiệm vụ chính

- Phát triển mô hình AI dựa trên YOLOv5 và OCR để nhận dạng biển số xe từ ảnh, video và luồng camera thời gian thực.
- Xử lý và lưu trữ dữ liệu nhận diện gồm ảnh gốc, ảnh đã xử lý, biển số và tọa độ vùng chứa biển số trong cơ sở dữ liệu backend.
- Xây dựng API RESTful để phục vụ giao tiếp giữa backend AI, frontend quản trị và các thành phần khác của hệ thống.
- Phát triển giao diện quản trị (frontend admin) cho phép quản lý, tìm kiếm, thống kê và xuất báo cáo dữ liệu nhận diện.
- Đảm bảo hệ thống hoạt động ổn định, có khả năng mở rộng cao thông qua kiến trúc microservices và triển khai bằng Docker.
### Trường hợp sử dụng tiêu biểu

#### Người dùng cuối (Người dân)
- Sử dụng ảnh, video hoặc camera trực tiếp (real-time) để hệ thống nhận diện biển số xe một cách tự động và nhanh chóng.
- Hệ thống trả về danh sách các biển số xe được nhận dạng trong phiên làm việc hoặc trong ngày.
- Cho phép sao chép nhanh biển số đã nhận dạng để dễ dàng tra cứu phạt nguội hoặc các thông tin vi phạm giao thông liên quan trên trang chính thức của CSGT, hỗ trợ tra cứu bán tự động.
- Tra cứu thông tin vi phạm giao thông dựa trên biển số đã nhận dạng, giúp người dân tiện lợi trong việc theo dõi và xử lý vi phạm.

#### Quản trị viên / Kỹ thuật viên
- Giám sát và quản lý hoạt động của toàn bộ hệ thống nhận diện biển số.
- Truy cập, lọc và thống kê dữ liệu nhận diện biển số theo ngày, tuần, tháng hoặc khung thời gian cụ thể.
- Xem danh sách biển số đã được tra cứu trong ngày để theo dõi các lượt truy vấn.
- Quản lý danh sách xe đặc biệt như xe nội bộ, xe nghi vấn hoặc xe có nhiều lần vi phạm.
- Xuất báo cáo dữ liệu nhận diện và tra cứu dưới các định dạng như Excel hoặc CSV phục vụ công tác tổng hợp và phân tích.

#### Backend AI
- Tiếp nhận dữ liệu đầu vào từ frontend hoặc camera, xử lý phát hiện và nhận dạng biển số xe bằng các mô hình AI (YOLOv5, OCR).
- Đảm bảo tốc độ xử lý nhanh, chính xác đáp ứng yêu cầu nhận diện thời gian thực (real-time).

#### Backend DB
- Lưu trữ toàn bộ dữ liệu nhận dạng biển số, bao gồm ảnh gốc, ảnh đã xử lý, tọa độ bounding box và thời gian nhận diện.
- Ghi nhận lịch sử tra cứu biển số, bao gồm thông tin người dùng và thời điểm tra cứu.
- Cung cấp API RESTful để frontend và backend AI truy xuất và cập nhật dữ liệu hiệu quả, hỗ trợ phân trang, tìm kiếm, và lọc theo nhiều tiêu chí.


---


## Kiến trúc hệ thống

Hệ thống nhận diện biển số xe thời gian thực được thiết kế theo kiến trúc **microservices** nhằm tăng tính mô-đun, dễ dàng mở rộng và bảo trì. Mỗi thành phần được phát triển, vận hành độc lập và đóng gói trong Docker container, giúp triển khai nhanh chóng và đồng nhất trên các môi trường khác nhau.

### Các thành phần chính

- **Frontend User**  
  Đây là giao diện dành cho người dân hoặc các thiết bị gửi dữ liệu đầu vào. Người dùng có thể tải lên ảnh hoặc video, hoặc truyền trực tiếp luồng camera để hệ thống nhận diện biển số xe.  
  Frontend User có các chức năng:  
  - Hiển thị kết quả nhận dạng biển số theo thời gian thực.  
  - Hỗ trợ người dùng sao chép biển số đã nhận dạng để tra cứu phạt nguội một cách bán tự động thông qua trang web chính thức của CSGT.  
  - Lưu trữ lịch sử tra cứu, giúp người dùng dễ dàng theo dõi các lần tra cứu trước đó.  

- **Backend AI**  
  Thành phần này chịu trách nhiệm xử lý nhận dạng biển số xe bằng công nghệ AI, bao gồm mô hình YOLOv5 để phát hiện vị trí biển số và OCR để trích xuất ký tự trên biển số.  
  Backend AI thực hiện:  
  - Nhận dữ liệu ảnh/video/luồng camera từ frontend hoặc thiết bị.  
  - Xử lý nhận diện nhanh chóng, đảm bảo độ chính xác cao và đáp ứng yêu cầu thời gian thực.  
  - Gửi kết quả nhận dạng về Backend DB để lưu trữ đồng thời trả về frontend để hiển thị.  

- **Backend DB**  
  Đây là thành phần quản lý dữ liệu toàn bộ hệ thống, bao gồm:  
  - Lưu trữ thông tin biển số xe đã nhận dạng, kèm theo ảnh gốc và ảnh vùng khoanh biển số.  
  - Quản lý lịch sử tra cứu, người dùng và danh sách xe đặc biệt (xe nội bộ, xe nghi vấn).  
  - Cung cấp API RESTful để frontend và backend AI truy xuất, cập nhật dữ liệu một cách an toàn và hiệu quả.  

- **Frontend Admin**  
  Giao diện quản trị dành cho cán bộ kỹ thuật và quản lý hệ thống.  
  Frontend Admin cho phép:  
  - Giám sát tổng thể hoạt động của hệ thống, xem số liệu thống kê theo thời gian thực và lịch sử.  
  - Tìm kiếm, lọc và quản lý dữ liệu biển số, bao gồm cả danh sách xe đặc biệt.  
  - Xuất báo cáo dữ liệu theo các khoảng thời gian khác nhau (ngày, tháng, quý).  
  - Quản lý quyền truy cập và tài khoản người dùng.  

### Giao tiếp giữa các thành phần

- **API RESTful**  
  Tất cả các dịch vụ backend cung cấp API REST để frontend gửi yêu cầu truy xuất hoặc cập nhật dữ liệu.  
  API giúp các thành phần hoạt động tách biệt, dễ dàng bảo trì và nâng cấp.  

- **WebSocket**  
  Được sử dụng để cập nhật dữ liệu nhận dạng biển số theo thời gian thực đến frontend, giúp người dùng và quản trị viên luôn có thông tin mới nhất mà không cần tải lại trang.  

- **Docker**  
  Toàn bộ các thành phần microservices được đóng gói dưới dạng Docker container để đảm bảo môi trường chạy đồng nhất, thuận tiện trong triển khai và mở rộng. Docker cũng hỗ trợ quản lý tài nguyên và phân phối tải hợp lý.  

---

## Liên kết Docker Hub



---

## Hướng dẫn chạy Docker Compose


