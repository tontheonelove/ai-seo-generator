import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { BackgroundFX } from "@/components/layout/background-fx";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/**
 * ================================================================
 * RootLayout — โครงหน้ารวมของทั้งแอป (ทุกหน้าต้องผ่านไฟล์นี้)
 * ----------------------------------------------------------------
 * - ฟอนต์: Geist (ไม่มีหัว อ่านง่าย สไตล์โมเดิร์น)
 * - ธีม: ครอบด้วย ThemeProvider ค่าเริ่มต้น = โหมดมืด
 * - พื้นหลัง: แสงลอย + กริด จาก BackgroundFX
 * - Toaster: จุดแจ้งเตือน (Toast) ของทั้งแอป (เช่น "คัดลอกแล้ว ✅")
 * ================================================================
 */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* 📌 Metadata = SEO ของตัวแอปเอง ( ironically ต้องเป๊ะ! 😄 ) */
export const metadata: Metadata = {
  title: {
    default: "SEO EZ — AI Keyword Research Dashboard",
    template: "%s | SEO EZ",
  },
  description:
    "ค้นหาคีย์เวิร์ดคุณภาพสำหรับ SEO ในวินาทีเดียว ด้วยพลัง AI ผ่าน OpenRouter พร้อมคัดลอกได้ทันที",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* suppressHydrationWarning = จำเป็น! เพราะ next-themes
       จะแทรก class dark/light ตอนโหลด ซึ่งอาจไม่ตรงกับฝั่ง Server */
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* ชั้นพื้นหลัง (ตรึงนิ่ง) */}
          <BackgroundFX />

          {/* เนื้อหาหลักของแอป (ให้อยู่เหนือชั้นพื้นหลังเสมอด้วย z-10) */}
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>

          {/* จุดแจ้งเตือนทั้งแอป: แสดงด้านบนกลางจอ, มีสีตามสถานะ */}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}