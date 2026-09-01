"use client";

/**
 * ================================================================
 * ThemeToggle — ปุ่มสลับโหมดมืด/สว่าง ที่ Header
 * ----------------------------------------------------------------
 * ⚠️ กัน BUG: ใช้ตัวแปร `mounted` เพื่อกัน Hydration Mismatch
 * เพราะฝั่ง Server ไม่รู้ว่าผู้ใช้ตอนนี้อยู่โหมดไหน
 * (จะเรนเดอร์ปุ่มว่าง ๆ ไว้ก่อนจนกว่าเบราว์เซอร์จะพร้อม)
 * ================================================================
 */
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // เมื่อเบราว์เซอร์โหลดเสร็จแล้ว ค่อยแสดงปุ่มจริง
  useEffect(() => {
    setMounted(true);
  }, []);

  // ระหว่างรอ → แสดงปุ่มโปร่งใสขนาดเท่ากัน (กันหน้าตากระตุก)
  if (!mounted) {
    return <Button variant="ghost" size="icon" aria-label="กำลังโหลดธีม" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="สลับโหมดมืด/สว่าง"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}