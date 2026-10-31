// ===================== DATA =====================
const CATEGORIES = [
  { id: "all", label: "ทั้งหมด" },
  { id: "data", label: "📊 ดึงข้อมูล" },
  { id: "form", label: "📝 กรอกฟอร์ม" },
  { id: "report", label: "📄 รายงาน / ไฟล์" },
  { id: "monitor", label: "🔔 เฝ้าระวัง" },
  { id: "test", label: "🧪 ทดสอบระบบ" },
  { id: "ai", label: "🤖 ใช้ร่วมกับ AI" },
];

const LEVEL = { easy: "ง่าย", mid: "ปานกลาง", hard: "ท้าทาย" };

const USE_CASES = [
  {
    id: "scrape-table", icon: "📊", cat: "data", level: "easy",
    title: "ดึงตารางจากเว็บลง Excel",
    desc: "อ่านข้อมูลในตาราง (ราคา สต็อก สถานะ) จากหน้าเว็บ แล้วบันทึกเป็นไฟล์ Excel อัตโนมัติ",
    example: "ฝ่ายจัดซื้อดึงราคาวัตถุดิบจากเว็บ Supplier ทุกเช้า แทนการ copy-paste",
    code: `from playwright.sync_api import sync_playwright
import pandas as pd

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://www.w3schools.com/html/html_tables.asp")

    rows = []
    for tr in page.locator("#customers tr").all()[1:]:   # ข้ามหัวตาราง
        cells = tr.locator("td").all_inner_texts()
        rows.append(cells)

    df = pd.DataFrame(rows, columns=["Company", "Contact", "Country"])
    df.to_excel("customers.xlsx", index=False)
    print(f"บันทึกแล้ว {len(df)} แถว")
    browser.close()`,
    prompt: `เขียน Python script ด้วย Playwright (sync API) ที่:
1. เปิดหน้า [URL]
2. อ่านข้อมูลจากตาราง [ระบุ selector หรือชื่อตาราง] ทุกแถว (ถ้ามีหลายหน้าให้กด Next จนครบ)
3. บันทึกเป็นไฟล์ Excel ชื่อ output_YYYY-MM-DD.xlsx ด้วย pandas
ใส่ error handling, ถ่ายภาพหน้าจอเมื่อเกิด error และอธิบายวิธีติดตั้ง library ที่ต้องใช้`,
  },
  {
    id: "multi-page", icon: "📑", cat: "data", level: "mid",
    title: "ดึงข้อมูลหลายหน้า (Pagination)",
    desc: "วนกดปุ่ม 'ถัดไป' จนครบทุกหน้า แล้วรวมข้อมูลทั้งหมดไว้ในไฟล์เดียว",
    example: "ทีมขายรวบรวมรายชื่อตัวแทนจำหน่ายจากหน้า directory ที่มี 30 หน้า",
    code: `from playwright.sync_api import sync_playwright
import csv

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://quotes.toscrape.com/")

    all_items = []
    while True:
        for q in page.locator(".quote").all():
            all_items.append({
                "text": q.locator(".text").inner_text(),
                "author": q.locator(".author").inner_text(),
            })
        next_btn = page.locator("li.next a")
        if next_btn.count() == 0:
            break                      # ไม่มีหน้าถัดไปแล้ว
        next_btn.click()
        page.wait_for_load_state("networkidle")

    with open("quotes.csv", "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "author"])
        writer.writeheader()
        writer.writerows(all_items)
    print("รวมทั้งหมด", len(all_items), "รายการ")
    browser.close()`,
    prompt: `เขียน Python + Playwright script ที่ดึงข้อมูล [ระบุฟิลด์ เช่น ชื่อ, เบอร์, จังหวัด] จาก [URL]
โดยวนกดปุ่ม "ถัดไป" จนหมดทุกหน้า รวมข้อมูลแล้วบันทึกเป็น CSV (encoding utf-8-sig เพื่อเปิดภาษาไทยใน Excel ได้)
ใส่การหน่วงเวลา 1 วินาทีระหว่างหน้าเพื่อไม่ให้โหลดเว็บหนักเกินไป`,
  },
  {
    id: "login-session", icon: "🔐", cat: "form", level: "mid",
    title: "Login ครั้งเดียว ใช้ซ้ำได้ตลอด",
    desc: "บันทึก session หลัง Login ไว้ในไฟล์ ครั้งต่อไปไม่ต้อง Login ใหม่ (รองรับระบบที่มี OTP ให้คนกดครั้งแรก)",
    example: "Login ระบบหลังบ้าน/ERP บนเว็บ ที่มี 2FA — ให้คน Login เองครั้งแรก แล้ว script ใช้ session ต่อ",
    code: `from playwright.sync_api import sync_playwright
import os

AUTH_FILE = "auth.json"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)

    if not os.path.exists(AUTH_FILE):
        context = browser.new_context()
        page = context.new_page()
        page.goto("https://your-intranet.example.com/login")
        print("กรุณา Login ด้วยตัวเอง (รวม OTP) แล้วกด Enter ที่นี่...")
        input()
        context.storage_state(path=AUTH_FILE)   # บันทึก cookie/session
    else:
        context = browser.new_context(storage_state=AUTH_FILE)
        page = context.new_page()

    page.goto("https://your-intranet.example.com/dashboard")
    print("เข้าสู่ระบบแล้ว:", page.title())
    browser.close()`,
    prompt: `เขียน Python + Playwright script ที่ Login เข้า [URL ระบบ]
- ครั้งแรก: เปิด browser ให้ผู้ใช้ Login เอง (เพราะมี OTP) แล้วบันทึก storage_state ลง auth.json
- ครั้งถัดไป: โหลด auth.json แล้วเข้าหน้า [หน้าที่ต้องการ] ได้เลย
- ถ้า session หมดอายุ (ถูก redirect ไปหน้า login) ให้ลบ auth.json แล้วแจ้งให้ Login ใหม่
อย่า hard-code รหัสผ่าน`,
  },
  {
    id: "bulk-form", icon: "📝", cat: "form", level: "mid",
    title: "กรอกฟอร์มจาก Excel ทีละหลายร้อยรายการ",
    desc: "อ่านข้อมูลจาก Excel แล้วกรอกลงฟอร์มบนเว็บทีละแถว พร้อมบันทึกผลว่าสำเร็จหรือไม่",
    example: "HR บันทึกข้อมูลพนักงานใหม่ 200 คนลงระบบเว็บ, บัญชีคีย์ใบแจ้งหนี้ลงระบบ",
    code: `from playwright.sync_api import sync_playwright
import pandas as pd

df = pd.read_excel("employees.xlsx")
results = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=200)
    page = browser.new_page()

    for _, row in df.iterrows():
        try:
            page.goto("https://demoqa.com/automation-practice-form")
            page.get_by_placeholder("First Name").fill(row["first_name"])
            page.get_by_placeholder("Last Name").fill(row["last_name"])
            page.get_by_placeholder("name@example.com").fill(row["email"])
            page.get_by_placeholder("Mobile Number").fill(str(row["phone"]))
            page.locator("#submit").click()
            results.append("สำเร็จ")
        except Exception as e:
            page.screenshot(path=f"error_{row['first_name']}.png")
            results.append(f"ล้มเหลว: {e}")

    df["ผลลัพธ์"] = results
    df.to_excel("employees_result.xlsx", index=False)
    browser.close()`,
    prompt: `เขียน Python + Playwright script ที่อ่านไฟล์ [ชื่อไฟล์].xlsx (คอลัมน์: [ระบุคอลัมน์])
แล้วกรอกลงฟอร์มที่ [URL] ทีละแถว จากนั้นกดปุ่ม [ชื่อปุ่ม]
- บันทึกผลแต่ละแถว (สำเร็จ/ล้มเหลว + เหตุผล) ลงคอลัมน์ใหม่แล้ว save เป็นไฟล์ใหม่
- ถ้าแถวไหน error ให้ถ่ายภาพหน้าจอแล้วข้ามไปแถวถัดไป ไม่ต้องหยุดทั้งหมด
- มีโหมดทดลอง (dry run) ที่กรอกแต่ไม่กด submit`,
  },
  {
    id: "download", icon: "⬇️", cat: "report", level: "easy",
    title: "ดาวน์โหลดรายงานอัตโนมัติ",
    desc: "เข้าระบบ เลือกช่วงวันที่ กดปุ่ม Export แล้วเก็บไฟล์ไว้ในโฟลเดอร์ที่กำหนด",
    example: "ดาวน์โหลดรายงานยอดขายรายวันจากระบบ POS / Marketplace ทุกเช้า",
    code: `from playwright.sync_api import sync_playwright
from datetime import date
import os

os.makedirs("reports", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(storage_state="auth.json", accept_downloads=True)
    page = context.new_page()
    page.goto("https://your-system.example.com/reports/sales")

    page.get_by_label("วันที่").fill(date.today().isoformat())
    with page.expect_download() as dl_info:
        page.get_by_role("button", name="Export Excel").click()

    download = dl_info.value
    path = f"reports/sales_{date.today()}.xlsx"
    download.save_as(path)
    print("ดาวน์โหลดแล้ว:", path)
    browser.close()`,
    prompt: `เขียน Python + Playwright script ที่เข้า [URL หน้ารายงาน] (ใช้ session จาก auth.json)
เลือกช่วงวันที่ = เมื่อวาน, กดปุ่ม [ชื่อปุ่ม Export] แล้วบันทึกไฟล์ลงโฟลเดอร์ reports/ โดยตั้งชื่อตามวันที่
จากนั้นเปิดไฟล์ด้วย pandas แล้วพิมพ์ยอดรวมของคอลัมน์ [ชื่อคอลัมน์]`,
  },
  {
    id: "screenshot-pdf", icon: "🖼️", cat: "report", level: "easy",
    title: "ถ่ายภาพหน้าจอ / บันทึกเป็น PDF",
    desc: "เก็บหลักฐานหน้าเว็บ dashboard หรือใบเสร็จเป็นภาพ/PDF ทีละหลายหน้า",
    example: "เก็บภาพ Dashboard KPI ทุกสิ้นเดือนเพื่อแนบในรายงานผู้บริหาร",
    code: `from playwright.sync_api import sync_playwright

urls = {
    "home": "https://example.com",
    "playwright": "https://playwright.dev",
}

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    for name, url in urls.items():
        page.goto(url)
        page.screenshot(path=f"{name}.png", full_page=True)
        page.pdf(path=f"{name}.pdf", format="A4")   # PDF ใช้ได้กับ Chromium
        print("บันทึก", name)
    browser.close()`,
    prompt: `เขียน Python + Playwright script ที่อ่านรายการ URL จากไฟล์ urls.txt
แล้วถ่ายภาพหน้าจอเต็มหน้า (full page) และบันทึก PDF ขนาด A4 ของแต่ละหน้า
ตั้งชื่อไฟล์ตามลำดับและวันที่ เก็บไว้ในโฟลเดอร์ evidence/YYYY-MM/`,
  },
  {
    id: "price-monitor", icon: "🔔", cat: "monitor", level: "mid",
    title: "เฝ้าดูราคา / สถานะ แล้วแจ้งเตือน",
    desc: "เช็กหน้าเว็บเป็นระยะ ถ้าราคาลด สินค้ากลับมามีสต็อก หรือสถานะเปลี่ยน ให้แจ้งเตือนทันที",
    example: "ติดตามราคาคู่แข่ง, เช็กสถานะพัสดุ, แจ้งเมื่อประกาศจัดซื้อจัดจ้างใหม่ขึ้นเว็บ",
    code: `from playwright.sync_api import sync_playwright
import json, os, requests

STATE = "last_price.json"
WEBHOOK = os.environ["TEAMS_WEBHOOK_URL"]   # หรือ LINE / Slack

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html")
    price = float(page.locator(".price_color").first.inner_text().replace("£", ""))
    browser.close()

old = json.load(open(STATE))["price"] if os.path.exists(STATE) else None
if old is not None and price < old:
    requests.post(WEBHOOK, json={"text": f"ราคาลดลง! {old} → {price}"})
json.dump({"price": price}, open(STATE, "w"))
print("ราคาปัจจุบัน:", price)`,
    prompt: `เขียน Python + Playwright script ที่เช็กราคา/สถานะจาก [URL] (selector: [ระบุ])
เปรียบเทียบกับค่าครั้งก่อนที่เก็บไว้ในไฟล์ JSON ถ้าเปลี่ยน [เงื่อนไข เช่น ลดลงเกิน 5%]
ให้ส่งแจ้งเตือนเข้า [Teams/LINE/Email] โดยอ่าน webhook จาก environment variable
และบอกวิธีตั้งให้รันทุก 1 ชั่วโมงบน Windows Task Scheduler`,
  },
  {
    id: "health-check", icon: "🩺", cat: "monitor", level: "easy",
    title: "เช็กว่าเว็บ/ระบบยังใช้งานได้",
    desc: "เปิดหน้าเว็บสำคัญทุกเช้า ตรวจว่าโหลดได้ เวลาโหลดเท่าไร มีข้อความ error ไหม",
    example: "ทีม IT ตรวจระบบภายใน 20 ระบบก่อนเวลาเข้างาน แล้วสรุปเป็นตาราง",
    code: `from playwright.sync_api import sync_playwright
import time

SITES = ["https://example.com", "https://playwright.dev", "https://httpstat.us/500"]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    for url in SITES:
        start = time.time()
        try:
            resp = page.goto(url, timeout=15000)
            ms = int((time.time() - start) * 1000)
            ok = resp is not None and resp.ok
            print(("✅" if ok else "❌"), url, resp.status if resp else "-", f"{ms} ms")
        except Exception as e:
            print("❌", url, "โหลดไม่ได้:", e)
    browser.close()`,
    prompt: `เขียน Python + Playwright script ตรวจสุขภาพเว็บไซต์จากรายการ [URLs]
สำหรับแต่ละเว็บ: บันทึก HTTP status, เวลาโหลด (ms), ตรวจว่ามีข้อความ [ข้อความที่ต้องมี] อยู่ในหน้า
สรุปผลเป็นตาราง HTML แล้วส่งอีเมลเฉพาะเมื่อมีเว็บล้มเหลว`,
  },
  {
    id: "e2e-test", icon: "🧪", cat: "test", level: "mid",
    title: "ทดสอบระบบอัตโนมัติ (E2E Test)",
    desc: "จำลองผู้ใช้จริง: Login → สั่งซื้อ → ชำระเงิน เพื่อตรวจว่าระบบยังทำงานถูกต้องหลังอัปเดต",
    example: "ทีม QA ทดสอบ flow สำคัญ 50 เคสภายใน 5 นาที แทนการกดเองครึ่งวัน",
    code: `# ไฟล์ test_shop.py   รันด้วย:  pip install pytest-playwright && pytest
from playwright.sync_api import Page, expect

def test_login_success(page: Page):
    page.goto("https://www.saucedemo.com/")
    page.get_by_placeholder("Username").fill("standard_user")
    page.get_by_placeholder("Password").fill("secret_sauce")
    page.get_by_role("button", name="Login").click()
    expect(page.locator(".title")).to_have_text("Products")

def test_login_wrong_password(page: Page):
    page.goto("https://www.saucedemo.com/")
    page.get_by_placeholder("Username").fill("standard_user")
    page.get_by_placeholder("Password").fill("wrong")
    page.get_by_role("button", name="Login").click()
    expect(page.locator("[data-test=error]")).to_be_visible()`,
    prompt: `เขียน automated test ด้วย pytest-playwright สำหรับเว็บ [URL]
ครอบคลุมเคส: [เช่น Login สำเร็จ, Login ผิด, เพิ่มสินค้าลงตะกร้า, ชำระเงิน]
ใช้ locator แบบ get_by_role / get_by_label, ใช้ fixture สำหรับ Login, เปิด trace เมื่อ test fail
และอธิบายวิธีรันและวิธีดูรายงาน HTML`,
  },
  {
    id: "ai-summary", icon: "🧠", cat: "ai", level: "mid", ai: true,
    title: "ดึงข่าว/รีวิว แล้วให้ AI สรุป",
    desc: "Playwright อ่านเนื้อหาจากหลายหน้า → ส่งให้ Claude สรุปประเด็นสำคัญเป็นภาษาไทย",
    example: "สรุปข่าวอุตสาหกรรมประจำวัน, สรุปรีวิวลูกค้าจาก Marketplace ให้ทีม Product",
    code: `from playwright.sync_api import sync_playwright
import anthropic

client = anthropic.Anthropic()   # อ่าน ANTHROPIC_API_KEY จาก environment

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://news.ycombinator.com/")
    titles = page.locator(".titleline > a").all_inner_texts()[:30]
    browser.close()

response = client.messages.create(
    model="claude-sonnet-5-5",          # งานสรุปทั่วไป → Sonnet
    max_tokens=2000,
    messages=[{
        "role": "user",
        "content": "สรุปหัวข้อข่าวเทคโนโลยีต่อไปนี้เป็นภาษาไทย 5 ประเด็นหลัก:\\n"
                   + "\\n".join(titles),
    }],
)
print(response.content[0].text)`,
    prompt: `เขียน Python script ที่ใช้ Playwright ดึง [หัวข้อข่าว/รีวิว] จาก [URL] (สูงสุด N รายการ)
จากนั้นใช้ Anthropic Python SDK (model: claude-sonnet-5-5) สรุปเป็นภาษาไทย:
- 5 ประเด็นหลัก
- ความรู้สึกโดยรวม (บวก/กลาง/ลบ)
- สิ่งที่ทีม [ชื่อทีม] ควรรู้
บันทึกผลเป็นไฟล์ Markdown ตามวันที่ อ่าน API key จาก environment variable ANTHROPIC_API_KEY`,
  },
  {
    id: "ai-classify", icon: "🏷️", cat: "ai", level: "mid", ai: true,
    title: "ให้ AI จัดหมวด / ติด Tag ข้อมูลจำนวนมาก",
    desc: "ดึงข้อความ (ticket, อีเมล, รีวิว) แล้วให้ AI จัดหมวดเป็น JSON — ใช้ model เล็กเพื่อประหยัด",
    example: "จัดหมวด ticket แจ้งปัญหา 1,000 รายการ: ฮาร์ดแวร์ / ซอฟต์แวร์ / เครือข่าย / บัญชีผู้ใช้",
    code: `import anthropic, json

client = anthropic.Anthropic()
tickets = ["คอมเปิดไม่ติด", "ลืมรหัสผ่านอีเมล", "Wi-Fi ชั้น 3 หลุดบ่อย"]  # ได้จาก Playwright

for t in tickets:
    r = client.messages.create(
        model="claude-haiku-5-5",       # งานง่าย ปริมาณเยอะ → Haiku (ถูกและเร็ว)
        max_tokens=256,
        system='ตอบเป็น JSON เท่านั้น: {"category": "hardware|software|network|account", "urgent": true/false}',
        messages=[{"role": "user", "content": t}],
    )
    print(t, "→", json.loads(r.content[0].text))`,
    prompt: `เขียน Python script ที่:
1. ใช้ Playwright ดึงรายการ [ticket/อีเมล/รีวิว] จาก [URL]
2. ส่งแต่ละรายการให้ Claude (model: claude-haiku-5-5 เพราะเป็นงานง่ายปริมาณมาก) จัดหมวดเป็น [หมวด A, B, C]
   และให้ตอบกลับเป็น JSON
3. บันทึกผลเป็น Excel พร้อมคอลัมน์หมวดหมู่ และสรุปจำนวนต่อหมวด
ใส่ retry เมื่อเรียก API ไม่สำเร็จ`,
  },
  {
    id: "ai-agent", icon: "🕹️", cat: "ai", level: "hard", ai: true,
    title: "ให้ AI ควบคุม Browser เอง (Agent)",
    desc: "แทนที่จะเขียนขั้นตอนเอง ให้ AI ดูหน้าเว็บแล้วตัดสินใจคลิก/พิมพ์เองผ่าน Playwright MCP",
    example: "“เข้าเว็บจองห้องประชุม หาห้องว่าง 10 คน บ่ายวันพฤหัส แล้วสรุปตัวเลือกให้” (ให้คนกดยืนยันเอง)",
    code: `# ไม่ต้องเขียนโค้ด! ติดตั้ง Playwright MCP ให้ AI ที่รองรับ MCP
# ตัวอย่าง: Claude Code / Claude Desktop

# 1) เพิ่ม MCP server (Claude Code)
#    claude mcp add playwright -- npx @playwright/mcp@latest

# 2) สั่งงานเป็นภาษาคน เช่น
#    "เปิด https://www.saucedemo.com ล็อกอินด้วย standard_user / secret_sauce
#     หาสินค้าที่ราคาถูกที่สุด เพิ่มลงตะกร้า แล้วถ่ายภาพหน้าจอตะกร้าให้ดู
#     ห้ามกดชำระเงิน"

# 3) เมื่อ AI ทำสำเร็จ ให้สั่งต่อว่า:
#    "เขียนขั้นตอนที่คุณเพิ่งทำเป็น Python + Playwright script ให้หน่อย"
#    → ได้ script ไว้รันซ้ำเองโดยไม่ต้องเสียค่า AI ทุกครั้ง`,
    prompt: `(ใช้กับ AI ที่ติดตั้ง Playwright MCP แล้ว)
เปิดเว็บ [URL] แล้วทำงานนี้: [เป้าหมาย]
ข้อจำกัด:
- ห้ามกดยืนยัน / ชำระเงิน / ลบข้อมูล ให้หยุดถามฉันก่อน
- ถ้าเจอ CAPTCHA หรือ OTP ให้หยุดแล้วแจ้งฉัน
- เมื่อเสร็จ ให้สรุปผลเป็นตาราง และเขียนขั้นตอนทั้งหมดเป็น Python + Playwright script เพื่อให้ฉันรันซ้ำเองได้`,
  },
  {
    id: "ai-extract", icon: "🧾", cat: "ai", level: "hard", ai: true,
    title: "อ่านเอกสาร/ใบแจ้งหนี้ ด้วย AI แล้วกรอกลงระบบ",
    desc: "ดาวน์โหลด PDF ใบแจ้งหนี้ → AI ดึงเลขที่ วันที่ ยอดเงิน → Playwright กรอกลงระบบบัญชีบนเว็บ",
    example: "บัญชีบันทึกใบแจ้งหนี้จาก Supplier 300 ใบ/เดือน โดยให้คนตรวจเฉพาะรายการที่ AI ไม่มั่นใจ",
    code: `import anthropic, base64, json

client = anthropic.Anthropic()
pdf_b64 = base64.standard_b64encode(open("invoice.pdf", "rb").read()).decode()

r = client.messages.create(
    model="claude-opus-5-5",            # เอกสารซับซ้อน ต้องแม่น → Opus
    max_tokens=2000,
    messages=[{"role": "user", "content": [
        {"type": "document",
         "source": {"type": "base64", "media_type": "application/pdf", "data": pdf_b64}},
        {"type": "text",
         "text": 'ดึงข้อมูลเป็น JSON: {"invoice_no": "", "date": "YYYY-MM-DD", "vendor": "", "total": 0}'},
    ]}],
)
data = json.loads(r.content[0].text)
print(data)
# จากนั้นใช้ Playwright กรอก data ลงฟอร์มระบบบัญชี (ดู Use case "กรอกฟอร์มจาก Excel")`,
    prompt: `เขียน Python script ที่:
1. อ่านไฟล์ PDF ใบแจ้งหนี้ทั้งหมดในโฟลเดอร์ invoices/
2. ส่งให้ Claude (claude-opus-5-5) ดึงข้อมูล: เลขที่ใบแจ้งหนี้, วันที่, ชื่อผู้ขาย, ยอดรวม, VAT เป็น JSON
3. ตรวจความถูกต้องเบื้องต้น (ยอดรวม = ยอดก่อน VAT + VAT)
4. ใช้ Playwright กรอกข้อมูลลงระบบที่ [URL] แต่ "ไม่กดบันทึก" ถ้าข้อมูลไม่ผ่านการตรวจ ให้ใส่ในไฟล์ review.xlsx แทน`,
  },
];

const DEPARTMENTS = {
  "💼 ขาย / การตลาด": [
    ["ติดตามราคาคู่แข่ง", "เช็กราคาสินค้าคู่แข่งบนเว็บ/Marketplace ทุกวัน แล้วแจ้งเมื่อมีโปรโมชั่น", "2-3 ชม./สัปดาห์"],
    ["สรุปรีวิวลูกค้า", "ดึงรีวิวจากหน้าร้านออนไลน์ แล้วให้ AI สรุปจุดชม/จุดติ", "4 ชม./เดือน"],
    ["เก็บ Lead จาก Directory", "รวบรวมรายชื่อบริษัทเป้าหมายจากเว็บสมาคม/งานแสดงสินค้า (ตามเงื่อนไขของเว็บ)", "1 วัน/แคมเปญ"],
    ["รายงาน Social/Ads", "ดาวน์โหลดรายงานจาก dashboard โฆษณาหลายแพลตฟอร์มมารวมใน Excel เดียว", "3 ชม./สัปดาห์"],
  ],
  "💰 บัญชี / การเงิน": [
    ["ดาวน์โหลด Statement", "Login ระบบ (ที่อนุญาต) ดาวน์โหลดรายการเดินบัญชี/รายงานทุกวัน", "30 นาที/วัน"],
    ["คีย์ใบแจ้งหนี้", "AI อ่าน PDF → Playwright กรอกลงระบบบัญชีบนเว็บ ให้คนตรวจก่อนบันทึก", "2-3 วัน/เดือน"],
    ["อัตราแลกเปลี่ยน", "ดึงอัตราแลกเปลี่ยนประจำวันจากเว็บธนาคารลง Excel", "15 นาที/วัน"],
    ["ตรวจสถานะการจ่ายเงิน", "เช็กสถานะการโอน/ใบกำกับภาษีในระบบ e-Tax หรือพอร์ทัลลูกค้า", "1 ชม./วัน"],
  ],
  "👥 HR": [
    ["บันทึกพนักงานใหม่", "กรอกข้อมูลจาก Excel ลงระบบ HR บนเว็บทีละหลายคน", "1 วัน/รอบ"],
    ["คัดกรองใบสมัคร", "ดาวน์โหลดใบสมัครจากเว็บหางาน แล้วให้ AI สรุปคุณสมบัติเทียบ JD (คนตัดสินใจ)", "5 ชม./ตำแหน่ง"],
    ["รายงานการลา/เข้างาน", "ดึงรายงานจากระบบลงเวลา แล้วสรุปรายแผนก", "2 ชม./เดือน"],
    ["ลงทะเบียนอบรม", "สมัครคอร์ส e-Learning ให้พนักงานหลายคนตามรายชื่อ", "3 ชม./รอบ"],
  ],
  "🛠️ IT": [
    ["Health check ระบบ", "เช็กทุกระบบภายในทุกเช้า พร้อมเวลาโหลดและภาพหน้าจอ", "1 ชม./วัน"],
    ["ทดสอบหลังอัปเดต", "รัน E2E test flow สำคัญอัตโนมัติก่อน/หลัง deploy", "ครึ่งวัน/release"],
    ["ตรวจ License/สิทธิ์", "ดึงรายชื่อผู้ใช้จาก admin console หลายระบบมาเทียบกับรายชื่อพนักงาน", "1 วัน/ไตรมาส"],
    ["จัดหมวด Ticket", "ดึง ticket จากระบบ Helpdesk ให้ AI จัดหมวด/ความเร่งด่วน", "1 ชม./วัน"],
  ],
  "📦 จัดซื้อ / Supply Chain": [
    ["เช็กราคาวัตถุดิบ", "ดึงราคาจากเว็บ Supplier/ตลาดกลาง ทุกวันแล้วทำกราฟแนวโน้ม", "1 ชม./วัน"],
    ["ติดตามพัสดุ", "เช็กสถานะ tracking หลายบริษัทขนส่งจากเลขพัสดุใน Excel", "1-2 ชม./วัน"],
    ["ประกาศจัดซื้อจัดจ้าง", "เฝ้าดูประกาศใหม่ตาม keyword แล้วแจ้งเตือนทีม", "30 นาที/วัน"],
    ["อัปเดตสต็อกบนพอร์ทัล", "กรอกยอดสต็อกลงพอร์ทัลของลูกค้า/ห้าง จากไฟล์ ERP", "2 ชม./สัปดาห์"],
  ],
  "🎧 บริการลูกค้า": [
    ["ร่างคำตอบ", "ดึงคำถามลูกค้าจากระบบ แล้วให้ AI ร่างคำตอบ ให้พนักงานตรวจก่อนส่ง", "2 ชม./วัน"],
    ["ตรวจสถานะคำสั่งซื้อ", "ค้นสถานะ order จากหลายระบบให้ในครั้งเดียว", "1 ชม./วัน"],
    ["สรุปเรื่องร้องเรียน", "รวบรวมเรื่องร้องเรียนรายสัปดาห์ ให้ AI จัดกลุ่มสาเหตุ", "3 ชม./สัปดาห์"],
  ],
};

// ===================== HELPERS =====================
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1600);
}

function copyText(text) {
  const done = () => toast("คัดลอกแล้ว ✓");
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done);
  } else {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); ta.remove(); done();
  }
}

function codeBlock(code) {
  return `<div class="code"><button class="copy">Copy</button><pre>${esc(code)}</pre></div>`;
}

function attachCopyButtons(root = document) {
  $$(".code", root).forEach((box) => {
    if (!$(".copy", box)) {
      const b = document.createElement("button");
      b.className = "copy"; b.textContent = "Copy";
      box.prepend(b);
    }
    $(".copy", box).onclick = () => copyText($("pre", box).innerText);
  });
}

// ===================== TABS =====================
function showTab(id) {
  $$(".tab").forEach((t) => t.classList.toggle("active", t.id === id));
  $$("#nav button").forEach((b) => b.classList.toggle("active", b.dataset.tab === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", "#" + id);
}
$$("#nav button").forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));
$$("[data-goto]").forEach((b) => (b.onclick = () => showTab(b.dataset.goto)));

// ===================== USE CASES =====================
let activeCat = "all";

function renderFilters() {
  $("#filters").innerHTML = CATEGORIES.map(
    (c) => `<button class="chip ${c.id === activeCat ? "active" : ""}" data-cat="${c.id}">${c.label}</button>`
  ).join("");
  $$("#filters .chip").forEach((b) => (b.onclick = () => { activeCat = b.dataset.cat; renderFilters(); renderUseCases(); }));
}

function renderUseCases() {
  const q = $("#search").value.trim().toLowerCase();
  const list = USE_CASES.filter((u) =>
    (activeCat === "all" || u.cat === activeCat || (activeCat === "ai" && u.ai)) &&
    (!q || (u.title + u.desc + u.example + u.code).toLowerCase().includes(q))
  );
  $("#usecaseGrid").innerHTML = list.length
    ? list.map((u) => `
      <div class="card uc" data-id="${u.id}">
        <div class="icon">${u.icon}</div>
        <h3>${u.title}</h3>
        <p>${u.desc}</p>
        <div class="meta">
          <span class="pill ${u.level}">${LEVEL[u.level]}</span>
          ${u.ai ? '<span class="pill ai">ใช้ AI</span>' : ""}
          <span class="pill">${CATEGORIES.find((c) => c.id === u.cat).label}</span>
        </div>
      </div>`).join("")
    : `<p class="muted">ไม่พบ use case ที่ตรงกับคำค้นหา</p>`;
  $$("#usecaseGrid .uc").forEach((c) => (c.onclick = () => openUseCase(c.dataset.id)));
}

function openUseCase(id) {
  const u = USE_CASES.find((x) => x.id === id);
  $("#modalBody").innerHTML = `
    <h2>${u.icon} ${u.title}</h2>
    <p>${u.desc}</p>
    <div class="tip"><b>🏢 ตัวอย่างการใช้งานจริง:</b> ${u.example}</div>
    <h3>ตัวอย่างโค้ด Python</h3>
    ${codeBlock(u.code)}
    <h3>🤖 Prompt สำเร็จรูป — ก๊อปไปให้ AI เขียน script แบบของคุณ</h3>
    <p class="muted">แก้ข้อความใน [วงเล็บ] ให้ตรงกับงานของคุณ</p>
    ${codeBlock(u.prompt)}
  `;
  attachCopyButtons($("#modalBody"));
  $("#modal").classList.remove("hidden");
}
$("#modalClose").onclick = () => $("#modal").classList.add("hidden");
$("#modal").onclick = (e) => { if (e.target.id === "modal") $("#modal").classList.add("hidden"); };
document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#modal").classList.add("hidden"); });
$("#search").oninput = renderUseCases;

// ===================== DEPARTMENTS =====================
let activeDept = Object.keys(DEPARTMENTS)[0];
function renderDept() {
  $("#deptButtons").innerHTML = Object.keys(DEPARTMENTS).map(
    (d) => `<button class="chip ${d === activeDept ? "active" : ""}">${d}</button>`
  ).join("");
  $$("#deptButtons .chip").forEach((b) => (b.onclick = () => { activeDept = b.textContent; renderDept(); }));
  $("#deptIdeas").innerHTML = DEPARTMENTS[activeDept].map(
    ([t, d, s]) => `<div class="idea"><b>${t}</b>${d}<div class="saving">⏱️ ประหยัดได้ประมาณ ${s}</div></div>`
  ).join("");
}

// ===================== MODEL ROUTER =====================
const MODELS = {
  haiku: { id: "claude-haiku-5-5", name: "Haiku", color: "easy", why: "งานง่าย/ซ้ำ ๆ ปริมาณมาก — เร็วและถูกที่สุด" },
  sonnet: { id: "claude-sonnet-5-5", name: "Sonnet", color: "mid", why: "งานทั่วไปที่ต้องเขียน/สรุป/เปรียบเทียบ — สมดุลระหว่างความเร็วและความเก่ง" },
  opus: { id: "claude-opus-5-5", name: "Opus", color: "hard", why: "งานซับซ้อน ต้องคิดหลายขั้น หรือผิดพลาดไม่ได้ — เก่งที่สุด" },
};
const ROUTE_RULES = [
  { model: "opus", words: ["สัญญา", "กฎหมาย", "วิเคราะห์", "วางแผน", "เขียน script", "เขียนโค้ด", "เขียนโปรแกรม", "ทั้งระบบ", "ซับซ้อน", "ใบแจ้งหนี้", "การเงิน", "ตรวจสอบ", "หลายขั้นตอน", "agent", "code", "debug", "แก้ error"] },
  { model: "haiku", words: ["จัดหมวด", "จัดกลุ่ม", "ติด tag", "tag", "บวกหรือลบ", "บวก/ลบ", "sentiment", "ดึงเบอร์", "ดึงอีเมล", "แยก", "ตรวจคำ", "แปลสั้น", "ใช่หรือไม่", "classify", "รายการ", "1,000", "1000", "500"] },
  { model: "sonnet", words: ["สรุป", "เขียนอีเมล", "ร่าง", "ตอบลูกค้า", "เปรียบเทียบ", "แปล", "รายงาน", "บทความ", "อธิบาย"] },
];

function routeTask(text) {
  const t = text.toLowerCase();
  const score = { haiku: 0, sonnet: 0, opus: 0 };
  ROUTE_RULES.forEach((r) => r.words.forEach((w) => { if (t.includes(w.toLowerCase())) score[r.model] += 1; }));
  if (score.opus > 0) return "opus";
  if (score.haiku > score.sonnet) return "haiku";
  if (score.sonnet > 0) return "sonnet";
  return text.length > 120 ? "opus" : "sonnet";
}

$("#routerBtn").onclick = () => {
  const text = $("#routerInput").value.trim();
  if (!text) return toast("พิมพ์งานก่อนนะ");
  const m = MODELS[routeTask(text)];
  $("#routerOut").innerHTML = `
    <div class="result">
      <span class="pill ${m.color}">แนะนำ: ${m.name}</span> <code>${m.id}</code>
      <p>${m.why}</p>
      ${codeBlock(`response = client.messages.create(
    model="${m.id}",
    max_tokens=2000,
    messages=[{"role": "user", "content": """${text.replace(/"/g, "'")}"""}],
)
print(response.content[0].text)`)}
      <p class="muted">* เป็นการเดาจาก keyword อย่างง่ายเพื่อการเรียนรู้ — ในงานจริงควรทดลองกับข้อมูลตัวอย่างแล้วเลือก model ที่ถูกที่สุดที่ยังให้คุณภาพพอ</p>
    </div>`;
  attachCopyButtons($("#routerOut"));
};

const AI_ROUTER_CODE = `"""
ตัวอย่าง: Playwright ดึงรีวิวลูกค้า → เลือก model ตามประเภทงาน → AI ประมวลผล
ติดตั้ง:  pip install playwright anthropic && playwright install chromium
ตั้งค่า:  export ANTHROPIC_API_KEY="..."   (Windows: setx ANTHROPIC_API_KEY "...")
"""
from playwright.sync_api import sync_playwright
import anthropic

client = anthropic.Anthropic()

# 1) เลือก model ให้เหมาะกับงาน — งานง่ายใช้ model เล็ก ประหยัดกว่าหลายสิบเท่า
MODEL_BY_TASK = {
    "classify":  "claude-haiku-5-5",    # จัดหมวด / บวก-ลบ / ดึงข้อมูลสั้น ๆ
    "summarize": "claude-sonnet-5-5",   # สรุป / เขียนอีเมล / เปรียบเทียบ
    "analyze":   "claude-opus-5-5",     # วิเคราะห์เชิงลึก / วางแผน / งานที่ต้องแม่น
}

def ask_ai(task: str, prompt: str, max_tokens: int = 2000) -> str:
    response = client.messages.create(
        model=MODEL_BY_TASK[task],
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason == "refusal":
        return "(AI ปฏิเสธคำขอนี้)"
    return response.content[0].text

# 2) ใช้ Playwright ดึงข้อมูลจากเว็บ
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://quotes.toscrape.com/")
    reviews = page.locator(".quote .text").all_inner_texts()
    browser.close()

# 3) งานง่าย ทำทีละรายการ → Haiku
for r in reviews[:5]:
    label = ask_ai("classify", f"ข้อความนี้ให้ความรู้สึก บวก / กลาง / ลบ ? ตอบคำเดียว\\n\\n{r}", 10)
    print(label.strip(), "|", r[:60])

# 4) งานสรุปภาพรวม → Sonnet
all_text = "\\n".join(reviews)
print(ask_ai("summarize", f"สรุปประเด็นหลักของข้อความต่อไปนี้เป็นภาษาไทย 3 ข้อ:\\n{all_text}"))

# 5) งานวิเคราะห์เชิงกลยุทธ์ → Opus
print(ask_ai("analyze", f"จากข้อความเหล่านี้ เสนอแผนปรับปรุง 3 ข้อพร้อมเหตุผล:\\n{all_text}"))`;

// ===================== PROMPT BUILDER =====================
function buildPrompt() {
  const f = new FormData($("#builderForm"));
  const goal = f.get("goal") || "[อธิบายงาน]";
  const url = f.get("url") || "[URL]";
  const steps = (f.get("steps") || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const output = f.get("output");
  const ai = f.get("ai");
  const level = f.get("level");
  const schedule = f.get("schedule");
  const login = f.get("login");

  const aiText = {
    none: "",
    summary: "\n- หลังดึงข้อมูลแล้ว ให้ส่งเนื้อหาให้ Claude สรุปเป็นภาษาไทย (ใช้ Anthropic Python SDK, model: claude-sonnet-5-5)",
    classify: "\n- หลังดึงข้อมูลแล้ว ให้ส่งแต่ละรายการให้ Claude จัดหมวดหมู่ (ใช้ Anthropic Python SDK, model: claude-haiku-5-5 เพราะเป็นงานง่ายปริมาณมาก) ตอบกลับเป็น JSON",
    extract: "\n- หลังดึงข้อมูลแล้ว ให้ส่งให้ Claude ดึงข้อมูลสำคัญเป็น JSON ตาม schema ที่กำหนด (ใช้ Anthropic Python SDK, model: claude-opus-5-5 เพราะต้องแม่นยำ) และตรวจสอบ JSON ก่อนบันทึก",
  }[ai];

  const levelText = {
    beginner: "ฉันเป็นมือใหม่ Python: กรุณาอธิบายทีละขั้นตอน ใส่ comment ภาษาไทยทุกส่วน บอกวิธีติดตั้ง Python, library และวิธีรันบน Windows อย่างละเอียด",
    mid: "ฉันพอเขียน Python ได้: ใส่ comment ในจุดสำคัญ และบอกวิธีติดตั้ง library ที่ต้องใช้",
    pro: "ขอโค้ดที่สะอาด แบ่งเป็นฟังก์ชัน พร้อม type hints อธิบายสั้น ๆ พอ",
  }[level];

  const prompt = `คุณคือผู้เชี่ยวชาญด้าน Python และ Playwright ช่วยเขียน script automation ให้หน่อย

## เป้าหมาย
${goal}

## เว็บไซต์
${url}

## ขั้นตอนที่ฉันทำเองอยู่ทุกวัน
${steps.length ? steps.map((s, i) => `${i + 1}. ${s}`).join("\n") : "1. [ขั้นตอนที่ 1]\n2. [ขั้นตอนที่ 2]"}

## ผลลัพธ์ที่ต้องการ
- ${output}${aiText}

## ข้อกำหนดทางเทคนิค
- ใช้ Python 3 + Playwright (sync API) กับ Chromium
- ใช้ locator ที่ทนต่อการเปลี่ยนแปลง เช่น get_by_role, get_by_label, get_by_text${login ? `
- เว็บนี้ต้อง Login: อ่าน username/password จากไฟล์ .env (python-dotenv) ห้าม hard-code และบันทึก session ด้วย storage_state เพื่อไม่ต้อง Login ทุกครั้ง` : ""}${ai !== "none" ? `
- อ่าน API key จาก environment variable ANTHROPIC_API_KEY` : ""}
- รอให้ element โหลดก่อนใช้งาน และหน่วงเวลาเล็กน้อยระหว่างหน้า เพื่อไม่ให้ระบบโหลดหนัก
- มี error handling: ถ้าเกิด error ให้ถ่ายภาพหน้าจอ บันทึก log แล้วทำรายการถัดไปต่อ
- มีตัวเลือก headless=False สำหรับดูการทำงานตอนทดสอบ${schedule ? `
- อธิบายวิธีตั้งให้ script รันอัตโนมัติทุกวัน (Windows Task Scheduler และ cron บน Linux/Mac)` : ""}

## ระดับคำอธิบาย
${levelText}

## ข้อควรระวัง
- ห้ามกดปุ่มที่ยืนยันธุรกรรม/ลบข้อมูล โดยไม่ถามฉันก่อน (ให้มีโหมด dry-run)
- ถ้ามีส่วนไหนที่คุณไม่แน่ใจเรื่องโครงสร้างหน้าเว็บ ให้บอกฉันว่าต้องเปิด DevTools ดู selector ตรงไหน หรือแนะนำให้ใช้ "playwright codegen ${url}" ช่วย`;

  $("#promptOut").textContent = prompt;
  const hint = { none: "ใช้ AI แค่ตอนเขียน script", summary: "AI ใน script: Sonnet", classify: "AI ใน script: Haiku", extract: "AI ใน script: Opus" }[ai];
  $("#modelHint").textContent = hint;
}
$("#builderForm").addEventListener("input", buildPrompt);
$("#builderForm").addEventListener("change", buildPrompt);
$("#copyPrompt").onclick = () => copyText($("#promptOut").textContent);

// ===================== THINGS TO KNOW (VIDEO) =====================
// เวลาเริ่ม (วินาที) ต้องตรงกับ data-start ของแต่ละ scene ใน video/index.html
const CHAPTERS = [
  { t: 0, no: "บทนำ", title: "5 เรื่องที่ควรรู้", points: ["Playwright + Python + AI ทำงานร่วมกันอย่างไร"] },
  { t: 6, no: "เรื่องที่ 1", title: "Playwright คือ “มือ” · AI คือ “สมอง”", points: ["Playwright: คลิก พิมพ์ กรอกฟอร์ม ดาวน์โหลด อ่านข้อมูล", "AI: สรุป จัดหมวด แปล อ่านเอกสาร เขียนโค้ด"] },
  { t: 15, no: "เรื่องที่ 2", title: "งานซ้ำ → Script · งานไม่แน่นอน → Agent", points: ["Script ที่ AI เขียนให้: เร็ว ถูก ผลเหมือนเดิม", "AI Agent: ยืดหยุ่น แต่ช้า แพง ต้องมีคนตรวจ", "ให้ Agent ทำครั้งแรก แล้วสั่งให้เขียนเป็น script"] },
  { t: 25, no: "เรื่องที่ 3", title: "เลือก Model ให้เหมาะกับงาน", points: ["Haiku: งานง่าย ปริมาณมาก", "Sonnet: สรุป ร่างอีเมล เปรียบเทียบ", "Opus: วิเคราะห์ลึก เขียน script งานที่ผิดไม่ได้"] },
  { t: 35, no: "เรื่องที่ 4", title: "หาปุ่มด้วย “ความหมาย”", points: ["ใช้ get_by_role / get_by_label แทน CSS ยาว ๆ", "ใช้ playwright codegen ช่วยสร้างโค้ด"] },
  { t: 44, no: "เรื่องที่ 5", title: "ใช้อย่างปลอดภัย", points: ["เก็บรหัสผ่าน / API Key ใน .env", "ไม่ส่งข้อมูลลูกค้าเข้า AI โดยไม่ได้รับอนุมัติ", "เคารพ Terms of Service ไม่ข้าม CAPTCHA", "คนตรวจก่อนกดยืนยันธุรกรรม"] },
  { t: 56, no: "เริ่มต้น", title: "4 ขั้นตอนสู่ Automation แรก", points: ["เลือกงาน → ให้ AI เขียน → ทดสอบ → ตั้งเวลา"] },
];

function fmtTime(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }

function renderKnow() {
  const v = $("#knowVideo");
  const seek = (t) => { v.currentTime = t; v.play().catch(() => {}); };
  $("#chapters").innerHTML = CHAPTERS.map((c, i) =>
    `<button class="chip" data-i="${i}"><small>${fmtTime(c.t)}</small>${c.no}</button>`).join("");
  $("#knowCards").innerHTML = CHAPTERS.slice(1).map((c, i) => `
    <div class="card know-card" data-i="${i + 1}">
      <div class="no">${c.no} · ${fmtTime(c.t)}</div>
      <h3>${c.title}</h3>
      <ul>${c.points.map((p) => `<li>${p}</li>`).join("")}</ul>
    </div>`).join("");
  $$("#chapters .chip, #knowCards .know-card").forEach((el) => (el.onclick = () => seek(CHAPTERS[+el.dataset.i].t)));

  // ไฮไลต์บทที่กำลังเล่น
  v.addEventListener("timeupdate", () => {
    let cur = 0;
    CHAPTERS.forEach((c, i) => { if (v.currentTime >= c.t) cur = i; });
    $$("#chapters .chip").forEach((b) => b.classList.toggle("active", +b.dataset.i === cur));
    $$("#knowCards .know-card").forEach((c) => c.classList.toggle("playing", +c.dataset.i === cur));
  });
}

// หยุดวิดีโอเมื่อออกจากแท็บ
$$("#nav button, [data-goto]").forEach((b) => b.addEventListener("click", () => {
  if ((b.dataset.tab || b.dataset.goto) !== "know") $("#knowVideo").pause();
}));

// ===================== INIT =====================
renderKnow();
$("#aiRouterCode").textContent = AI_ROUTER_CODE;
renderFilters();
renderUseCases();
renderDept();
buildPrompt();
attachCopyButtons();
const initial = location.hash.slice(1);
if (initial && document.getElementById(initial)?.classList.contains("tab")) showTab(initial);
