/**
 * ================================================================
 * Ai Content Tools Generator — Generators (หัวใจของเครื่องมือทั้งหมด)
 * ----------------------------------------------------------------
 * 3 generator functions:
 * 1. generateKeywords — คีย์เวิร์ด (ใช้ model ที่ผู้ใช้เลือก)
 * 2. generateTitles — 5 Titles พร้อม score (ใช้ MiniMax M3 แบบ Fixed)
 * 3. generateDescription — 1 Description (ใช้ MiniMax M3 แบบ Fixed)
 *
 * 📌 Model Allocation:
 * - Keyword: ผู้ใช้เลือกได้จาก dropdown (default จาก .env)
 * - Title/Description: ใช้ minimax/minimax-m3:free เสมอ (เหมาะสำหรับงาน content)
 * ================================================================
 */
import {
  APP_NAME,
  APP_URL,
  FALLBACK_MODELS,
  REQUEST_TIMEOUT_MS,
} from "@/lib/config";
import {
  parseKeywordResponse,
  parseTitleResponse,
  parseDescriptionResponse,
} from "@/lib/parser";
import {
  buildKeywordPrompt,
  buildTitlePrompt,
  buildDescriptionPrompt,
} from "@/lib/prompts";
import type {
  KeywordItem,
  TitleItem,
  DescriptionItem,
  SearchSettings,
  KeywordLanguage,
} from "@/types/seo";

/** ที่อยู่ API ของ OpenRouter */
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * 📌 FIXED MODEL สำหรับ Content Tools (Title/Description)
 * ----------------------------------------------------------------
 * ใช้ minimax/minimax-m3:free เป็น default เพราะ:
 * - เก่งเรื่องการเรียบเรียงภาษาไทย/อังกฤษให้เป็นธรรมชาติ
 * - เหมาะกับงานเขียนที่ต้องการ "ความลื่นไหล" สูง
 * - ตอบสนอง CTA และ Power Words ได้ดี
 *
 * ⚠️ ถ้าต้องการเปลี่ยน model ให้แก้ที่ constant ด้านล่างที่เดียว
 */
const CONTENT_TOOLS_MODEL = "minimax/minimax-m3:free";

/**
 * ================================================================
 * Error Class + Types
 * ================================================================
 */

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
      return new OpenRouterError(
        `OpenRouter ตอบกลับผิดพลาด (รหัส ${status})`,
        status
      );
  }
}

/**
 * ================================================================
 * callOpenRouter — ฟังก์ชันกลางสำหรับเรียก OpenRouter
 * (ลด code ซ้ำซ้อนระหว่าง generators ทั้ง 3 ตัว)
 * ================================================================
 */
async function callOpenRouter(
  prompt: string,
  model: string
): Promise<string> {
  /* ---- ตรวจความพร้อมของ API Key ก่อนเสมอ ---- */
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError(
      "ยังไม่ได้ตั้งค่า OPENROUTER_API_KEY — เพิ่มในไฟล์ .env.local แล้วรีสตาร์ทเซิร์ฟเวอร์"
    );
  }

  /* ---- เรียก API พร้อม Timeout ---- */
  let res: Response;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL,
        "X-Title": APP_NAME,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
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
      const errData = (await res.json()) as {
        error?: { message?: string } | string;
      };
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
  console.log(
    `[OpenRouter] Response from ${model} (first 200 chars):`,
    content.slice(0, 200)
  );

  return content;
}

/**
 * ================================================================
 * 🔍 generateKeywords — สร้างคีย์เวิร์ดสำหรับ Keyword Generator
 * ----------------------------------------------------------------
 * ใช้ model ที่ผู้ใช้เลือกจาก UI (หรือ default จาก .env)
 * ================================================================
 */
export async function generateKeywords(
  seed: string,
  settings: SearchSettings
): Promise<KeywordItem[]> {
  /* เลือกโมเดล: จาก UI > จาก .env > ค่าเริ่มต้น (fallback) */
  const model =
    settings.model ||
    process.env.NEXT_PUBLIC_OPENROUTER_MODEL ||
    FALLBACK_MODELS[0]?.id ||
    "";

  const prompt = buildKeywordPrompt(seed, settings);
  const content = await callOpenRouter(prompt, model);
  return parseKeywordResponse(content, settings.count);
}

/**
 * ================================================================
 * 📝 generateTitles — สร้าง 5 Titles สำหรับ Title Generator
 * ----------------------------------------------------------------
 * ใช้ MiniMax M3 แบบ Fixed (เหมาะสำหรับงาน content)
 * @param keyword คำหลัก
 * @param model (optional) ถ้าระบุ → ใช้ตัวนี้แทน MiniMax M3
 * @param language ภาษาของผลลัพธ์
 * ================================================================
 */
export async function generateTitles(
  keyword: string,
  model?: string,
  language: KeywordLanguage = "auto"
): Promise<TitleItem[]> {
  const finalModel = model || CONTENT_TOOLS_MODEL;

  const prompt = buildTitlePrompt(keyword, language);
  const content = await callOpenRouter(prompt, finalModel);
  return parseTitleResponse(content, 5);
}

/**
 * ================================================================
 * 📄 generateDescription — สร้าง Description สำหรับ Description Generator
 * ----------------------------------------------------------------
 * ใช้ MiniMax M3 แบบ Fixed (เหมาะสำหรับงาน content)
 * @param input Title หรือเนื้อหาคร่าวๆ
 * @param model (optional) ถ้าระบุ → ใช้ตัวนี้แทน MiniMax M3
 * @param language ภาษาของผลลัพธ์
 * ================================================================
 */
export async function generateDescription(
  input: string,
  model?: string,
  language: KeywordLanguage = "auto"
): Promise<DescriptionItem> {
  const finalModel = model || CONTENT_TOOLS_MODEL;

  const prompt = buildDescriptionPrompt(input, language);
  const content = await callOpenRouter(prompt, finalModel);
  return parseDescriptionResponse(content);
}