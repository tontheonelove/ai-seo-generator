/**
 * ================================================================
 * SEO EZ — Prompt Builder
 * ----------------------------------------------------------------
 * หน้าที่: สร้างคำสั่งส่งให้ AI โดย "บังคับอย่างเข้มงวด" ว่า
 * ต้องตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่นปน
 * 📌 ปรับแก้โทน/กติกาของ AI ได้จากไฟล์นี้ที่เดียว
 * ================================================================
 */
import type { KeywordLanguage, SearchMode, SearchSettings } from "@/types/seo";

/** คำอธิบายเฉพาะของแต่ละโหมดการค้นหา (แทรกเข้าไปใน Prompt) */
const MODE_INSTRUCTIONS: Record<SearchMode, string> = {
  general:
    "Generate a smart mix of short-tail and long-tail keywords that real people search for.",
  longtail:
    "Generate ONLY long-tail keywords (3+ words, specific, lower competition, high intent).",
  questions:
    "Generate ONLY question-style keywords (e.g. how/what/why/where/best ways... or Thai question forms).",
  commercial:
    "Generate ONLY commercial / transactional intent keywords (buy, price, review, vs, best, cheap, discount...).",
};

/** คำอธิบายเรื่องภาษาของผลลัพธ์ */
const LANGUAGE_INSTRUCTIONS: Record<KeywordLanguage, string> = {
  auto: "Write keywords in the SAME language as the seed topic (Thai seed → Thai keywords, English seed → English keywords).",
  en: "Write ALL keywords in English.",
  th: "Write ALL keywords in Thai.",
};

/**
 * buildKeywordPrompt — สร้าง Prompt เต็มรูปแบบจากคำค้น + การตั้งค่า
 * @param seed     คำที่ผู้ใช้พิมพ์ เช่น "bitcoin"
 * @param settings การตั้งค่าที่ผู้ใช้เลือก (จำนวน/ภาษา/โหมด)
 * @returns ข้อความ Prompt พร้อมส่งให้ AI
 */
export function buildKeywordPrompt(
  seed: string,
  settings: Pick<SearchSettings, "count" | "language" | "mode">
): string {
  return `You are a world-class SEO keyword researcher.

TASK: Generate exactly ${settings.count} high-quality SEO keywords related to the seed topic: "${seed}".

RULES:
1. Style: ${MODE_INSTRUCTIONS[settings.mode]}
2. Language: ${LANGUAGE_INSTRUCTIONS[settings.language]}
3. Every keyword must be something real users actually type into search engines.
4. No duplicates, no numbering, no hashtags, no quotation marks inside keywords.
5. Give each keyword an opportunity score from 1-100 (100 = highest traffic/SEO potential).
6. Sort by score, highest first.
7. RESPOND WITH ONLY A VALID JSON OBJECT. No markdown, no code fences, no explanations, no extra text.

EXACT RESPONSE FORMAT (example only, do not copy these values):
{"keywords":[{"keyword":"best bitcoin wallet","score":96},{"keyword":"how to buy bitcoin safely","score":91}]}`;
}