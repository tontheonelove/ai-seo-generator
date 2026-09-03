"use client";

/**
 * ================================================================
 * Sidebar — แถบเมนูด้านซ้าย (เฉพาะ Desktop)
 * ----------------------------------------------------------------
 * 3 เมนูหลัก:
 * 1. Keyword Generator (คีย์เวิร์ด)
 * 2. Title Generator (หัวข้อ)
 * 3. Description Generator (คำอธิบาย)
 *
 * 📌 โลโก้ด้านบนใช้สไตล์เดียวกับ Header (สายฟ้า + ACT)
 * ================================================================
 */
import { usePathname } from "next/navigation";
import { Zap, Search, Type, FileText } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  const pathname = usePathname();

  /* ดึง URL หลัก (ลบ / หรือ /titles ออก) */
  const basePath = pathname.split("/")[1] || "";

  const menuItems = [
    {
      path: "/",
      label: "Keyword",
      icon: Search,
      active: basePath === "",
    },
    {
      path: "/titles",
      label: "Title",
      icon: Type,
      active: basePath === "titles",
    },
    {
      path: "/descriptions",
      label: "Description",
      icon: FileText,
      active: basePath === "descriptions",
    },
  ];

  return (
    <div className="flex h-screen flex-col border-r border-border/50 bg-background">
      {/* บนสุด: โลโก้ + ชื่อแอป (สไตล์เดียวกับ Header) */}
      <div className="border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
            <Zap className="size-5 text-white" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-extrabold tracking-tight">ACT</p>
            <p className="text-[11px] text-muted-foreground">
              Ai Content Tools
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav>
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}