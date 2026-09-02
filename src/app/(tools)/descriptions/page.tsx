"use client";

/**
 * ================================================================
 * Description Generator — หน้าสร้าง Description แบบยาวด้วย AI
 * ----------------------------------------------------------------
 * URL: /descriptions
 * Features:
 * - Textarea ใส่หัวข้อหรือเนื้อหา
 * - Generate Description แบบยาวครบชุด (Hook + Bullets + CTA + Hashtags)
 * - เหมาะสำหรับ YouTube / Facebook / Social
 * - แสดงจำนวนตัวอักษร + จำนวนบรรทัด + highlights
 * - Copy + Favorites
 * ================================================================
 */
import { useState } from "react";
import { toast } from "sonner";
import { DescriptionInput } from "@/components/content-tools/description-input";
import { DescriptionResults } from "@/components/content-tools/description-results";
import { SavedList } from "@/components/content-tools/saved-list";
import { useDescriptionSearch } from "@/hooks/use-description-search";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { DescriptionFavoriteItem } from "@/types/seo";

export default function DescriptionsPage() {
  /* ---- State ---- */
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"auto" | "en" | "th">("auto");

  /* ---- Hook ---- */
  const { description, isLoading, currentInput, generate, cancel } =
    useDescriptionSearch();

  /* ---- Favorites ---- */
  const [favorites, setFavorites] = useLocalStorage<DescriptionFavoriteItem[]>(
    "act-description-favorites",
    []
  );

  /* ---- เช็คว่า Description ปัจจุบันเป็น favorite หรือไม่ ---- */
  const isFavorite =
    description !== null &&
    favorites.some(
      (f) =>
        f.description.toLowerCase() === description.description.toLowerCase()
    );

  /**
   * handleSubmit — เมื่อกดปุ่มสร้าง Description
   */
  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    generate(text, undefined, language);
  };

  /**
   * handleToggleFavorite — เพิ่ม/ลบ favorite
   */
  const handleToggleFavorite = () => {
    if (!description) return;

    const exists = favorites.some(
      (f) =>
        f.description.toLowerCase() === description.description.toLowerCase()
    );

    if (exists) {
      setFavorites((prev) =>
        prev.filter(
          (f) =>
            f.description.toLowerCase() !==
            description.description.toLowerCase()
        )
      );
      toast.info("นำออกจาก favorite แล้ว");
    } else {
      setFavorites((prev) => [
        {
          type: "description",
          description: description.description,
          input: currentInput || input,
          savedAt: Date.now(),
        },
        ...prev,
      ]);
      toast.success("บันทึกเป็น favorite แล้ว ⭐");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          สร้าง Description สุดปัง{" "}
          <span className="text-gradient">สำหรับ YouTube / Facebook</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          ใส่หัวข้อหรือเนื้อหาของคุณ AI จะเขียน Description แบบยาวครบชุด —
          Hook, สิ่งที่จะได้เรียนรู้, CTA และ Hashtags — คัดลอกไปใช้ได้ทันที
        </p>
      </div>

      {/* Input */}
      <div className="mb-8">
        <DescriptionInput
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
      <DescriptionResults
        description={description}
        currentInput={currentInput}
        isLoading={isLoading}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* ⭐ รายการ Description ที่บันทึกไว้ */}
      <div className="mt-8">
        <SavedList
          title="Description ที่บันทึกไว้"
          multiline
          items={favorites.map((f) => ({
            id: String(f.savedAt),
            text: f.description,
            meta: `จาก: ${f.input.slice(0, 60)}`,
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