/**
 * ================================================================
 * API Route: /api/keywords
 * ----------------------------------------------------------------
 * POST → รับคำค้น + การตั้งค่า จากหน้าเว็บ แล้วคืนลิสต์คีย์เวิร์ด
 * GET  → เช็กสถานะระบบ (ใช้ตอน Deploy ว่าตั้งค่าครบหรือยัง)
 *
 * 🛡️ หลักความปลอดภัยของไฟล์นี้:
 * 1. ตรวจข้อมูลขาเข้าด้วย zod ทุกครั้ง (กันค่ามั่ว/ค่าอันตราย)
 * 2. ไม่ส่งรายละเอียด Error ภายในออกภายนอก — ส่งเฉพาะข้อความที่ผู้ใช้เข้าใจ
 * 3. API Key ถูกใช้ที่นี่เท่านั้น ไม่เคยหลุดไปฝั่ง Client
 * ================================================================
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { APP_NAME, DEFAULT_SETTINGS } from "@/lib/config";
import { generateKeywords, OpenRouterError } from "@/lib/openrouter";
import { KeywordParseError } from "@/lib/parser";

/**
 * 📐 โครงสร้างข้อมูลที่ "ยอมรับ" จากหน้าเว็บ
 * - seed: บังคับไม่ว่าง และยาวไม่เกิน 100 ตัวอักษร
 * - settings: เป็นทางเลือก (optional) ถ้าไม่ส่งมาจะใช้ค่าเริ่มต้นทั้งหมด
 */
const requestSchema = z.object({
  seed: z
    .string()
    .trim()
    .min(1, "กรุณาพิมพ์คำค้นก่อนค้นหา")
    .max(100, "คำค้นยาวเกินไป (สูงสุด 100 ตัวอักษร)"),
  settings: z
    .object({
      model: z.string().min(1).max(200),
      count: z.number().int().min(1).max(100),
      language: z.enum(["auto", "en", "th"]),
      mode: z.enum(["general", "longtail", "questions", "commercial"]),
    })
    .optional(),
});

/**
 * POST /api/keywords
 * ตัวอย่างข้อมูลที่รับ:
 * { "seed": "bitcoin", "settings": { "model": "...", "count": 20, ... } }
 * ตัวอย่างคำตอบสำเร็จ:
 * { "keywords": [ { "keyword": "best bitcoin wallet", "score": 96 }, ... ] }
 * ตัวอย่างคำตอบผิดพลาด:
 * { "error": "ถูกจำกัดจำนวนคำขอชั่วคราว (Rate Limit) — รอสักครู่แล้วลองใหม่" }
 */
export async function POST(req: Request) {
  /* ---- ด่านที่ 1: ต้องเป็น JSON ที่อ่านได้ ---- */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "ข้อมูลที่ส่งมาไม่ถูกต้อง (ต้องเป็น JSON เท่านั้น)" },
      { status: 400 }
    );
  }

  /* ---- ด่านที่ 2: ตรวจโครงสร้างด้วย zod ---- */
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    // 🐞 ในโหมด dev: คืน error detail ของ zod กลับมาด้วย เพื่อช่วย debug
    // ⚠️ ตอน deploy จริง (NODE_ENV === "production") จะส่งเฉพาะข้อความเดียวเพื่อความปลอดภัย
    const isDev = process.env.NODE_ENV !== "production";
    const firstIssue = parsed.error.issues[0];
    const message = firstIssue?.message ?? "ข้อมูลที่ส่งมาไม่ถูกต้อง";

    return NextResponse.json(
      isDev
        ? {
            error: message,
            path: firstIssue?.path ?? [],
            code: firstIssue?.code,
            /* ส่ง payload ที่รับมาได้ กลับมาให้ดูว่า zod เห็นเป็นอย่างไร */
            received: body,
          }
        : { error: message },
      { status: 400 }
    );
  }


  /* ---- รวมการตั้งค่า: ค่าที่ส่งมา + ค่าเริ่มต้นส่วนที่ขาด ---- */
  const { seed, settings } = parsed.data;
  const finalSettings = { ...DEFAULT_SETTINGS, ...settings };

  /* ---- เรียก AI และคืนผลลัพธ์ ---- */
  try {
    const keywords = await generateKeywords(seed, finalSettings);
    return NextResponse.json({ keywords });
  } catch (err) {
    // กรณี Error จาก OpenRouter (คีย์ผิด / rate limit / โมเดลหาย ฯลฯ)
    if (err instanceof OpenRouterError) {
      const status =
        err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
      return NextResponse.json({ error: err.message }, { status });
    }

    // กรณี AI ตอบมั่วจน Parser กู้ไม่สำเร็จ
    if (err instanceof KeywordParseError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }

    // กรณีไม่คาดคิด: log ไว้ฝั่งเซิร์ฟเวอร์เท่านั้น (ไม่เผยรายละเอียดออกภายนอก)
    console.error("[/api/keywords] Unexpected error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ — ลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/keywords
 * ใช้เช็กสถานะระบบหลัง Deploy (เช่น เปิดดูว่าใส่ API Key ครือหรือยัง)
 * ⚠️ คืนเฉพาะค่า true/false ของ hasKey — ไม่คืนตัวคีย์เด็ดขาด
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: APP_NAME,
    hasKey: Boolean(process.env.OPENROUTER_API_KEY),
  });
}