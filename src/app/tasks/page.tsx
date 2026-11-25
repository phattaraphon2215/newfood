import { prisma } from "@/lib/prisma";
import { createTask, toggleTask, deleteTask } from "@/actions/taskActions";
import { CRMA_DELIVERY_ZONES, CRMA_RESTAURANTS } from "@/lib/crmaData";
import { OrderChatBox } from "@/components/OrderChatBox";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  // READ: ดึงรายการงานจัดส่งอาหารทั้งหมดพร้อมข้อความแชทจากฐานข้อมูลแบบ Server-side
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Workshop 5 • CRMA Food Delivery Tasks
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              รายการจัดส่งอาหาร รร.จปร. (Database Live)
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
          >
            ← กลับหน้าร้านเต็มรูปแบบ
          </Link>
        </div>

        {/* ฟอร์มสร้างงานจัดส่งอาหารใหม่ (เรียกใช้ Server Action โดยตรง) */}
        <form action={createTask} className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="task-restaurant" className="block text-xs font-semibold text-slate-600 mb-1">
                ร้านอาหารใน รร.จปร.
              </label>
              <select
                id="task-restaurant"
                name="restaurant"
                defaultValue={CRMA_RESTAURANTS[0]}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
              >
                {CRMA_RESTAURANTS.map((rest) => (
                  <option key={rest} value={rest}>
                    {rest}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-zone" className="block text-xs font-semibold text-slate-600 mb-1">
                จุดจัดส่งใน รร.จปร.
              </label>
              <select
                id="task-zone"
                name="deliveryZone"
                defaultValue={CRMA_DELIVERY_ZONES[0]}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
              >
                {CRMA_DELIVERY_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label htmlFor="task-title" className="sr-only">
                ชื่อเมนูอาหารที่สั่ง
              </label>
              <input
                id="task-title"
                type="text"
                name="title"
                required
                placeholder="พิมพ์เมนูอาหารและผู้รับ (เช่น กะเพราถาด ส่ง พัน.1 นนร.)..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition whitespace-nowrap"
            >
              เพิ่มออเดอร์ส่งอาหาร
            </button>
          </div>
        </form>

        {/* รายการงานจัดส่งอาหารจาก Database */}
        <div className="divide-y divide-slate-100">
          {tasks.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">
              ยังไม่มีรายการจัดส่งอาหารในฐานข้อมูล
            </p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <form
                    action={toggleTask.bind(null, task.id, task.isDone)}
                    className="flex items-start gap-3 flex-1"
                  >
                    <button
                      type="submit"
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold transition shrink-0 ${
                        task.isDone
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {task.isDone ? "✓" : ""}
                    </button>
                    <div>
                      <span
                        className={`text-sm block ${
                          task.isDone
                            ? "line-through text-slate-400"
                            : "text-slate-800 font-semibold"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        🏪 {task.restaurant} • 📍 {task.deliveryZone} • ฿
                        {(task.price * task.quantity).toLocaleString()}
                      </span>
                    </div>
                  </form>

                  <form action={deleteTask.bind(null, task.id)}>
                    <button
                      type="submit"
                      className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition"
                    >
                      ลบ
                    </button>
                  </form>
                </div>

                {/* ช่องแชทพูดคุยระหว่างผู้ส่งและผู้รับในแต่ละออเดอร์ */}
                <OrderChatBox
                  taskId={task.id}
                  orderTitle={task.title}
                  customerName={task.customerName}
                  deliveryZone={task.deliveryZone}
                  messages={task.messages}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
