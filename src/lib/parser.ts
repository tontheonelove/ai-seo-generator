/**
 * ================================================================
 * Ai Content Tools Generator — AI Response Parser (ด่านตรวจคำตอบ)
 * ----------------------------------------------------------------
 * ทำไมต้องมีไฟล์นี้? เพราะ AI ฟรีบางตัวอาจ:
 *   - ห่อ JSON ด้วย ```json ... ```
 *   - เผลอพิมพ์คำอธิบายนำมาก่อน
 *   - ตอบเป็น array เฉย ๆ แทน object
 *   - ตอบเป็นข้อความธรรมดา ไม่ใช้ JSON เลย
 * ไฟล์นี้จะ "กู้" ข้อมูลออกมาให้ได้ทุกกรณี + ตัดซ้ำ + เรียงคะแนน
 *
 * รองรับ 3 ประเภท:
 * 1. parseKeywordResponse — keywords
 * 2. parseTitleResponse — titles
 * 3. parseDescriptionResponse — description แบบยาว (รักษา \n)
 * ================================================================
 */
import { z } from "zod";
import type { KeywordItem, TitleItem, DescriptionItem } from "@/types/seo";

/** Error เฉพาะกรณี "กู้คำตอบจาก AI ไม่สำเร็จ" */
export class KeywordParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KeywordParseError";
  }
}

/* ================================================================
 * Schemas (ตรวจด้วย zod)
 * ================================================================ */

const keywordItemSchema = z.object({
  keyword: z.string().min(1).max(120),
  score: z.coerce.number().catch(50),
});

const aiResponseSchema = z.object({
  keywords: z.array(keywordItemSchema),
});

const titleItemSchema = z.object({
  title: z.string().min(10).max(80),
  score: z.coerce.number().catch(50),
  reason: z.string().catch(""),
});

const titleResponseSchema = z.object({
  titles: z.array(titleItemSchema),
});

/** Schema สำหรับ DescriptionItem (แบบยาว: 100-5000 ตัวอักษร) */
const descriptionItemSchema = z.object({
  description: z.string().min(100).max(5000),
  charCount: z.coerce.number().catch(0),
  highlights: z.array(z.string()).catch([]),
});

const descriptionResponseSchema = z.object({
  description: z.string().min(100).max(5000),
  charCount: z.coerce.number().catch(0),
  highlights: z.array(z.string()).catch([]),
});

/* ================================================================
 * Helpers กลาง
 * ================================================================ */

/**
 * tryParseJSON — พยายาม parse JSON จากข้อความดิบ
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
 */
function extractJSONFromString(text: string): string | null {
  /* ตัด markdown code fences ออก */
  text = text.replace(/```(?:json)?/gi, "");

  /* หา { ... } ที่ยาวที่สุด */
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return null;
}

/* ================================================================
 * 1) KEYWORDS
 * ================================================================ */

/**
 * parseKeywordResponse — แปลงข้อความดิบจาก AI เป็นลิสต์คีย์เวิร์ดที่สะอาด
 */
export function parseKeywordResponse(
  raw: string,
  maxCount: number
): KeywordItem[] {
  let text = raw.trim();

  /* ขั้นที่ 1: ลอง parse JSON ตรงๆ */
  let json = tryParseJSON(text);

  /* ขั้นที่ 2: ถ้าไม่ได้ ลองตัดสิ่งปนเปื้อนออก */
  if (!json) {
    const extracted = extractJSONFromString(text);
    if (extracted) {
      json = tryParseJSON(extracted);
    }
  }

  /* ขั้นที่ 3: ถ้า AI ตอบเป็น array เฉยๆ → ห่อเป็น object */
  if (Array.isArray(json)) {
    json = { keywords: json };
  }

  /* ขั้นที่ 4: ถ้าได้ JSON → ตรวจโครงสร้างด้วย zod */
  if (json && typeof json === "object") {
    const result = aiResponseSchema.safeParse(json);
    if (result.success) {
      return cleanAndDeduplicate(result.data.keywords, maxCount);
    }
  }

  /* ขั้นที่ 5: fallback extract จากข้อความธรรมดา */
  console.warn("[Parser] Keyword JSON parse failed, trying fallback...");
  console.warn("[Parser] Raw response (first 500 chars):", text.slice(0, 500));

  const fallbackKeywords = fallbackExtractKeywords(text);
  if (fallbackKeywords.length > 0) {
    console.log(
      `[Parser] Fallback extracted ${fallbackKeywords.length} keywords`
    );
    return cleanAndDeduplicate(fallbackKeywords, maxCount);
  }

  /* ขั้นที่ 6: ถ้ายังไม่ได้เลย → throw error */
  console.error("[Parser] Full raw response:", text);
  throw new KeywordParseError(
    "AI ตอบกลับในรูปแบบที่อ่านไม่ได้ ลองกดค้นหาใหม่อีกครั้ง หรือเปลี่ยนโมเดล"
  );
}

/** Fallback: ดึง keywords จากข้อความธรรมดา */
function fallbackExtractKeywords(text: string): KeywordItem[] {
  const keywords: KeywordItem[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;

    /* ลบเลขลำดับ เช่น "1.", "2)", "- " */
    let cleaned = trimmed.replace(/^\d+[\.\)\-]\s*/, "").trim();

    /* ลบ markdown bullet */
    cleaned = cleaned.replace(/^[-*]\s*/, "").trim();

    /* ลองดึง score ถ้ามี */
    let score = 50;
    const scoreMatch = cleaned.match(/\(?\s*score\s*[:\-]\s*(\d+)\s*\)?/i);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1], 10);
      cleaned = cleaned.replace(scoreMatch[0], "").trim();
    }

    /* ลบเครื่องหมายคำพูด */
    cleaned = cleaned.replace(/^["'""''「」『』]+|["'""''「」『』]+$/g, "").trim();

    if (cleaned.length >= 2 && cleaned.length <= 120) {
      keywords.push({
        keyword: cleaned,
        score: Math.min(100, Math.max(0, score)),
      });
    }
  }

  return keywords;
}

/** ทำความสะอาด + ตัดซ้ำ + เรียงคะแนน (keywords) */
function cleanAndDeduplicate(
  keywords: KeywordItem[],
  maxCount: number
): KeywordItem[] {
  const seen = new Set<string>();
  const cleaned: KeywordItem[] = [];

  for (const item of keywords) {
    const keyword = item.keyword.replace(/\s+/g, " ").trim();

    if (keyword.length < 2 || keyword.length > 120) continue;
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    cleaned.push({
      keyword,
      score: Math.min(100, Math.max(0, Math.round(item.score))),
    });
  }

  cleaned.sort((a, b) => b.score - a.score);

  if (cleaned.length === 0) {
    throw new KeywordParseError("AI ไม่สร้างคีย์เวิร์ดมาให้เลย ลองค้นหาใหม่อีกครั้ง");
  }

  return cleaned.slice(0, maxCount);
}

/* ================================================================
 * 2) TITLES
 * ================================================================ */

/**
 * parseTitleResponse — แปลงคำตอบ AI เป็น TitleItem[]
 */
export function parseTitleResponse(raw: string, maxCount: number): TitleItem[] {
  let text = raw.trim();

  let json = tryParseJSON(text);
  if (!json) {
    const extracted = extractJSONFromString(text);
    if (extracted) {
      json = tryParseJSON(extracted);
    }
  }

  if (Array.isArray(json)) {
    json = { titles: json };
  }

  if (json && typeof json === "object") {
    const result = titleResponseSchema.safeParse(json);
    if (result.success) {
      return cleanAndDeduplicateTitles(result.data.titles, maxCount);
    }
  }

  /* Fallback: ดึงจากข้อความธรรมดา */
  console.warn("[Parser] Title JSON parse failed, trying fallback...");
  console.warn("[Parser] Raw response (first 500 chars):", text.slice(0, 500));

  const fallbackTitles = fallbackExtractTitles(text);
  if (fallbackTitles.length > 0) {
    return cleanAndDeduplicateTitles(fallbackTitles, maxCount);
  }

  console.error("[Parser] Full raw response:", text);
  throw new KeywordParseError(
    "AI ตอบ Title ในรูปแบบที่อ่านไม่ได้ ลองใหม่หรือเปลี่ยนโมเดล"
  );
}

/** Fallback: ดึง titles จากข้อความธรรมดา */
function fallbackExtractTitles(text: string): TitleItem[] {
  const titles: TitleItem[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    let cleaned = line.trim();
    if (!cleaned || cleaned.length < 10) continue;

    cleaned = cleaned.replace(/^\d+[\.\)\-]\s*/, "").trim();
    cleaned = cleaned.replace(/^[-*•]\s*/, "").trim();

    let score = 50;
    const scoreMatch = cleaned.match(/\(?\s*score\s*[:\-]\s*(\d+)\s*\)?/i);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1], 10);
      cleaned = cleaned.replace(scoreMatch[0], "").trim();
    }

    cleaned = cleaned.replace(/^["'""''「」『』]+|["'""''「」『』]+$/g, "").trim();

    if (cleaned.length >= 10 && cleaned.length <= 80) {
      titles.push({ title: cleaned, score, reason: "" });
    }
  }

  return titles;
}

/** ทำความสะอาด TitleItem[] (ตัดซ้ำ + เรียงคะแนน) */
function cleanAndDeduplicateTitles(
  titles: TitleItem[],
  maxCount: number
): TitleItem[] {
  const seen = new Set<string>();
  const cleaned: TitleItem[] = [];

  for (const item of titles) {
    const title = item.title.replace(/\s+/g, " ").trim();
    if (title.length < 10 || title.length > 80) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    cleaned.push({
      title,
      score: Math.min(100, Math.max(0, Math.round(item.score))),
      reason: item.reason.replace(/\s+/g, " ").trim().slice(0, 100),
    });
  }

  cleaned.sort((a, b) => b.score - a.score);

  if (cleaned.length === 0) {
    throw new KeywordParseError("AI ไม่สร้าง Title มาให้เลย ลองใหม่");
  }

  return cleaned.slice(0, maxCount);
}

/* ================================================================
 * 3) DESCRIPTION (แบบยาว)
 * ================================================================ */

/**
 * parseDescriptionResponse — แปลงคำตอบ AI เป็น DescriptionItem
 */
export function parseDescriptionResponse(raw: string): DescriptionItem {
  let text = raw.trim();

  let json = tryParseJSON(text);
  if (!json) {
    const extracted = extractJSONFromString(text);
    if (extracted) {
      json = tryParseJSON(extracted);
    }
  }

  if (json && typeof json === "object") {
    const result = descriptionResponseSchema.safeParse(json);
    if (result.success) {
      return cleanDescription(result.data);
    }
  }

  /* Fallback: ใช้ทั้งข้อความดิบเป็น description */
  console.warn("[Parser] Description JSON parse failed, trying fallback...");
  console.warn("[Parser] Raw response (first 500 chars):", text.slice(0, 500));

  const fallback = fallbackExtractDescription(text);
  if (fallback) {
    return cleanDescription(fallback);
  }

  console.error("[Parser] Full raw response:", text);
  throw new KeywordParseError(
    "AI ตอบ Description ในรูปแบบที่อ่านไม่ได้ ลองใหม่หรือเปลี่ยนโมเดล"
  );
}

/** ทำความสะอาด DescriptionItem (รักษาขึ้นบรรทัดใหม่ + นับ charCount ใหม่) */
function cleanDescription(item: DescriptionItem): DescriptionItem {
  /* ⚠️ ไม่ใช้ replace(/\s+/g) เพราะจะทำลาย \n ของ description แบบยาว */
  const description = item.description.trim();

  if (description.length < 100) {
    throw new KeywordParseError(
      "Description สั้นเกินไป (ต้องอย่างน้อย 100 ตัวอักษร) — ลองใหม่อีกครั้ง"
    );
  }

  return {
    description,
    /* นับใหม่เสมอ เพราะ AI มักนับผิด */
    charCount: description.length,
    highlights: item.highlights
      .map((h) => h.replace(/\s+/g, " ").trim())
      .filter((h) => h.length > 0 && h.length < 50)
      .slice(0, 6),
  };
}

/** Fallback: ถ้า JSON พัง ให้ใช้ทั้งข้อความดิบเป็น description (แบบยาว) */
function fallbackExtractDescription(text: string): DescriptionItem | null {
  const cleaned = text.trim();

  if (cleaned.length >= 100) {
    return {
      description: cleaned,
      charCount: cleaned.length,
      highlights: ["extracted via fallback"],
    };
  }

  return null;
}