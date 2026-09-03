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

## 🚢 Deploy to Vercel (ไม่ต้องมี GitHub ก็ทำได้)

### ขั้นที่ 1: Login Vercel บนหน้าเว็บ

- ไปที่ [vercel.com](https://vercel.com) → สมัครด้วย **Email** (ฟรี) หรือ login ให้เรียบร้อย

### ขั้นที่ 2: Login ผ่าน CLI

```bash
npx vercel login
```

ระบบจะเด้งไปหน้าเว็บ → กด **Allow** เพื่ออนุญาตการเชื่อมต่อ

### ขั้นที่ 3: สร้างโปรเจกต์ครั้งแรก

```bash
npx vercel
```

ตอบคำถามตามนี้:

| คำถาม | คำตอบ |
|-------|--------|
| Set up and deploy? | **Y** |
| Which scope? | เลือกบัญชีของคุณ |
| Link to existing project? | **N** |
| Project name? | กด Enter |
| Directory? | กด Enter |
| Override settings? | **N** |

### ขั้นที่ 4: เพิ่ม Environment Variables (3 ตัว)

```bash
npx vercel env add OPENROUTER_API_KEY
npx vercel env add NEXT_PUBLIC_OPENROUTER_MODELS
npx vercel env add NEXT_PUBLIC_OPENROUTER_MODEL
```

แต่ละตัว:
- **ประเภทตัวแปร:** `OPENROUTER_API_KEY` เลือก **Secret** / อีก 2 ตัวเลือก **Config**
- **Environments:** เลือกให้ครบทั้ง 3 (Production, Preview, Development)
- **ค่าที่ใส่:**
  - `OPENROUTER_API_KEY` → คีย์จาก OpenRouter ของคุณ
  - `NEXT_PUBLIC_OPENROUTER_MODELS` → เช่น `minimax/minimax-m3:free|MiniMax M3 (แนะนำ)` (⚠️ วางแบบ **ไม่มี**เครื่องหมายคำพูด)
  - `NEXT_PUBLIC_OPENROUTER_MODEL` → `minimax/minimax-m3:free`

### ขั้นที่ 5: Deploy Production

```bash
npx vercel --prod
```

รอ 1-3 นาที → ได้ URL Production เช่น `https://your-app.vercel.app`

### ขั้นที่ 6: ทดสอบเปิดใช้งาน

เปิด URL ที่ได้ → ทดสอบครบ 3 เครื่องมือ (Keyword / Title / Description)

> 💡 **ครั้งต่อไปที่แก้โค้ด:** แค่รัน `npx vercel --prod` อีกครั้ง = อัปเดตทันที

---


📄 License
MIT
<p align="center">
Made with ⚡ by <b>Ton Like IT</b>
</p>