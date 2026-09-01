"use client";

/**
 * ================================================================
 * Home — หน้า Dashboard หลักของ SEO EZ
 * ----------------------------------------------------------------
 * โครงสร้างหน้า (บน → ล่าง, ซ้าย → ขวา):
 * 1. Hero: พาดหัว + คำอธิบาย
 * 2. KeywordStats: สถิติการใช้งาน 3 ช่อง
 * 3. KeywordSearch: ช่องค้นหาหลัก
 * 4. SettingsBar: แถบตั้งค่า (Model/Count/Language/Mode)
 * 5. Grid หลัก:
 *    - ซ้าย (กว้าง): KeywordChips แสดงผลคีย์เวิร์ด
 *    - ขวา (แคบ): HistoryPanel + FavoritesPanel
 *
 * 🧠 State ทั้งหมด:
 * - input: คำที่ผู้ใช้กำลังพิมพ์
 * - settings: การตั้งค่า (ซิงค์ localStorage)
 * - favorites: คีย์เวิร์ดที่ถูกใจ (ซิงค์ localStorage)
 * - ส่วนที่เหลือจัดการโดย useKeywordSearch hook
 *
 * 🚀 Performance:
 * - ใช้ dynamic import สำหรับ KeywordChips เพื่อลด bundle size ตอนแรกโหลด
 * ================================================================
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { KeywordSearch } from "@/components/seo/keyword-search";
import { SettingsBar } from "@/components/seo/settings-bar";
import { HistoryPanel } from "@/components/seo/history-panel";
import { FavoritesPanel } from "@/components/seo/favorites-panel";
import { KeywordStats } from "@/components/seo/keyword-stats";
import { ScrollToTop } from "@/components/seo/scroll-to-top";
import { useKeywordSearch } from "@/hooks/use-keyword-search";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DEFAULT_SETTINGS } from "@/lib/config";
import type {
  FavoriteItem,
  KeywordItem,
  SearchSettings,
} from "@/types/seo";

/**
 * 🚀 Dynamic import สำหรับ KeywordChips
 * เหตุผล: component นี้ค่อนข้างหนัก (ใช้ motion, export menu)
 * การโหลดแบบ lazy จะช่วยให้หน้าโหลดเร็วขึ้น + แสดง skeleton ระหว่างรอ
 */
const KeywordChips = dynamic(
  () =>
    import("@/components/seo/keyword-chips").then((mod) => mod.KeywordChips),
  {
    loading: () => (
      <div className="glass-panel animate-pulse rounded-2xl p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/40 bg-muted/30 p-4"
            >
              <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
              <div className="mt-3 h-1.5 w-1/2 rounded bg-muted-foreground/10" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false, // ไม่ render ฝั่ง server เพื่อป้องกัน hydration issues
  }
);

export default function Home() {
  /* ---- คำที่ผู้ใช้กำลังพิมพ์ในช่องค้นหา ---- */
  const [input, setInput] = useState("");

  /* ---- การตั้งค่า (จำไว้แม้ปิดเบราว์เซอร์) ---- */
  const [settings, setSettings] = useLocalStorage<SearchSettings>(
    "seo-ez-settings",
    DEFAULT_SETTINGS
  );

  /* ---- คีย์เวิร์ดที่ถูกใจ ---- */
  const [favorites, setFavorites] = useLocalStorage<FavoriteItem[]>(
    "seo-ez-favorites",
    []
  );

  /* ---- State การค้นหาจาก hook ---- */
  const {
    keywords,
    isLoading,
    currentSeed,
    search,
    cancel,
    deleteHistoryEntry,
    clearHistory,
    incrementCopied,
    history,
    stats,
  } = useKeywordSearch();

  /* ---- แปลง favorites เป็น KeywordItem[] เพื่อให้ KeywordChips ใช้ได้ ---- */
  const favoriteItems: KeywordItem[] = favorites.map((f) => ({
    keyword: f.keyword,
    score: 0,
  }));

  /**
   * handleSubmit — เมื่อกดปุ่มค้นหา / กด Enter
   */
  const handleSubmit = () => {
    const seed = input.trim();
    if (!seed) return;
    search(seed, settings);
  };

  /**
   * handleToggleFavorite — เพิ่ม/ลบ favorite พร้อม Toast แจ้งเตือน
   */
  const handleToggleFavorite = (kw: KeywordItem) => {
    const exists = favorites.some(
      (f) => f.keyword.toLowerCase() === kw.keyword.toLowerCase()
    );

    if (exists) {
      setFavorites((prev) =>
        prev.filter(
          (f) => f.keyword.toLowerCase() !== kw.keyword.toLowerCase()
        )
      );
      toast.info(`นำ "${kw.keyword}" ออกจาก favorite แล้ว`);
    } else {
      setFavorites((prev) => [
        {
          keyword: kw.keyword,
          seed: currentSeed || input,
          savedAt: Date.now(),
        },
        ...prev,
      ]);
      toast.success(`บันทึก "${kw.keyword}" เป็น favorite แล้ว ⭐`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
      {/* 1️⃣ Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          ค้นหาคีย์เวิร์ดสุดปัง{" "}
          <span className="text-gradient">ด้วยพลัง AI</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          พิมพ์คำค้นเดียว ได้ชุดคีย์เวิร์ดคุณภาพเรียงตามคะแนนศักยภาพ
          พร้อมคัดลอกและ Export ไปใช้ได้ทันที
        </p>
      </div>

      {/* 2️⃣ Stats */}
      <div className="mb-6">
        <KeywordStats stats={stats} />
      </div>

      {/* 3️⃣ Search + 4️⃣ Settings */}
      <div className="mb-8 space-y-3">
        <KeywordSearch
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onCancel={cancel}
          isLoading={isLoading}
        />
        <SettingsBar
          settings={settings}
          onChange={setSettings}
          disabled={isLoading}
        />
      </div>

      {/* 5️⃣ Grid หลัก */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ซ้าย: ผลลัพธ์ (ใช้ dynamic import เพื่อ performance) */}
        <KeywordChips
          keywords={keywords}
          currentSeed={currentSeed}
          isLoading={isLoading}
          favorites={favoriteItems}
          onToggleFavorite={handleToggleFavorite}
          onCopied={incrementCopied}
        />

        {/* ขวา: ประวัติ + Favorites */}
        <div className="space-y-6">
          <HistoryPanel
            history={history}
            onReselect={(entry) => {
              setInput(entry.seed);
              search(entry.seed, settings);
            }}
            onDelete={deleteHistoryEntry}
            onClearAll={clearHistory}
          />

          <FavoritesPanel
            favorites={favorites}
            onRemove={(kw) =>
              setFavorites((prev) =>
                prev.filter((f) => f.keyword !== kw)
              )
            }
            onClearAll={() => setFavorites([])}
            onCopied={incrementCopied}
          />
        </div>
      </div>

      {/* 🆕 ปุ่มเลื่อนขึ้นบนสุด (Floating Action Button) */}
      <ScrollToTop />
    </div>
  );
}