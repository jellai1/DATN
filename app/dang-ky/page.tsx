"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "NGUOI_LAO_DONG" | "NHA_TUYEN_DUNG";
type FieldErrors = Record<string, string[] | undefined>;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("NGUOI_LAO_DONG");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/dang-ky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hoTen: form.get("hoTen"),
          email: form.get("email"),
          soDienThoai: form.get("soDienThoai"),
          matKhau: form.get("matKhau"),
          xacNhanMatKhau: form.get("xacNhanMatKhau"),
          vaiTro: role,
          ...(role === "NHA_TUYEN_DUNG"
            ? {
                tenDonVi: form.get("tenDonVi"),
                maSoThue: form.get("maSoThue"),
                diaChiTruSo: form.get("diaChiTruSo"),
                chucVuNguoiDaiDien: form.get("chucVuNguoiDaiDien"),
              }
            : {}),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        setErrors(data.errors ?? {});
        return;
      }

      setSuccess(true);
      setMessage(data.message);
      if (data.developmentOtp) {
        sessionStorage.setItem("developmentOtp", data.developmentOtp);
      }
      setTimeout(
        () => router.push(`/xac-thuc-otp?email=${encodeURIComponent(data.email)}`),
        900,
      );
    } catch {
      setMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const errorFor = (name: string) =>
    errors[name]?.[0] ? <small className="field-error">{errors[name]?.[0]}</small> : null;

  return (
    <main className="auth-page register-page">
      <section className="auth-intro">
        <Link className="auth-brand" href="/">
          <span className="brand-mark">V</span>
          <span>
            <strong>VIỆC LÀM</strong>
            <small>THANH NIÊN HÀ NỘI</small>
          </span>
        </Link>
        <div className="auth-intro-content">
          <span className="auth-kicker">BẮT ĐẦU HÀNH TRÌNH MỚI</span>
          <h1>Tạo hồ sơ hôm nay.<br />Nắm bắt cơ hội ngày mai.</h1>
          <p>
            Một tài khoản duy nhất giúp bạn tìm việc, tuyển dụng và theo dõi
            toàn bộ quá trình kết nối.
          </p>
          <div className="auth-benefits">
            <span>✓ Đăng ký hoàn toàn miễn phí</span>
            <span>✓ Thông tin được bảo mật</span>
            <span>✓ Doanh nghiệp được xác thực</span>
          </div>
        </div>
        <small className="auth-copyright">© 2026 Trung tâm Dịch vụ Việc làm Thanh niên Hà Nội</small>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-card register-card">
          <Link className="auth-back" href="/">← Quay lại trang chủ</Link>
          <span className="auth-kicker dark">TẠO TÀI KHOẢN MỚI</span>
          <h2>Đăng ký tài khoản</h2>
          <p className="auth-subtitle">Chọn vai trò và điền đầy đủ thông tin bên dưới.</p>

          <div className="role-picker">
            <button
              className={role === "NGUOI_LAO_DONG" ? "selected" : ""}
              type="button"
              onClick={() => setRole("NGUOI_LAO_DONG")}
            >
              <b>👤</b><span><strong>Người lao động</strong><small>Tìm việc và ứng tuyển</small></span>
            </button>
            <button
              className={role === "NHA_TUYEN_DUNG" ? "selected" : ""}
              type="button"
              onClick={() => setRole("NHA_TUYEN_DUNG")}
            >
              <b>▦</b><span><strong>Nhà tuyển dụng</strong><small>Đăng tin và tìm ứng viên</small></span>
            </button>
          </div>

          {message && (
            <div className={`form-message ${success ? "success" : "error"}`}>{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            {role === "NHA_TUYEN_DUNG" && (
              <>
                <div className="form-row">
                  <label className="form-group">
                    <span>Tên đơn vị</span>
                    <input name="tenDonVi" placeholder="Công ty TNHH ABC" required />
                    {errorFor("tenDonVi")}
                  </label>
                  <label className="form-group">
                    <span>Mã số thuế</span>
                    <input name="maSoThue" placeholder="0101234567" required />
                    {errorFor("maSoThue")}
                  </label>
                </div>
                <label className="form-group">
                  <span>Địa chỉ trụ sở</span>
                  <input
                    name="diaChiTruSo"
                    placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
                    required
                  />
                  {errorFor("diaChiTruSo")}
                </label>
              </>
            )}
            <div className="form-row">
              <label className="form-group">
                <span>
                  {role === "NHA_TUYEN_DUNG"
                    ? "Họ tên người đại diện"
                    : "Họ và tên"}
                </span>
                <input name="hoTen" placeholder="Nguyễn Văn A" required />
                {errorFor("hoTen")}
              </label>
              {role === "NHA_TUYEN_DUNG" ? (
                <label className="form-group">
                  <span>Chức vụ người đại diện</span>
                  <input
                    name="chucVuNguoiDaiDien"
                    placeholder="Giám đốc / Trưởng phòng nhân sự"
                    required
                  />
                  {errorFor("chucVuNguoiDaiDien")}
                </label>
              ) : (
                <label className="form-group">
                  <span>Số điện thoại</span>
                  <input name="soDienThoai" placeholder="0912345678" required />
                  {errorFor("soDienThoai")}
                </label>
              )}
            </div>
            <div className="form-row">
              <label className="form-group">
                <span>Email</span>
                <input name="email" type="email" placeholder="email@example.com" required />
                {errorFor("email")}
              </label>
              {role === "NHA_TUYEN_DUNG" && (
                <label className="form-group">
                  <span>Số điện thoại người đại diện</span>
                  <input name="soDienThoai" placeholder="0912345678" required />
                  {errorFor("soDienThoai")}
                </label>
              )}
            </div>
            <div className="form-row">
              <label className="form-group">
                <span>Mật khẩu</span>
                <div className="password-field">
                  <input
                    name="matKhau"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ít nhất 8 ký tự, 1 chữ hoa và 1 số"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
                {errorFor("matKhau")}
              </label>
              <label className="form-group">
                <span>Xác nhận mật khẩu</span>
                <input
                  name="xacNhanMatKhau"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                {errorFor("xacNhanMatKhau")}
              </label>
            </div>
            <label className="terms">
              <input type="checkbox" required />
              <span>Tôi đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a>.</span>
            </label>
            <button className="auth-submit" type="submit" disabled={loading || success}>
              {loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản →"}
            </button>
          </form>

          <p className="auth-switch">
            Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
