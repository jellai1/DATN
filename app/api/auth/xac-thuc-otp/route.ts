import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/database";

const verifySchema = z.object({
  email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
  otp: z.string().trim().regex(/^[0-9]{6}$/, "OTP phải gồm đúng 6 chữ số"),
});

function createUsername(email: string, pendingId: number) {
  const prefix = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 35);
  return `${prefix || "taikhoan"}_${pendingId}`;
}

export async function POST(request: Request) {
  const database = getDatabase();
  try {
    const result = verifySchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }

    const pendingResult = await database.query(
      `SELECT * FROM dang_ky_tam
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [result.data.email],
    );
    const pending = pendingResult.rows[0];

    if (!pending) {
      return NextResponse.json(
        { message: "Không tìm thấy yêu cầu đăng ký. Vui lòng đăng ký lại!" },
        { status: 404 },
      );
    }

    if (new Date(pending.han_otp).getTime() <= Date.now()) {
      return NextResponse.json(
        { message: "Mã xác thực đã hết hiệu lực. Vui lòng yêu cầu gửi lại mã!" },
        { status: 400 },
      );
    }

    if (pending.ma_otp !== result.data.otp) {
      await database.query(
        `UPDATE dang_ky_tam
         SET so_lan_nhap_sai_otp = so_lan_nhap_sai_otp + 1
         WHERE id = $1`,
        [pending.id],
      );
      return NextResponse.json(
        { message: "Mã xác thực không đúng!" },
        { status: 400 },
      );
    }

    const client = await database.connect();
    try {
      await client.query("BEGIN");
      const status =
        pending.loai_tai_khoan === "NHA_TUYEN_DUNG" ? "CHO_DUYET" : "HOAT_DONG";
      const username = createUsername(pending.email, Number(pending.id));

      const accountResult = await client.query(
        `INSERT INTO tai_khoan
         (ho_ten, ten_dang_nhap, email, so_dien_thoai, mat_khau_hash,
          vai_tro, trang_thai, da_xac_thuc_email, ma_otp, han_otp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, NULL, NULL)
         RETURNING id`,
        [
          pending.ho_ten,
          username,
          pending.email,
          pending.so_dien_thoai,
          pending.mat_khau_hash,
          pending.loai_tai_khoan,
          status,
        ],
      );

      if (pending.loai_tai_khoan === "NHA_TUYEN_DUNG") {
        await client.query(
          `INSERT INTO ho_so_nha_tuyen_dung
           (tai_khoan_id, ten_don_vi, ma_so_thue, dia_chi_tru_so,
            nguoi_dai_dien, so_dien_thoai_lien_he, trang_thai_duyet)
           VALUES ($1, $2, $3, $4, $5, $6, 'CHO_DUYET')`,
          [
            accountResult.rows[0].id,
            pending.ten_don_vi,
            pending.ma_so_thue,
            pending.dia_chi_tru_so,
            pending.ho_ten,
            pending.so_dien_thoai,
          ],
        );
      }

      await client.query("DELETE FROM dang_ky_tam WHERE id = $1", [pending.id]);
      await client.query("COMMIT");

      return NextResponse.json({
        message:
          pending.loai_tai_khoan === "NHA_TUYEN_DUNG"
            ? "Đăng ký thành công. Tài khoản đang chờ Cán bộ quản trị xét duyệt."
            : "Đăng ký thành công. Bạn có thể đăng nhập.",
        choXetDuyet: pending.loai_tai_khoan === "NHA_TUYEN_DUNG",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Lỗi xác thực OTP:", error);
    return NextResponse.json(
      { message: "Đăng ký chưa hoàn tất. Vui lòng thử lại sau!" },
      { status: 500 },
    );
  }
}
