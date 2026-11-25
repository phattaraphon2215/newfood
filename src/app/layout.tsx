import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutUser } from "@/actions/authActions";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRMA Food Express | ระบบสั่งและจัดส่งอาหาร โรงเรียนนายร้อยพระจุลจอมเกล้า (จปร.)",
  description:
    "บริการสั่งและจัดส่งอาหารด่วนภายในพื้นที่โรงเรียนนายร้อยพระจุลจอมเกล้า (รร.จปร.) เขาชะโงก จ.นครนายก ส่งถึงกองพันนักเรียนนายร้อย 1-4 อาคารเรียนส่วนการศึกษา บก.รร.จปร. และ รพ.รร.จปร.",
  keywords: [
    "ส่งอาหาร รร.จปร.",
    "โรงเรียนนายร้อยพระจุลจอมเกล้า",
    "CRMA Food Express",
    "สั่งอาหาร เขาชะโงก",
    "เดลิเวอรี่ จปร นครนายก",
    "กองพันนักเรียนนายร้อย",
  ],
  openGraph: {
    title: "CRMA Food Express | ส่งอาหารภายในโรงเรียนนายร้อย จปร.",
    description:
      "สั่งอาหารด่วนถึงทุกกองพันและอาคารเรียนภายในโรงเรียนนายร้อยพระจุลจอมเกล้า พร้อมระบบแชทคุยกับไรเดอร์แบบสดๆ",
    type: "website",
    locale: "th_TH",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "google907f275ac9293c55",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="th">
      <body className={`${prompt.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        {/* Top Military & Gold Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-amber-200 text-xs py-2 px-4 border-b border-amber-700/40">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">
                CRMA Food Delivery • พื้นที่โรงเรียนนายร้อยพระจุลจอมเกล้า (เขาชะโงก จ.นครนายก)
              </span>
            </div>
            <div className="flex items-center gap-4 text-amber-300/90">
              {currentUser ? (
                <span>
                  👤 ผู้ใช้งาน: <strong>{currentUser.name}</strong> ({currentUser.role})
                </span>
              ) : (
                <span>🔒 สถานะ: ยังไม่ได้เข้าสู่ระบบ (Guest)</span>
              )}
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Prisma DB + bcrypt Auth</span>
            </div>
          </div>
        </div>

        {/* Navigation Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-red-700 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-amber-500/20">
                จปร
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-amber-700 transition">
                    CRMA FOOD EXPRESS
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    เขาชะโงก เดลิเวอรี่
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  ระบบสั่งและจัดส่งอาหารภายใน รร.จปร. (Workshop 5 CRUD & Workshop 6 Auth)
                </p>
              </div>
            </Link>

            <nav aria-label="เมนูหลัก" className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition"
              >
                หน้าร้าน
              </Link>
              <Link
                href="/tasks"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition"
              >
                Workshop 5 (/tasks)
              </Link>
              <Link
                href="/dashboard"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 text-amber-300 hover:bg-slate-800 transition shadow-sm"
              >
                🛡️ Dashboard (/dashboard)
              </Link>

              {currentUser ? (
                <form action={logoutUser}>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                  >
                    ออกจากระบบ
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
                >
                  เข้าสู่ระบบ / สมัครสมาชิก
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-semibold text-amber-400 text-sm">
                CRMA Food Express — ระบบส่งอาหารภายในโรงเรียนนายร้อยพระจุลจอมเกล้า
              </p>
              <p className="mt-1">
                พัฒนาด้วย Next.js App Router, Prisma ORM, bcryptjs และ Middleware Protected Routes (Workshop 5 & 6)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                ✓ Persistent Data 100%
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
                ✓ bcrypt Password Hashing
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-emerald-300 border border-slate-700">
                ✓ Middleware Auth Guard
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
