-- Chạy file này nếu database đã có bảng tai_khoan từ phiên bản trước.
ALTER TABLE tai_khoan
ADD COLUMN IF NOT EXISTS ma_otp VARCHAR(6),
ADD COLUMN IF NOT EXISTS han_otp TIMESTAMPTZ;

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
    trang_thai_duyet VARCHAR(20) NOT NULL DEFAULT 'CHO_DUYET',
    ly_do_tu_choi TEXT,
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Đồng bộ bảng hồ sơ nếu bảng này đã được tạo từ phiên bản cũ.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'ho_so_nha_tuyen_dung'
          AND column_name = 'id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'ho_so_nha_tuyen_dung'
          AND column_name = 'ma_nha_tuyen_dung'
    ) THEN
        ALTER TABLE ho_so_nha_tuyen_dung
        RENAME COLUMN id TO ma_nha_tuyen_dung;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'ho_so_nha_tuyen_dung'
          AND column_name = 'ho_ten_nguoi_dai_dien'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'ho_so_nha_tuyen_dung'
          AND column_name = 'nguoi_dai_dien'
    ) THEN
        ALTER TABLE ho_so_nha_tuyen_dung
        RENAME COLUMN ho_ten_nguoi_dai_dien TO nguoi_dai_dien;
    END IF;
END $$;

ALTER TABLE ho_so_nha_tuyen_dung
ADD COLUMN IF NOT EXISTS linh_vuc_id BIGINT
    REFERENCES linh_vuc(ma_linh_vuc) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS so_dien_thoai_lien_he VARCHAR(15),
ADD COLUMN IF NOT EXISTS tep_giay_phep_kinh_doanh TEXT,
ADD COLUMN IF NOT EXISTS trang_thai_duyet VARCHAR(20)
    NOT NULL DEFAULT 'CHO_DUYET',
ADD COLUMN IF NOT EXISTS ly_do_tu_choi TEXT;

-- Bổ sung số điện thoại từ tài khoản cho các hồ sơ cũ.
UPDATE ho_so_nha_tuyen_dung AS hs
SET so_dien_thoai_lien_he = tk.so_dien_thoai
FROM tai_khoan AS tk
WHERE hs.tai_khoan_id = tk.id
  AND hs.so_dien_thoai_lien_he IS NULL;

ALTER TABLE ho_so_nha_tuyen_dung
DROP COLUMN IF EXISTS chuc_vu_nguoi_dai_dien;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_ho_so_nha_tuyen_dung_trang_thai_duyet'
    ) THEN
        ALTER TABLE ho_so_nha_tuyen_dung
        ADD CONSTRAINT chk_ho_so_nha_tuyen_dung_trang_thai_duyet
        CHECK (trang_thai_duyet IN ('CHO_DUYET', 'DA_DUYET', 'TU_CHOI'));
    END IF;
END $$;

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
