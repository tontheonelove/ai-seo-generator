/**
 * ================================================================
 * SEO EZ — OpenRouter Client (ใช้ฝั่ง SERVER เท่านั้น ⚠️)
 * ----------------------------------------------------------------
 * หน้าที่: ส่ง Prompt ไปยัง OpenRouter และนำคำตอบมาผ่าน Parser
 * - มี Timeout กันค้าง
 * - แปลงรหัส Error ทุกกรณีเป็นข้อความภาษาไทยที่ผู้ใช้เข้าใจ
 * - แสดง error detail จาก OpenRouter เพื่อช่วย debug
 * ⚠️ ห้าม import ไฟล์นี้ใน Client Component เด็ดขาด
 *    (เพราะมีการอ่าน process.env.OPENROUTER_API_KEY)
 * ================================================================
 */
import { APP_NAME, APP_URL, DEFAULT_MODEL_ID, FALLBACK_MODELS, REQUEST_TIMEOUT_MS } from "@/lib/config";
import { parseKeywordResponse } from "@/lib/parser";
import { buildKeywordPrompt } from "@/lib/prompts";
import type { KeywordItem, SearchSettings } from "@/types/seo";

/** ที่อยู่ API ของ OpenRouter */
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Error แบบกำหนดเอง พร้อมรหัสสถานะ HTTP (ถ้ามี) */
export class OpenRouterError extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "OpenRouterError";
    this.status = status;
  }
}

/** รูปร่างขั้นต่ำของคำตอบจาก OpenRouter ที่เราใช้ */
interface OpenRouterResponse {
  choices?: { message?: { content?: string } }[];
}

/**
 * mapStatusToError — แปลงรหัสผิดพลาดจาก OpenRouter เป็นภาษาไทย
 * @param status รหัส HTTP เช่น 401, 429
 */
function mapStatusToError(status: number): OpenRouterError {
  switch (status) {
    case 401:
      return new OpenRouterError(
        "API Key ไม่ถูกต้องหรือหมดอายุ — ตรวจสอบค่า OPENROUTER_API_KEY ใน .env.local",
        401
      );
    case 402:
      return new OpenRouterError(
        "โมเดลนี้ต้องใช้เครดิต — ลองเปลี่ยนไปใช้โมเดลที่ลงท้ายด้วย :free ตัวอื่น",
        402
      );
    case 404:
      return new OpenRouterError(
        "ไม่พบโมเดลที่เลือก — โมเดลฟรีอาจถูกถอดออกชั่วคราว ลองเปลี่ยนตัวอื่น",
        404
      );
    case 429:
      return new OpenRouterError(
        "ถูกจำกัดจำนวนคำขอชั่วคราว (Rate Limit) — รอสักครู่แล้วลองใหม่",
        429
      );
    default:
      return new OpenRouterError(`OpenRouter ตอบกลับผิดพลาด (รหัส ${status})`, status);
  }
}

/**
 * generateKeywords — หัวใจของแอป: เรียก AI แล้วคืนลิสต์คีย์เวิร์ดที่สะอาด
 * @param seed     คำที่ผู้ใช้พิมพ์
 * @param settings การตั้งค่า (โมเดล/จำนวน/ภาษา/โหมด)
 * @returns KeywordItem[] พร้อมใช้งานทันที
 */
export async function generateKeywords(
  seed: string,
  settings: SearchSettings
): Promise<KeywordItem[]> {
  /* ---- ตรวจความพร้อมของ API Key ก่อนเสมอ ---- */
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError(
      "ยังไม่ได้ตั้งค่า OPENROUTER_API_KEY — เพิ่มในไฟล์ .env.local แล้วรีสตาร์ทเซิร์ฟเวอร์"
    );
  }

  /* ---- เลือกโมเดล: จาก UI > จาก .env > ค่าเริ่มต้น > fallback ---- */
  const model =
    settings.model || process.env.NEXT_PUBLIC_OPENROUTER_MODEL || FALLBACK_MODELS[0]?.id || "";

  /* ---- เรียก API พร้อม Timeout ---- */
  let res: Response;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        /* 2 หัวด้านล่างนี้ OpenRouter แนะนำให้ใส่ เพื่อแสดงชื่อแอปเราใน Dashboard */
        "HTTP-Referer": APP_URL,
        "X-Title": APP_NAME,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7, // ความสร้างสรรค์กำลังดี สำหรับงาน keyword
        max_tokens: 2048, // เหลือเฟือสำหรับ 50 คีย์เวิร์ด
        messages: [{ role: "user", content: buildKeywordPrompt(seed, settings) }],
      }),
    });
  } catch (err) {
    // แยกกรณี "หมดเวลา" ออกจาก "เน็ตหลุด"
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new OpenRouterError(
        "AI ตอบกลับช้าเกินกำหนด (60 วินาที) — ลองใหม่อีกครั้งหรือเปลี่ยนโมเดล"
      );
    }
    throw new OpenRouterError(
      "ไม่สามารถเชื่อมต่อ OpenRouter ได้ — กรุณาตรวจสอบอินเทอร์เน็ตของคุณ"
    );
  }

  /* ---- แปลง Error ทุกกรณีให้เป็นภาษาไทย ---- */
  if (!res.ok) {
    /* 🐞 อ่าน error body จาก OpenRouter เพื่อดูสาเหตุที่แท้จริง */
    let errorDetail = "";
    try {
      const errData = (await res.json()) as { error?: { message?: string } | string };
      if (typeof errData.error === "string") {
        errorDetail = errData.error;
      } else if (errData.error?.message) {
        errorDetail = errData.error.message;
      }
    } catch {
      /* ถ้าอ่าน body ไม่ได้ ก็ไม่เป็นไร */
    }

    const baseErr = mapStatusToError(res.status);

    /* 🐞 Log error detail ฝั่ง server (สำหรับ debug) */
    console.error(`[OpenRouter] ${res.status} Error:`, {
      model,
      status: res.status,
      detail: errorDetail || "(no detail)",
    });

    /* ถ้าเป็น 400 หรือ 404 และมีรายละเอียดจาก OpenRouter ให้ต่อท้าย */
    if ((res.status === 400 || res.status === 404) && errorDetail) {
      throw new OpenRouterError(
        `${baseErr.message} | รายละเอียดจาก OpenRouter: ${errorDetail}`,
        res.status
      );
    }

    throw baseErr;
  }

  /* ---- ดึงเนื้อหาคำตอบ ---- */
  const data = (await res.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new OpenRouterError("AI ไม่ส่งข้อมูลกลับมา — ลองค้นหาใหม่อีกครั้ง");
  }

  /* 🐞 Log raw response (สำหรับ debug) */
  console.log(`[OpenRouter] Raw response from ${model} (first 300 chars):`, content.slice(0, 300));

  /* ---- ผ่านด่านตรวจความสะอาด ก่อนคืนผล ---- */
  return parseKeywordResponse(content, settings.count);

}