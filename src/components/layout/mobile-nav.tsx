"use client";

/**
 * ================================================================
 * MobileNav — แถบนำทางด้านล่างสำหรับมือถือ (Bottom Navigation)
 * ----------------------------------------------------------------
 * - แสดงเฉพาะหน้าจอ < lg (มือถือ/แท็บเล็ต)
 * - 3 เมนู: Keyword / Title / Description
 * - Sticky ด้านล่าง + blur พื้นหลัง
 * ================================================================
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Type, FileText } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const basePath = pathname.split("/")[1] || "";

  const items = [
    { path: "/", label: "Keyword", icon: Search, active: basePath === "" },
    { path: "/titles", label: "Title", icon: Type, active: basePath === "titles" },
    { path: "/descriptions", label: "Desc", icon: FileText, active: basePath === "descriptions" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/80 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              item.active ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={item.label}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}