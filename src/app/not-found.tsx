/**
 * ================================================================
 * NotFound — หน้า 404 สวย ๆ เมื่อผู้ใช้เข้า URL ที่ไม่มีอยู่จริง
 * ----------------------------------------------------------------
 * 🎨 ออกแบบให้:
 * - แสดงเลข 404 ใหญ่ ๆ พร้อม gradient
 * - ข้อความภาษาไทยที่เข้าใจง่าย
 * - ปุ่มกลับหน้าหลัก (ใช้ Link โดยตรงแทน Button+asChild)
 * ================================================================
 */
import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      {/* เลข 404 ใหญ่ */}
      <h1 className="text-gradient text-8xl font-extrabold sm:text-9xl">
        404
      </h1>

      {/* ข้อความ */}
      <h2 className="mt-4 text-2xl font-semibold">ไม่พบหน้าที่คุณต้องการ</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        หน้าที่คุณพยายามเข้าถึงอาจถูกลบ ย้ายที่อยู่ หรือไม่มีอยู่จริง
      </p>

      {/* ปุ่มกลับหน้าหลัก — ใช้ Link ของ Next.js โดยตรง */}
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:brightness-110"
      >
        <Home className="size-4" />
        กลับหน้าหลัก
      </Link>
    </div>
  );
}