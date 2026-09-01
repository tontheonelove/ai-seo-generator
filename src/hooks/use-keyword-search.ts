/**
 * ================================================================
 * useKeywordSearch — หัวใจของหน้า Dashboard
 * ----------------------------------------------------------------
 * หน้าที่:
 * - จัดการ state ของการค้นหา (Loading, Error, Result)
 * - เรียก API /api/keywords พร้อม AbortController (ปุ่ม Cancel)
 * - บันทึกผลการค้นหาลง History
 * - อัปเดต Stats (จำนวนครั้ง, จำนวนคีย์เวิร์ด)
 *
 * 🛡️ กัน BUG:
 * - ถ้าผู้ใช้กดค้นหาใหม่ขณะยังโหลดอยู่ → ยกเลิก request เก่าทันที
 * - ถ้า Component ถูก unmount ขณะยังโหลด → ยกเลิก request ป้องกัน setState บน component ที่ตายแล้ว
 * ================================================================
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type {
  AppStats,
  HistoryEntry,
  KeywordItem,
  SearchSettings,
} from "@/types/seo";
import { DEFAULT_SETTINGS } from "@/lib/config";

export function useKeywordSearch() {
  /* ---- State หลักของการค้นหา ---- */
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSeed, setCurrentSeed] = useState("");

  /* ---- เก็บ AbortController ไว้สำหรับยกเลิก request ---- */
  const abortControllerRef = useRef<AbortController | null>(null);

  /* ---- History + Stats (ซิงค์กับ localStorage) ---- */
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    "seo-ez-history",
    []
  );
  const [stats, setStats] = useLocalStorage<AppStats>("seo-ez-stats", {
    searches: 0,
    keywordsGenerated: 0,
    copied: 0,
  });

  /* ---- ยกเลิก request เก่าถ้า component ถูก unmount ---- */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * search — ค้นหาด้วยคำค้น + การตั้งค่า
   * @param seed     คำค้น เช่น "bitcoin"
   * @param settings การตั้งค่า (model/count/language/mode)
   */
  const search = useCallback(
    async (seed: string, settings: SearchSettings = DEFAULT_SETTINGS) => {
      /* ยกเลิก request เดิมที่กำลังโหลดอยู่ (ถ้ามี) */
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);
      setCurrentSeed(seed);

      try {
        const res = await fetch("/api/keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seed, settings }),
          signal: controller.signal,
        });

        const data = await res.json();

        /* กรณี error จาก API */
        if (!res.ok || data.error) {
          throw new Error(data.error || "เกิดข้อผิดพลาดในการค้นหา");
        }

        /* กรณีสำเร็จ */
        const keywords = data.keywords as KeywordItem[];
        setKeywords(keywords);

        /* บันทึกลง History (ล่าสุดอยู่บนสุด, จำกัด 50 รายการ) */
        const newEntry: HistoryEntry = {
          id: `search-${Date.now()}`,
          seed,
          keywords,
          createdAt: Date.now(),
        };
        setHistory((prev) => [newEntry, ...prev].slice(0, 50));

        /* อัปเดต Stats */
        setStats((prev) => ({
          searches: prev.searches + 1,
          keywordsGenerated: prev.keywordsGenerated + keywords.length,
          copied: prev.copied,
        }));
      } catch (err) {
        /* ถ้าถูกยกเลิกโดย user → ไม่แสดง error */
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const message =
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการค้นหา";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [setHistory, setStats]
  );

  /**
   * cancel — ยกเลิกการค้นหาที่กำลังโหลดอยู่
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  /**
   * clearResults — ล้างผลลัพธ์การค้นหา (กดปุ่ม "ล้าง")
   */
  const clearResults = useCallback(() => {
    setKeywords([]);
    setError(null);
    setCurrentSeed("");
  }, []);

  /**
   * deleteHistoryEntry — ลบประวัติการค้นหา 1 รายการ
   * @param id id ของรายการที่ต้องการลบ
   */
  const deleteHistoryEntry = useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((h) => h.id !== id));
    },
    [setHistory]
  );

  /**
   * clearHistory — ล้างประวัติการค้นหาทั้งหมด
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  /**
   * incrementCopied — เพิ่มจำนวนครั้งที่คัดลอก (เรียกตอน Copy/ Copy All)
   */
  const incrementCopied = useCallback(() => {
    setStats((prev) => ({ ...prev, copied: prev.copied + 1 }));
  }, [setStats]);

  /**
   * resetAll — รีเซ็ตทุกอย่างให้เหมือนผู้ใช้ใหม่ครั้งแรก
   * (ลบ history, favorites, stats, settings จาก localStorage)
   */
  const resetAll = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      // ลบเฉพาะ keys ของ SEO EZ (ไม่ลบของแอปอื่น)
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith("seo-ez-"))
        .forEach((key) => window.localStorage.removeItem(key));
      
      // รีเซ็ต state ในหน่วยความจำ
      setHistory([]);
      setStats({ searches: 0, keywordsGenerated: 0, copied: 0 });
      setKeywords([]);
      setError(null);
      setCurrentSeed("");
    } catch (err) {
      console.error("[resetAll] ไม่สามารถรีเซ็ต:", err);
    }
  }, [setHistory, setStats]);

  return {
    keywords,
    isLoading,
    error,
    currentSeed,
    search,
    cancel,
    clearResults,
    deleteHistoryEntry,
    clearHistory,
    incrementCopied,
    resetAll,
    history,
    stats,
  };
}