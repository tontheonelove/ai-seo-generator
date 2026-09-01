"use client";

/**
 * ================================================================
 * ScrollToTop — ปุ่มเลื่อนขึ้นบนสุดของหน้า (Floating Action Button)
 * ----------------------------------------------------------------
 * Features:
 * - แสดงเฉพาะตอนที่ scroll ลงไปเกิน 400px
 * - มี animation fade-in/fade-out
 * - ใช้ smooth scroll
 * - มี pulse glow effect
 * ================================================================
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
  const [show, setShow] = useState(false);

  /* ---- ติดตามการ scroll ---- */
  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 400);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---- เลื่อนขึ้นบนสุดแบบ smooth ---- */
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={handleClick}
            size="icon"
            className="relative size-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60"
            aria-label="เลื่อนขึ้นบนสุด"
          >
            {/* Pulse glow */}
            <span className="absolute inset-0 animate-pulse-glow rounded-full bg-emerald-400/30 blur-md" />
            
            {/* ไอคอน */}
            <ArrowUp className="relative size-5 text-white" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}