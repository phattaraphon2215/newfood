import { prisma } from "@/lib/prisma";
import {
  createTask,
  toggleTask,
  deleteTask,
  seedSampleOrders,
  updateTaskDetails,
} from "@/actions/taskActions";
import {
  CRMA_DELIVERY_ZONES,
  CRMA_RECOMMENDED_MENUS,
  CRMA_RESTAURANTS,
} from "@/lib/crmaData";
import { OrderChatBox } from "@/components/OrderChatBox";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // ตรวจสอบว่ามีข้อมูลหรือข้อความแชทในฐานข้อมูลหรือยัง ถ้ายังไม่มีให้สร้างข้อมูลตัวอย่างของ รร.จปร. อัตโนมัติ
  const count = await prisma.task.count();
  const msgCount = await prisma.chatMessage.count();
  if (count === 0 || msgCount === 0) {
    await seedSampleOrders();
  }

  // READ: ดึงรายการสั่งอาหารทั้งหมดพร้อมประวัติแชท (Relational Database: Task -> ChatMessage)
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const pendingOrders = tasks.filter((t) => !t.isDone);
  const completedOrders = tasks.filter((t) => t.isDone);
  const totalRevenue = tasks.reduce((sum, t) => sum + t.price * t.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero Banner: โรงเรียนนายร้อยพระจุลจอมเกล้า (จปร.) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-stone-900 to-amber-950 text-white p-6 sm:p-10 shadow-xl border border-amber-500/20">
        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold">
              <span>📍 พื้นที่บริการ: โรงเรียนนายร้อยพระจุลจอมเกล้า (เขาชะโงก จ.นครนายก)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              บริการสั่งและจัดส่งอาหารด่วน{" "}
              <span className="text-amber-400">ถึงทุกกองพัน & อาคารเรียน รร.จปร.</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              ไม่ว่าจะอยู่ที่ <strong>กองพันนักเรียนนายร้อย 1-4</strong>,{" "}
              <strong>อาคารเรียนส่วนการศึกษา</strong>, <strong>บก.รร.จปร.</strong> หรือ{" "}
              <strong>รพ.รร.จปร.</strong> สั่งอาหารจานโปรดแล้วติดตามสถานะจัดส่งแบบ{" "}
              <span className="text-amber-300 font-medium">
                Database Live (Prisma ORM + Next.js Server Actions)
              </span>{" "}
              ข้อมูลบันทึกถาวร รีเฟรชไม่หาย 100%
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#order-form"
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/25"
              >
                + สั่งอาหารใหม่ทันที
              </a>
              <Link
                href="/tasks"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition"
              >
                เปิดหน้า Workshop 5 (/tasks) →
              </Link>
            </div>
          </div>

          {/* Live Database Stats Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-xs text-slate-300">ออเดอร์ทั้งหมดใน DB</p>
              <p className="text-3xl font-bold text-white mt-1">{tasks.length}</p>
              <p className="text-[11px] text-emerald-300 mt-1">● บันทึกในฐานข้อมูลจริง</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/15 backdrop-blur-sm border border-amber-400/30">
              <p className="text-xs text-amber-200">กำลังจัดส่งไปจุดนัดรับ</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{pendingOrders.length}</p>
              <p className="text-[11px] text-amber-200/80 mt-1">รอไรเดอร์ส่งถึงกองพัน</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/15 backdrop-blur-sm border border-emerald-400/30">
              <p className="text-xs text-emerald-200">จัดส่งสำเร็จแล้ว (isDone)</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{completedOrders.length}</p>
              <p className="text-[11px] text-emerald-200/80 mt-1">✓ ส่งมอบเรียบร้อย</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-xs text-slate-300">ยอดรวมมูลค่าอาหาร</p>
              <p className="text-3xl font-bold text-white mt-1">
                ฿{totalRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-300 mt-1">ฟรีค่าส่งภายใน รร.จปร.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Menu Cards: เมนูยอดฮิตในพื้นที่ รร.จปร. กดสั่งด่วนใน 1 คลิก */}
      <section aria-labelledby="quick-menu-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Quick Order • เมนูยอดนิยมในพื้นที่เขาชะโงก
            </span>
            <h2 id="quick-menu-heading" className="text-2xl font-bold text-slate-900">
              สั่งด่วน 1 คลิกจากร้านดังใน รร.จปร.
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            เลือกจุดจัดส่งแล้วกดปุ่ม <strong>“สั่งเมนูนี้ลง Database”</strong> เพื่อเรียกใช้{" "}
            <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">createTask</code>{" "}
            ทันที
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CRMA_RECOMMENDED_MENUS.map((item) => (
            <article
              key={item.id}
              className="order-card bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between gap-4"
            >
              <header className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
                    <span>{item.emoji}</span>
                    <span>{item.badge}</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">⏱ {item.prepTime}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-xs font-medium text-amber-800">🏪 {item.restaurant}</p>
              </header>

              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

              <footer className="pt-3 border-t border-slate-100">
                <form action={createTask} className="space-y-2.5">
                  <input type="hidden" name="title" value={item.title} />
                  <input type="hidden" name="restaurant" value={item.restaurant} />
                  <input type="hidden" name="price" value={item.price} />
                  <input type="hidden" name="quantity" value="1" />
                  <input
                    type="hidden"
                    name="customerName"
                    value="นนร. / บุคลากร รร.จปร. (สั่งด่วน)"
                  />
                  <input type="hidden" name="phone" value="081-999-CRMA" />

                  <div>
                    <label
                      htmlFor={`zone-${item.id}`}
                      className="block text-[11px] font-semibold text-slate-600 mb-1"
                    >
                      เลือกจุดส่งใน รร.จปร.:
                    </label>
                    <select
                      id={`zone-${item.id}`}
                      name="deliveryZone"
                      defaultValue={CRMA_DELIVERY_ZONES[0]}
                      className="w-full text-xs rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800"
                    >
                      {CRMA_DELIVERY_ZONES.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div>
                      <span className="text-xs text-slate-400">ราคา</span>
                      <p className="text-lg font-bold text-slate-900">฿{item.price}</p>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-amber-600 text-white hover:text-slate-950 font-semibold text-xs transition shadow-sm"
                    >
                      + สั่งเมนูนี้ลง Database
                    </button>
                  </div>
                </form>
              </footer>
            </article>
          ))}
        </div>
      </section>

      {/* Main Content Grid: Left = Custom Order Form (CREATE), Right = Live Delivery Board (READ, UPDATE, DELETE) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start" id="order-form">
        {/* CREATE FORM */}
        <section
          aria-labelledby="custom-order-heading"
          className="lg:col-span-5 bg-white rounded-3xl shadow-lg border border-slate-200 p-6 sm:p-7 lg:sticky lg:top-24"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              📝
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                1. CREATE (Server Action)
              </span>
              <h2 id="custom-order-heading" className="text-xl font-bold text-slate-900">
                สร้างใบสั่งอาหารใหม่ (กำหนดเอง)
              </h2>
            </div>
          </div>

          <form action={createTask} className="space-y-4">
            <div>
              <label
                htmlFor="order-title"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                รายการอาหารที่ต้องการสั่ง <span aria-hidden="true" className="text-rose-600">*</span>
              </label>
              <input
                id="order-title"
                type="text"
                name="title"
                required
                placeholder="เช่น ข้าวกะเพราหมูกรอบไข่ดาว 2 กล่อง + น้ำเก๊กฮวย"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="order-restaurant"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  ร้านอาหารในพื้นที่ รร.จปร.
                </label>
                <select
                  id="order-restaurant"
                  name="restaurant"
                  defaultValue={CRMA_RESTAURANTS[0]}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  {CRMA_RESTAURANTS.map((rest) => (
                    <option key={rest} value={rest}>
                      {rest}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="order-zone"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  จุดจัดส่งภายใน รร.จปร.
                </label>
                <select
                  id="order-zone"
                  name="deliveryZone"
                  defaultValue={CRMA_DELIVERY_ZONES[0]}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  {CRMA_DELIVERY_ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="order-customer"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  ชื่อผู้สั่ง / ยศ / ชั้นปี <span aria-hidden="true" className="text-rose-600">*</span>
                </label>
                <input
                  id="order-customer"
                  type="text"
                  name="customerName"
                  required
                  autoComplete="name"
                  placeholder="เช่น นนร. ธนกร ชั้นปีที่ 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="order-phone"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input
                  id="order-phone"
                  type="text"
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="เช่น 081-234-5678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="order-price"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  ราคาต่อชุด (บาท)
                </label>
                <input
                  id="order-price"
                  type="number"
                  name="price"
                  min={10}
                  max={5000}
                  defaultValue={70}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="order-quantity"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  จำนวน (ชุด/กล่อง)
                </label>
                <input
                  id="order-quantity"
                  type="number"
                  name="quantity"
                  min={1}
                  max={100}
                  defaultValue={1}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="order-note"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                หมายเหตุถึงร้านค้า / จุดนัดรับหน้ากองพัน
              </label>
              <textarea
                id="order-note"
                name="note"
                rows={2}
                placeholder="เช่น เผ็ดน้อย, ฝากไว้ที่ป้อมยามหน้ากองพัน 2, ขอช้อนส้อมพลาสติก"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-md shadow-amber-600/20"
            >
              บันทึกคำสั่งซื้อลงฐานข้อมูล (Create Order)
            </button>
          </form>
        </section>

        {/* READ, UPDATE (Toggle & Edit), DELETE BOARD */}
        <section aria-labelledby="live-orders-heading" className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  2. READ / UPDATE / DELETE • Database Live
                </span>
                <h2 id="live-orders-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
                  กระดานติดตามการจัดส่งอาหาร รร.จปร. ({tasks.length} รายการ)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  กดปุ่มหน้าชื่อเมนูเพื่อสลับสถานะ{" "}
                  <strong>กำลังจัดส่ง ↔ จัดส่งสำเร็จ (toggleTask)</strong> หรือกดลบรายการ
                </p>
              </div>

              <Link
                href="/tasks"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
              >
                ดูแบบมุมมอง Workshop (/tasks)
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-slate-400 text-sm">ยังไม่มีรายการสั่งอาหารในฐานข้อมูล</p>
                <form action={seedSampleOrders}>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition"
                  >
                    + โหลดข้อมูลตัวอย่างออเดอร์ รร.จปร. (4 รายการ)
                  </button>
                </form>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {tasks.map((task) => (
                  <article
                    key={task.id}
                    className={`py-5 first:pt-4 last:pb-1 transition ${
                      task.isDone ? "opacity-75" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Toggle Status & Order Details */}
                      <div className="flex items-start gap-3.5 flex-1">
                        <form action={toggleTask.bind(null, task.id, task.isDone)}>
                          <button
                            type="submit"
                            title={
                              task.isDone
                                ? "คลิกเพื่อเปลี่ยนกลับเป็น กำลังจัดส่ง"
                                : "คลิกเพื่อยืนยันว่า จัดส่งสำเร็จแล้ว"
                            }
                            className={`mt-0.5 w-7 h-7 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition shadow-sm ${
                              task.isDone
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100"
                            }`}
                          >
                            {task.isDone ? "✓" : "🛵"}
                          </button>
                        </form>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              #CRMA-{String(task.id).padStart(3, "0")}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                task.isDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              {task.isDone ? "✓ จัดส่งถึงจุดนัดรับแล้ว" : "🛵 กำลังจัดส่งในพื้นที่ จปร."}
                            </span>
                            <span className="text-xs font-bold text-slate-900 ml-auto sm:ml-0">
                              ฿{(task.price * task.quantity).toLocaleString()}{" "}
                              <span className="text-[11px] font-normal text-slate-500">
                                ({task.price}฿ × {task.quantity})
                              </span>
                            </span>
                          </div>

                          <h3
                            className={`text-base font-bold ${
                              task.isDone
                                ? "line-through text-slate-400"
                                : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </h3>

                          <div className="grid sm:grid-cols-2 gap-1.5 text-xs text-slate-600 pt-1">
                            <p>
                              <strong className="text-slate-800">🏪 ร้าน:</strong> {task.restaurant}
                            </p>
                            <p>
                              <strong className="text-slate-800">📍 จุดส่ง:</strong>{" "}
                              <span className="text-amber-800 font-medium">{task.deliveryZone}</span>
                            </p>
                            <p>
                              <strong className="text-slate-800">👤 ผู้สั่ง:</strong>{" "}
                              {task.customerName}
                            </p>
                            <p>
                              <strong className="text-slate-800">📞 โทร:</strong> {task.phone}
                            </p>
                          </div>

                          {task.note && (
                            <p className="text-xs bg-amber-50/80 text-amber-900 border border-amber-200/70 rounded-xl px-3 py-1.5 mt-1">
                              <strong>หมายเหตุ:</strong> {task.note}
                            </p>
                          )}

                          {/* Collapsible Quick Edit (Update Details) */}
                          <details className="pt-1 group">
                            <summary className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 cursor-pointer select-none">
                              ✏️ แก้ไขจุดส่ง / จำนวน / หมายเหตุ (Update)
                            </summary>
                            <form
                              action={updateTaskDetails}
                              className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                            >
                              <input type="hidden" name="id" value={task.id} />
                              <div className="grid sm:grid-cols-3 gap-2">
                                <div className="sm:col-span-2">
                                  <label
                                    htmlFor={`edit-zone-${task.id}`}
                                    className="block text-[11px] font-semibold text-slate-600 mb-0.5"
                                  >
                                    เปลี่ยนจุดส่งใน รร.จปร.
                                  </label>
                                  <select
                                    id={`edit-zone-${task.id}`}
                                    name="deliveryZone"
                                    defaultValue={task.deliveryZone}
                                    className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                                  >
                                    {CRMA_DELIVERY_ZONES.map((z) => (
                                      <option key={z} value={z}>
                                        {z}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label
                                    htmlFor={`edit-qty-${task.id}`}
                                    className="block text-[11px] font-semibold text-slate-600 mb-0.5"
                                  >
                                    จำนวน (ชุด)
                                  </label>
                                  <input
                                    id={`edit-qty-${task.id}`}
                                    type="number"
                                    name="quantity"
                                    min={1}
                                    max={100}
                                    defaultValue={task.quantity}
                                    className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor={`edit-note-${task.id}`}
                                  className="block text-[11px] font-semibold text-slate-600 mb-0.5"
                                >
                                  หมายเหตุการจัดส่ง
                                </label>
                                <input
                                  id={`edit-note-${task.id}`}
                                  type="text"
                                  name="note"
                                  defaultValue={task.note ?? ""}
                                  placeholder="ระบุหมายเหตุเพิ่มเติม..."
                                  className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                                />
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition"
                                >
                                  บันทึกการแก้ไข
                                </button>
                              </div>
                            </form>
                          </details>

                          {/* ช่องแชทพูดคุยระหว่าง ผู้ส่ง (ไรเดอร์ จปร.) กับ ผู้รับ (ลูกค้าใน รร.จปร.) */}
                          <OrderChatBox
                            taskId={task.id}
                            orderTitle={task.title}
                            customerName={task.customerName}
                            deliveryZone={task.deliveryZone}
                            messages={task.messages}
                            defaultOpen={!task.isDone}
                          />
                        </div>
                      </div>

                      {/* Right: Action Buttons (Toggle & Delete) */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <form action={toggleTask.bind(null, task.id, task.isDone)}>
                          <button
                            type="submit"
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                              task.isDone
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            }`}
                          >
                            {task.isDone ? "ตีกลับเป็นกำลังส่ง" : "✓ ยืนยันส่งสำเร็จ"}
                          </button>
                        </form>

                        <form action={deleteTask.bind(null, task.id)}>
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold transition"
                          >
                            ลบออเดอร์
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
