"use client";

/**
 * ================================================================
 * Sidebar — แถบเมนูด้านซ้าย (รองรับ Desktop + Mobile)
 * ----------------------------------------------------------------
 * 3 เมนูหลัก:
 * 1. Keyword Generator (คีย์เวิร์ด)
 * 2. Title Generator (หัวข้อ)
 * 3. Description Generator (คำอธิบาย)
 *
 * 📱 Responsive:
 * - Desktop: แสดงด้านซ้าย
 * - Mobile: แปลงเป็น Bottom Navigation
 * ================================================================
 */
import { usePathname } from "next/navigation";
import { LayoutGrid, Search, Type, FileText } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

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
      {/* 顶部: โลโก้ + ชื่อแอป */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
            <LayoutGrid className="size-4 text-white" />
          </div>
          <span className="text-sm font-medium">ACT</span>
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

      {/* 底部: Settings + Theme Toggle */}
      <div className="border-t border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Settings</div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}