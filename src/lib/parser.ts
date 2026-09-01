/**
 * ================================================================
 * SEO EZ — AI Response Parser (ด่านตรวจคำตอบจาก AI)
 * ----------------------------------------------------------------
 * ทำไมต้องมีไฟล์นี้? เพราะ AI ฟรีบางตัวอาจ:
 *   - ห่อ JSON ด้วย ```json ... ```
 *   - เผลอพิมพ์คำอธิบายนำมาก่อน
 *   - ตอบเป็น array เฉย ๆ แทน object
 * ไฟล์นี้จะ "กู้" คีย์เวิร์ดออกมาให้ได้ทุกกรณี + ตัดซ้ำ + เรียงคะแนน
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
 * parseKeywordResponse — แปลงข้อความดิบจาก AI เป็นลิสต์คีย์เวิร์ดที่สะอาด
 * @param raw      ข้อความดิบที่ AI ตอบกลับ
 * @param maxCount จำนวนสูงสุดที่ต้องการ (ตัดส่วนเกินทิ้ง)
 * @returns KeywordItem[] เรียงตามคะแนนจากมากไปน้อย, ไม่ซ้ำกัน
 */
export function parseKeywordResponse(raw: string, maxCount: number): KeywordItem[] {
  /* ---- ขั้นที่ 1: ดึงส่วนที่เป็น JSON ออกมา ---- */
  let text = raw.trim();

  // ตัด markdown code fences ออก (เช่น ```json ... ```)
  text = text.replace(/```(?:json)?/gi, "");

  // ถ้ามีข้อความปนก่อน/หลัง JSON ให้ตัดเฉพาะช่วง { ... }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  /* ---- ขั้นที่ 2: แปลงเป็น object ---- */
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new KeywordParseError(
      "AI ตอบกลับในรูปแบบที่อ่านไม่ได้ ลองกดค้นหาใหม่อีกครั้ง หรือเปลี่ยนโมเดล"
    );
  }

  // กรณี AI ตอบเป็น array เฉย ๆ → ห่อเป็น object ให้ตรงกับ schema
  if (Array.isArray(json)) {
    json = { keywords: json };
  }

  /* ---- ขั้นที่ 3: ตรวจโครงสร้างด้วย zod ---- */
  const result = aiResponseSchema.safeParse(json);
  if (!result.success) {
    throw new KeywordParseError(
      "โครงสร้างคำตอบจาก AI ไม่ถูกต้อง ลองกดค้นหาใหม่อีกครั้ง หรือเปลี่ยนโมเดล"
    );
  }

  /* ---- ขั้นที่ 4: ทำความสะอาด + ตัดซ้ำ + เรียงคะแนน ---- */
  const seen = new Set<string>();
  const cleaned: KeywordItem[] = [];

  for (const item of result.data.keywords) {
    // จัดช่องว่างให้เรียบร้อย: ตัดหน้า-หลัง, ยุบช่องว่างซ้ำเป็นหนึ่ง
    const keyword = item.keyword.replace(/\s+/g, " ").trim();

    // ข้ามคำที่สั้น/ยาวเกิน หรือซ้ำเดิม (ไม่แบ่งเล็กใหญ่)
    if (keyword.length < 2 || keyword.length > 120) continue;
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    cleaned.push({
      keyword,
      // บีบคะแนนให้อยู่ในช่วง 0–100 เสมอ
      score: Math.min(100, Math.max(0, Math.round(item.score))),
    });
  }

  // เรียงจากคะแนนมาก → น้อย (sort ของ JS เป็น stable sort)
  cleaned.sort((a, b) => b.score - a.score);

  if (cleaned.length === 0) {
    throw new KeywordParseError("AI ไม่สร้างคีย์เวิร์ดมาให้เลย ลองค้นหาใหม่อีกครั้ง");
  }

  // ตัดให้ไม่เกินจำนวนที่ผู้ใช้ขอ
  return cleaned.slice(0, maxCount);
}