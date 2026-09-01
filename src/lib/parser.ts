/**
 * ================================================================
 * SEO EZ — AI Response Parser (ด่านตรวจคำตอบจาก AI)
 * ----------------------------------------------------------------
 * ทำไมต้องมีไฟล์นี้? เพราะ AI ฟรีบางตัวอาจ:
 *   - ห่อ JSON ด้วย ```json ... ```
 *   - เผลอพิมพ์คำอธิบายนำมาก่อน
 *   - ตอบเป็น array เฉย ๆ แทน object
 *   - ตอบเป็นข้อความธรรมดา ไม่ใช้ JSON เลย
 * ไฟล์นี้จะ "กู้" คีย์เวิร์ดออกมาให้ได้ทุกกรณี + ตัดซ้ำ + เรียงคะแนน
 * 
 * 🐞 Debug: log raw response เมื่อ parse ไม่สำเร็จ
 * ================================================================
 */
import { z } from "zod";
import type { KeywordItem } from "@/types/seo";

/** Error เฉพาะกรณี "กู้คำตอบจาก AI ไม่สำเร็จ" */
export class KeywordParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KeywordParseError";
  }
}

/**
 * โครงสร้างคำตอบที่คาดหวังจาก AI (ตรวจด้วย zod)
 * - score ใช้ .catch(50) → ถ้า AI ส่งค่าแปลก ๆ มา ให้ใช้ 50 แทน ไม่พังทั้งลิสต์
 */
const keywordItemSchema = z.object({
  keyword: z.string().min(1).max(120),
  score: z.coerce.number().catch(50),
});

const aiResponseSchema = z.object({
  keywords: z.array(keywordItemSchema),
});

/**
 * tryParseJSON — พยายาม parse JSON จากข้อความดิบ
 * @returns object ที่ parse ได้ หรือ null ถ้าทำไม่ได้
 */
function tryParseJSON(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * extractJSONFromString — ดึง JSON object ออกมาจากข้อความที่อาจมีสิ่งอื่นปน
 * @returns JSON string ที่ตัดมาเฉพาะส่วน {...} หรือ null
 */
function extractJSONFromString(text: string): string | null {
  // ตัด markdown code fences ออก
  text = text.replace(/```(?:json)?/gi, "");

  // หา { ... } ที่ยาวที่สุด
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return null;
}

/**
 * fallbackExtractKeywords — ถ้า parse JSON ไม่ได้ ลองดึง keywords จากข้อความธรรมดา
 * เช่น ถ้า AI ตอบเป็น:
 * "1. bitcoin price (score: 99)
 *  2. best bitcoin wallet (score: 95)"
 */
function fallbackExtractKeywords(text: string): KeywordItem[] {
  const keywords: KeywordItem[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;

    // ลบเลขลำดับ เช่น "1.", "2)", "- "
    let cleaned = trimmed.replace(/^\d+[\.\)\-]\s*/, "").trim();
    
    // ลบ markdown bullet
    cleaned = cleaned.replace(/^[-*]\s*/, "").trim();

    // ลองดึง score ถ้ามี เช่น "keyword (score: 95)"
    let score = 50;
    const scoreMatch = cleaned.match(/\(?\s*score\s*[:\-]\s*(\d+)\s*\)?/i);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1], 10);
      cleaned = cleaned.replace(scoreMatch[0], "").trim();
    }

    // ลบเครื่องหมายคำพูด
    cleaned = cleaned.replace(/^["'""''「」『』]+|["'""''「」『』]+$/g, "").trim();

    if (cleaned.length >= 2 && cleaned.length <= 120) {
      keywords.push({ keyword: cleaned, score: Math.min(100, Math.max(0, score)) });
    }
  }

  return keywords;
}

/**
 * parseKeywordResponse — แปลงข้อความดิบจาก AI เป็นลิสต์คีย์เวิร์ดที่สะอาด
 * @param raw      ข้อความดิบที่ AI ตอบกลับ
 * @param maxCount จำนวนสูงสุดที่ต้องการ (ตัดส่วนเกินทิ้ง)
 * @returns KeywordItem[] เรียงตามคะแนนจากมากไปน้อย, ไม่ซ้ำกัน
 */
export function parseKeywordResponse(raw: string, maxCount: number): KeywordItem[] {
  let text = raw.trim();

  /* ---- ขั้นที่ 1: ลอง parse JSON ตรงๆ ---- */
  let json = tryParseJSON(text);

  /* ---- ขั้นที่ 2: ถ้าไม่ได้ ลองตัดสิ่งปนเปื้อนออก ---- */
  if (!json) {
    const extracted = extractJSONFromString(text);
    if (extracted) {
      json = tryParseJSON(extracted);
    }
  }

  /* ---- ขั้นที่ 3: ถ้า AI ตอบเป็น array เฉยๆ → ห่อเป็น object ---- */
  if (Array.isArray(json)) {
    json = { keywords: json };
  }

  /* ---- ขั้นที่ 4: ถ้าได้ JSON → ตรวจโครงสร้างด้วย zod ---- */
  if (json && typeof json === "object") {
    const result = aiResponseSchema.safeParse(json);
    if (result.success) {
      return cleanAndDeduplicate(result.data.keywords, maxCount);
    }
  }

  /* ---- ขั้นที่ 5: ถ้ายังไม่ได้ → ลอง fallback extract จากข้อความธรรมดา ---- */
  console.warn("[Parser] JSON parse failed, trying fallback extraction...");
  console.warn("[Parser] Raw response (first 500 chars):", text.slice(0, 500));
  
  const fallbackKeywords = fallbackExtractKeywords(text);
  if (fallbackKeywords.length > 0) {
    console.log(`[Parser] Fallback extracted ${fallbackKeywords.length} keywords`);
    return cleanAndDeduplicate(fallbackKeywords, maxCount);
  }

  /* ---- ขั้นที่ 6: ถ้ายังไม่ได้เลย → throw error ---- */
  console.error("[Parser] Full raw response:", text);
  throw new KeywordParseError(
    "AI ตอบกลับในรูปแบบที่อ่านไม่ได้ ลองกดค้นหาใหม่อีกครั้ง หรือเปลี่ยนโมเดล"
  );
}

/**
 * cleanAndDeduplicate — ทำความสะอาด + ตัดซ้ำ + เรียงคะแนน
 */
function cleanAndDeduplicate(keywords: KeywordItem[], maxCount: number): KeywordItem[] {
  const seen = new Set<string>();
  const cleaned: KeywordItem[] = [];

  for (const item of keywords) {
    // จัดช่องว่างให้เรียบร้อย
    const keyword = item.keyword.replace(/\s+/g, " ").trim();

    // ข้ามคำที่สั้น/ยาวเกิน หรือซ้ำเดิม
    if (keyword.length < 2 || keyword.length > 120) continue;
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    cleaned.push({
      keyword,
      score: Math.min(100, Math.max(0, Math.round(item.score))),
    });
  }

  // เรียงจากคะแนนมาก → น้อย
  cleaned.sort((a, b) => b.score - a.score);

  if (cleaned.length === 0) {
    throw new KeywordParseError("AI ไม่สร้างคีย์เวิร์ดมาให้เลย ลองค้นหาใหม่อีกครั้ง");
  }

  return cleaned.slice(0, maxCount);
}