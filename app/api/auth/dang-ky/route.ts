import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/database";
import { sendOtpEmail } from "@/lib/email";
import { generateOtp, OTP_EXPIRES_MINUTES } from "@/lib/otp";

const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .max(72)
  .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ cái in hoa")
  .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số");

const commonFields = {
  hoTen: z.string().trim().min(2, "Họ tên không được bỏ trống").max(100),
  soDienThoai: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không đúng định dạng"),
  email: z.string().trim().toLowerCase().email("Email không đúng định dạng").max(150),
  matKhau: passwordSchema,
  xacNhanMatKhau: z.string(),
};

const workerSchema = z.object({
  ...commonFields,
  vaiTro: z.literal("NGUOI_LAO_DONG"),
});

const employerSchema = z.object({
  ...commonFields,
  vaiTro: z.literal("NHA_TUYEN_DUNG"),
  tenDonVi: z.string().trim().min(2, "Tên đơn vị không được bỏ trống").max(200),
  maSoThue: z
    .string()
    .trim()
    .regex(/^[0-9-]{10,14}$/, "Mã số thuế không đúng định dạng"),
  diaChiTruSo: z.string().trim().min(5, "Địa chỉ trụ sở không được bỏ trống").max(255),
  chucVuNguoiDaiDien: z
    .string()
    .trim()
    .min(2, "Chức vụ người đại diện không được bỏ trống")
    .max(100),
});

const registerSchema = z
  .discriminatedUnion("vaiTro", [workerSchema, employerSchema])
  .refine((data) => data.matKhau === data.xacNhanMatKhau, {
    message: "Mật khẩu không trùng khớp",
    path: ["xacNhanMatKhau"],
  });

export async function POST(request: Request) {
  const database = getDatabase();
  try {
    const result = registerSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        {
          message: "Thông tin đăng ký chưa hợp lệ",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = result.data;
    const duplicateAccount = await database.query(
      `SELECT email, so_dien_thoai
       FROM tai_khoan
       WHERE LOWER(email) = LOWER($1) OR so_dien_thoai = $2
       LIMIT 1`,
      [data.email, data.soDienThoai],
    );

    if (duplicateAccount.rowCount) {
      const account = duplicateAccount.rows[0];
      return NextResponse.json(
        {
          message:
            account.email.toLowerCase() === data.email
              ? "Email đã được sử dụng!"
              : "Số điện thoại đã được sử dụng!",
        },
        { status: 409 },
      );
    }

    const duplicatePendingPhone = await database.query(
      `SELECT 1 FROM dang_ky_tam
       WHERE so_dien_thoai = $1 AND LOWER(email) <> LOWER($2)
       LIMIT 1`,
      [data.soDienThoai, data.email],
    );
    if (duplicatePendingPhone.rowCount) {
      return NextResponse.json(
        { message: "Số điện thoại đã được sử dụng!" },
        { status: 409 },
      );
    }

    if (data.vaiTro === "NHA_TUYEN_DUNG") {
      const duplicateTax = await database.query(
        `SELECT 1 FROM ho_so_nha_tuyen_dung WHERE ma_so_thue = $1 LIMIT 1`,
        [data.maSoThue],
      );
      if (duplicateTax.rowCount) {
        return NextResponse.json(
          { message: "Mã số thuế đã được sử dụng!" },
          { status: 409 },
        );
      }

      const duplicatePendingTax = await database.query(
        `SELECT 1 FROM dang_ky_tam
         WHERE ma_so_thue = $1 AND LOWER(email) <> LOWER($2)
         LIMIT 1`,
        [data.maSoThue, data.email],
      );
      if (duplicatePendingTax.rowCount) {
        return NextResponse.json(
          { message: "Mã số thuế đã được sử dụng!" },
          { status: 409 },
        );
      }
    }

    const passwordHash = await hash(data.matKhau, 12);
    const otp = generateOtp();

    await database.query(
      `INSERT INTO dang_ky_tam
       (loai_tai_khoan, ho_ten, so_dien_thoai, email, mat_khau_hash,
        ten_don_vi, ma_so_thue, dia_chi_tru_so, chuc_vu_nguoi_dai_dien,
        ma_otp, han_otp, so_lan_nhap_sai_otp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        CURRENT_TIMESTAMP + ($11 * INTERVAL '1 minute'), 0)
       ON CONFLICT (email) DO UPDATE SET
         loai_tai_khoan = EXCLUDED.loai_tai_khoan,
         ho_ten = EXCLUDED.ho_ten,
         so_dien_thoai = EXCLUDED.so_dien_thoai,
         mat_khau_hash = EXCLUDED.mat_khau_hash,
         ten_don_vi = EXCLUDED.ten_don_vi,
         ma_so_thue = EXCLUDED.ma_so_thue,
         dia_chi_tru_so = EXCLUDED.dia_chi_tru_so,
         chuc_vu_nguoi_dai_dien = EXCLUDED.chuc_vu_nguoi_dai_dien,
         ma_otp = EXCLUDED.ma_otp,
         han_otp = EXCLUDED.han_otp,
         so_lan_nhap_sai_otp = 0,
         ngay_tao = CURRENT_TIMESTAMP`,
      [
        data.vaiTro,
        data.hoTen,
        data.soDienThoai,
        data.email,
        passwordHash,
        data.vaiTro === "NHA_TUYEN_DUNG" ? data.tenDonVi : null,
        data.vaiTro === "NHA_TUYEN_DUNG" ? data.maSoThue : null,
        data.vaiTro === "NHA_TUYEN_DUNG" ? data.diaChiTruSo : null,
        data.vaiTro === "NHA_TUYEN_DUNG" ? data.chucVuNguoiDaiDien : null,
        otp,
        OTP_EXPIRES_MINUTES,
      ],
    );

    try {
      const emailResult = await sendOtpEmail({
        email: data.email,
        hoTen: data.hoTen,
        otp,
      });
      return NextResponse.json(
        {
          message: "Mã xác thực đã được gửi đến email của bạn!",
          email: data.email,
          ...(emailResult.developmentMode ? { developmentOtp: otp } : {}),
        },
        { status: 201 },
      );
    } catch (emailError) {
      await database.query("DELETE FROM dang_ky_tam WHERE email = $1", [data.email]);
      console.error("Lỗi gửi OTP:", emailError);
      return NextResponse.json(
        { message: "Không thể gửi mã xác thực. Vui lòng thử lại sau!" },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { message: "Đăng ký chưa hoàn tất. Vui lòng thử lại sau!" },
      { status: 500 },
    );
  }
}
