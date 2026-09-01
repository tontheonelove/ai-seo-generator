"use client";

/**
 * ================================================================
 * KeywordChips — แผงแสดงผลคีย์เวิร์ด (พระเอกของแอป!)
 * ----------------------------------------------------------------
 * Features:
 * - แสดงคีย์เวิร์ดแต่ละตัวเป็น "Chip" พร้อม score (0-100)
 * - Progress bar สีเขียว-ทอง แสดงความแรงของ score
 * - Click ที่ Chip = คัดลอกทันที + Toast แจ้งเตือน
 * - ปุ่ม ⭐ ด้านขวาเพื่อบันทึกเป็น Favorite
 * - Copy All Button คัดลอกทั้งหมดในคลิกเดียว
 * - Export Dropdown: TXT / CSV / JSON
 * - Animation: chip เด้งเข้ามาทีละตัวตอนโหลดเสร็จ
 * - Empty State สวย ๆ ตอนที่ไม่มีผลค้นหา
 * ================================================================
 */
import { motion } from "motion/react";
import {
  Copy,
  Check,
  Star,
  Download,
  FileText,
  Table,
  FileJson2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClipboard } from "@/hooks/use-clipboard";
import type { KeywordItem } from "@/types/seo";

interface KeywordChipsProps {
  keywords: KeywordItem[];
  currentSeed: string;
  isLoading: boolean;
  favorites: KeywordItem[];
  onToggleFavorite: (keyword: KeywordItem) => void;
  onCopied: () => void;
}

export function KeywordChips({
  keywords,
  currentSeed,
  isLoading,
  favorites,
  onToggleFavorite,
  onCopied,
}: KeywordChipsProps) {
  const { copied, copy } = useClipboard();

  /* ---- ตรวจสอบว่าคีย์เวิร์ดนี้เป็น favorite หรือไม่ ---- */
  const isFavorite = (kw: string) =>
    favorites.some((f) => f.keyword.toLowerCase() === kw.toLowerCase());

  /* ---- Copy keyword เดียว ---- */
  const handleCopyOne = async (kw: string) => {
    const ok = await copy(kw);
    if (ok) {
      toast.success(`คัดลอกแล้ว: ${kw}`, {
        duration: 1500,
        icon: <Check className="size-4" />,
      });
      onCopied();
    } else {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  };

  /* ---- Copy All ---- */
  const handleCopyAll = async () => {
    const text = keywords.map((k) => k.keyword).join("\n");
    const ok = await copy(text);
    if (ok) {
      toast.success(`คัดลอก ${keywords.length} คีย์เวิร์ดแล้ว!`, {
        duration: 2000,
      });
      onCopied();
    }
  };

  /* ---- Export ไฟล์ ---- */
  const download = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`ดาวน์โหลด ${filename} แล้ว`);
  };

  const exportAs = (format: "txt" | "csv" | "json") => {
    const stamp = new Date().toISOString().slice(0, 10);
    const baseName = `${currentSeed.replace(/\s+/g, "_")}_${stamp}`;

    if (format === "txt") {
      download(
        `${baseName}.txt`,
        keywords.map((k) => k.keyword).join("\n"),
        "text/plain"
      );
    } else if (format === "csv") {
      /* 🛡️ กัน Excel อ่านไทยเพี้ยน:
         1. เติม BOM "\uFEFF" ที่ต้นไฟล์ = ป้ายบอก Excel ว่า "นี่คือ UTF-8"
         2. ใช้ \r\n ขึ้นบรรทัดใหม่ = มาตรฐาน CSV ที่ Excel บน Windows ชอบที่สุด */
      const header = "keyword,score\r\n";
      const rows = keywords
        .map((k) => `"${k.keyword.replace(/"/g, '""')}",${k.score}`)
        .join("\r\n");
      download(
        `${baseName}.csv`,
        "\uFEFF" + header + rows,
        "text/csv;charset=utf-8"
      );
    } else {
      download(
        `${baseName}.json`,
        JSON.stringify({ seed: currentSeed, keywords }, null, 2),
        "application/json"
      );
    }
  };

  /* ---- สีของ progress bar ตามระดับ score ---- */
  const scoreColor = (s: number) => {
    if (s >= 90) return "bg-gradient-to-r from-emerald-400 to-cyan-400";
    if (s >= 75) return "bg-gradient-to-r from-emerald-500 to-green-500";
    if (s >= 60) return "bg-gradient-to-r from-yellow-400 to-amber-500";
    return "bg-gradient-to-r from-slate-400 to-slate-500";
  };

  /* ---- Empty State ---- */
  if (!isLoading && keywords.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
          <FileText className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">ยังไม่มีผลลัพธ์</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          พิมพ์คำค้นด้านบน แล้วกด <kbd className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Enter</kbd> หรือคลิกปุ่มค้นหา เพื่อเริ่มสร้างคีย์เวิร์ดด้วย AI
        </p>
      </div>
    );
  }

  /* ---- Skeleton ขณะโหลด ---- */
  if (isLoading && keywords.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border/40 bg-muted/30 p-4"
            >
              <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
              <div className="mt-3 h-1.5 w-1/2 rounded bg-muted-foreground/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6">
      {/* Header: จำนวนผล + ปุ่ม Copy All / Export */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">
            คีย์เวิร์ดสำหรับ{" "}
            <span className="text-gradient">{currentSeed}</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            พบ <b>{keywords.length}</b> คีย์เวิร์ด · เรียงตามคะแนนศักยภาพ
          </p>
        </div>

        <div className="flex gap-2">
          {/* Copy All */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleCopyAll}
          >
            {copied ? (
              <Check className="size-4 text-primary" />
            ) : (
              <Copy className="size-4" />
            )}
            Copy All
          </Button>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <Download className="size-4" />
              Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportAs("txt")}>
                <FileText className="mr-2 size-4" />
                ดาวน์โหลด TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs("csv")}>
                <Table className="mr-2 size-4" />
                ดาวน์โหลด CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs("json")}>
                <FileJson2 className="mr-2 size-4" />
                ดาวน์โหลด JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid ของ Chips (เพิ่ม stagger effect) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {keywords.map((kw, i) => (
          <motion.div
            key={`${kw.keyword}-${i}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: i * 0.04,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1], // cubic-bezier ที่นุ่มนวล
            }}
            whileHover={{ y: -4 }} // ยกขึ้นตอน hover
            whileTap={{ scale: 0.98 }} // กดลงตอนคลิก
            className="group relative"
          >
            <div
              onClick={() => handleCopyOne(kw.keyword)}
              className="group/card relative cursor-pointer rounded-xl border border-border/60 bg-background/60 p-3 transition-all hover:border-primary/40 hover:bg-background/80 hover:shadow-lg hover:shadow-primary/5"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCopyOne(kw.keyword);
                }
              }}
            >
              {/* แถบบน: Keyword + Favorite + Copy hint */}
              <div className="flex items-start justify-between gap-2">
                <Badge
                  variant="secondary"
                  className="mb-2 h-5 w-5 shrink-0 justify-center px-1.5 text-[10px] font-bold"
                >
                  {i + 1}
                </Badge>

                <p className="flex-1 break-words text-sm font-medium leading-snug">
                  {kw.keyword}
                </p>

                <div className="flex shrink-0 items-center gap-0.5">
                  {/* Favorite button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(kw);
                    }}
                    className="rounded-md p-1 text-muted-foreground opacity-60 transition hover:bg-muted hover:opacity-100"
                    aria-label={
                      isFavorite(kw.keyword) ? "เอาออกจาก favorite" : "เพิ่ม favorite"
                    }
                  >
                    <Star
                      className={`size-4 ${
                        isFavorite(kw.keyword)
                          ? "fill-yellow-400 text-yellow-400"
                          : ""
                      }`}
                    />
                  </button>

                  {/* Copy hint (แสดงตอน hover) */}
                  <Copy className="size-4 text-muted-foreground opacity-0 transition group-hover/card:opacity-60" />
                </div>
              </div>

              {/* แถบล่าง: Progress bar + Score */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${kw.score}%` }}
                    transition={{ delay: i * 0.03 + 0.2, duration: 0.6 }}
                    className={`h-full rounded-full ${scoreColor(kw.score)}`}
                  />
                </div>
                <span className="text-xs font-mono font-semibold tabular-nums text-muted-foreground">
                  {kw.score}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}