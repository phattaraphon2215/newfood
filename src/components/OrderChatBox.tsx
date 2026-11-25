import { sendChatMessage, deleteChatMessage } from "@/actions/taskActions";

export interface ChatMessageItem {
  id: number;
  taskId: number;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: Date;
}

interface OrderChatBoxProps {
  taskId: number;
  orderTitle: string;
  customerName: string;
  deliveryZone: string;
  messages: ChatMessageItem[];
  defaultOpen?: boolean;
}

export function OrderChatBox({
  taskId,
  orderTitle,
  customerName,
  deliveryZone,
  messages,
  defaultOpen = false,
}: OrderChatBoxProps) {
  return (
    <details
      open={defaultOpen}
      className="mt-3 rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/50 to-white overflow-hidden group"
    >
      <summary className="px-4 py-2.5 cursor-pointer select-none flex flex-wrap items-center justify-between gap-2 bg-amber-100/60 hover:bg-amber-100 transition text-xs font-semibold text-amber-950">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs">
            💬
          </span>
          <span>
            ห้องแชทผู้ส่ง & ผู้รับ (#CRMA-{String(taskId).padStart(3, "0")})
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-amber-900 border border-amber-300 text-[11px]">
            {messages.length} ข้อความ
          </span>
        </div>
        <span className="text-[11px] text-amber-800 group-open:hidden">
          คลิกเพื่อเปิดแชทสนทนา ▼
        </span>
        <span className="text-[11px] text-amber-800 hidden group-open:inline">
          ซ่อนหน้าต่างแชท ▲
        </span>
      </summary>

      <div className="p-4 space-y-4">
        {/* Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pb-2 border-b border-slate-100">
          <span>
            📦 ออเดอร์: <strong className="text-slate-700">{orderTitle}</strong>
          </span>
          <span>
            📍 จุดนัดรับ: <strong className="text-amber-800">{deliveryZone}</strong>
          </span>
        </div>

        {/* Message List */}
        <div
          role="log"
          aria-label={`ประวัติการแชทของออเดอร์ ${orderTitle}`}
          className="space-y-2.5 max-h-64 overflow-y-auto pr-1"
        >
          {messages.length === 0 ? (
            <p className="text-center py-4 text-xs text-slate-400">
              ยังไม่มีข้อความพูดคุย เริ่มพิมพ์นัดหมายจุดรับอาหารใน รร.จปร. ได้เลย!
            </p>
          ) : (
            messages.map((msg) => {
              const isRider = msg.senderRole === "RIDER";
              const timeString = new Date(msg.createdAt).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isRider ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm border ${
                      isRider
                        ? "bg-slate-900 text-white border-slate-800 rounded-tl-sm"
                        : "bg-amber-500/15 text-slate-900 border-amber-300 rounded-tr-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span
                        className={`font-bold text-[11px] flex items-center gap-1 ${
                          isRider ? "text-amber-400" : "text-amber-900"
                        }`}
                      >
                        <span>{isRider ? "🛵 ผู้ส่ง (ไรเดอร์ จปร.)" : "🎖️ ผู้รับอาหาร"}</span>
                        <span>• {msg.senderName}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] ${
                            isRider ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {timeString} น.
                        </span>
                        <form action={deleteChatMessage.bind(null, msg.id)}>
                          <button
                            type="submit"
                            title="ลบข้อความนี้"
                            className={`text-[10px] px-1 rounded hover:bg-rose-500 hover:text-white transition ${
                              isRider ? "text-slate-400" : "text-slate-400"
                            }`}
                          >
                            ×
                          </button>
                        </form>
                      </div>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Form to send a new message */}
        <form
          action={sendChatMessage}
          className="pt-2 border-t border-slate-200/80 space-y-2.5"
        >
          <input type="hidden" name="taskId" value={taskId} />

          <div className="grid sm:grid-cols-12 gap-2 items-center">
            {/* Role selection: ผู้รับ vs ผู้ส่ง */}
            <fieldset className="sm:col-span-7 flex flex-wrap items-center gap-2">
              <legend className="sr-only">เลือกบทบาทผู้ส่งข้อความ</legend>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50/70 text-xs font-semibold text-amber-950 cursor-pointer">
                <input
                  type="radio"
                  name="senderRole"
                  value="CUSTOMER"
                  defaultChecked
                  className="accent-amber-600"
                />
                <span>🎖️ ผู้รับ ({customerName})</span>
              </label>

              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="senderRole"
                  value="RIDER"
                  className="accent-slate-900"
                />
                <span>🛵 ผู้ส่ง (ไรเดอร์ จปร.)</span>
              </label>
            </fieldset>

            {/* Optional Custom Sender Name */}
            <div className="sm:col-span-5">
              <label htmlFor={`chat-sender-${taskId}`} className="sr-only">
                ชื่อผู้ส่งข้อความ
              </label>
              <input
                id={`chat-sender-${taskId}`}
                type="text"
                name="senderName"
                defaultValue={customerName}
                placeholder="ชื่อผู้ส่งข้อความ..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <label htmlFor={`chat-msg-${taskId}`} className="sr-only">
              ข้อความแชท
            </label>
            <input
              id={`chat-msg-${taskId}`}
              type="text"
              name="message"
              required
              placeholder="พิมพ์ข้อความคุยกับไรเดอร์ / นัดจุดรับหน้ากองพัน..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm whitespace-nowrap"
            >
              ส่งข้อความ 💬
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}
