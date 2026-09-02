# ⚡ ACT — Ai Content Tools Generator

<p align="center">
  <b>ชุดเครื่องมือ AI สำหรับสร้างคีย์เวิร์ด, ชื่อเรื่อง, และคำอธิบาย Meta Description</b>
  <br />
  <i>พิมพ์คำเดียว ได้ผลลัพธ์คุณภาพสูงพร้อมใช้งานทันที</i>
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

### 🔍 1. Keyword Generator
- พิมพ์คำค้นเดียว ได้คีย์เวิร์ดคุณภาพ 10-50 คำ เรียงตาม score (0-100)
- 4 โหมด: ทั่วไป / Long-tail / คำถาม / เชิงพาณิชย์
- เลือกโมเดล AI ได้เองจาก Dropdown
- Click-to-Copy, Copy All, Export (TXT/CSV/JSON)
- Favorites ⭐ + History + Stats

### 📝 2. Title Generator
- สร้าง 5 Titles คุณภาพสูงเรียงตามคะแนน CTR
- พร้อมเหตุผลสั้น ๆ ว่าทำไมแต่ละ Title ถึงดี
- ใช้ MiniMax M3 (Fixed) — เก่งเรื่องภาษาทั้งไทย/อังกฤษ

### 🎬 3. Description Generator
- สร้าง Description แบบยาวครบชุดสำหรับ YouTube / Facebook
- โครงสร้าง: Hook → Intro → ✅ Bullets → CTA → #Hashtags
- แสดงจำนวนตัวอักษร + จำนวนบรรทัด (แสดงตามจริง ไม่ตัดข้อความ)

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
OPENROUTER_MODEL=minimax/minimax-m3:free
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

## 🚢 Deploy แบบไม่มี GitHub (ใช้ Vercel CLI)

1. สมัคร [vercel.com](https://vercel.com) ด้วย **Email** (ฟรี)
2. ติดตั้ง CLI: `npm install -g vercel`
3. Login: `vercel login` → เลือก Email
4. ในโฟลเดอร์โปรเจกต์: `vercel` (ตอบคำถามตามปกติ)
5. เพิ่ม env vars:
   ```bash
   vercel env add OPENROUTER_API_KEY
   vercel env add NEXT_PUBLIC_OPENROUTER_MODELS
   vercel env add NEXT_PUBLIC_OPENROUTER_MODEL
   ```
6. Deploy: `vercel --prod`

---

1. Push repo ขึ้น GitHub

2. ไปที่ vercel.com/new → Import Git Repository

3. เลือก repository Ai Content Tools Generator

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