# Việc Làm Thanh Niên Hà Nội

Mã nguồn trang chủ, đăng ký, xác thực OTP, đăng nhập và đổi mật khẩu được xây
dựng bằng Next.js, React, TypeScript, Tailwind CSS và PostgreSQL.

## Yêu cầu

- Node.js 20 trở lên
- npm
- PostgreSQL và pgAdmin 4

## Tạo cơ sở dữ liệu

1. Mở pgAdmin 4 và tạo database `viec_lam_thanh_nien`.
2. Chọn database vừa tạo, mở Query Tool.
3. Mở và chạy toàn bộ nội dung file `database/schema.sql`.
4. Sao chép `.env.example` thành `.env.local`.
5. Trong `.env.local`, thay `MAT_KHAU_POSTGRES` bằng mật khẩu tài khoản
   `postgres` trên máy.

Nếu database đã được tạo bằng phiên bản cũ, không chạy lại `schema.sql`. Hãy mở
Query Tool và chạy file:

```text
database/migration_f01_f02.sql
```

## Cấu hình gửi OTP

Trong `.env.local`, cấu hình các biến SMTP theo mẫu trong `.env.example`.
Nếu dùng Gmail:

1. Bật xác minh hai bước cho tài khoản Google.
2. Tạo Mật khẩu ứng dụng.
3. Điền email vào `SMTP_USER` và Mật khẩu ứng dụng vào `SMTP_PASSWORD`.

Nếu chưa cấu hình SMTP khi chạy ở chế độ phát triển, mã OTP sẽ xuất hiện ngay
trên trang xác thực và trong Terminal để tiện kiểm thử.

## Chạy trên Windows

Mở thư mục dự án bằng Visual Studio Code, sau đó chạy trong Terminal:

```powershell
npm.cmd install
npm.cmd run dev
```

Mở địa chỉ được hiển thị trong Terminal, thông thường là:

```text
http://localhost:3000
```

## Các tệp giao diện chính

- `app/page.tsx`: nội dung và xử lý tương tác của trang chủ
- `app/globals.css`: toàn bộ CSS và responsive
- `app/layout.tsx`: tiêu đề và bố cục chung
- `app/dang-ky/page.tsx`: giao diện đăng ký
- `app/dang-nhap/page.tsx`: giao diện đăng nhập
- `app/xac-thuc-otp/page.tsx`: giao diện nhập và gửi lại OTP
- `app/doi-mat-khau/page.tsx`: giao diện đổi mật khẩu
- `app/api/auth`: API đăng ký, OTP, đăng nhập, đổi mật khẩu và đăng xuất
- `database/schema.sql`: câu lệnh tạo bảng tài khoản
- `database/migration_f01_f02.sql`: nâng cấp database đã tồn tại theo F01–F02

## Luồng đăng ký theo F01–F02

- Dữ liệu đăng ký được lưu tạm trong bảng `dang_ky_tam`.
- Tài khoản chính thức chỉ được tạo sau khi OTP đúng và còn hạn.
- Người lao động được kích hoạt ngay sau khi xác thực OTP.
- Nhà tuyển dụng được tạo ở trạng thái `CHO_DUYET`, vẫn đăng nhập được nhưng
  chưa được phép đăng tin.
- Thông tin đơn vị được lưu trong bảng `ho_so_nha_tuyen_dung`.
