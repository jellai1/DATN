import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";

const changePasswordSchema = z
  .object({
    matKhauHienTai: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    matKhauMoi: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự").max(72),
    xacNhanMatKhauMoi: z.string(),
  })
  .refine((data) => data.matKhauMoi === data.xacNhanMatKhauMoi, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["xacNhanMatKhauMoi"],
  })
  .refine((data) => data.matKhauHienTai !== data.matKhauMoi, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["matKhauMoi"],
  });

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Bạn cần đăng nhập để đổi mật khẩu" },
        { status: 401 },
      );
    }

    const result = changePasswordSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        {
          message: "Thông tin chưa hợp lệ",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const database = getDatabase();
    const accountResult = await database.query(
      "SELECT mat_khau_hash FROM tai_khoan WHERE id = $1 LIMIT 1",
      [user.id],
    );
    const account = accountResult.rows[0];

    if (!account || !(await compare(result.data.matKhauHienTai, account.mat_khau_hash))) {
      return NextResponse.json(
        { message: "Mật khẩu hiện tại không chính xác" },
        { status: 400 },
      );
    }

    const newPasswordHash = await hash(result.data.matKhauMoi, 12);
    await database.query(
      `UPDATE tai_khoan
       SET mat_khau_hash = $1,
           ngay_cap_nhat = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newPasswordHash, user.id],
    );

    return NextResponse.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    return NextResponse.json(
      { message: "Không thể đổi mật khẩu lúc này" },
      { status: 500 },
    );
  }
}
