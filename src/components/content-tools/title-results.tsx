"use client";

/**
 * ================================================================
 * TitleResults — แสดง 5 Titles พร้อม score, reason, copy buttons
 * ----------------------------------------------------------------
 * Features:
 * - แสดง 5 Titles เรียงตาม score
 * - Progress bar สีตามระดับ score
 * - Click ที่ Title = copy ทันที
 * - ปุ่ม ⭐ เพื่อเพิ่ม Favorite
 * - ปุ่ม Copy All
 * - Animation: title เด้งเข้ามาทีละตัว
 * ================================================================
 */
import { motion } from "motion/react";
import { Copy, Check, Star, FileText } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import type { TitleItem } from "@/types/seo";

interface TitleResultsProps {
  titles: TitleItem[];
  currentKeyword: string;
  isLoading: boolean;
  favorites: TitleItem[];
  onToggleFavorite: (title: TitleItem) => void;
}

export function TitleResults({
  titles,
  currentKeyword,
  isLoading,
  favorites,
  onToggleFavorite,
}: TitleResultsProps) {
  const { copied, copy } = useClipboard();

  const isFavorite = (title: string) =>
    favorites.some((f) => f.title.toLowerCase() === title.toLowerCase());

  const handleCopyOne = async (title: string) => {
    const ok = await copy(title);
    if (ok) {
      toast.success(`คัดลอกแล้ว: ${title}`, {
        duration: 1500,
        icon: <Check className="size-4" />,
      });
    }
  };

  const handleCopyAll = async () => {
    const text = titles.map((t) => t.title).join("\n");
    const ok = await copy(text);
    if (ok) {
      toast.success(`คัดลอก ${titles.length} Titles แล้ว!`, {
        duration: 2000,
      });
    }
  };

  const scoreColor = (s: number) => {
    if (s >= 90) return "bg-gradient-to-r from-emerald-400 to-cyan-400";
    if (s >= 75) return "bg-gradient-to-r from-emerald-500 to-green-500";
    if (s >= 60) return "bg-gradient-to-r from-yellow-400 to-amber-500";
    return "bg-gradient-to-r from-slate-400 to-slate-500";
  };

  /* ---- Empty State ---- */
  if (!isLoading && titles.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
          <FileText className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">ยังไม่มี Title</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          พิมพ์คำหลักด้านบน แล้วกดปุ่ม "สร้าง Title" เพื่อให้ AI ช่วยคิด 5 Titles
          คุณภาพสูงสำหรับคุณ
        </p>
      </div>
    );
  }

  /* ---- Skeleton ขณะโหลด ---- */
  if (isLoading && titles.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border/40 bg-muted/30 p-4"
            >
              <div className="h-5 w-4/5 rounded bg-muted-foreground/20" />
              <div className="mt-3 h-3 w-3/5 rounded bg-muted-foreground/10" />
              <div className="mt-3 h-1.5 w-1/3 rounded bg-muted-foreground/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">
            5 Titles สำหรับ{" "}
            <span className="text-gradient">{currentKeyword}</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            เรียงตามคะแนน CTR (Click-Through Rate) จากสูงไปต่ำ
          </p>
        </div>

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
      </div>

      {/* Title Cards */}
      <div className="space-y-3">
        {titles.map((title, i) => (
          <motion.div
            key={`${title.title}-${i}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: i * 0.08,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -2 }}
            className="group relative"
          >
            <div
              onClick={() => handleCopyOne(title.title)}
              className="group/card relative cursor-pointer rounded-xl border border-border/60 bg-background/60 p-4 transition-all hover:border-primary/40 hover:bg-background/80 hover:shadow-lg hover:shadow-primary/5"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCopyOne(title.title);
                }
              }}
            >
              {/* แถบบน: Title + Favorite + Copy hint */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="h-6 w-6 shrink-0 justify-center px-1.5 text-xs font-bold"
                    >
                      {i + 1}
                    </Badge>
                    <h3 className="text-base font-semibold leading-snug">
                      {title.title}
                    </h3>
                  </div>

                  {title.reason && (
                    <p className="text-sm text-muted-foreground mb-3">
                      💡 {title.reason}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(title);
                    }}
                    className="rounded-md p-1.5 text-muted-foreground opacity-60 transition hover:bg-muted hover:opacity-100"
                    aria-label={
                      isFavorite(title.title)
                        ? "เอาออกจาก favorite"
                        : "เพิ่ม favorite"
                    }
                  >
                    <Star
                      className={`size-5 ${
                        isFavorite(title.title)
                          ? "fill-yellow-400 text-yellow-400"
                          : ""
                      }`}
                    />
                  </button>

                  <Copy className="size-5 text-muted-foreground opacity-0 transition group-hover/card:opacity-60" />
                </div>
              </div>

              {/* แถบล่าง: Progress bar + Score */}
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${title.score}%` }}
                    transition={{ delay: i * 0.08 + 0.3, duration: 0.6 }}
                    className={`h-full rounded-full ${scoreColor(title.score)}`}
                  />
                </div>
                <span className="text-sm font-mono font-semibold tabular-nums text-muted-foreground">
                  {title.score}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}