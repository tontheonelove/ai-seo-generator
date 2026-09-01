/**
 * ================================================================
 * useLocalStorage — Hook สำหรับบันทึก/โหลดข้อมูลจาก localStorage
 * (เวอร์ชันแก้ Hydration Mismatch)
 * ----------------------------------------------------------------
 * 🛡️ หลักการทำงาน:
 * - ตอน SSR: คืนค่า `initial` เสมอ (ไม่วิ่งไปอ่าน localStorage)
 * - หลัง mount บน Client: ค่อยอ่านจาก localStorage แล้วอัปเดต state
 * - ทุกครั้งที่ state เปลี่ยน: บันทึกกลับลง localStorage
 *
 * ทำไมต้องทำแบบนี้?
 * - Server ไม่มี `window.localStorage` (ใช้ไม่ได้)
 * - ถ้าอ่านตอน SSR → SSR กับ Client จะเห็นค่าไม่ตรง → Hydration Error
 * - ใช้ `mounted` state เป็น flag ว่า "พร้อมอ่านจาก localStorage แล้ว"
 * ================================================================
 */
import { useCallback, useEffect, useState } from "react";

/**
 * useLocalStorage — สร้าง state ที่ซิงค์กับ localStorage โดยไม่พัง SSR
 * @param key     ชื่อ key ใน localStorage (เช่น "seo-ez-history")
 * @param initial ค่าเริ่มต้นสำหรับ SSR และกรณีที่ไม่มีข้อมูล
 * @returns [value, setValue] เหมือน useState ทั่วไป
 */
export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (value: T | ((prev: T) => T)) => void] {
  /* ---- State หลัก ใช้ค่า initial ก่อนเสมอ (ป้องกัน SSR mismatch) ---- */
  const [state, setState] = useState<T>(initial);

  /* ---- Flag บอกว่า component ถูก mount บน client แล้วหรือยัง ---- */
  const [mounted, setMounted] = useState(false);

  /* ---- หลัง mount: ค่อยอ่านจาก localStorage ครั้งแรก ---- */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setState(JSON.parse(raw) as T);
      }
    } catch (err) {
      console.error(
        `[useLocalStorage] ไม่สามารถอ่าน key "${key}" จาก localStorage:`,
        err
      );
    }
    setMounted(true);
  }, [key]);

  /* ---- ห่อ setState เพื่อบันทึกลง localStorage ทุกครั้งที่เปลี่ยน ---- */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof value === "function"
            ? (value as (prev: T) => T)(prev)
            : value;

        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch (err) {
          console.error(
            `[useLocalStorage] ไม่สามารถบันทึก key "${key}":`,
            err
          );
        }

        return next;
      });
    },
    [key]
  );

  /*
   * ⚠️ คืนค่า `initial` แทน `state` ก่อน mount เพื่อป้องกัน hydration mismatch
   * หลัง mounted แล้ว ค่อยคืน state จริงที่อ่านจาก localStorage
   */
  return [mounted ? state : initial, setValue];
}