import { redirect } from "next/navigation";
import Link from "next/link";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { logoutUser, quickDemoLogin } from "@/actions/authActions";
import { prisma } from "@/lib/prisma";
import { toggleTask, deleteTask } from "@/actions/taskActions";
import { OrderChatBox } from "@/components/OrderChatBox";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // หากไม่มีผู้ใช้ล็อกอิน ให้ Redirect ไปหน้า Login ทันที (Workshop 6: Protected Route)
  if (!user) {
    redirect("/login");
  }

  // ทดสอบ bcrypt.hash และ bcrypt.compare แบบสดๆ เพื่อแสดงผลในหน้า Dashboard ตามภารกิจ Workshop 6
  const samplePlain = "MySecurePassword123!";
  const sampleHash = await bcrypt.hash(samplePlain, 10);
  const sampleMatch = await bcrypt.compare(samplePlain, sampleHash);

  // ดึงรายการออเดอร์ส่งอาหารทั้งหมดพร้อมข้อความแชท
  const allTasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // ดึงรายชื่อสมาชิกทั้งหมด (เฉพาะ ADMIN จะเห็นตารางจัดการสมาชิก)
  const allUsers =
    user.role === "ADMIN"
      ? await prisma.user.findMany({ orderBy: { createdAt: "asc" } })
      : [];

  const isRiderOrAdmin = user.role === "RIDER" || user.role === "ADMIN";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* 1. User Profile Card (ตามโครงสร้างโค้ดตัวอย่าง Workshop 6 เป๊ะ + ข้อมูลสังกัด รร.จปร.) */}
      <section className="p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              บัญชีผู้ใช้งาน • Protected User Dashboard (/dashboard)
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              ยินดีต้อนรับ, {user.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              สังกัด/จุดรับหลัก: <strong className="text-slate-700">{user.unit}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              สถานะ: เข้าสู่ระบบแล้ว (Session Active)
            </span>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <p className="text-xs text-slate-400 font-medium">อีเมล (Authentication ID)</p>
            <p className="text-base font-semibold text-slate-800 mt-0.5">{user.email}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <p className="text-xs text-slate-400 font-medium">ระดับสิทธิ์ (Authorization Role)</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  user.role === "RIDER"
                    ? "bg-emerald-100 text-emerald-900"
                    : user.role === "ADMIN"
                    ? "bg-sky-100 text-sky-900"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {user.role}
              </span>
              <span className="text-xs font-medium text-slate-600">
                {user.role === "RIDER"
                  ? "(ไรเดอร์ส่งอาหาร จปร.)"
                  : user.role === "ADMIN"
                  ? "(ผู้ดูแลระบบทั้งหมด)"
                  : "(ผู้สั่ง/ผู้รับอาหาร)"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <p className="text-xs text-slate-400 font-medium">เบอร์ติดต่อ</p>
            <p className="text-base font-semibold text-slate-800 mt-0.5">{user.phone}</p>
          </div>
        </div>

        {/* Password Hash Inspection Box (ภารกิจข้อ 2: แสดงผล bcrypt Hashing ในฐานข้อมูลจริง) */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-400">
              🔐 ความปลอดภัยรหัสผ่านในฐานข้อมูล (bcrypt Password Hashing)
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              bcrypt.compare() Verified = {sampleMatch ? "true" : "false"}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            รหัสผ่านของคุณถูกแปลงด้วย <code className="text-amber-300">bcrypt.hash(password, 10)</code>{" "}
            แบบทางเดียว (One-Way Hash) ไม่มีการเก็บรหัสผ่านจริง (Plaintext):
          </p>
          <div className="p-2.5 rounded-xl bg-black/50 font-mono text-xs text-emerald-400 break-all border border-slate-800">
            {user.passwordHash}
          </div>
        </div>

        {/* Role Switcher & Logout Footer */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              สลับบทบาทผู้ใช้งานด่วน:
            </span>
            <form action={quickDemoLogin}>
              <input type="hidden" name="email" value="cadet@crma.ac.th" />
              <button
                type="submit"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  user.email === "cadet@crma.ac.th"
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200"
                }`}
              >
                🎖️ โหมดผู้สั่ง (MEMBER)
              </button>
            </form>
            <form action={quickDemoLogin}>
              <input type="hidden" name="email" value="rider@crma.ac.th" />
              <button
                type="submit"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  user.email === "rider@crma.ac.th"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200"
                }`}
              >
                🛵 โหมดไรเดอร์ (RIDER)
              </button>
            </form>
            <form action={quickDemoLogin}>
              <input type="hidden" name="email" value="admin@crma.ac.th" />
              <button
                type="submit"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  user.email === "admin@crma.ac.th"
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-200"
                }`}
              >
                🛡️ โหมดผู้ดูแล (ADMIN)
              </button>
            </form>
          </div>

          <form action={logoutUser}>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl text-sm transition border border-rose-200"
            >
              ออกจากระบบ (Logout)
            </button>
          </form>
        </div>
      </section>

      {/* 2. Role-Based Workspace (Authorization: สิทธิ์การใช้งานตามบทบาทของ User ที่ล็อกอิน) */}
      <section className="p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-slate-100 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Authorization (AuthZ) • พื้นที่ทำงานตามสิทธิ์ของคุณ ({user.role})
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {user.role === "RIDER"
                ? "🛵 ศูนย์ปฏิบัติการไรเดอร์: รับงานจัดส่ง & แชทแจ้งลูกค้าใน รร.จปร."
                : user.role === "ADMIN"
                ? "🛡️ ศูนย์ควบคุมระบบจัดส่งอาหาร & จัดการสมาชิกทั้งหมด"
                : "🎖️ รายการอาหารที่คุณสั่ง & ช่องแชทติดต่อไรเดอร์"}
            </h2>
          </div>

          <Link
            href="/#order-form"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            + สั่งอาหารเพิ่มที่หน้าร้าน
          </Link>
        </div>

        {/* Orders List with Role-Based Controls */}
        <div className="divide-y divide-slate-100">
          {allTasks.map((task) => (
            <article key={task.id} className="py-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      #CRMA-{String(task.id).padStart(3, "0")}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        task.isDone
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {task.isDone ? "✓ จัดส่งสำเร็จแล้ว" : "🛵 กำลังจัดส่ง"}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      ฿{(task.price * task.quantity).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                  <p className="text-xs text-slate-600">
                    🏪 <strong>ร้าน:</strong> {task.restaurant} • 📍{" "}
                    <strong>จุดส่ง:</strong>{" "}
                    <span className="text-amber-800 font-semibold">{task.deliveryZone}</span> • 👤{" "}
                    <strong>ผู้รับ:</strong> {task.customerName}
                  </p>
                </div>

                {/* Authorization Check: เฉพาะ RIDER หรือ ADMIN ที่กดปุ่มเปลี่ยนสถานะจัดส่ง / ลบออเดอร์ในหน้า Dashboard ได้ */}
                <div className="flex items-center gap-2">
                  {isRiderOrAdmin ? (
                    <>
                      <form action={toggleTask.bind(null, task.id, task.isDone)}>
                        <button
                          type="submit"
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                            task.isDone
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          }`}
                        >
                          {task.isDone ? "ตีกลับเป็นกำลังส่ง" : "✓ ไรเดอร์ยืนยันส่งสำเร็จ"}
                        </button>
                      </form>
                      <form action={deleteTask.bind(null, task.id)}>
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          ลบ
                        </button>
                      </form>
                    </>
                  ) : (
                    <span className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500">
                      🔒 เฉพาะไรเดอร์ (RIDER) ที่กดยืนยันส่งสำเร็จได้
                    </span>
                  )}
                </div>
              </div>

              {/* Chat Box pre-configured with logged-in user's name */}
              <OrderChatBox
                taskId={task.id}
                orderTitle={task.title}
                customerName={user.name}
                deliveryZone={task.deliveryZone}
                messages={task.messages}
              />
            </article>
          ))}
        </div>
      </section>

      {/* 3. Admin-Only Section: ตารางตรวจสอบสมาชิกและ Password Hash ทั้งหมดในระบบ */}
      {user.role === "ADMIN" && (
        <section className="p-6 sm:p-8 bg-slate-900 text-white rounded-3xl shadow-xl border border-slate-800 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              ADMIN ONLY (Authorization Level: ADMIN)
            </span>
            <h2 className="text-lg font-bold mt-1">
              ตารางสมาชิกและค่า bcrypt Password Hash ในฐานข้อมูล ({allUsers.length} บัญชี)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 pr-4">ชื่อ-สกุล</th>
                  <th className="py-2.5 pr-4">อีเมล</th>
                  <th className="py-2.5 pr-4">Role</th>
                  <th className="py-2.5">bcrypt Password Hash ใน Database</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2.5 pr-4 font-semibold text-white">{u.name}</td>
                    <td className="py-2.5 pr-4 text-slate-300">{u.email}</td>
                    <td className="py-2.5 pr-4">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-amber-300 font-bold">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-emerald-400 break-all">
                      {u.passwordHash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
