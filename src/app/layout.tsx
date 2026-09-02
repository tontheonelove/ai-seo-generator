import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { BackgroundFX } from "@/components/layout/background-fx";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import "./globals.css";

/**
 * ================================================================
 * RootLayout — โครงหน้ารวมของทั้งแอป (ทุกหน้าต้องผ่านไฟล์นี้)
 * ----------------------------------------------------------------
 * 📌 ใช้ ThemeProvider ค่าเริ่มต้น = โหมดมืด
 * 📌 มี Sidebar ด้านซ้าย (Desktop) + Bottom Nav (Mobile)
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

/**
 * 📌 Metadata = SEO ของตัวแอปเอง
 */
export const metadata: Metadata = {
  title: {
    default: "Ai Content Tools Generator",
    template: "%s | ACT",
  },
  description:
    "เครื่องมือสร้างเนื้อหา SEO ด้วย AI: ค้นหาคีย์เวิร์ด, สร้าง Title & Description คุณภาพสูง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Background FX */}
          <BackgroundFX />

          {/* Main Layout */}
          <div className="relative z-10 flex min-h-screen flex-col">
            {/* Header อยู่ด้านบนสุด */}
            <Header />

            {/* Content Area: Sidebar + Main */}
            <div className="flex flex-1">
              {/* Sidebar (สำหรับ Desktop ≥ lg) */}
              <aside className="hidden lg:block w-60 shrink-0">
                <Sidebar />
              </aside>

              {/* Main Content (pb-14 เว้นที่ให้ Bottom Nav บนมือถือ) */}
              <div className="flex flex-1 flex-col pb-14 lg:pb-0">
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </div>

            {/* 📱 Bottom Navigation สำหรับมือถือ */}
            <MobileNav />
          </div>

          {/* Toaster */}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}