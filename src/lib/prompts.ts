/**
 * ================================================================
 * Ai Content Tools Generator — Prompt Engineering
 * ----------------------------------------------------------------
 * 3 prompt builders:
 * 1. buildKeywordPrompt — สำหรับ Keyword Generator
 * 2. buildTitlePrompt — สำหรับ Title Generator (5 titles)
 * 3. buildDescriptionPrompt — สำหรับ Description Generator (แบบยาว)
 *
 * 📌 ทุก prompt บังคับ AI ตอบเป็น VALID JSON เท่านั้น
 * 📌 Description เป็นแบบยาว (Long-form) สำหรับ YouTube / Facebook
 * ================================================================
 */
import type { KeywordLanguage, SearchSettings } from "@/types/seo";

/**
 * ================================================================
 * buildKeywordPrompt — สร้าง Prompt สำหรับ Keyword Generator
 * ----------------------------------------------------------------
 * @param seed     คำที่ผู้ใช้พิมพ์
 * @param settings การตั้งค่า (count/language/mode)
 * ================================================================
 */
export function buildKeywordPrompt(
  seed: string,
  settings: SearchSettings
): string {
  const { count, language, mode } = settings;

  const langInstruction =
    language === "th"
      ? "Generate ALL keywords in Thai."
      : language === "en"
      ? "Generate ALL keywords in English."
      : "Detect the language of the seed keyword and generate keywords in that same language (Thai seed → Thai keywords, English seed → English keywords).";

  const modeInstruction =
    mode === "longtail"
      ? "Focus on LONG-TAIL keywords: 3+ words, very specific, low competition, high conversion intent."
      : mode === "questions"
      ? "Focus on QUESTION-based keywords: start with how, what, why, where, when, which, can, is, are (or Thai equivalents เช่น วิธี, ทำไม, อะไร, ที่ไหน)."
      : mode === "commercial"
      ? "Focus on COMMERCIAL / buying-intent keywords: include words like best, buy, price, review, cheap, vs, deal, ราคา, รีวิว, ซื้อ, แนะนำ."
      : "Generate a DIVERSIFIED mix: short-tail, long-tail, questions, and commercial keywords.";

  return `You are an elite SEO keyword research specialist with deep knowledge of search intent and Google autocomplete behavior.

TASK: Generate exactly ${count} high-quality SEO keywords for the seed topic: "${seed}".

RULES:
1. ${langInstruction}
2. ${modeInstruction}
3. Every keyword must be realistic — something real people would type into Google.
4. No duplicates, no generic single words, no hashtags, no brand names unrelated to the seed.
5. Assign each keyword a potential score from 1-100 based on search volume × relevance × ranking feasibility (100 = best opportunity).
6. Sort by score, highest first.
7. RESPOND WITH ONLY A VALID JSON OBJECT. No markdown, no code fences, no explanations.

EXACT RESPONSE FORMAT (example only, do not copy these values):
{"keywords":[{"keyword":"bitcoin price","score":99},{"keyword":"how to buy bitcoin","score":95}]}`;
}

/**
 * ================================================================
 * buildTitlePrompt — สร้าง Prompt สำหรับ Title Generator
 * ----------------------------------------------------------------
 * บังคับ AI ตอบ JSON ที่มี titles 5 รายการ (title + score + reason)
 * ================================================================
 */
export function buildTitlePrompt(
  keyword: string,
  language: KeywordLanguage
): string {
  const langInstruction =
    language === "th"
      ? "Write ALL titles in Thai."
      : language === "en"
      ? "Write ALL titles in English."
      : "Match the language of the keyword (Thai keyword → Thai titles, English keyword → English titles).";

  return `You are an elite SEO copywriter with 15+ years of experience crafting high-CTR titles.

TASK: Generate exactly 5 distinct, click-worthy SEO titles for the keyword: "${keyword}".

RULES:
1. Each title MUST include the exact keyword "${keyword}" naturally.
2. Length MUST be between 45-60 characters (optimal for Google SERP).
3. Use power words (Best, Ultimate, Guide, Proven, Secret, 2026, Top 10, etc.).
4. Each title must be unique in angle (how-to, listicle, question, comparison, news).
5. ${langInstruction}
6. Avoid clickbait — titles must match real user intent.
7. Give each title an SEO score from 1-100 (100 = highest CTR potential).
8. Provide a SHORT reason (max 80 chars) explaining why this title works.
9. Sort by score, highest first.
10. RESPOND WITH ONLY A VALID JSON OBJECT. No markdown, no code fences, no explanations.

EXACT RESPONSE FORMAT (example only, do not copy these values):
{"titles":[{"title":"Best Bitcoin Wallet 2026: Complete Guide","score":96,"reason":"Has year, power word, clear intent"},{"title":"How to Choose a Bitcoin Wallet in 5 Minutes","score":92,"reason":"How-to format, specific promise"}]}`;
}

/**
 * ================================================================
 * buildDescriptionPrompt — สร้าง Prompt สำหรับ Description Generator
 * ----------------------------------------------------------------
 * 🎬 แบบยาว (Long-form) สำหรับ YouTube / Facebook / Social
 * โครงสร้าง: Hook → Intro → Bullets → CTA → Hashtags
 * ความยาว: 400-1200 ตัวอักษร
 * ================================================================
 */
export function buildDescriptionPrompt(
  input: string,
  language: KeywordLanguage
): string {
  const langInstruction =
    language === "th"
      ? "Write the description in Thai."
      : language === "en"
      ? "Write the description in English."
      : "Match the language of the input (Thai input → Thai description, English input → English description).";

  return `You are a professional content writer creating engaging long-form descriptions for YouTube videos, Facebook posts, and social media content.

TASK: Write ONE compelling long-form description for the following title/content:
"${input}"

STRUCTURE (follow this order exactly):
1. HOOK: 1 catchy opening line with 1-2 relevant emojis.
2. INTRO: 2-3 sentences explaining what this content is about and why it matters.
3. WHAT YOU WILL GET: 4-6 bullet points starting with ✅ describing what the audience will learn or receive.
4. CTA: 1 strong call-to-action line (e.g., "กดติดตามเพื่อไม่พลาดคลิปใหม่", "Subscribe for more", "แชร์ให้เพื่อนของคุณ").
5. HASHTAGS: 4-6 relevant hashtags on the last line (e.g., #ComfyUI #AIart).

RULES:
1. Total length should be between 400 and 1500 characters. Include ALL useful details — never truncate or omit information to save space.
2. Use real line breaks between sections — the output will be displayed as multiline text.
3. ${langInstruction}
4. Use emojis naturally but not excessively (max 8 total).
5. Hashtags must be relevant to the topic and written without spaces.
6. RESPOND WITH ONLY A VALID JSON OBJECT. No markdown code fences, no explanations outside the JSON.

EXACT RESPONSE FORMAT (example only, do not copy these values):
{"description":"🎨 ComfyUI 2026 ฉบับเริ่มต้น!\\n\\nคลิปนี้พาคุณเรียนรู้การสร้างสรรค์ภาพ AI ตั้งแต่ติดตั้งจนถึงใช้งานจริง แม้ไม่เคยทำมาก่อน\\n\\nสิ่งที่คุณจะได้เรียนรู้:\\n✅ การติดตั้งเวอร์ชันล่าสุด\\n✅ Workflow พื้นฐานสำหรับมือใหม่\\n✅ เทคนิคขั้นสูงที่มือโปรใช้\\n\\nอย่าลืมกดติดตามเพื่อไม่พลาดคลิปใหม่!\\n\\n#ComfyUI #AIart #สอนAI","charCount":320,"highlights":["strong hook","clear bullet points","CTA included","relevant hashtags"]}`;
}