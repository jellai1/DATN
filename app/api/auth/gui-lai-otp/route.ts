import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/database";
import { sendOtpEmail } from "@/lib/email";
import { generateOtp, OTP_EXPIRES_MINUTES } from "@/lib/otp";

const resendSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
});

export async function POST(request: Request) {
  try {
    const result = resendSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ message: "Email không hợp lệ" }, { status: 400 });
    }

    const database = getDatabase();
    const pendingResult = await database.query(
      `SELECT id, ho_ten, han_otp FROM dang_ky_tam
       WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [result.data.email],
    );
    const pending = pendingResult.rows[0];

    if (!pending) {
      return NextResponse.json(
        { message: "Không tìm thấy yêu cầu đăng ký. Vui lòng đăng ký lại!" },
        { status: 404 },
      );
    }

    if (
      pending.han_otp &&
      new Date(pending.han_otp).getTime() > Date.now() + 4 * 60 * 1000
    ) {
      return NextResponse.json(
        { message: "Vui lòng chờ 1 phút trước khi gửi lại OTP" },
        { status: 429 },
      );
    }

    const otp = generateOtp();
    await database.query(
      `UPDATE dang_ky_tam
       SET ma_otp = $1,
           han_otp = CURRENT_TIMESTAMP + ($2 * INTERVAL '1 minute'),
           so_lan_nhap_sai_otp = 0
       WHERE id = $3`,
      [otp, OTP_EXPIRES_MINUTES, pending.id],
    );

    try {
      const emailResult = await sendOtpEmail({
        email: result.data.email,
        hoTen: pending.ho_ten,
        otp,
      });
      return NextResponse.json({
        message: "Mã xác thực mới đã được gửi đến email của bạn!",
        ...(emailResult.developmentMode ? { developmentOtp: otp } : {}),
      });
    } catch (emailError) {
      console.error("Lỗi gửi lại OTP:", emailError);
      return NextResponse.json(
        { message: "Không thể gửi mã xác thực. Vui lòng thử lại sau!" },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Lỗi gửi lại OTP:", error);
    return NextResponse.json(
      { message: "Không thể gửi lại OTP lúc này" },
      { status: 500 },
    );
  }
}
