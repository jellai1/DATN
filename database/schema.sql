CREATE TABLE IF NOT EXISTS tai_khoan (
    id BIGSERIAL PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    ten_dang_nhap VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(15) UNIQUE,
    mat_khau_hash VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(20) NOT NULL
        CHECK (vai_tro IN ('NGUOI_LAO_DONG', 'NHA_TUYEN_DUNG', 'QUAN_TRI')),
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'HOAT_DONG'
        CHECK (trang_thai IN ('CHO_DUYET', 'HOAT_DONG', 'BI_KHOA')),
    da_xac_thuc_email BOOLEAN NOT NULL DEFAULT FALSE,
    ma_otp VARCHAR(6),
    han_otp TIMESTAMPTZ,
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lan_dang_nhap_cuoi TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tai_khoan_email ON tai_khoan(email);
CREATE INDEX IF NOT EXISTS idx_tai_khoan_so_dien_thoai ON tai_khoan(so_dien_thoai);
CREATE INDEX IF NOT EXISTS idx_tai_khoan_vai_tro ON tai_khoan(vai_tro);
CREATE INDEX IF NOT EXISTS idx_tai_khoan_ma_otp ON tai_khoan(email, ma_otp);

CREATE TABLE IF NOT EXISTS linh_vuc (
    ma_linh_vuc BIGSERIAL PRIMARY KEY,
    ten_linh_vuc_hoat_dong VARCHAR(255) NOT NULL UNIQUE,
    mo_ta_linh_vuc TEXT
);

CREATE TABLE IF NOT EXISTS ho_so_nha_tuyen_dung (
    ma_nha_tuyen_dung BIGSERIAL PRIMARY KEY,
    tai_khoan_id BIGINT NOT NULL UNIQUE
        REFERENCES tai_khoan(id) ON DELETE CASCADE,
    linh_vuc_id BIGINT
        REFERENCES linh_vuc(ma_linh_vuc) ON DELETE SET NULL,
    ten_don_vi VARCHAR(200) NOT NULL,
    ma_so_thue VARCHAR(30) NOT NULL UNIQUE,
    dia_chi_tru_so VARCHAR(255) NOT NULL,
    nguoi_dai_dien VARCHAR(100) NOT NULL,
    so_dien_thoai_lien_he VARCHAR(15) NOT NULL,
    tep_giay_phep_kinh_doanh TEXT,
    trang_thai_duyet VARCHAR(20) NOT NULL DEFAULT 'CHO_DUYET'
        CHECK (trang_thai_duyet IN ('CHO_DUYET', 'DA_DUYET', 'TU_CHOI')),
    ly_do_tu_choi TEXT,
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ho_so_nha_tuyen_dung_linh_vuc
ON ho_so_nha_tuyen_dung(linh_vuc_id);

CREATE INDEX IF NOT EXISTS idx_ho_so_nha_tuyen_dung_trang_thai_duyet
ON ho_so_nha_tuyen_dung(trang_thai_duyet);

CREATE TABLE IF NOT EXISTS ho_so_nguoi_lao_dong (
    ma_ho_so BIGSERIAL PRIMARY KEY,
    tai_khoan_id BIGINT NOT NULL UNIQUE
        REFERENCES tai_khoan(id) ON DELETE CASCADE,
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh VARCHAR(10)
        CHECK (gioi_tinh IN ('NAM', 'NU', 'KHAC')),
    dia_chi VARCHAR(255),
    anh_dai_dien TEXT,
    muc_luong_mong_muon NUMERIC(15, 2)
        CHECK (muc_luong_mong_muon >= 0),
    dia_diem_mong_muon VARCHAR(255),
    tep_cv_dinh_kem TEXT,
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ho_so_nguoi_lao_dong_dia_diem
ON ho_so_nguoi_lao_dong(dia_diem_mong_muon);

-- Lưu tạm dữ liệu trước khi OTP hợp lệ; đây chưa phải tài khoản chính thức.
CREATE TABLE IF NOT EXISTS dang_ky_tam (
    id BIGSERIAL PRIMARY KEY,
    loai_tai_khoan VARCHAR(20) NOT NULL
        CHECK (loai_tai_khoan IN ('NGUOI_LAO_DONG', 'NHA_TUYEN_DUNG')),
    ho_ten VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mat_khau_hash VARCHAR(255) NOT NULL,
    ten_don_vi VARCHAR(200),
    ma_so_thue VARCHAR(30),
    dia_chi_tru_so VARCHAR(255),
    chuc_vu_nguoi_dai_dien VARCHAR(100),
    ma_otp VARCHAR(6) NOT NULL,
    han_otp TIMESTAMPTZ NOT NULL,
    so_lan_nhap_sai_otp INTEGER NOT NULL DEFAULT 0,
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dang_ky_tam_email_otp
ON dang_ky_tam(email, ma_otp);
