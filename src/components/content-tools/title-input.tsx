"use client";

/**
 * ================================================================
 * TitleInput — ช่องใส่ keyword สำหรับ Title Generator
 * ----------------------------------------------------------------
 * Features:
 * - Input field + ปุ่ม Generate
 * - Keyboard shortcut: Enter = generate
 * - Loading state + Cancel button
 * - Clear button เมื่อมีข้อความ
 * ================================================================
 */
import { Loader2, Search, X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  language: "auto" | "en" | "th";
  onLanguageChange: (lang: "auto" | "en" | "th") => void;
}

export function TitleInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
  language,
  onLanguageChange,
}: TitleInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length === 0) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Main input */}
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="พิมพ์คำหลัก เช่น 'best bitcoin wallet', 'อาหารญี่ปุ่น'..."
          className="h-14 rounded-2xl border-border/60 bg-background/60 pl-12 pr-36 text-base backdrop-blur-md transition-shadow placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:shadow-lg focus-visible:shadow-primary/10"
          disabled={isLoading}
          aria-label="คำหลักสำหรับสร้าง Title"
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
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

          <Button
            type={isLoading ? "button" : "submit"}
            size="sm"
            className="h-10 min-w-24 gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
            disabled={!value.trim() && !isLoading}
            onClick={isLoading ? onCancel : undefined}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                กำลังสร้าง...
              </>
            ) : (
              <>
                <Wand2 className="size-4" />
                สร้าง Title
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Language selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">ภาษา:</span>
        <Select
          value={language}
          onValueChange={(v) => onLanguageChange(v as "auto" | "en" | "th")}
          disabled={isLoading}
        >
          <SelectTrigger className="h-9 w-48 text-left text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto" className="text-xs">
              อัตโนมัติ (ตามคำที่พิมพ์)
            </SelectItem>
            <SelectItem value="en" className="text-xs">
              อังกฤษ
            </SelectItem>
            <SelectItem value="th" className="text-xs">
              ไทย
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );
}