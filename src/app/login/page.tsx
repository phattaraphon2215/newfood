import Link from "next/link";
import { redirect } from "next/navigation";
import { loginUser, quickDemoLogin } from "@/actions/authActions";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorMsg = params?.error;
  const fromPath = params?.from;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left: Login Form */}
        <section className="md:col-span-7 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Workshop 6 • Authentication (ยืนยันตัวตน)
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              เข้าสู่ระบบ CRMA Food Express
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              ตรวจสอบรหัสผ่านที่เข้ารหัสในฐานข้อมูลด้วย{" "}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                bcrypt.compare()
              </code>{" "}
              และสร้าง Secure Session Cookie (<code className="text-amber-800">auth-token</code>)
            </p>
          </div>

          {fromPath && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium"
            >
              🛡️ <strong>Next.js Middleware แจ้งเตือน:</strong> หน้า{" "}
              <code className="font-bold">{fromPath}</code> เป็น Protected Route กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
            >
              ⚠️ {errorMsg}
            </div>
          )}

          <form action={loginUser} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                อีเมลผู้ใช้งาน (รร.จปร.) <span aria-hidden="true" className="text-rose-600">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                required
                autoComplete="username"
                defaultValue="cadet@crma.ac.th"
                placeholder="เช่น cadet@crma.ac.th"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                รหัสผ่าน (Password) <span aria-hidden="true" className="text-rose-600">*</span>
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                defaultValue="crma1234"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white hover:text-slate-950 font-bold text-sm transition shadow-md"
            >
              เข้าสู่ระบบ (Login with bcrypt)
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              ยังไม่มีบัญชีสมาชิกในระบบส่งอาหาร รร.จปร.?{" "}
              <Link
                href="/register"
                className="font-bold text-amber-700 hover:text-amber-900 underline"
              >
                สมัครสมาชิกใหม่ (Register & Hash Password) →
              </Link>
            </p>
          </div>
        </section>

        {/* Right: 1-Click Quick Demo Roles (Authentication vs Authorization) */}
        <aside className="md:col-span-5 bg-gradient-to-br from-slate-900 via-stone-900 to-amber-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-amber-500/20 space-y-5">
          <div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-semibold">
              ⚡ ทดสอบระบบสิทธิ์ (Authorization Roles)
            </span>
            <h2 className="text-lg font-bold mt-2">
              เข้าสู่ระบบด่วน 1 คลิก (แยกตามบทบาทใน รร.จปร.)
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              เลือกเข้าใช้งานเพื่อเปรียบเทียบความแตกต่างระหว่าง{" "}
              <strong className="text-amber-300">ผู้สั่งอาหาร (MEMBER)</strong> กับ{" "}
              <strong className="text-emerald-300">ไรเดอร์ผู้ส่ง (RIDER)</strong> และ{" "}
              <strong className="text-sky-300">ผู้ดูแลระบบ (ADMIN)</strong>
            </p>
          </div>

          <div className="space-y-3">
            {/* Role 1: Cadet Member */}
            <form action={quickDemoLogin}>
              <input type="hidden" name="email" value="cadet@crma.ac.th" />
              <button
                type="submit"
                className="w-full text-left p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition flex items-start gap-3"
              >
                <span className="text-2xl">🎖️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      นนร. กิตติพงศ์ ชั้นปีที่ 4
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      MEMBER
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    อีเมล: cadet@crma.ac.th (รหัส: crma1234)
                  </p>
                  <p className="text-[11px] text-amber-300 mt-1">
                    สิทธิ์: สั่งอาหารไปกองพัน 1, แชทกับไรเดอร์ในฐานะผู้รับ
                  </p>
                </div>
              </button>
            </form>

            {/* Role 2: Rider */}
            <form action={quickDemoLogin}>
              <input type="hidden" name="email" value="rider@crma.ac.th" />
              <button
                type="submit"
                className="w-full text-left p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition flex items-start gap-3"
              >
                <span className="text-2xl">🛵</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      จ.ส.อ. สมศักดิ์ (ไรเดอร์ จปร.)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                      RIDER
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    อีเมล: rider@crma.ac.th (รหัส: rider1234)
                  </p>
                  <p className="text-[11px] text-emerald-300 mt-1">
                    สิทธิ์: กดยืนยันส่งอาหารสำเร็จ (Toggle Done), แชทฝั่งไรเดอร์
                  </p>
                </div>
              </button>
            </form>

            {/* Role 3: Admin */}
            <form action={quickDemoLogin}>
              <input type="hidden" name="email" value="admin@crma.ac.th" />
              <button
                type="submit"
                className="w-full text-left p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition flex items-start gap-3"
              >
                <span className="text-2xl">🛡️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      พ.ต. ธีรภัทร (ส่วนการศึกษา)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-400 text-slate-950">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    อีเมล: admin@crma.ac.th (รหัส: admin1234)
                  </p>
                  <p className="text-[11px] text-sky-300 mt-1">
                    สิทธิ์: จัดการทุกออเดอร์ และตรวจสอบบัญชีสมาชิกทั้งหมด
                  </p>
                </div>
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
