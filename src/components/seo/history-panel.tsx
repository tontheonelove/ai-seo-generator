"use client";

/**
 * ================================================================
 * HistoryPanel — ประวัติการค้นหา (50 รายการล่าสุด)
 * ----------------------------------------------------------------
 * Features:
 * - แสดงคำค้น + จำนวนคีย์เวิร์ดที่ได้ + เวลา
 * - Click = ค้นหาคำนั้นใหม่อีกครั้ง (ด้วย setting ปัจจุบัน)
 * - ปุ่ม Trash เพื่อลบทีละรายการ
 * - ปุ่ม Clear All เพื่อล้างทั้งหมด
 * - Empty State เมื่อไม่มีประวัติ
 * - ใช้ ScrollArea เพื่อให้ scroll ได้ลื่นแม้มีรายการเยอะ
 * ================================================================
 */
import { History, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { HistoryEntry } from "@/types/seo";

interface HistoryPanelProps {
  history: HistoryEntry[];
  onReselect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryPanel({
  history,
  onReselect,
  onDelete,
  onClearAll,
}: HistoryPanelProps) {
  /* ---- จัดรูปแบบเวลาให้เข้าใจง่าย ---- */
  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "เมื่อสักครู่";
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
    const days = Math.floor(hrs / 24);
    return `${days} วันที่แล้ว`;
  };

  return (
    <div className="glass-panel flex h-[420px] flex-col rounded-2xl p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <h3 className="font-semibold">ประวัติ ({history.length})</h3>
        </div>

        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
            onClick={onClearAll}
          >
            <Trash2 className="size-3" />
            ล้างทั้งหมด
          </Button>
        )}
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <RotateCcw className="size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            ยังไม่มีประวัติการค้นหา
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 -mx-1">
          <div className="space-y-1 px-1">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-center justify-between gap-2 rounded-lg border border-transparent p-2 transition hover:border-border/60 hover:bg-muted/40"
              >
                <button
                  type="button"
                  onClick={() => onReselect(entry)}
                  className="flex-1 overflow-hidden text-left"
                >
                  <p className="truncate text-sm font-medium">{entry.seed}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {entry.keywords.length} คำ · {formatTime(entry.createdAt)}
                  </p>
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                  onClick={() => onDelete(entry.id)}
                  aria-label="ลบ"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}