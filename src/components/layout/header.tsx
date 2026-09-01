/**
 * ================================================================
 * Header — แถบด้านบนของทุกหน้า
 * ----------------------------------------------------------------
 * - โลโก้สายฟ้า + ชื่อแอป "SEO EZ" (ตัว EZ ไล่เฉด)
 * - แถบนี้เหนียว (sticky) ติดด้านบนเสมอ + เบลอด้านหลัง
 * ================================================================
 */
import { Zap } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        {/* โลโก้ + ชื่อแอป */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
            <Zap className="size-5 text-white" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-extrabold tracking-tight">
              SEO <span className="text-gradient">EZ</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              AI Keyword Research Dashboard
            </p>
          </div>
        </div>

        {/* ปุ่มสลับโหมดมืด/สว่าง */}
        <ThemeToggle />
      </div>
    </header>
  );
}