import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { BackgroundFX } from "@/components/layout/background-fx";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import "./globals.css";

/**
 * ================================================================
 * RootLayout — โครงหน้ารวมของทั้งแอป
 * ----------------------------------------------------------------
 * 📌 ไม่มี Header แล้ว — โลโก้อยู่ใน Sidebar
 * 📌 Theme Toggle เป็นปุ่มลอยมุมขวาบน (ใช้ได้ทุกหน้าจอ)
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
            {/* 🌙 Floating Theme Toggle (มุมขวาบน — ทุกหน้าจอ) */}
            <div className="fixed right-4 top-4 z-50 rounded-full border border-border/50 bg-background/80 shadow-lg backdrop-blur-xl">
              <ThemeToggle />
            </div>

            {/* Content Area: Sidebar + Main */}
            <div className="flex flex-1">
              {/* Sidebar (เฉพาะ Desktop ≥ lg) */}
              <aside className="hidden w-60 shrink-0 lg:block">
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