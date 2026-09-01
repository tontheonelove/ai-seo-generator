"use client";

/**
 * ================================================================
 * KeywordSearch — ช่องค้นหาหลักของหน้า Dashboard
 * ----------------------------------------------------------------
 * Features:
 * - ช่อง Input พร้อมไอคอน Search ด้านซ้าย
 * - ปุ่ม "ค้นหา" ด้านขวา (หรือกด Enter)
 * - ปุ่ม "กำลังโหลด..." พร้อม Spinner + ปุ่มยกเลิก (Cancel)
 * - ปุ่มล้าง (X) ตอนมีข้อความในช่อง
 * - Keyboard Shortcut: กด `/` ที่ไหนก็ได้ในหน้าเพื่อ Focus ช่องนี้
 *
 * 🛡️ กัน BUG:
 * - ป้องกันการ submit ค่าว่าง (trim แล้วต้องยาว > 0)
 * - useEffect clean up event listener ตอน unmount
 * ================================================================
 */
import { useEffect, useRef } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface KeywordSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function KeywordSearch({
  value,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
}: KeywordSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---- Keyboard Shortcut: กด `/` เพื่อ Focus ช่องค้นหา ---- */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      /* ไม่ trigger ถ้าผู้ใช้กำลังพิมพ์ในช่องอื่น */
      if (isTyping) return;

      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ---- Submit handler ---- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length === 0) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      {/* 🔍 ไอคอน Search ด้านซ้าย */}
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

      {/* ช่องพิมพ์ พร้อม padding ด้านซ้าย-ขวาเผื่อไอคอน */}
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="พิมพ์คำค้น เช่น bitcoin, digital marketing, อาหารญี่ปุ่น..."
        className="h-14 rounded-2xl border-border/60 bg-background/60 pl-12 pr-36 text-base backdrop-blur-md transition-shadow placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:shadow-lg focus-visible:shadow-primary/10"
        disabled={isLoading}
        aria-label="คำค้นหาคีย์เวิร์ด"
      />

      {/* 🏷️ Hint สำหรับ Keyboard Shortcut (ซ่อนตอนกำลังพิมพ์) */}
      {!value && !isLoading && (
        <kbd className="pointer-events-none absolute right-36 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-[11px] font-mono text-muted-foreground md:flex">
          <span>/</span>
        </kbd>
      )}

      {/* 🎯 ปุ่มฝั่งขวา: ล้าง / ยกเลิก / ค้นหา */}
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
        {/* ปุ่มล้าง (แสดงตอนมีข้อความ) */}
        {value && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onChange("")}
            aria-label="ล้างช่องค้นหา"
          >
            <X className="size-4" />
          </Button>
        )}

        {/* ปุ่มยกเลิก (แสดงตอนโหลด) */}
        {isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 gap-1.5 text-destructive"
            onClick={onCancel}
          >
            <X className="size-4" />
            ยกเลิก
          </Button>
        )}

        {/* ปุ่มค้นหา */}
        <Button
          type={isLoading ? "button" : "submit"}
          size="sm"
          className="h-10 min-w-24 gap-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
          disabled={!value.trim() && !isLoading}
          onClick={isLoading ? onCancel : undefined}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              กำลังค้น...
            </>
          ) : (
            <>
              <Search className="size-4" />
              ค้นหา
            </>
          )}
        </Button>
      </div>
    </form>
  );
}