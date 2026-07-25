-- Chạy file này nếu bảng tai_khoan đã được tạo từ phiên bản cũ.
ALTER TABLE tai_khoan
ADD COLUMN IF NOT EXISTS ma_otp VARCHAR(6),
ADD COLUMN IF NOT EXISTS han_otp TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_tai_khoan_ma_otp
ON tai_khoan(email, ma_otp);
