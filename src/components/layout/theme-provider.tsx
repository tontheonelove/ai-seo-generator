"use client";

/**
 * ================================================================
 * ThemeProvider — ตัวครอบจัดการธีมสว่าง/มืด ของทั้งแอป
 * ----------------------------------------------------------------
 * หมายเหตุ: ต้องเป็น Client Component ("use client")
 * เพราะ next-themes ต้องอ่านค่าจากเบราว์เซอร์ (localStorage)
 * ================================================================
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}