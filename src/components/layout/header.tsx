/**
 * ================================================================
 * Header — แถบด้านบนของทุกหน้า (เวอร์ชันย่อสำหรับใช้กับ Sidebar)
 * ----------------------------------------------------------------
 * - โลโก้ ACT + ไอคอน Sparkles
 * - แถบนี้เหนียว (sticky) ติดด้านบนเสมอ + เบลอด้านหลัง
 * ================================================================
 */
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        {/* โลโก้ + ชื่อแอป (ย่อ) */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md shadow-emerald-500/30">
            <Sparkles className="size-4 text-white" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-extrabold tracking-tight">
              <span className="text-gradient">ACT</span>
            </p>
            <p className="text-[10px] text-muted-foreground">
              Ai Content Tools
            </p>
          </div>
        </div>

        {/* ปุ่มสลับโหมดมืด/สว่าง */}
        <ThemeToggle />
      </div>
    </header>
  );
}