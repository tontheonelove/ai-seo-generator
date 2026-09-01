/**
 * ================================================================
 * SEO EZ — Types กลางของทั้งแอป
 * ----------------------------------------------------------------
 * 📌 ทุกไฟล์ต้องใช้ Types จากที่นี่เท่านั้น ห้ามประกาศซ้ำที่อื่น
 * เพื่อให้ง่ายต่อการแก้ไขในอนาคต (แก้ที่เดียว = อัปเดตทั้งระบบ)
 * ================================================================
 */

/** โหมดการค้นหา — กำหนด "แนว" ของคีย์เวิร์ดที่ AI จะสร้าง */
export type SearchMode = "general" | "longtail" | "questions" | "commercial";

/** ภาษาของผลลัพธ์ — auto = ตามภาษาที่ผู้ใช้พิมพ์ */
export type KeywordLanguage = "auto" | "en" | "th";

/** คีย์เวิร์ด 1 รายการ พร้อมคะแนนศักยภาพ (0–100) ที่ AI ประเมินให้ */
export interface KeywordItem {
  keyword: string;
  score: number;
}

/** การตั้งค่าการค้นหาที่ผู้ใช้เลือกจากหน้าเว็บ */
export interface SearchSettings {
  /** ชื่อโมเดล OpenRouter เช่น deepseek/deepseek-v3.1:free */
  model: string;
  /** จำนวนคีย์เวิร์ดที่ต้องการ (10/20/30/50) */
  count: number;
  /** ภาษาของผลลัพธ์ */
  language: KeywordLanguage;
  /** โหมดการค้นหา */
  mode: SearchMode;
}

/** 1 รายการในประวัติการค้นหา */
export interface HistoryEntry {
  id: string;
  /** คำที่ผู้ใช้พิมพ์ */
  seed: string;
  keywords: KeywordItem[];
  /** เวลาที่ค้นหา (Unix ms) */
  createdAt: number;
}

/** คีย์เวิร์ดที่ผู้ใช้กดถูกใจ (ดาว) เก็บไว้ */
export interface FavoriteItem {
  keyword: string;
  /** มาจากการค้นหาคำใด */
  seed: string;
  savedAt: number;
}

/** สถิติการใช้งานสะสมของแอป */
export interface AppStats {
  /** จำนวนครั้งที่ค้นหาสำเร็จ */
  searches: number;
  /** จำนวนคีย์เวิร์ดที่ AI สร้างให้ทั้งหมด */
  keywordsGenerated: number;
  /** จำนวนครั้งที่ผู้ใช้คัดลอก */
  copied: number;
}