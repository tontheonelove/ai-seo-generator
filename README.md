# ⚡ SEO EZ — AI Keyword Research Dashboard

<p align="center">
  <b>ค้นหาคีย์เวิร์ดคุณภาพสำหรับ SEO ในวินาทีเดียว ด้วยพลัง AI</b>
  <br />
  <i>พิมพ์คำเดียว ได้ชุดคีย์เวิร์ดพร้อมคะแนนศักยภาพ เรียงจากดีที่สุด</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-latest-black" />
  <img src="https://img.shields.io/badge/OpenRouter-AI-10b981" />
</p>


<img src=ex.png>


---

## ✨ Features

### 🔍 Core
- **Smart Search** — พิมพ์คำค้นเดียว ได้คีย์เวิร์ดคุณภาพ 10-50 คำ เรียงตาม score (0-100)
- **Multi-Model AI** — เลือกโมเดลฟรีได้หลายตัว (DeepSeek, Qwen3, Llama, Mistral, Gemma...)
- **Auto Language** — พิมพ์ไทยได้ไทย พิมพ์อังกฤษได้อังกฤษ อัตโนมัติ
- **Search Modes** — 4 โหมด: ทั่วไป / Long-tail / คำถาม / เชิงพาณิชย์

### 🎯 Productivity
- **Click-to-Copy** — คลิกที่ chip เพื่อคัดลอกทันที
- **Copy All** — คัดลอกทั้งหมดในคลิกเดียว
- **Export** — ดาวน์โหลดเป็น TXT / CSV (รองรับ Excel ภาษาไทย) / JSON
- **Favorites ⭐** — บันทึกคีย์เวิร์ดที่ถูกใจไว้ใช้ภายหลัง
- **History** — ประวัติการค้นหาย้อนหลัง 50 รายการ
- **Stats** — สถิติการใช้งาน (ค้นหา/สร้าง/คัดลอก)

### 🎨 Design
- **Dark/Light Theme** — สลับได้ทันที (ค่าเริ่มต้น = Dark)
- **Glassmorphism UI** — การ์ดกระจก + Gradient + Floating Glow Blobs
- **Smooth Animations** — chip เด้ง, hover lift, scroll reveal
- **Responsive** — ใช้งานได้ลื่นทุกหน้าจอ (Mobile → Desktop)
- **Keyboard Shortcut** — กด `/` เพื่อ focus ช่องค้นหา

### 🛡️ Quality
- **Type-Safe** — TypeScript + Zod validation ทุกชั้น
- **Error Boundary** — กันแอปพังทั้งหน้า
- **Smart Parser** — AI ตอบผิดรูปแบบก็กู้ข้อมูลออกมาได้
- **Secure** — API Key อยู่ฝั่ง server เท่านั้น ไม่เคยรั่ว

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/tontheonelove/ai-seo-generator.git
cd ai-seo-generator
npm install

```
---

### 2. ตั้งค่า Environment

คัดลอก .env.example เป็น .env.local:

```
cp .env.example .env.local
```

แก้ไข .env.local:

```
# คีย์จาก https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# โมเดลเริ่มต้น (ต้องลงท้ายด้วย :free)
OPENROUTER_MODEL=qwen/qwen3-235b-a22b:free
```
Run Development Server

```
npm run dev
```

เปิด Browser
```
http://localhost:3000
```

---

1. Push repo ขึ้น GitHub
2. ไปที่ vercel.com/new → Import Git Repository
3. เลือก repository seo-ez
4. เพิ่ม Environment Variables:
5. OPENROUTER_API_KEY = คีย์จาก OpenRouter
6. OPENROUTER_MODEL = โมเดลที่ต้องการใช้ (เช่น qwen/qwen3-235b-a22b:free)
7. กด Deploy ⚡
---


📄 License
MIT
<p align="center">
Made with ⚡ by <b>Ton Like IT</b>
</p>