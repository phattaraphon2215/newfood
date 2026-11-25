import Link from "next/link";
import { redirect } from "next/navigation";
import { registerUser } from "@/actions/authActions";
import { getCurrentUser } from "@/lib/auth";
import { CRMA_DELIVERY_ZONES } from "@/lib/crmaData";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorMsg = params?.error;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Workshop 6 • Password Hashing with bcryptjs
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            สมัครสมาชิกใหม่ (CRMA Food Express)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            รหัสผ่านที่คุณกรอกจะถูกเข้ารหัสทางเดียวด้วย{" "}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
              await bcrypt.hash(password, 10)
            </code>{" "}
            ก่อนบันทึกลงฐานข้อมูล
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <form action={registerUser} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                ชื่อ-นามสกุล / ยศ / ชั้นปี <span aria-hidden="true" className="text-rose-600">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                name="name"
                required
                autoComplete="name"
                placeholder="เช่น นนร. ธนกร ชั้นปีที่ 3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                id="reg-phone"
                type="text"
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="เช่น 081-234-5678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                อีเมล (Email) <span aria-hidden="true" className="text-rose-600">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="เช่น thanakorn@crma.ac.th"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                รหัสผ่าน (จะถูก Hash ด้วย bcrypt) <span aria-hidden="true" className="text-rose-600">*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                required
                minLength={4}
                autoComplete="new-password"
                placeholder="อย่างน้อย 4 ตัวอักษร"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-role"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                เลือกบทบาทในระบบ (Authorization Role)
              </label>
              <select
                id="reg-role"
                name="role"
                defaultValue="MEMBER"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
              >
                <option value="MEMBER">🎖️ MEMBER — ผู้สั่ง/ผู้รับอาหาร (นนร. / บุคลากร)</option>
                <option value="RIDER">🛵 RIDER — ผู้ส่งอาหาร (ไรเดอร์ จปร.)</option>
                <option value="ADMIN">🛡️ ADMIN — ผู้ดูแลระบบส่งอาหาร รร.จปร.</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-unit"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                หน่วย / กองพัน / จุดรับอาหารหลัก
              </label>
              <select
                id="reg-unit"
                name="unit"
                defaultValue={CRMA_DELIVERY_ZONES[0]}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
              >
                {CRMA_DELIVERY_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-md shadow-amber-600/20"
          >
            สมัครสมาชิก & เข้ารหัสรหัสผ่านด้วย bcrypt
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            มีบัญชีผู้ใช้งานอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="font-bold text-amber-700 hover:text-amber-900 underline"
            >
              เข้าสู่ระบบที่นี่ (Login) →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
