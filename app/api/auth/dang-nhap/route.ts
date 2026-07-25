import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { getDatabase } from "@/lib/database";

const loginSchema = z.object({
  dinhDanh: z.string().trim().min(1, "Vui lòng nhập email, số điện thoại hoặc tên đăng nhập"),
  matKhau: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export async function POST(request: Request) {
  try {
    const result = loginSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }

    const { dinhDanh, matKhau } = result.data;
    const database = getDatabase();
    const queryResult = await database.query(
      `SELECT id, ho_ten, email, mat_khau_hash, vai_tro, trang_thai,
              da_xac_thuc_email
       FROM tai_khoan
       WHERE LOWER(email) = LOWER($1)
          OR so_dien_thoai = $1
          OR LOWER(ten_dang_nhap) = LOWER($1)
       LIMIT 1`,
      [dinhDanh],
    );

    const account = queryResult.rows[0];
    if (!account || !(await compare(matKhau, account.mat_khau_hash))) {
      return NextResponse.json(
        { message: "Thông tin đăng nhập hoặc mật khẩu không chính xác" },
        { status: 401 },
      );
    }

    if (!account.da_xac_thuc_email) {
      return NextResponse.json(
        {
          message: "Email chưa được xác thực",
          requireOtp: true,
          email: account.email,
        },
        { status: 403 },
      );
    }

    if (account.trang_thai === "BI_KHOA") {
      return NextResponse.json(
        { message: "Tài khoản đã bị khóa. Vui lòng liên hệ Trung tâm." },
        { status: 403 },
      );
    }

    await database.query(
      "UPDATE tai_khoan SET lan_dang_nhap_cuoi = CURRENT_TIMESTAMP WHERE id = $1",
      [account.id],
    );

    const token = await createSessionToken({
      id: account.id,
      hoTen: account.ho_ten,
      email: account.email,
      vaiTro: account.vai_tro,
      trangThai: account.trang_thai,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      message:
        account.trang_thai === "CHO_DUYET"
          ? "Đăng nhập thành công. Tài khoản đang chờ xét duyệt nên chưa thể đăng tin."
          : "Đăng nhập thành công",
      choXetDuyet: account.trang_thai === "CHO_DUYET",
      user: {
        id: account.id,
        hoTen: account.ho_ten,
        email: account.email,
        vaiTro: account.vai_tro,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json(
      { message: "Không thể đăng nhập lúc này. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
