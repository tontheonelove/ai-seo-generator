"use client";

/**
 * ================================================================
 * DescriptionResults — แสดง Description แบบยาว (YouTube/Facebook)
 * ----------------------------------------------------------------
 * 📌 เวอร์ชันนี้ "แสดงตามจริง ไม่ตัดสิน ไม่ตัดข้อความ":
 * - แสดงเนื้อหาครบทุกตัวอักษร (whitespace-pre-line)
 * - แสดงจำนวนตัวอักษร + จำนวนบรรทัด เป็น "ข้อมูลอ้างอิง" เท่านั้น
 * - ไม่มีกล่องแดง/เขียวตัดสินสั้น-ยาว อีกต่อไป
 * ================================================================
 */
import { motion } from "motion/react";
import { Copy, Star, FileText, Ruler, List } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import type { DescriptionItem } from "@/types/seo";

interface DescriptionResultsProps {
  description: DescriptionItem | null;
  currentInput: string;
  isLoading: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function DescriptionResults({
  description,
  currentInput,
  isLoading,
  isFavorite,
  onToggleFavorite,
}: DescriptionResultsProps) {
  const { copy } = useClipboard();

  const handleCopy = async () => {
    if (!description) return;
    const ok = await copy(description.description);
    if (ok) {
      toast.success("คัดลอก Description แล้ว!");
    }
  };

  /* ---- Empty State ---- */
  if (!isLoading && !description) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
          <FileText className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">ยังไม่มี Description</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          ใส่หัวข้อหรือเนื้อหาของคุณ แล้วกดปุ่ม "สร้าง Description"
          เพื่อให้ AI เขียน Description แบบยาวครบชุด — Hook, Bullets, CTA และ
          Hashtags — พร้อมคัดลอกไปใช้กับ YouTube / Facebook ได้ทันที
        </p>
      </div>
    );
  }

  /* ---- Skeleton ขณะโหลด ---- */
  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-2/3 rounded bg-muted/30" />
          <div className="h-24 w-full rounded-xl bg-muted/30" />
          <div className="space-y-2">
            <div className="h-4 w-1/2 rounded bg-muted/30" />
            <div className="h-4 w-3/5 rounded bg-muted/30" />
            <div className="h-4 w-2/5 rounded bg-muted/30" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-muted/30" />
            <div className="h-6 w-24 rounded-full bg-muted/30" />
          </div>
        </div>
      </div>
    );
  }

  if (!description) return null;

  /* นับจำนวนบรรทัด (เพื่อแสดงเป็นข้อมูลอ้างอิง) */
  const lineCount = description.description.split("\n").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel rounded-2xl p-6"
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold">
          Description สำหรับ{" "}
          <span className="text-gradient">
            {currentInput.slice(0, 40)}
            {currentInput.length > 40 ? "..." : ""}
          </span>
        </h2>
      </div>

      {/* Description Card (แสดงครบทุกตัวอักษร แบบหลายบรรทัด) */}
      <div className="mb-4 rounded-xl border border-border/60 bg-background/60 p-5">
        <p className="whitespace-pre-line text-base leading-relaxed">
          {description.description}
        </p>
      </div>

      {/* ข้อมูลอ้างอิง: จำนวนตัวอักษร + จำนวนบรรทัด (ไม่ตัดสิน) */}
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Ruler className="size-4" />
          {description.charCount.toLocaleString()} ตัวอักษร
        </span>
        <span className="flex items-center gap-1.5">
          <List className="size-4" />
          {lineCount} บรรทัด
        </span>
      </div>

      {/* Highlights */}
      {description.highlights.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            จุดเด่น
          </p>
          <div className="flex flex-wrap gap-2">
            {description.highlights.map((highlight, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="gap-1 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 dark:text-violet-300"
              >
                ✓ {highlight}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={handleCopy}
        >
          <Copy className="size-4" />
          คัดลอก Description
        </Button>

        <Button
          variant={isFavorite ? "default" : "outline"}
          size="sm"
          className={`gap-1.5 ${
            isFavorite ? "bg-yellow-500 text-black hover:bg-yellow-400" : ""
          }`}
          onClick={onToggleFavorite}
        >
          <Star className={`size-4 ${isFavorite ? "fill-black" : ""}`} />
          {isFavorite ? "บันทึกแล้ว" : "บันทึก Favorite"}
        </Button>
      </div>
    </motion.div>
  );
}