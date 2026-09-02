/**
 * ================================================================
 * SEO EZ — ค่าคงที่และการตั้งค่ากลาง
 * ----------------------------------------------------------------
 * 📌 Env variables ที่ใช้ NEXT_PUBLIC_ prefix:
 *    - NEXT_PUBLIC_OPENROUTER_MODELS (รายชื่อโมเดล)
 *    - NEXT_PUBLIC_OPENROUTER_MODEL (โมเดลเริ่มต้น)
 * 📌 Env variables ที่ไม่เติม NEXT_PUBLIC_ (secret ฝั่ง server):
 *    - OPENROUTER_API_KEY (เรียกใช้ที่ api/keywords/route.ts เท่านั้น)
 * 
 * ⚠️ อัปเดตล่าสุด 2026: โมเดล qwen3-235b:free ถูกถอดออกจากกลุ่มฟรี
 *    ใช้โมเดล deepseek, llama, gemma, ling แทน
 * ================================================================
 */
import type { KeywordLanguage, SearchMode, SearchSettings } from "@/types/seo";

/** ชื่อแอป (ใช้ส่งให้ OpenRouter แสดงใน Dashboard) */
export const APP_NAME = "ACT - Ai Content Tools";

/** URL ของแอป (ประกอบ Header ให้ OpenRouter) */
export const APP_URL = "https://seo-ez.vercel.app";

/**
 * 🤖 Fallback model list — ใช้เมื่อไม่มี env ตั้งไว้
 * 📌 อัปเดตล่าสุด 2026: รายชื่อโมเดลฟรีที่ยัง active
 */
export const FALLBACK_MODELS: { id: string; label: string }[] = [
  { id: "minimax/minimax-m3:free", label: "MiniMax M3 (แนะนำ) " },
  { id: "inclusionai/ling-3.0-flash-fin:free", label: "Ling 3.0 Flash" },
  { id: "liquid/lfm-2.5-2.6b:free", label: "Liquid 2.5" },
  { id: "poolside/laguna-s-2.1:free", label: "Laguna S 2.1" },
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B" },
];

/**
 * parseModelsFromEnv — แปลงค่าจาก NEXT_PUBLIC_OPENROUTER_MODELS
 * Format ที่รองรับ: "id1|label1,id2|label2,id3|label3"
 */
function parseModelsFromEnv(): { id: string; label: string }[] | null {
  const envValue = process.env.NEXT_PUBLIC_OPENROUTER_MODELS;
  if (!envValue || envValue.trim() === "") return null;

  try {
    const models = envValue.split(",").map((item) => {
      const [id, ...labelParts] = item.split("|");
      const label = labelParts.join("|").trim();
      return {
        id: id.trim(),
        label: label || id,
      };
    });
    return models.filter((m) => m.id.length > 0);
  } catch (err) {
    console.error("[config] ไม่สามารถ parse NEXT_PUBLIC_OPENROUTER_MODELS:", err);
    return null;
  }
}

/**
 * 📋 รายชื่อโมเดลทั้งหมดที่แสดงใน Dropdown
 * - ถ้ามี env → ใช้ค่านั้น
 * - ถ้าไม่มี → ใช้ FALLBACK_MODELS
 */
export const FREE_MODELS: { id: string; label: string }[] =
  parseModelsFromEnv() ?? FALLBACK_MODELS;

/**
 * 🤖 โมเดลเริ่มต้น
 * - ถ้ามี env → ใช้ค่านั้น
 * - ถ้าไม่มี → ใช้ตัวแรกของ FALLBACK_MODELS
 */
export const DEFAULT_MODEL_ID =
  process.env.NEXT_PUBLIC_OPENROUTER_MODEL || FALLBACK_MODELS[0]?.id || "";

/** ตัวเลือกจำนวนคีย์เวิร์ดต่อครั้ง */
export const COUNT_OPTIONS = [10, 20, 30, 50] as const;

/** จำนวนตั้งต้น */
export const DEFAULT_COUNT = 20;

/** ⏱️ เวลาสูงสุดที่รอ AI ตอบ (ms) */
export const REQUEST_TIMEOUT_MS = 60_000;

/** ตัวเลือกโหมดการค้นหา */
export const MODE_OPTIONS: { value: SearchMode; label: string }[] = [
  { value: "general", label: "ทั่วไป (ผสมทุกแนว)" },
  { value: "longtail", label: "Long-tail (เจาะจง สู้ง่าย)" },
  { value: "questions", label: "คำถามที่คนค้นหา" },
  { value: "commercial", label: "สายซื้อ / เชิงพาณิชย์" },
];

/** ตัวเลือกภาษาของผลลัพธ์ */
export const LANGUAGE_OPTIONS: { value: KeywordLanguage; label: string }[] = [
  { value: "auto", label: "อัตโนมัติ (ตามคำที่พิมพ์)" },
  { value: "en", label: "อังกฤษ" },
  { value: "th", label: "ไทย" },
];

/** การตั้งค่าเริ่มต้นตอนเปิดแอปครั้งแรก */
export const DEFAULT_SETTINGS: SearchSettings = {
  model: DEFAULT_MODEL_ID,
  count: DEFAULT_COUNT,
  language: "auto",
  mode: "general",
};