/**
 * ================================================================
 * useClipboard — Hook สำหรับคัดลอกข้อความแบบปลอดภัย
 * ----------------------------------------------------------------
 * ทำไมต้องมี Hook นี้?
 * - API `navigator.clipboard.writeText()` ใช้ไม่ได้ทุกที่
 *   (เช่น บน HTTP, หรือเบราว์เซอร์เก่าบางตัว)
 * - Hook นี้มี Fallback: ถ้า clipboard API ใช้ไม่ได้ จะใช้วิธีเก่า
 *   (สร้าง textarea ชั่วคราว → select → execCommand)
 * - คืนค่า success/error เพื่อให้แสดง Toast ได้ถูกต้อง
 * ================================================================
 */
import { useCallback, useState } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  /**
   * copy — คัดลอกข้อความ + รีเซ็ตสถานะ copied หลังจาก 2 วินาที
   * @param text ข้อความที่ต้องการคัดลอก
   * @returns Promise<boolean> สำเร็จ true / ล้มเหลว false
   */
  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      /* วิธีที่ 1: ใช้ Clipboard API (ทันสมัย เร็ว ปลอดภัย) */
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        /* วิธีที่ 2: Fallback สำหรับ HTTP หรือเบราว์เซอร์เก่า */
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("[useClipboard] คัดลอกไม่สำเร็จ:", err);
      return false;
    }
  }, []);

  return { copied, copy };
}