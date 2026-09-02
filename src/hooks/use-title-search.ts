/**
 * ================================================================
 * useTitleSearch — Hook สำหรับ Title Generator
 * ----------------------------------------------------------------
 * หน้าที่:
 * - จัดการ state (Loading, Error, Result)
 * - เรียก API /api/generate พร้อม AbortController
 * - บันทึกผลการสร้างลง History
 * - อัปเดต Stats
 *
 * 📌 ใช้ API ใหม่: /api/generate (toolType: "title")
 * ================================================================
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { TitleItem } from "@/types/seo";

export function useTitleSearch() {
  /* ---- State หลัก ---- */
  const [titles, setTitles] = useState<TitleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState("");

  /* ---- AbortController สำหรับยกเลิก request ---- */
  const abortControllerRef = useRef<AbortController | null>(null);

  /* ---- ยกเลิก request ถ้า component ถูก unmount ---- */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * generate — สร้าง 5 Titles จาก keyword
   */
  const generate = useCallback(
    async (
      keyword: string,
      model?: string,
      language: "auto" | "en" | "th" = "auto"
    ) => {
      /* ยกเลิก request เดิม */
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);
      setCurrentKeyword(keyword);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolType: "title",
            keyword,
            model,
            language,
          }),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้าง Title");
        }

        const titles = data.titles as TitleItem[];
        setTitles(titles);

        toast.success(`สร้าง ${titles.length} Titles สำเร็จ!`);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const message =
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้าง Title";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * cancel — ยกเลิกการสร้างที่กำลังโหลดอยู่
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  /**
   * clearResults — ล้างผลลัพธ์
   */
  const clearResults = useCallback(() => {
    setTitles([]);
    setError(null);
    setCurrentKeyword("");
  }, []);

  return {
    titles,
    isLoading,
    error,
    currentKeyword,
    generate,
    cancel,
    clearResults,
  };
}