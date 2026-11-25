import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const AUTH_COOKIE_NAME = "auth-token";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  unit: string;
  phone: string;
  passwordHash: string;
  createdAt: Date;
}

// สร้างบัญชีตัวอย่างเริ่มต้นในระบบ รร.จปร. (พร้อมเข้ารหัสรหัสผ่านด้วย bcryptjs)
export async function ensureDefaultUsers() {
  const count = await prisma.user.count();
  if (count > 0) return;

  const saltRounds = 10;
  const cadetHash = await bcrypt.hash("crma1234", saltRounds);
  const riderHash = await bcrypt.hash("rider1234", saltRounds);
  const adminHash = await bcrypt.hash("admin1234", saltRounds);

  await prisma.user.createMany({
    data: [
      {
        name: "นนร. กิตติพงศ์ ชั้นปีที่ 4",
        email: "cadet@crma.ac.th",
        passwordHash: cadetHash,
        role: "MEMBER",
        unit: "กองพันนักเรียนนายร้อยที่ 1 (พัน.1 กรม นนร.)",
        phone: "089-456-1122",
      },
      {
        name: "จ.ส.อ. สมศักดิ์ (สายตรวจส่งอาหาร จปร.)",
        email: "rider@crma.ac.th",
        passwordHash: riderHash,
        role: "RIDER",
        unit: "หน่วยบริการจัดส่งอาหาร สโมสรนายทหาร รร.จปร.",
        phone: "081-777-8899",
      },
      {
        name: "พ.ต. ธีรภัทร (ผู้ดูแลระบบส่งอาหาร รร.จปร.)",
        email: "admin@crma.ac.th",
        passwordHash: adminHash,
        role: "ADMIN",
        unit: "อาคารเรียนส่วนการศึกษา (ตึกเรียนรวม)",
        phone: "081-890-3344",
      },
    ],
  });
}

// ดึงข้อมูลผู้ใช้ที่กำลังล็อกอินอยู่จาก Session Cookie (auth-token)
export async function getCurrentUser(): Promise<SessionUser | null> {
  await ensureDefaultUsers();

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    // รูปแบบ token: "uid:<id>:<email>"
    const parts = token.split(":");
    if (parts[0] !== "uid" || !parts[1]) return null;

    const userId = Number(parts[1]);
    if (!Number.isFinite(userId)) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch {
    return null;
  }
}
