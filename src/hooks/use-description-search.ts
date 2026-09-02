/**
 * ================================================================
 * useDescriptionSearch — Hook สำหรับ Description Generator
 * ----------------------------------------------------------------
 * หน้าที่:
 * - จัดการ state (Loading, Error, Result)
 * - เรียก API /api/generate (toolType: "description")
 * - ใช้ MiniMax M3 แบบ Fixed (เหมือน Title Generator)
 * ================================================================
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { DescriptionItem } from "@/types/seo";

export function useDescriptionSearch() {
  /* ---- State หลัก ---- */
  const [description, setDescription] = useState<DescriptionItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState("");

  /* ---- AbortController ---- */
  const abortControllerRef = useRef<AbortController | null>(null);

  /* ---- Cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * generate — สร้าง Description จาก input
   */
  const generate = useCallback(
    async (
      input: string,
      model?: string,
      language: "auto" | "en" | "th" = "auto"
    ) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);
      setCurrentInput(input);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolType: "description",
            input,
            model,
            language,
          }),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(
            data.error || "เกิดข้อผิดพลาดในการสร้าง Description"
          );
        }

        const desc = data.description as DescriptionItem;
        setDescription(desc);

        toast.success("สร้าง Description สำเร็จ!");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการสร้าง Description";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearResults = useCallback(() => {
    setDescription(null);
    setError(null);
    setCurrentInput("");
  }, []);

  return {
    description,
    isLoading,
    error,
    currentInput,
    generate,
    cancel,
    clearResults,
  };
}