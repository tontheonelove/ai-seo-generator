/**
 * ================================================================
 * Loading — หน้าโหลดอัตโนมัติของ Next.js (App Router)
 * ----------------------------------------------------------------
 * 📌 ไฟล์นี้จะถูก Next.js เรียกอัตโนมัติเมื่อ:
 * - กำลังโหลด route ใหม่
 * - กำลังรอ Server Component
 * - ข้อมูลยังมาไม่ครบ
 *
 * 🎨 ออกแบบให้:
 * - ใช้ Skeleton loading ที่สวยงาม
 * - มี gradient animation
 * - แสดงโลโก้ + ข้อความ "กำลังโหลด..."
 * ================================================================
 */
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      {/* โลโก้หมุน */}
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
          <Loader2 className="size-8 animate-spin text-white" />
        </div>
      </div>

      {/* ข้อความ */}
      <h2 className="text-xl font-semibold">กำลังโหลด SEO EZ...</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        เตรียมความพร้อมระบบ AI ให้คุณ
      </p>

      {/* Progress bar animation */}
      <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-muted/40">
        <div className="animate-shimmer h-full w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      </div>
    </div>
  );
}