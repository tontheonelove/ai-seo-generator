"use client";

/**
 * ================================================================
 * Title Generator — หน้าสร้าง Title คุณภาพสูงด้วย AI
 * ----------------------------------------------------------------
 * URL: /titles
 * Features:
 * - Input keyword + Language selector
 * - Generate 5 Titles พร้อม score + reason
 * - Click to copy + Copy All
 * - Favorites integration
 * ================================================================
 */
import { useState } from "react";
import { toast } from "sonner";
import { TitleInput } from "@/components/content-tools/title-input";
import { TitleResults } from "@/components/content-tools/title-results";
import { SavedList } from "@/components/content-tools/saved-list";
import { useTitleSearch } from "@/hooks/use-title-search";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { TitleItem, TitleFavoriteItem } from "@/types/seo";

export default function TitlesPage() {
  /* ---- State ---- */
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"auto" | "en" | "th">("auto");

  /* ---- Hook ---- */
  const { titles, isLoading, currentKeyword, generate, cancel } =
    useTitleSearch();

  /* ---- Favorites ---- */
  const [favorites, setFavorites] = useLocalStorage<TitleFavoriteItem[]>(
    "act-title-favorites",
    []
  );

  /* ---- แปลง favorites เป็น TitleItem[] ---- */
  const favoriteItems: TitleItem[] = favorites.map((f) => ({
    title: f.title,
    score: f.score,
    reason: "",
  }));

  /**
   * handleSubmit — เมื่อกดปุ่มสร้าง Title
   */
  const handleSubmit = () => {
    const keyword = input.trim();
    if (!keyword) return;
    generate(keyword, undefined, language);
  };

  /**
   * handleToggleFavorite — เพิ่ม/ลบ favorite
   */
  const handleToggleFavorite = (title: TitleItem) => {
    const exists = favorites.some(
      (f) => f.title.toLowerCase() === title.title.toLowerCase()
    );

    if (exists) {
      setFavorites((prev) =>
        prev.filter((f) => f.title.toLowerCase() !== title.title.toLowerCase())
      );
      toast.info(`นำ "${title.title}" ออกจาก favorite แล้ว`);
    } else {
      setFavorites((prev) => [
        {
          type: "title",
          title: title.title,
          keyword: currentKeyword || input,
          score: title.score,
          savedAt: Date.now(),
        },
        ...prev,
      ]);
      toast.success(`บันทึก "${title.title}" เป็น favorite แล้ว ⭐`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          สร้าง Title สุดปัง{" "}
          <span className="text-gradient">ด้วยพลัง AI</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          พิมพ์คำหลักเดียว ได้ 5 Titles คุณภาพสูงเรียงตามคะแนน CTR
          พร้อมเหตุผลว่าทำไมแต่ละ Title ถึงดี
        </p>
      </div>

      {/* Input */}
      <div className="mb-8">
        <TitleInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onCancel={cancel}
          isLoading={isLoading}
          language={language}
          onLanguageChange={setLanguage}
        />
      </div>

      {/* Results */}
      <TitleResults
        titles={titles}
        currentKeyword={currentKeyword}
        isLoading={isLoading}
        favorites={favoriteItems}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* ⭐ รายการ Title ที่บันทึกไว้ */}
      <div className="mt-8">
        <SavedList
          title="Title ที่บันทึกไว้"
          items={favorites.map((f) => ({
            id: String(f.savedAt),
            text: f.title,
            meta: `คำค้น: ${f.keyword} · score ${f.score}`,
          }))}
          onRemove={(id) =>
            setFavorites((prev) => prev.filter((f) => String(f.savedAt) !== id))
          }
          onClearAll={() => setFavorites([])}
        />
      </div>
    </div>
  );
}