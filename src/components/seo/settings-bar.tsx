"use client";

/**
 * ================================================================
 * SettingsBar — แถบตั้งค่าการค้นหาด้านบน
 * ----------------------------------------------------------------
 * Dropdowns 4 ตัว:
 * 1. Model     → เลือกโมเดล AI (ฟรีหลายตัว)
 * 2. Count     → จำนวนคีย์เวิร์ดต่อครั้ง (10/20/30/50)
 * 3. Language  → ภาษาของผลลัพธ์ (Auto/EN/TH)
 * 4. Mode      → แนวการค้นหา (ทั่วไป/Long-tail/คำถาม/เชิงพาณิชย์)
 *
 * 🎨 ออกแบบให้ responsive:
 * - Mobile: 2 คอลัมน์
 * - Tablet/Desktop: 4 คอลัมน์
 * ================================================================
 */
import { Layers, Globe, Compass, Hash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  COUNT_OPTIONS,
  FREE_MODELS,
  LANGUAGE_OPTIONS,
  MODE_OPTIONS,
} from "@/lib/config";
import type {
  KeywordLanguage,
  SearchMode,
  SearchSettings,
} from "@/types/seo";

interface SettingsBarProps {
  settings: SearchSettings;
  onChange: (settings: SearchSettings) => void;
  disabled?: boolean;
}

export function SettingsBar({
  settings,
  onChange,
  disabled,
}: SettingsBarProps) {
  const update = <K extends keyof SearchSettings>(
    key: K,
    value: SearchSettings[K]
  ) => onChange({ ...settings, [key]: value });

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* 1️⃣ Model */}
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="size-3.5" />
            Model
          </Label>
          <Select
            value={settings.model}
            onValueChange={(v) => {
              if (v) update("model", v);
            }}
            disabled={disabled}
          >
            <SelectTrigger className="h-9 text-left text-xs">
              <SelectValue placeholder="เลือกโมเดล" />
            </SelectTrigger>
            <SelectContent>
              {FREE_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2️⃣ Count */}
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="size-3.5" />
            จำนวน
          </Label>
          <Select
            value={String(settings.count)}
            onValueChange={(v) => update("count", Number(v))}
            disabled={disabled}
          >
            <SelectTrigger className="h-9 text-left text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNT_OPTIONS.map((c) => (
                <SelectItem key={c} value={String(c)} className="text-xs">
                  {c} คำ
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3️⃣ Language */}
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="size-3.5" />
            ภาษา
          </Label>
          <Select
            value={settings.language}
            onValueChange={(v) => update("language", v as KeywordLanguage)}
            disabled={disabled}
          >
            <SelectTrigger className="h-9 text-left text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((l) => (
                <SelectItem key={l.value} value={l.value} className="text-xs">
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4️⃣ Mode */}
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Compass className="size-3.5" />
            โหมดค้นหา
          </Label>
          <Select
            value={settings.mode}
            onValueChange={(v) => update("mode", v as SearchMode)}
            disabled={disabled}
          >
            <SelectTrigger className="h-9 text-left text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODE_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-xs">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}