"use client";

/**
 * ================================================================
 * Error — Error Boundary ฝั่ง Client ของ Next.js
 * ----------------------------------------------------------------
 * 📌 ไฟล์นี้จะถูกเรียกเมื่อมี Error เกิดขึ้นใน Component ใดก็ตาม
 * ป้องกันไม่ให้แอปทั้งหน้าพังจนใช้งานไม่ได้
 *
 * 🎨 ออกแบบให้:
 * - แสดง Error message ภาษาไทย
 * - มีปุ่ม "ลองใหม่" เพื่อยิง request อีกครั้ง
 * - มีปุ่ม "กลับหน้าแรก" เพื่อเริ่มใหม่
 * - ไม่แสดงรายละเอียด error ภายใน (ปลอดภัย)
 * ================================================================
 */
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  /* ---- Log error ฝั่ง client (เพื่อ debug) ---- */
  useEffect(() => {
    console.error("[Error Boundary]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      {/* ไอคอนแจ้งเตือน */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-destructive/10">
        <AlertTriangle className="size-10 text-destructive" />
      </div>

      {/* ข้อความ */}
      <h1 className="text-2xl font-bold">เกิดข้อผิดพลาด</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        ระบบพบปัญหาที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
        หรือกลับไปที่หน้าแรกเพื่อเริ่มใหม่
      </p>

      {/* ปุ่มดำเนินการ */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          onClick={reset}
          className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
        >
          <RefreshCw className="size-4" />
          ลองใหม่
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="gap-2"
        >
          <Home className="size-4" />
          กลับหน้าแรก
        </Button>
      </div>

      {/* Error details (เฉพาะ dev mode) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 max-w-2xl text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            ดูรายละเอียด Error (เฉพาะ dev mode)
          </summary>
          <pre className="mt-3 overflow-auto rounded-lg bg-muted/40 p-4 text-xs">
            {error.message}
            {"\n\n"}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}