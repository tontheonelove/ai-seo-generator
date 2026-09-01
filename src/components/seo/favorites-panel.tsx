"use client";

/**
 * ================================================================
 * FavoritesPanel — คีย์เวิร์ดที่ถูกใจ (กด ⭐)
 * ----------------------------------------------------------------
 * Features:
 * - แสดงคีย์เวิร์ดที่ถูกบันทึก + ชื่อคำค้นที่มา
 * - Click = คัดลอกคีย์เวิร์ดนั้นทันที
 * - ปุ่มลบออกจาก favorites
 * - Copy All favorites ในคลิกเดียว
 * - Empty State เมื่อไม่มี favorite
 * ================================================================
 */
import { Star, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClipboard } from "@/hooks/use-clipboard";
import type { FavoriteItem } from "@/types/seo";

interface FavoritesPanelProps {
  favorites: FavoriteItem[];
  onRemove: (keyword: string) => void;
  onClearAll: () => void;
  onCopied: () => void;
}

export function FavoritesPanel({
  favorites,
  onRemove,
  onClearAll,
  onCopied,
}: FavoritesPanelProps) {
  const { copy } = useClipboard();

  const handleCopyOne = async (kw: string) => {
    const ok = await copy(kw);
    if (ok) {
      toast.success(`คัดลอกแล้ว: ${kw}`, { duration: 1500 });
      onCopied();
    }
  };

  const handleCopyAll = async () => {
    if (favorites.length === 0) return;
    const ok = await copy(favorites.map((f) => f.keyword).join("\n"));
    if (ok) {
      toast.success(`คัดลอก favorite ${favorites.length} คำแล้ว!`);
      onCopied();
    }
  };

  return (
    <div className="glass-panel flex h-[420px] flex-col rounded-2xl p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <h3 className="font-semibold">Favorite ({favorites.length})</h3>
        </div>

        <div className="flex gap-1">
          {favorites.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handleCopyAll}
              >
                <Copy className="size-3" />
                Copy All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                onClick={onClearAll}
              >
                <Trash2 className="size-3" />
                ล้าง
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Star className="size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            ยังไม่มี favorite
          </p>
          <p className="text-xs text-muted-foreground/80">
            กด ⭐ ที่คีย์เวิร์ดเพื่อบันทึก
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 -mx-1">
          <div className="space-y-1 px-1">
            {favorites.map((fav, i) => (
              <div
                key={`${fav.keyword}-${i}`}
                className="group flex items-center justify-between gap-2 rounded-lg border border-transparent p-2 transition hover:border-yellow-400/30 hover:bg-yellow-400/5"
              >
                <button
                  type="button"
                  onClick={() => handleCopyOne(fav.keyword)}
                  className="flex-1 overflow-hidden text-left"
                >
                  <p className="truncate text-sm font-medium">{fav.keyword}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    จาก: {fav.seed}
                  </p>
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                  onClick={() => onRemove(fav.keyword)}
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