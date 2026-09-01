/**
 * ================================================================
 * BackgroundFX — ชั้นพื้นหลังของทั้งแอป (ตรึงนิ่ง ไม่เลื่อนตามจอ)
 * ----------------------------------------------------------------
 * ประกอบด้วย:
 * 1) ลายกริดจาง ๆ (คลาส .bg-grid)
 * 2) ก้อนแสง 3 สี (เขียว/ฟ้า/ม่วง) เบลอจัด + ลอยไปมาช้า ๆ
 * ⚠️ pointer-events-none = คลิกทะลุได้ ไม่ขวางปุ่มใด ๆ ทั้งสิ้น
 * ================================================================
 */
export function BackgroundFX() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* ลายกริดพื้นหลัง */}
      <div className="bg-grid absolute inset-0" />

      {/* ก้อนแสงสีเขียว (บนซ้าย) */}
      <div className="animate-float absolute -top-40 left-1/4 size-[500px] rounded-full bg-emerald-500/20 blur-[130px]" />

      {/* ก้อนแสงสีฟ้า (ขวา) */}
      <div className="animate-float-slow absolute top-1/3 -right-40 size-[450px] rounded-full bg-cyan-500/15 blur-[130px]" />

      {/* ก้อนแสงสีม่วง (ล่าง) */}
      <div className="animate-pulse-glow absolute -bottom-40 left-1/3 size-[400px] rounded-full bg-violet-500/15 blur-[130px]" />
    </div>
  );
}