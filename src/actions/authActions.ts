"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, ensureDefaultUsers } from "@/lib/auth";

// 1. REGISTER: สมัครสมาชิกใหม่ พร้อมทำ Password Hashing ด้วย bcryptjs
export async function registerUser(formData: FormData) {
  await ensureDefaultUsers();

  const name = ((formData.get("name") as string) || "").trim();
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const plainPassword = (formData.get("password") as string) || "";
  const role = ((formData.get("role") as string) || "MEMBER").toUpperCase();
  const unit =
    ((formData.get("unit") as string) || "กองพันนักเรียนนายร้อยที่ 1 (พัน.1 กรม นนร.)").trim();
  const phone = ((formData.get("phone") as string) || "081-234-5678").trim();

  if (!name || !email || !plainPassword) {
    redirect("/register?error=กรุณากรอกข้อมูลให้ครบทุกช่อง");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    redirect("/register?error=อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาเข้าสู่ระบบ");
  }

  // กฎเหล็กข้อที่ 1 (Workshop 6): แปลงรหัสผ่านเป็น Hash ด้วย bcryptjs ก่อนบันทึกลง Database
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role: role === "RIDER" || role === "ADMIN" ? role : "MEMBER",
      unit,
      phone,
    },
  });

  // สร้าง Session Cookie (auth-token)
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, `uid:${newUser.id}:${newUser.email}`, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 วัน
    sameSite: "lax",
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// 2. LOGIN: ตรวจสอบตัวตน (Authentication) ด้วย bcrypt.compare()
export async function loginUser(formData: FormData) {
  await ensureDefaultUsers();

  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const plainPassword = (formData.get("password") as string) || "";

  if (!email || !plainPassword) {
    redirect("/login?error=กรุณากรอกอีเมลและรหัสผ่าน");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/login?error=ไม่พบบัญชีผู้ใช้นี้ในระบบ รร.จปร.");
  }

  // เปรียบเทียบรหัสผ่านที่พิมพ์มากับ Hash ในฐานข้อมูลด้วย bcrypt.compare
  const isMatch = await bcrypt.compare(plainPassword, user.passwordHash);
  if (!isMatch) {
    redirect("/login?error=รหัสผ่านไม่ถูกต้อง (bcrypt.compare = false)");
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, `uid:${user.id}:${user.email}`, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// 3. QUICK DEMO LOGIN: ปุ่มล็อกอินด่วน 1 คลิกสำหรับทดสอบบทบาท ผู้สั่งอาหาร (MEMBER) vs ไรเดอร์ (RIDER) vs ผู้ดูแล (ADMIN)
export async function quickDemoLogin(formData: FormData) {
  await ensureDefaultUsers();

  const targetEmail = ((formData.get("email") as string) || "cadet@crma.ac.th")
    .trim()
    .toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!user) {
    redirect("/login?error=ไม่พบบัญชีทดสอบ");
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, `uid:${user.id}:${user.email}`, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// 4. LOGOUT: ออกจากระบบ ลบ Session Cookie (auth-token)
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/login");
}
