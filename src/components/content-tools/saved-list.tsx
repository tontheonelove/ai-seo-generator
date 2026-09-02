"use client";

/**
 * ================================================================
 * SavedList — แผงแสดงรายการ favorite ที่บันทึกไว้
 * ----------------------------------------------------------------
 * ใช้ร่วมกันได้ทั้ง Title และ Description
 * Features: คัดลอก / ลบรายตัว / ล้างทั้งหมด
 * ================================================================
 */
import { Copy, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";

interface SavedListProps {
  title: string;
  items: { id: string; text: string; meta?: string }[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  /** true = แสดงหลายบรรทัด (สำหรับ description แบบยาว) */
  multiline?: boolean;
}

export function SavedList({
  title,
  items,
  onRemove,
  onClearAll,
  multiline = false,
}: SavedListProps) {
  const { copy } = useClipboard();

  if (items.length === 0) return null;

  const handleCopy = async (text: string) => {
    const ok = await copy(text);
    if (ok) toast.success("คัดลอกแล้ว!");
  };

  return (
    <div className="glass-panel rounded-2xl p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          {title} ({items.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
          onClick={onClearAll}
        >
          <Trash2 className="size-3" />
          ล้างทั้งหมด
        </Button>
      </div>

      {/* รายการ */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2 rounded-lg border border-border/50 bg-background/50 p-3"
          >
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm ${
                  multiline ? "whitespace-pre-line line-clamp-3" : "truncate"
                }`}
              >
                {item.text}
              </p>
              {item.meta && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p>
              )}
            </div>

            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => handleCopy(item.text)}
                aria-label="คัดลอก"
              >
                <Copy className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:text-destructive"
                onClick={() => onRemove(item.id)}
                aria-label="ลบ"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}