"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/dang-nhap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dinhDanh: form.get("dinhDanh"),
          matKhau: form.get("matKhau"),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        if (data.requireOtp && data.email) {
          setTimeout(
            () => router.push(`/xac-thuc-otp?email=${encodeURIComponent(data.email)}`),
            900,
          );
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Link className="auth-brand" href="/">
          <span className="brand-mark">V</span>
          <span>
            <strong>VIỆC LÀM</strong>
            <small>THANH NIÊN HÀ NỘI</small>
          </span>
        </Link>
        <div className="auth-intro-content">
          <span className="auth-kicker">KẾT NỐI · PHÁT TRIỂN · THÀNH CÔNG</span>
          <h1>Mỗi lần đăng nhập,<br />một cơ hội mới mở ra.</h1>
          <p>
            Theo dõi hồ sơ ứng tuyển, cập nhật trạng thái và kết nối với các
            doanh nghiệp uy tín tại Hà Nội.
          </p>
          <div className="auth-benefits">
            <span>✓ Hàng nghìn việc làm đã kiểm duyệt</span>
            <span>✓ Theo dõi tiến trình ứng tuyển minh bạch</span>
            <span>✓ Hỗ trợ hướng nghiệp miễn phí</span>
          </div>
        </div>
        <small className="auth-copyright">© 2026 Trung tâm Dịch vụ Việc làm Thanh niên Hà Nội</small>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-card">
          <Link className="auth-back" href="/">← Quay lại trang chủ</Link>
          <span className="auth-kicker dark">CHÀO MỪNG BẠN TRỞ LẠI</span>
          <h2>Đăng nhập tài khoản</h2>
          <p className="auth-subtitle">Nhập thông tin để tiếp tục sử dụng hệ thống.</p>

          {message && <div className="form-message error">{message}</div>}

          <form onSubmit={handleSubmit}>
            <label className="form-group">
              <span>Email, số điện thoại hoặc tên đăng nhập</span>
              <input
                name="dinhDanh"
                type="text"
                placeholder="Nhập thông tin đăng nhập"
                autoComplete="username"
                required
              />
            </label>
            <label className="form-group">
              <span>Mật khẩu</span>
              <div className="password-field">
                <input
                  name="matKhau"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </label>
            <div className="form-options">
              <label><input type="checkbox" /> Ghi nhớ đăng nhập</label>
              <Link href="/doi-mat-khau">Đổi mật khẩu</Link>
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
            </button>
          </form>

          <p className="auth-switch">
            Chưa có tài khoản? <Link href="/dang-ky">Đăng ký ngay</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
