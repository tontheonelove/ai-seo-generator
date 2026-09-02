"use client";

/**
 * ================================================================
 * DescriptionInput — Textarea สำหรับใส่ Title หรือเนื้อหา
 * ----------------------------------------------------------------
 * Features:
 * - Textarea (ใหญ่กว่า input เพราะรับเนื้อหาได้)
 * - Language selector
 * - Generate + Cancel + Clear buttons
 * - Placeholder แนะนำการกรอกข้อมูล
 * ================================================================
 */
import { Loader2, X, Wand2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  language: "auto" | "en" | "th";
  onLanguageChange: (lang: "auto" | "en" | "th") => void;
}

export function DescriptionInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
  language,
  onLanguageChange,
}: DescriptionInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length === 0) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Label + Counter */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4" />
          ใส่ Title หรือเนื้อหาที่ต้องการ
        </label>
        <span className="text-xs text-muted-foreground">
          {value.length} ตัวอักษร
        </span>
      </div>

      {/* Textarea */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="เช่น 'คู่มือการเลือก Bitcoin Wallet ที่ดีที่สุดสำหรับปี 2026' หรือ 'รีวิวร้านอาหารญี่ปุ่นย่านทองหล่อที่ควรลอง'..."
        rows={4}
        className="resize-none rounded-xl border-border/60 bg-background/60 text-sm backdrop-blur-md placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/40"
        disabled={isLoading}
        aria-label="เนื้อหาสำหรับสร้าง Description"
      />

      {/* Controls: Language + Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Language selector */}
        <div className="flex items-center gap-2">
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
                อัตโนมัติ (ตามเนื้อหา)
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

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {value && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => onChange("")}
            >
              <X className="size-4" />
              ล้าง
            </Button>
          )}

          {isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-destructive"
              onClick={onCancel}
            >
              <X className="size-4" />
              ยกเลิก
            </Button>
          )}

          <Button
            type={isLoading ? "button" : "submit"}
            size="sm"
            className="h-9 min-w-32 gap-1.5 bg-gradient-to-r from-violet-500 to-purple-500 font-semibold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
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
                สร้าง Description
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}