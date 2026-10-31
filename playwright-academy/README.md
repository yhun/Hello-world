# 🎭🐍 Playwright Academy

Web app สำหรับสอนพนักงานว่า **Python + Playwright** ทำ automation อะไรได้บ้าง และใช้ร่วมกับ **AI** ได้อย่างไร

## เปิดใช้งาน
เป็นไฟล์ static ไม่ต้องติดตั้งอะไร — เปิด `index.html` ในเบราว์เซอร์ได้เลย หรือรัน:

```bash
cd playwright-academy
npx http-server -p 8000
# เปิด http://localhost:8000
```

## เนื้อหา
| หน้า | รายละเอียด |
|---|---|
| หน้าแรก | Playwright คืออะไร, ก่อน/หลัง automate |
| 🎬 เรื่องที่ควรรู้ | วิดีโอ 72 วินาที (5 เรื่องสำคัญ) พร้อมปุ่มข้ามไปแต่ละบท และสรุปเป็นข้อความ |
| พื้นฐาน | ติดตั้ง, script แรก, cheat sheet, `playwright codegen` |
| Use Cases | 13 ตัวอย่าง (ดึงข้อมูล, กรอกฟอร์ม, ดาวน์โหลด, แจ้งเตือน, ทดสอบ, AI) พร้อมโค้ดและ Prompt สำเร็จรูป |
| ไอเดียตามแผนก | ขาย, บัญชี, HR, IT, จัดซื้อ, บริการลูกค้า |
| AI + Playwright | 3 รูปแบบการใช้ AI + การเลือก model ตามงาน (Haiku / Sonnet / Opus) พร้อมตัวทดลอง |
| Prompt Builder | กรอกงานของคุณ → ได้ prompt ไปให้ AI เขียน script |
| เริ่มต้นใช้งาน | Roadmap 5 ขั้น, ควรทำ/ไม่ควรทำ, FAQ |

## แก้ไขเนื้อหา
ข้อมูล use case, แผนก และกฎการเลือก model อยู่ใน `app.js` (`USE_CASES`, `DEPARTMENTS`, `ROUTE_RULES`) — เพิ่ม/แก้ได้โดยไม่ต้องแตะ HTML

## วิดีโอ "เรื่องที่ควรรู้"
สร้างด้วย [HyperFrames](https://hyperframes.heygen.com) (open source, Apache-2.0) เขียนเป็น HTML + GSAP แล้ว render เป็น MP4

- ต้นฉบับ: `video/index.html` (fonts และ GSAP อยู่ใน `video/assets/` จึง render แบบ offline ได้)
- ไฟล์ที่ได้: `media/things-to-know.mp4` และภาพปก `media/poster.jpg`

แก้ข้อความแล้ว render ใหม่ (ต้องมี Node.js 22+ และ FFmpeg):

```bash
cd video
npm run check                                            # ตรวจ composition
npx hyperframes@0.8.223 render -q delivery -o ../media/things-to-know.mp4
```

> ถ้าเปลี่ยนเวลาของ scene ใน `video/index.html` ให้แก้ `CHAPTERS` ใน `app.js` ให้ตรงกันด้วย
> การข้ามไปยังบทต่าง ๆ ต้องเปิดผ่าน web server ที่รองรับ Range request (เช่น `npx http-server`, nginx, GitHub Pages) — `python -m http.server` ไม่รองรับ
