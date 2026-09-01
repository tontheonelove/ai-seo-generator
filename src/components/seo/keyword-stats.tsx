"use client";

/**
 * ================================================================
 * KeywordStats — แถบสถิติการใช้งาน 3 ช่อง
 * ----------------------------------------------------------------
 * แสดง 3 ตัวเลข:
 * 1. จำนวนครั้งของการค้นหา (Searches)
 * 2. จำนวนคีย์เวิร์ดที่ AI สร้างให้ทั้งหมด (Keywords)
 * 3. จำนวนครั้งที่ผู้ใช้คัดลอก (Copied)
 *
 * 🎨 ใช้ Glass panel + ไอคอนไล่สี + Animation เด้งตอนอัปเดตตัวเลข
 * ================================================================
 */
import { motion } from "motion/react";
import { Search, Sparkles, Copy } from "lucide-react";
import type { AppStats } from "@/types/seo";

interface KeywordStatsProps {
  stats: AppStats;
}

export function KeywordStats({ stats }: KeywordStatsProps) {
  const items = [
    {
      label: "ค้นหาทั้งหมด",
      value: stats.searches,
      icon: Search,
      gradient: "from-emerald-500 to-teal-500",
      bg: "from-emerald-500/10 to-teal-500/10",
    },
    {
      label: "คีย์เวิร์ดที่สร้าง",
      value: stats.keywordsGenerated,
      icon: Sparkles,
      gradient: "from-cyan-500 to-blue-500",
      bg: "from-cyan-500/10 to-blue-500/10",
    },
    {
      label: "คัดลอกแล้ว",
      value: stats.copied,
      icon: Copy,
      gradient: "from-violet-500 to-purple-500",
      bg: "from-violet-500/10 to-purple-500/10",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`glass-panel relative overflow-hidden rounded-2xl p-4`}
        >
          {/* พื้นไล่สีจาง ๆ */}
          <div
            className={`absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br ${item.bg} blur-2xl`}
          />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              {/* Animation ตอนตัวเลขเปลี่ยน */}
              <motion.p
                key={item.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-3xl font-extrabold tabular-nums"
              >
                {item.value.toLocaleString()}
              </motion.p>
            </div>

            <div
              className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient} shadow-md`}
            >
              <item.icon className="size-4 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}