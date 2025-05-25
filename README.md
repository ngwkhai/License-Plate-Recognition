# Tên Dự Án
Hệ thống nhận diện biển số xe và hỗ trợ tra cứu phạt nguội

## Overview
- [Thành viên nhóm](#thanh-vien-nhom)
- [Mô tả dự án](#mo-ta-du-an)
  - [Tổng quan mục tiêu](#tong-quan-muc-tieu)
  - [Nhiệm vụ chính](#nhiem-vu-chinh)
  - [Trường hợp sử dụng](#truong-hop-su-dung)
- [Kiến trúc hệ thống](#kien-truc-he-thong)
- [Liên kết Docker Hub](#lien-ket-docker-hub)
- [Hướng dẫn chạy Docker Compose](#huong-dan-chay-docker-compose)
- [Hướng dẫn sử dụng](#huong-dan-su-dung)
---

## Thành viên nhóm

23020384	  Nguyễn Đình Khải
23020388	  Nguyễn Thế Khôi
23020414	  Võ Duy Quang
223020376  Nguyễn Đức Huy
230200344  Ngô Quang Dũng


---

## Mô tả dự án
### Tổng quan mục tiêu
Dự án phát triển hệ thống nhận diện biển số xe thời gian thực sử dụng AI nhằm nâng cao hiệu quả quản lý giao thông và hỗ trợ người dân tra cứu vi phạm phạt nguội một cách tiện lợi.

Hệ thống được thiết kế để:

- Phát hiện và nhận dạng biển số xe chính xác từ hình ảnh, video hoặc luồng camera trực tiếp.
- Xử lý đa dạng nguồn dữ liệu đầu vào với khả năng mở rộng và đáp ứng yêu cầu thời gian thực.
- Lưu trữ kết quả nhận dạng cùng các thông tin liên quan như thời gian xử lý, tọa độ vùng chứa biển số trên ảnh/video, và ảnh đã được xử lý kèm đánh dấu biển số.
- Cung cấp giao diện thân thiện cho người dùng cuối và quản trị viên nhằm giám sát, tra cứu và quản lý hiệu quả.
- Tích hợp tính năng hỗ trợ tra cứu phạt nguội bằng cách tự động mở trang web chính thức của CSGT (csgt.vn) với biển số đã nhận dạng, giúp người dùng nhanh chóng thực hiện thao tác tra cứu.

Hệ thống được triển khai theo kiến trúc microservices với các thành phần riêng biệt, sử dụng Docker để đảm bảo khả năng mở rộng, bảo trì dễ dàng và hiệu suất xử lý cao trong môi trường thực tế.

 ### Nhiệm vụ chính
- Phát triển mô hình AI nhận diện biển số xe: Sử dụng các kỹ thuật học sâu (deep learning) hiện đại như YOLOv5 cho việc phát hiện vùng biển số và OCR (nhận dạng ký tự quang học) để trích xuất chính xác các ký tự trên biển số xe.

- Xây dựng hệ thống xử lý đa dạng nguồn dữ liệu: Hỗ trợ nhận dữ liệu đầu vào từ nhiều hình thức như ảnh tĩnh, video, hoặc luồng camera thời gian thực.

- Lưu trữ và quản lý dữ liệu nhận dạng: Thiết kế cơ sở dữ liệu đảm bảo lưu trữ hiệu quả các thông tin biển số, hình ảnh, thời gian nhận dạng và tọa độ vùng nhận dạng.

- Cung cấp giao diện người dùng thân thiện: Phát triển các ứng dụng frontend hỗ trợ người dân gửi dữ liệu, xem kết quả nhận dạng và tra cứu phạt nguội, đồng thời cung cấp công cụ quản trị cho người quản lý hệ thống để giám sát và báo cáo.

- Đảm bảo hoạt động ổn định, bảo mật và hiệu suất cao: Sử dụng Docker và kiến trúc microservices giúp triển khai nhanh, mở rộng dễ dàng và tăng độ bền vững của hệ thống.
  ### Trường hợp sử dụng tiêu biểu

#### Người dân / Người dùng cuối:

- Tải lên ảnh hoặc video chứa biển số xe để nhận diện tự động.
- Sử dụng camera trực tiếp để hệ thống tự động phát hiện và nhận dạng biển số.
- Tra cứu thông tin vi phạm giao thông (phạt nguội) dựa trên biển số đã nhận dạng, thông qua cơ chế hỗ trợ bán tự động.

#### Quản trị viên / Kỹ thuật viên:

- Quản lý và giám sát toàn bộ hoạt động của hệ thống nhận diện.
- Truy cập dữ liệu biển số xe đã được nhận dạng, thống kê lưu lượng xe theo thời gian, địa điểm.
- Quản lý danh sách xe đặc biệt (nội bộ, nghi vấn) và nhận cảnh báo khi phát hiện.
- Xuất báo cáo, phân tích dữ liệu phục vụ công tác quản lý và ra quyết định.

#### Backend AI:

- Nhận dữ liệu từ frontend, xử lý phát hiện và nhận dạng biển số xe.
- Đảm bảo độ chính xác và tốc độ xử lý đáp ứng thời gian thực.

#### Backend DB:

- Lưu trữ dữ liệu nhận dạng, lịch sử tra cứu và các thông tin liên quan.
- Cung cấp API cho frontend và backend AI để truy xuất và cập nhật dữ liệu.

---


## Kiến trúc hệ thống


Hệ thống nhận diện biển số xe thời gian thực được xây dựng theo kiến trúc **microservices**, mỗi thành phần được đóng gói trong Docker container, giao tiếp qua API và message broker, giúp dễ dàng mở rộng và bảo trì.

### Các thành phần chính

- **Frontend User**:  
  Giao diện cho người dân hoặc thiết bị gửi ảnh, video, luồng camera trực tiếp. Hiển thị kết quả nhận dạng và hỗ trợ tra cứu phạt nguội qua trang csgt.vn. Lưu trữ lịch sử tra cứu cũng như gửi hình ảnh/ video cho hệ thống nhận diện

- **Backend AI**:  
  Xử lý nhận diện biển số bằng mô hình YOLOv5 và OCR. Trả kết quả nhận dạng và gửi dữ liệu về Backend DB.

- **Backend DB**:  
  Lưu trữ và quản lý dữ liệu biển số, lịch sử tra cứu, người dùng. Cung cấp API cho frontend và backend.

- **Frontend Admin**:  
  Giao diện quản trị giúp giám sát, lọc dữ liệu, quản lý xe đặc biệt, cảnh báo và xuất báo cáo.

### Giao tiếp hệ thống

- Các dịch vụ sử dụng REST API và WebSocket cho giao tiếp đồng bộ và thời gian thực.  
- Kafka hoặc Redis làm message broker giữa Backend AI và Backend DB, hỗ trợ xử lý bất đồng bộ và chịu lỗi.

---

## Liên kết Docker Hub

---



## Hướng dẫn chạy Docker Compose

---

## Hướng dẫn sử dụng
---

