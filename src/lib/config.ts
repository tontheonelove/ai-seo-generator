/**
 * ================================================================
 * SEO EZ — ค่าคงที่และการตั้งค่ากลาง
 * ----------------------------------------------------------------
 * 📌 อยากเพิ่ม/ลดโมเดลฟรี, เปลี่ยนค่าเริ่มต้น → แก้ไฟล์นี้ที่เดียว
 * ⚠️ ไฟล์นี้ "ปลอดภัยต่อฝั่ง Client" (ไม่มี secret ใด ๆ)
 * ================================================================
 */
import type { KeywordLanguage, SearchMode, SearchSettings } from "@/types/seo";

/** ชื่อแอป (ใช้ส่งให้ OpenRouter แสดงใน Dashboard ของเขา) */
export const APP_NAME = "SEO EZ";

/** URL ของแอป (ใช้ประกอบ Header ให้ OpenRouter — ใส่ได้ทั้ง local/vercel) */
export const APP_URL = "https://seo-ez.vercel.app";

/**
 * 🤖 รายชื่อโมเดล "ฟรี" บน OpenRouter ที่ผ่านการคัดแล้วว่าเก่งเรื่อง keyword
 * 📌 หากโมเดลใดถูกถอดออก ให้ดูรายชื่อปัจจุบันที่:
 *    👉 https://openrouter.ai/models?max_price=0
 *    แล้วแก้/เพิ่มบรรทัดได้ที่นี่ (Dropdown บนหน้าเว็บจะอัปเดตตามอัตโนมัติ)
 */
export const FREE_MODELS: { id: string; label: string }[] = [
  { id: "inclusionai/ling-3.0-flash-fin:free", label: "Ling3.0 (แนะนำ)" },
  { id: "liquid/lfm-2.5-2.6b:free", label: "Liquid2.5" },
  { id: "nvidia/nemotron-3.5-lightning:free", label: "Nemotron-3.5" },
  { id: "poolside/laguna-s-2.1:free", label: "Laguna-s-2.1" },
  { id: "google/gemma-4-31b-it:free", label: "Gemma-4-31b" },
];

/** โมเดลตั้งต้น = ตัวแรกของรายการ */
export const DEFAULT_MODEL_ID = FREE_MODELS[0].id;

/** ตัวเลือกจำนวนคีย์เวิร์ดต่อครั้ง */
export const COUNT_OPTIONS = [10, 20, 30, 50] as const;

/** จำนวนตั้งต้น (ตามที่ตกลงกัน) */
export const DEFAULT_COUNT = 20;

/** ⏱️ เวลาสูงสุดที่รอ AI ตอบ (มิลลิวินาที) — เกินนี้ถือว่าหมดเวลา */
export const REQUEST_TIMEOUT_MS = 60_000;

/** ตัวเลือกโหมดการค้นหา (แสดงใน Dropdown) */
export const MODE_OPTIONS: { value: SearchMode; label: string }[] = [
  { value: "general", label: "ทั่วไป (ผสมทุกแนว)" },
  { value: "longtail", label: "Long-tail (เจาะจง สู้ง่าย)" },
  { value: "questions", label: "คำถามที่คนค้นหา" },
  { value: "commercial", label: "สายซื้อ / เชิงพาณิชย์" },
];

/** ตัวเลือกภาษาของผลลัพธ์ (แสดงใน Dropdown) */
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