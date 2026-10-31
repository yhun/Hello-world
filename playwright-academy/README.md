# 🎭🐍 Playwright Academy

Web app สำหรับสอนพนักงานว่า **Python + Playwright** ทำ automation อะไรได้บ้าง และใช้ร่วมกับ **AI** ได้อย่างไร

## เปิดใช้งาน
เป็นไฟล์ static ไม่ต้องติดตั้งอะไร — เปิด `index.html` ในเบราว์เซอร์ได้เลย หรือรัน:

```bash
cd playwright-academy
python -m http.server 8000
# เปิด http://localhost:8000
```

## เนื้อหา
| หน้า | รายละเอียด |
|---|---|
| หน้าแรก | Playwright คืออะไร, ก่อน/หลัง automate |
| พื้นฐาน | ติดตั้ง, script แรก, cheat sheet, `playwright codegen` |
| Use Cases | 13 ตัวอย่าง (ดึงข้อมูล, กรอกฟอร์ม, ดาวน์โหลด, แจ้งเตือน, ทดสอบ, AI) พร้อมโค้ดและ Prompt สำเร็จรูป |
| ไอเดียตามแผนก | ขาย, บัญชี, HR, IT, จัดซื้อ, บริการลูกค้า |
| AI + Playwright | 3 รูปแบบการใช้ AI + การเลือก model ตามงาน (Haiku / Sonnet / Opus) พร้อมตัวทดลอง |
| Prompt Builder | กรอกงานของคุณ → ได้ prompt ไปให้ AI เขียน script |
| เริ่มต้นใช้งาน | Roadmap 5 ขั้น, ควรทำ/ไม่ควรทำ, FAQ |

## แก้ไขเนื้อหา
ข้อมูล use case, แผนก และกฎการเลือก model อยู่ใน `app.js` (`USE_CASES`, `DEPARTMENTS`, `ROUTE_RULES`) — เพิ่ม/แก้ได้โดยไม่ต้องแตะ HTML
