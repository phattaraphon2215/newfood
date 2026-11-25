"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. CREATE: สร้างใบสั่งอาหาร / งานจัดส่งใหม่ในพื้นที่ รร.จปร. พร้อมข้อความแชทต้อนรับเริ่มต้น
export async function createTask(formData: FormData) {
  const title = formData.get("title") as string;
  if (!title || title.trim() === "") return;

  const restaurant = (formData.get("restaurant") as string) || "สโมสรนายทหาร รร.จปร.";
  const deliveryZone = (formData.get("deliveryZone") as string) || "กองพันนักเรียนนายร้อยที่ 1";
  const customerName = (formData.get("customerName") as string) || "นักเรียนนายร้อย";
  const phone = (formData.get("phone") as string) || "-";
  const priceRaw = Number(formData.get("price"));
  const quantityRaw = Number(formData.get("quantity"));
  const note = (formData.get("note") as string) || "";

  const price = Number.isFinite(priceRaw) && priceRaw > 0 ? priceRaw : 60;
  const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1;

  await prisma.task.create({
    data: {
      title: title.trim(),
      restaurant: restaurant.trim(),
      deliveryZone: deliveryZone.trim(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      price,
      quantity,
      note: note.trim() || null,
      messages: {
        create: [
          {
            senderRole: "RIDER",
            senderName: "ไรเดอร์ จปร. (สายตรวจส่งอาหาร)",
            message: `รับออเดอร์ "${title.trim()}" จาก ${restaurant.trim()} แล้วครับ กำลังเตรียมไปส่งที่ ${deliveryZone.trim()}`,
          },
        ],
      },
    },
  });

  // สั่งให้ Next.js อัปเดตหน้าจอทันทีที่มีข้อมูลใหม่
  revalidatePath("/");
  revalidatePath("/tasks");
}

// 2. UPDATE: สลับสถานะการจัดส่ง (กำลังจัดส่ง <-> จัดส่งสำเร็จแล้ว)
export async function toggleTask(id: number, currentStatus: boolean) {
  await prisma.task.update({
    where: { id },
    data: { isDone: !currentStatus },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

// 3. UPDATE DETAILS: แก้ไขรายละเอียดออเดอร์ (จำนวน, จุดส่ง, หมายเหตุ)
export async function updateTaskDetails(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;

  const deliveryZone = formData.get("deliveryZone") as string;
  const quantity = Number(formData.get("quantity")) || 1;
  const note = formData.get("note") as string;

  await prisma.task.update({
    where: { id },
    data: {
      ...(deliveryZone ? { deliveryZone } : {}),
      quantity,
      note: note?.trim() || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

// 4. DELETE: ลบรายการสั่งอาหาร
export async function deleteTask(id: number) {
  await prisma.task.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

// 5. CHAT CREATE: ส่งข้อความในช่องแชทระหว่าง "ผู้ส่ง (RIDER)" กับ "ผู้รับ (CUSTOMER)"
export async function sendChatMessage(formData: FormData) {
  const taskId = Number(formData.get("taskId"));
  const senderRole = ((formData.get("senderRole") as string) || "CUSTOMER").toUpperCase();
  const senderNameInput = (formData.get("senderName") as string) || "";
  const message = (formData.get("message") as string) || "";

  if (!taskId || !message.trim()) return;

  const defaultName =
    senderRole === "RIDER" ? "ไรเดอร์ จปร. (ผู้ส่งอาหาร)" : "ผู้รับอาหาร (รร.จปร.)";

  await prisma.chatMessage.create({
    data: {
      taskId,
      senderRole: senderRole === "RIDER" ? "RIDER" : "CUSTOMER",
      senderName: senderNameInput.trim() || defaultName,
      message: message.trim(),
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

// 6. CHAT DELETE: ลบข้อความแชท
export async function deleteChatMessage(messageId: number) {
  if (!messageId) return;

  await prisma.chatMessage.delete({
    where: { id: messageId },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

// 7. SEED: เพิ่มข้อมูลตัวอย่างออเดอร์ส่งอาหารใน รร.จปร. พร้อมบทสนทนาแชทระหว่างผู้ส่งและผู้รับ
export async function seedSampleOrders() {
  const count = await prisma.task.count();
  if (count > 0) {
    const msgCount = await prisma.chatMessage.count();
    if (msgCount === 0) {
      const existingTasks = await prisma.task.findMany();
      for (const t of existingTasks) {
        await prisma.chatMessage.createMany({
          data: [
            {
              taskId: t.id,
              senderRole: "RIDER",
              senderName: "ไรเดอร์ จปร. (สายตรวจส่งอาหาร)",
              message: `รับออเดอร์ "${t.title}" จาก ${t.restaurant} แล้วครับ กำลังนำส่งที่ ${t.deliveryZone}`,
            },
            {
              taskId: t.id,
              senderRole: "CUSTOMER",
              senderName: t.customerName,
              message: `รับทราบครับ มาถึง ${t.deliveryZone} แล้วแจ้งหน้าป้อมหรือโทรหาได้เลยนะครับ`,
            },
          ],
        });
      }
    }
    return;
  }

  await prisma.task.create({
    data: {
      title: "ข้าวกะเพราหมูกรอบไข่ดาวพิเศษ",
      restaurant: "สโมสรนายทหาร รร.จปร.",
      deliveryZone: "กองพันนักเรียนนายร้อยที่ 1 (พัน.1 กรม นนร.)",
      customerName: "นนร. กิตติพงศ์ ชั้นปีที่ 4",
      phone: "089-456-1122",
      price: 75,
      quantity: 2,
      note: "เผ็ดกลาง ขอพริกน้ำปลาเพิ่ม 2 ซอง ส่งที่ป้อมยามหน้ากองพัน",
      isDone: false,
      messages: {
        create: [
          {
            senderRole: "CUSTOMER",
            senderName: "นนร. กิตติพงศ์ ชั้นปีที่ 4",
            message: "พี่ไรเดอร์ครับ ถ้ามาถึงหน้ากองพัน 1 แล้ว ฝากแจ้งนายสิบเวรหน้าป้อมได้เลยนะครับ",
          },
          {
            senderRole: "RIDER",
            senderName: "จ.ส.อ. สมศักดิ์ (ไรเดอร์ จปร.)",
            message: "รับทราบครับน้อง! ตอนนี้รับข้าวจากสโมสรแล้ว กำลังขี่ผ่านศาลาวงกลม อีก 3 นาทีถึงพัน.1 ครับ",
          },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: "ชุดไก่ย่างเขาสวนกวาง + ส้มตำไทย + ข้าวเหนียว",
      restaurant: "ซุ้มอาหารริมอ่างเก็บน้ำห้วยปรือ",
      deliveryZone: "อาคารเรียนส่วนการศึกษา (ตึกเรียนรวม)",
      customerName: "พ.ต. ธีรภัทร (อาจารย์ส่วนการศึกษา)",
      phone: "081-890-3344",
      price: 165,
      quantity: 1,
      note: "ตำไทยไม่ใส่ถั่วลิสง ส่งห้องพักอาจารย์ ชั้น 2",
      isDone: false,
      messages: {
        create: [
          {
            senderRole: "RIDER",
            senderName: "ไรเดอร์ห้วยปรือ #02",
            message: "เรียนอาจารย์ครับ ไก่ย่างเพิ่งขึ้นจากเตาร้อนๆ กำลังเดินทางจากอ่างเก็บน้ำห้วยปรือไปตึกส่วนการศึกษาครับ",
          },
          {
            senderRole: "CUSTOMER",
            senderName: "พ.ต. ธีรภัทร",
            message: "ขอบคุณมากครับ ถึงแล้วโทรแจ้งได้เลย เดี๋ยวให้นักเรียนลงไปรับหน้าตึกครับ",
          },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: "อเมริกาโน่เย็นไม่หวาน + ขนมปังปิ้งเนยนม",
      restaurant: "คาเฟ่หน้าพิพิธภัณฑ์ รร.จปร. (ศาลาวงกลม)",
      deliveryZone: "กองบัญชาการโรงเรียนนายร้อย จปร. (บก.รร.จปร.)",
      customerName: "ร.อ. ณัฐวุฒิ",
      phone: "086-771-9900",
      price: 85,
      quantity: 1,
      note: "แยกน้ำแข็ง วางไว้ที่จุดรับพัสดุชั้น 1",
      isDone: true,
      messages: {
        create: [
          {
            senderRole: "RIDER",
            senderName: "ไรเดอร์คาเฟ่ศาลาวงกลม",
            message: "นำกาแฟและขนมปังปิ้งวางไว้ที่จุดรับพัสดุ ชั้น 1 บก.รร.จปร. เรียบร้อยแล้วครับผม",
          },
          {
            senderRole: "CUSTOMER",
            senderName: "ร.อ. ณัฐวุฒิ",
            message: "ได้รับเรียบร้อยแล้วครับ รวดเร็วมาก ขอบคุณครับ!",
          },
        ],
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}
