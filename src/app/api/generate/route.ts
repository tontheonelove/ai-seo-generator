/**
 * ================================================================
 * API Route: /api/generate
 * ----------------------------------------------------------------
 * POST — รับ toolType + input → สร้างผลลัพธ์ด้วย AI
 *
 * toolType:
 * - "keyword"     → seed, settings (เหมือน /api/keywords เดิม)
 * - "title"       → keyword, language
 * - "description" → input, language
 *
 * 🛡️ Validate ด้วย zod ทุกกรณี
 * ================================================================
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_SETTINGS } from "@/lib/config";
import {
  generateKeywords,
  generateTitles,
  generateDescription,
  OpenRouterError,
} from "@/lib/generators";
import { KeywordParseError } from "@/lib/parser";

/* ================================================================
 * Schemas สำหรับแต่ละ toolType
 * ================================================================ */

const keywordRequestSchema = z.object({
  toolType: z.literal("keyword"),
  seed: z.string().trim().min(1).max(100),
  settings: z
    .object({
      model: z.string().min(1).max(200),
      count: z.number().int().min(1).max(100),
      language: z.enum(["auto", "en", "th"]),
      mode: z.enum(["general", "longtail", "questions", "commercial"]),
    })
    .optional(),
});

const titleRequestSchema = z.object({
  toolType: z.literal("title"),
  keyword: z.string().trim().min(1).max(100),
  model: z.string().min(1).max(200).optional(),
  language: z.enum(["auto", "en", "th"]).default("auto"),
});

const descriptionRequestSchema = z.object({
  toolType: z.literal("description"),
  input: z.string().trim().min(1).max(500),
  model: z.string().min(1).max(200).optional(),
  language: z.enum(["auto", "en", "th"]).default("auto"),
});

/* ================================================================
 * Health check
 * ================================================================ */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "Ai Content Tools Generator",
    hasKey: Boolean(process.env.OPENROUTER_API_KEY),
    tools: ["keyword", "title", "description"],
  });
}

/* ================================================================
 * Main handler
 * ================================================================ */
export async function POST(req: Request) {
  /* ---- ด่านที่ 1: อ่าน JSON ---- */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "ข้อมูลไม่ถูกต้อง (ต้องเป็น JSON)" },
      { status: 400 }
    );
  }

  /* ---- ด่านที่ 2: ตรวจสอบ toolType ---- */
  const rawBody = body as { toolType?: string };
  const toolType = rawBody?.toolType;

  if (!toolType) {
    return NextResponse.json(
      { error: "ต้องระบุ toolType (keyword/title/description)" },
      { status: 400 }
    );
  }

  try {
    /* ---- keyword ---- */
    if (toolType === "keyword") {
      const parsed = keywordRequestSchema.parse(body);
      const finalSettings = { ...DEFAULT_SETTINGS, ...parsed.settings };
      const keywords = await generateKeywords(parsed.seed, finalSettings);
      return NextResponse.json({ keywords });
    }

    /* ---- title ---- */
    if (toolType === "title") {
      const parsed = titleRequestSchema.parse(body);
      const titles = await generateTitles(
        parsed.keyword,
        parsed.model,
        parsed.language
      );
      return NextResponse.json({ titles });
    }

    /* ---- description ---- */
    if (toolType === "description") {
      const parsed = descriptionRequestSchema.parse(body);
      const description = await generateDescription(
        parsed.input,
        parsed.model,
        parsed.language
      );
      return NextResponse.json({ description });
    }

    /* ---- toolType ไม่รู้จัก ---- */
    return NextResponse.json(
      { error: `toolType "${toolType}" ไม่รองรับ` },
      { status: 400 }
    );
  } catch (err) {
    /* ---- Zod validation error ---- */
    if (err instanceof z.ZodError) {
      const isDev = process.env.NODE_ENV !== "production";
      const firstIssue = err.issues[0];
      return NextResponse.json(
        isDev
          ? {
              error: firstIssue?.message || "ข้อมูลไม่ถูกต้อง",
              path: firstIssue?.path,
              code: firstIssue?.code,
            }
          : { error: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    /* ---- OpenRouter error ---- */
    if (err instanceof OpenRouterError) {
      const status =
        err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
      return NextResponse.json({ error: err.message }, { status });
    }

    /* ---- Parser error ---- */
    if (err instanceof KeywordParseError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }

    /* ---- Unexpected ---- */
    console.error("[/api/generate] Unexpected error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}