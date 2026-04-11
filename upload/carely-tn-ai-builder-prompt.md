# 🤖 AI BUILDER PROMPT — Carely.tn Digital Store
## Full-Stack Web Application — Copy & Paste Ready

---

## 🎯 PROJECT OVERVIEW

Build a complete full-stack digital product store called **Carely.tn** — a Tunisian Arabic-dialect family safety subscription reseller platform. The store sells exactly **2 products** (Qustodio Silver and Qustodio Gold premium accounts). The app has three distinct portals: a **public storefront**, a **client portal**, and a **super admin portal**.

---

## 🛠️ TECH STACK

- **Frontend**: Next.js 15 (App Router, TypeScript)
- **UI**: shadcn/ui components + Tailwind CSS
- **Font**: Baloo Bhaijaan 2 (Google Fonts) — used for ALL text, Arabic + Latin
- **Language**: Tunisian Arabic dialect (العربية التونسية) — RTL layout
- **Database**: Appwrite
  - Project ID: `69da3a96000d474efae3`
  - Project Name: `Mykid`
  - Endpoint: `https://fra.cloud.appwrite.io/v1`
- **Backend**: Ruby on Rails (API-only mode) OR Next.js API routes (choose simpler)
- **Direction**: `dir="rtl"` on `<html>` tag, Arabic-first layout

---

## 🎨 DESIGN SYSTEM

### Color Palette
```
Primary Green:    #1a8449  (buttons, accents, CTAs)
Light Green:      #d4f0e3  (backgrounds, cards)
Mint Surface:     #f0faf5  (page background)
Dark Green Text:  #094825  (headings)
White:            #ffffff  (cards)
Gold Accent:      #d4a017  (Gold plan highlights)
Silver Accent:    #8e9eab  (Silver plan highlights)
Gray Text:        #4b5563  (body text)
Border:           rgba(14,80,48,0.12)
```

### Typography Rules
- ALL text uses: `font-family: 'Baloo Bhaijaan 2', sans-serif`
- Headings: `font-weight: 800`, color: `#094825`
- Body: `font-weight: 500`, color: `#4b5563`
- Buttons: `font-weight: 700`
- Load from Google Fonts: `https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;500;600;700;800&display=swap`

### Feel & Vibe
- Premium, clean, trustworthy
- Family-friendly green palette
- Rounded corners everywhere (`border-radius: 14px` for cards, `border-radius: 100px` for pills)
- Subtle shadows: `box-shadow: 0 4px 16px rgba(14,80,48,0.10)`
- NO gradients on text, NO neon colors
- Green top-border accent on featured cards (3px solid #1a8449)

---

## 📦 THE 2 PRODUCTS — EXACT SPECS

### Product 1: Qustodio Silver 🥈
```
Name (Arabic):    Carely Silver — كيرلي سيلفر
Devices:          5 أجهزة
Duration:         سنة كاملة (12 شهر)
Price (TND):      89 دت / سنة
What it includes:
  - حجب المواقع غير اللائقة
  - تحديد وقت الشاشة
  - تقارير أسبوعية
  - دعم فني بالتونسي
  - تفعيل فوري بعد الدفع
Badge color:      Silver #8e9eab
```

### Product 2: Qustodio Gold 🥇
```
Name (Arabic):    Carely Gold — كيرلي ڨولد
Devices:          10 أجهزة
Duration:         سنة كاملة (12 شهر)
Price (TND):      149 دت / سنة
What it includes:
  - كل مميزات Silver
  - مراقبة واتساب وانستغرام
  - تتبع الموقع الجغرافي
  - تقارير يومية مفصلة
  - حجب مكالمات وجهات اتصال
  - دعم VIP أولوية على واتساب
Badge color:      Gold #d4a017
Featured:         YES — add "الأكثر شراءً" badge on top
```

---

## 🗂️ APPWRITE DATABASE SCHEMA

### Install SDK:
```bash
npm install appwrite
```

### lib/appwrite.ts:
```typescript
import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("69da3a96000d474efae3");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
```

### Collection 1: `users`
| Field | Type | Notes |
|-------|------|-------|
| $id | String | Auto — Appwrite ID |
| name | String | Full name — required |
| email | String | Unique — required |
| phone | String | Tunisian phone number |
| address | String | **Full address** — street, city, gouvernorat |
| wilaya | String | Gouvernorat (e.g., تونس، صفاقس، سوسة) |
| password_hint | String | Admin-visible plain note (NOT actual password — store Qustodio account password set for client) |
| role | Enum | `customer` \| `admin` |
| created_at | DateTime | Auto |

### Collection 2: `subscriptions`
| Field | Type | Notes |
|-------|------|-------|
| $id | String | Auto |
| user_id | String | → users.$id |
| plan | Enum | `silver` \| `gold` |
| status | Enum | `active` \| `expired` \| `pending` \| `cancelled` |
| qustodio_email | String | The Qustodio account email assigned to client |
| qustodio_password | String | The Qustodio account password (encrypted note for admin) |
| activation_code | String | License key / activation code |
| devices_count | Integer | 5 or 10 |
| starts_at | DateTime | Subscription start date |
| expires_at | DateTime | Subscription end date |
| auto_renew | Boolean | Default false |
| notes | String | Admin internal notes |

### Collection 3: `orders`
| Field | Type | Notes |
|-------|------|-------|
| $id | String | Auto |
| user_id | String | → users.$id |
| subscription_id | String | → subscriptions.$id |
| plan | Enum | `silver` \| `gold` |
| amount_tnd | Float | 89.00 or 149.00 |
| payment_method | Enum | `flouci` \| `d17` \| `card` \| `cash` \| `transfer` |
| payment_ref | String | Payment reference number |
| status | Enum | `pending` \| `paid` \| `failed` \| `refunded` |
| paid_at | DateTime | When payment confirmed |
| created_at | DateTime | Order creation time |

### Collection 4: `licenses`
| Field | Type | Notes |
|-------|------|-------|
| $id | String | Auto |
| qustodio_email | String | Qustodio account email |
| qustodio_password | String | Qustodio account password |
| plan | Enum | `silver` \| `gold` |
| is_assigned | Boolean | false = available |
| assigned_to_user | String | → users.$id (null if free) |
| assigned_at | DateTime | When assigned |
| expires_at | DateTime | When the Qustodio license expires |
| purchased_from | String | e.g., "Qustodio official" |
| notes | String | Admin notes |

---

## 🌐 PAGE STRUCTURE & ROUTES

### Public Pages (No login required)
```
/                     → Homepage (Hero + Products + Features + CTA)
/pricing              → Pricing page (Silver vs Gold comparison)
/features             → Features explained in Tunisian Arabic
/faq                  → Frequently asked questions
/contact              → Contact (WhatsApp button + email)
/auth/login           → Login page
/auth/register        → Register page (name, email, phone, address, password)
```

### Client Portal (Login required — role: customer)
```
/dashboard            → Client home: active subscription card + status
/dashboard/subscription → My subscription details + Qustodio credentials
/dashboard/orders     → Payment history table
/dashboard/profile    → Edit name, phone, address
/dashboard/support    → WhatsApp support button + FAQ
```

### Super Admin Portal (Login required — role: admin)
```
/admin                → Dashboard: stats cards (total users, active subs, revenue)
/admin/users          → All users table: name, email, phone, address, plan, status
/admin/users/[id]     → Single user detail: full profile + address + subscription + password
/admin/subscriptions  → All subscriptions: filter by plan/status, search
/admin/subscriptions/[id] → Edit subscription: change status, assign license, add notes
/admin/orders         → All orders: filter by status/plan, mark as paid
/admin/licenses       → License pool: add new, view assigned/available
/admin/licenses/new   → Add new Qustodio account (email + password + plan)
```

---

## 🏠 HOMEPAGE — SECTION BY SECTION

### Section 1: NAVBAR
```
Logo: "Carely" in green bold + ".tn" lighter
Right side: logo
Left side: nav links (الرئيسية · الأسعار · المميزات · تواصل معانا) + "سجل دخول" button (outlined) + "اشتري الآن" button (filled green)
Sticky on scroll, white background with green bottom border
Mobile: hamburger menu
```

### Section 2: HERO
```
Big headline (H1):
  "حمي أولادك على النت"
  "مع Carely.tn"

Subtext:
  "اشتري اشتراك Qustodio بالدينار التونسي — فعّل في دقيقتين — تابع من هاتفك"

Two CTA buttons:
  Primary: "اشتري الباقة الذهبية" → /pricing
  Secondary: "تعرف أكثر" → /features

Trust badges row below buttons:
  ✅ دفع آمن  |  ✅ تفعيل فوري  |  ✅ دعم بالتونسي  |  ✅ 9 مليون عيلة تثق بـ Qustodio

Hero image/illustration: family with devices, green tones (use a placeholder or CSS illustration)
```

### Section 3: STATS BAR
```
4 stat cards in a row:
  🌍 9 مليون+ عيلة تستخدم Qustodio
  ⭐ 4.3 تقييم التطبيق
  ⚡ تفعيل فوري بعد الدفع
  🇹🇳 دعم بالتونسي 100%
```

### Section 4: THE 2 PRODUCTS (Pricing Cards)
```
Section title: "اختار الباقة المناسبة لعيلتك"

TWO cards side by side:

SILVER CARD:
  Header: 🥈 Carely Silver
  Subtext: مناسبة للعيلة الصغيرة
  Price: 89 دت / سنة
  Devices badge: 5 أجهزة
  Feature list (checkmarks):
    ✓ حجب المواقع غير اللائقة
    ✓ تحديد وقت الشاشة
    ✓ تقارير أسبوعية
    ✓ دعم فني بالتونسي
    ✓ تفعيل فوري
  CTA button: "اشتري Silver" (silver/gray outlined button)

GOLD CARD (featured):
  Top badge: ⭐ الأكثر شراءً (gold background)
  Header: 🥇 Carely Gold
  Subtext: للعيلة اللي تحب الحماية الكاملة
  Price: 149 دت / سنة
  Devices badge: 10 أجهزة
  Feature list:
    ✓ كل مميزات Silver
    ✓ مراقبة واتساب وانستغرام
    ✓ تتبع الموقع الجغرافي
    ✓ تقارير يومية مفصلة
    ✓ حجب جهات الاتصال
    ✓ دعم VIP على واتساب
  CTA button: "اشتري Gold" (solid green button, larger)
  Border: 2px solid #d4a017 (gold)
```

### Section 5: HOW IT WORKS
```
Title: "3 خطوات وأولادك محميين 🛡️"

Step 1: 🛒 اختار باقتك
  "Silver أو Gold — كلو يتفعل في دقائق"

Step 2: 💳 ادفع بأمان
  "فلوسي، D17، أو كارت بنكي"

Step 3: 📧 فعّل التطبيق
  "يوصلك كود التفعيل على إيميلك مباشرة"
```

### Section 6: FEATURES GRID
```
Title: "شنو يقدر يعمل Qustodio؟"

9 feature cards:
  🔒 حجب المواقع — احجب أي موقع ما تحبش ولدك يشوفو
  ⏱️ وقت الشاشة — حدد متى وقداش يتفرج
  📍 تتبع الموقع — اعرف وينو في أي وقت
  📱 مراقبة التطبيقات — شوف كل تطبيق يفتحو
  💬 رسائل واتساب — تنبيه عند أي محادثة مريبة (Gold فقط)
  📊 تقارير تفصيلية — ملخص يومي وأسبوعي
  🌙 روتين النوم — أوقف النت تلقائيًا وقت النوم
  🚨 تنبيهات فورية — تنبيه لهاتفك في الحين
  📺 يوتيوب — شوف كل فيديو شافه ولدك
```

### Section 7: TESTIMONIALS
```
Title: "شنو قالو الوالدين التونسيين"

3 testimonial cards:
  "من بعد Carely، بات عندي راحة بال على أولادي" — أم بتول، تونس العاصمة
  "ولدي كان يقضي ساعات على النت، الآن كل شيء تحت السيطرة" — سيد نجيب، صفاقس
  "خدمة ممتازة وتفعيل سريع، ننصح بيه لكل عيلة" — أم سارة، سوسة
```

### Section 8: FAQ PREVIEW
```
Title: "أسئلة شايعة"

5 accordion items:
  Q: شنو هو Qustodio؟
  A: Qustodio هو أحسن تطبيق مراقبة أطفال في العالم، فيه أكثر من 9 مليون عيلة تستخدمه.

  Q: كيفاش يتفعل الاشتراك؟
  A: بعد الدفع، يوصلك إيميل فيه بيانات الدخول لـ Qustodio — تسجل وتبدأ في دقيقتين.

  Q: واش يخدم على الهاتف والكمبيوتر؟
  A: آه، Qustodio يخدم على Android، iPhone، Windows، Mac، وChromebook.

  Q: شنو الفرق بين Silver وGold؟
  A: Silver لـ 5 أجهزة، Gold لـ 10 أجهزة مع مراقبة واتساب وانستغرام وتتبع الموقع.

  Q: واش عندكم ضمان استرداد؟
  A: آه، ضمان استرداد 7 أيام بدون أسئلة.
```

### Section 9: CTA FINAL
```
Full-width green background section:
  Title: "ابدأ تحمي عيلتك اليوم"
  Subtext: "أكثر من 500 عيلة تونسية تثق بـ Carely.tn"
  Button: "اشتري الآن — ابدأ من 89 دت" (white button with green text)
```

### Section 10: FOOTER
```
4 columns:
  Col 1: Carely.tn logo + short description + social links (Facebook, Instagram, WhatsApp)
  Col 2: روابط (الرئيسية، الأسعار، المميزات، FAQ)
  Col 3: دعم (تواصل معانا، واتساب، سياسة الخصوصية)
  Col 4: تواصل (WhatsApp button: +216 XX XXX XXX, email: contact@carely.tn)

Bottom bar: © 2025 Carely.tn — جميع الحقوق محفوظة
```

---

## 🔐 AUTH SYSTEM

### Registration Page (/auth/register)
```
Form fields (all required):
  - الاسم الكامل (Full Name)
  - البريد الإلكتروني (Email)
  - كلمة السر (Password — min 8 chars)
  - تأكيد كلمة السر (Confirm Password)
  - رقم الهاتف (Phone — Tunisian format: 2X/5X/9X XXX XXX)
  - العنوان الكامل (Full Address — street + city)
  - الولاية (Wilaya — dropdown with all 24 Tunisian governorates)

After registration:
  - Create user in Appwrite Auth
  - Create user document in `users` collection with role: "customer"
  - Redirect to /dashboard
```

### Login Page (/auth/login)
```
Fields: Email + Password
After login: check role:
  - customer → /dashboard
  - admin → /admin
Remember me checkbox
Forgot password link (show email reset form)
```

---

## 👤 CLIENT PORTAL — DETAILED SPECS

### /dashboard — Main Dashboard
```
Top greeting: "أهلا، [اسم الزبون]! 👋"

SUBSCRIPTION STATUS CARD (large, centered):
  If ACTIVE:
    Big green badge: "اشتراكك نشط ✅"
    Plan name: Carely Silver / Carely Gold (with icon)
    Devices: 5 / 10 أجهزة
    Expiry date: "ينتهي في: 15 ديسمبر 2025"
    Days remaining: "بقالو 127 يوم"
    Progress bar showing time used vs remaining (green)

  If EXPIRED:
    Red banner: "اشتراكك انتهى ❌"
    Big CTA button: "جدد اشتراكك الآن"

  If PENDING:
    Yellow banner: "في انتظار تفعيل اشتراكك ⏳"
    "تواصل معانا على واتساب للتفعيل"

QUICK ACTIONS (3 cards):
  📧 بيانات الدخول → link to /dashboard/subscription
  📋 سجل الدفع → link to /dashboard/orders
  💬 تواصل معانا → opens WhatsApp
```

### /dashboard/subscription — Subscription Details
```
Card: "بيانات حساب Qustodio بتاعك"

IMPORTANT: Show credentials clearly
  - البريد الإلكتروني لـ Qustodio: [qustodio_email]
    (with copy button 📋)
  - كلمة السر: [shown as ••••••• with eye toggle to reveal]
    (with copy button 📋)
  - كود التفعيل: [activation_code if exists]

Setup instructions (numbered steps):
  1. حمّل تطبيق Qustodio من متجر التطبيقات
  2. افتح التطبيق وادخل البريد وكلمة السر اللي فوق
  3. أضف الجهاز بتاع ولدك من الداشبورد
  4. ابدأ في الحماية!

Link button: "افتح Qustodio Dashboard" → https://family.qustodio.com

Plan details card:
  - الباقة: Silver / Gold
  - عدد الأجهزة: 5 / 10
  - تاريخ البداية: [date]
  - تاريخ الانتهاء: [date]
  - الحالة: [status badge]
```

### /dashboard/orders — Order History
```
Table with columns:
  رقم الطلب | الباقة | المبلغ | طريقة الدفع | الحالة | التاريخ

Status badges:
  paid → green badge "مدفوع ✓"
  pending → yellow badge "في الانتظار"
  failed → red badge "فشل"

Empty state: "ما عندكش طلبات بعد — اشتري باقتك الأولى!"
```

### /dashboard/profile — Edit Profile
```
Editable form:
  - الاسم الكامل
  - رقم الهاتف
  - العنوان الكامل
  - الولاية (dropdown)
  
Read-only:
  - البريد الإلكتروني (can't change)

Change password section:
  - كلمة السر الحالية
  - كلمة السر الجديدة
  - تأكيد كلمة السر الجديدة
  Save button
```

---

## ⚙️ SUPER ADMIN PORTAL — DETAILED SPECS

### /admin — Admin Dashboard
```
TOP STATS ROW (4 metric cards):
  👥 إجمالي الزبائن: [count]
  ✅ اشتراكات نشطة: [count]
  ⏳ اشتراكات منتهية: [count]
  💰 إجمالي الإيرادات: [sum] دت

SECOND ROW:
  🥈 Silver نشط: [count]
  🥇 Gold نشط: [count]
  🔑 كودات متاحة: [count in licenses where is_assigned=false]
  📋 طلبات معلقة: [count where status=pending]

RECENT ORDERS TABLE (last 10):
  اسم الزبون | الباقة | المبلغ | الحالة | التاريخ | إجراء (view button)

EXPIRING SOON ALERT:
  List of subscriptions expiring in next 30 days
  Each row: اسم | باقة | ينتهي في [X] يوم | زر "تواصل"
```

### /admin/users — All Users
```
Search bar: بحث باسم أو إيميل أو هاتف
Filter dropdown: كل الزبائن / Silver فقط / Gold فقط / بدون اشتراك

TABLE columns:
  الاسم | الإيميل | الهاتف | الولاية | الباقة | الحالة | تاريخ التسجيل | إجراءات

Actions per row:
  👁️ عرض التفاصيل → /admin/users/[id]
  ✏️ تعديل
  🗑️ حذف (with confirmation modal)

Export button: تصدير CSV
```

### /admin/users/[id] — Single User Full Detail
```
This is the most important admin page.

SECTION 1 — معلومات الزبون:
  Full profile card showing:
  - الاسم الكامل
  - البريد الإلكتروني
  - رقم الهاتف
  - العنوان الكامل (address field — full text)
  - الولاية
  - تاريخ التسجيل
  - آخر دخول

SECTION 2 — بيانات الاشتراك:
  Subscription detail card:
  - الباقة: Silver / Gold (with colored badge)
  - الحالة: badge (active/expired/pending)
  - تاريخ البداية
  - تاريخ الانتهاء
  - عدد الأيام المتبقية

SECTION 3 — بيانات Qustodio (SENSITIVE — admin only):
  ⚠️ Red-bordered card with lock icon:
  Title: "🔐 بيانات حساب Qustodio"
  
  - إيميل Qustodio: [qustodio_email] + copy button
  - كلمة المرور: [shown hidden ••••••] + eye toggle + copy button
  - كود التفعيل: [activation_code] + copy button
  
  Admin note field: textarea to add internal notes
  Save notes button

SECTION 4 — سجل الطلبات:
  Mini table of all orders for this user

SECTION 5 — إجراءات الأدمن:
  Buttons:
  - "تعيين اشتراك جديد" (opens modal to assign license from pool)
  - "تغيير حالة الاشتراك" (dropdown: active/expired/cancelled)
  - "إرسال إيميل للزبون" (opens email modal)
  - "تواصل على واتساب" (opens whatsapp with pre-filled message)
  - "تجديد الاشتراك" (extend expiry by 1 year)
```

### /admin/subscriptions — All Subscriptions
```
Filters: الكل / نشطة / منتهية / معلقة | Silver / Gold | بحث

TABLE columns:
  الزبون | الإيميل | الباقة | الحالة | بداية | انتهاء | أيام متبقية | إجراء

Color coding:
  > 30 days: green row
  < 30 days: yellow row  
  Expired: red/gray row

Click row → /admin/subscriptions/[id]
```

### /admin/subscriptions/[id] — Edit Subscription
```
Full edit form:
  - Plan: Silver / Gold (dropdown)
  - Status: active / expired / pending / cancelled
  - Qustodio Email (editable)
  - Qustodio Password (editable — shown in plain text for admin)
  - Activation Code (editable)
  - Start Date (date picker)
  - End Date (date picker)
  - Notes (textarea)
  - Auto-renew toggle

Save button + Cancel button
Delete subscription button (red, with confirmation)
```

### /admin/orders — All Orders
```
Filters: الكل / مدفوع / معلق / فشل | بحث

TABLE columns:
  # | الزبون | الباقة | المبلغ | طريقة الدفع | مرجع الدفع | الحالة | التاريخ | إجراء

Action per order:
  "تأكيد الدفع" button (for pending orders) → changes status to paid + triggers license assignment
  "عرض الزبون" button → link to user detail

Revenue summary card at top:
  إجمالي المبيعات: X دت | Silver: X | Gold: X
```

### /admin/licenses — License Pool Management
```
STATS at top:
  🔑 كودات متاحة: [X Silver] [X Gold]
  ✅ كودات مستخدمة: [X]
  ⚠️ تنتهي هذا الشهر: [X]

TABLE of all licenses:
  إيميل Qustodio | كلمة المرور | الباقة | الحالة | مخصص لـ | تاريخ الانتهاء | إجراء

Status badges:
  متاح → green
  مستخدم → blue
  منتهي → red

"+ إضافة كود جديد" button → /admin/licenses/new
```

### /admin/licenses/new — Add New License
```
Form:
  - إيميل Qustodio: (text input)
  - كلمة مرور Qustodio: (text input — plain, this is account management)
  - نوع الباقة: Silver / Gold (radio buttons)
  - تاريخ انتهاء الكود: (date picker)
  - مصدر الشراء: (text — e.g., "Qustodio official site")
  - ملاحظات: (textarea)

Save button
```

---

## 🛒 CHECKOUT FLOW

### Step 1: Select Plan (/pricing)
- User clicks "اشتري Silver" or "اشتري Gold"
- If not logged in → redirect to /auth/register with plan stored in localStorage
- If logged in → redirect to /checkout/[plan]

### Step 2: Order Summary (/checkout/[plan])
```
Page layout:
  Left: Order summary card
    - Plan name + icon
    - Price
    - Device count
    - Duration: 12 شهر
    - Feature list
  
  Right: Payment form
    Customer info (pre-filled from profile):
      - الاسم: [auto-filled]
      - الإيميل: [auto-filled]
      - الهاتف: [auto-filled]
      - العنوان: [auto-filled]
    
    Payment method selection:
      💳 Carte Bancaire (card icon)
      📱 Flouci
      📲 D17
      🏦 Virement Bancaire (bank transfer)
      💵 دفع عند الاستلام (Cash on delivery — Tunisia)
    
    Payment reference field (appears for transfer/cash):
      "أدخل مرجع التحويل"
    
    Submit button: "تأكيد الطلب — [price] دت"
    
    Trust note: "🔒 دفعك آمن ومشفر 100%"
```

### Step 3: Order Created
- Create order in DB with status: pending
- If payment_method = card/flouci → redirect to payment gateway
- If payment_method = transfer/cash → show pending confirmation page

### Step 4: Success Page (/checkout/success)
```
Big checkmark animation (CSS only, green)
Title: "شكرًا! طلبك وصلنا ✅"

Message box:
  "راح يتواصل معاك فريقنا على واتساب في أقل من ساعة لتفعيل اشتراكك"

Order details card:
  - رقم الطلب: #CARE-XXXX
  - الباقة: Silver / Gold
  - المبلغ: XX دت
  - الحالة: في الانتظار / مؤكد

WhatsApp button: "تواصل معانا الآن على واتساب"
Dashboard button: "روح للداشبورد"
```

---

## 📱 MOBILE RESPONSIVENESS

- Full RTL on mobile
- Bottom navigation bar on mobile with icons:
  🏠 الرئيسية | 💰 الأسعار | 👤 حسابي | 💬 تواصل
- Cards stack vertically on mobile
- Pricing cards: stack vertically (Silver above Gold)
- Tables: horizontal scroll on mobile OR card-view alternative
- Font sizes: reduce heading by 4–6px on mobile
- Sticky WhatsApp FAB button (floating) on all pages: green circle button bottom-right

---

## 🌐 TUNISIAN WILAYA DROPDOWN

Include all 24 governorates:
```
تونس، أريانة، بن عروس، منوبة، نابل، زغوان، بنزرت، باجة،
جندوبة، الكاف، سليانة، القيروان، القصرين، سيدي بوزيد،
سوسة، المنستير، المهدية، صفاقس، قفصة، توزر، قبلي،
قابس، مدنين، تطاوين
```

---

## 🔔 NOTIFICATIONS & ALERTS

### Admin Alerts (shown in admin dashboard):
- ⚠️ طلبات دفع معلقة: X طلب ينتظر تأكيد
- 🔑 الكودات المتاحة قليلة: أقل من 5 كودات Silver / Gold
- 📅 اشتراكات تنتهي هذا الأسبوع: X اشتراك

### Client Alerts (shown in dashboard):
- 30 days before expiry: yellow banner "اشتراكك ينتهي في 30 يوم — جدد الآن"
- 7 days before: orange banner
- Expired: red banner with renew button

---

## 📋 ADDITIONAL IMPLEMENTATION NOTES

### Security Rules:
- Admin pages: check `role === "admin"` server-side — redirect if not
- Client pages: check authentication — redirect to login if not
- Qustodio passwords in DB: admin sees plain text (this is a credential manager, not user auth)
- Client sees their own Qustodio credentials only
- Rate limiting on auth endpoints

### Appwrite Auth Integration:
```typescript
// Register new user
const newAccount = await account.create(ID.unique(), email, password, name);
const session = await account.createEmailPasswordSession(email, password);

// Then create user document in database
await databases.createDocument(
  "carely_db",
  "users", 
  newAccount.$id, // use same ID
  { name, email, phone, address, wilaya, role: "customer" }
);
```

### Admin Route Protection (middleware.ts):
```typescript
export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  // Check Appwrite session + role from users collection
  // Redirect to /auth/login if not authenticated
  // Redirect to /dashboard if authenticated but not admin
}
```

### WhatsApp Integration:
```
All WhatsApp links use format:
https://wa.me/216XXXXXXXX?text=مرحبا، أريد الاستفسار عن اشتراك Carely.tn

Pre-fill message for support: 
"مرحبا Carely.tn، اسمي [name]، عندي مشكل في اشتراكي رقم [order_id]"
```

### Copy to Clipboard:
All credential fields (email, password, activation code) must have a copy button that:
1. Copies text to clipboard
2. Shows "تم النسخ! ✓" tooltip for 2 seconds
3. Returns to clipboard icon

### Password Visibility Toggle:
Qustodio password fields use eye icon toggle:
- Default: `••••••••` hidden
- Click eye: show plain text
- Click again: hide

---

## 📁 FINAL FOLDER STRUCTURE

```
carely-tn/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx              ← Homepage
│   │   │   ├── pricing/page.tsx
│   │   │   ├── features/page.tsx
│   │   │   ├── faq/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── checkout/
│   │   │   ├── [plan]/page.tsx
│   │   │   └── success/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx              ← Client home
│   │   │   ├── subscription/page.tsx ← Credentials view
│   │   │   ├── orders/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx              ← Admin dashboard
│   │   │   ├── users/
│   │   │   │   ├── page.tsx          ← All users
│   │   │   │   └── [id]/page.tsx     ← User detail + credentials
│   │   │   ├── subscriptions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── licenses/
│   │   │       ├── page.tsx
│   │   │       └── new/page.tsx
│   │   ├── layout.tsx                ← Baloo font + RTL + Providers
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       ← shadcn components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── WhatsAppFAB.tsx       ← Floating WhatsApp button
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   ├── ProductCards.tsx      ← Silver + Gold cards
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── FeaturesGrid.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── FaqAccordion.tsx
│   │   │   └── FinalCTA.tsx
│   │   ├── dashboard/
│   │   │   ├── SubscriptionCard.tsx
│   │   │   └── CredentialsCard.tsx   ← Show Qustodio creds with copy
│   │   └── admin/
│   │       ├── StatsGrid.tsx
│   │       ├── UsersTable.tsx
│   │       ├── LicenseForm.tsx
│   │       └── CredentialsManager.tsx
│   ├── lib/
│   │   ├── appwrite.ts               ← Client setup
│   │   ├── appwrite-config.ts        ← IDs & constants
│   │   ├── appwrite-server.ts        ← Server-side client (admin)
│   │   └── utils.ts                  ← formatDate, copyToClipboard, etc.
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSubscription.ts
│   │   └── useAdmin.ts
│   └── middleware.ts                  ← Route protection
├── public/
│   └── images/
├── .env.local
└── package.json
```

---

## ✅ MVP ACCEPTANCE CRITERIA

The MVP is complete when:
- [ ] Homepage shows Silver + Gold products clearly with prices
- [ ] User can register with name, email, phone, full address, wilaya
- [ ] User can login and see their subscription status
- [ ] User can see their Qustodio email + password (eye toggle + copy)
- [ ] Admin can login at /admin with separate portal
- [ ] Admin sees full user details including address and Qustodio credentials
- [ ] Admin can add licenses (email + password + plan) to the pool
- [ ] Admin can assign a license to a user/subscription
- [ ] Admin can change subscription status (active/expired/pending)
- [ ] Orders are tracked with payment method and reference
- [ ] RTL layout works correctly throughout
- [ ] Baloo Bhaijaan 2 font is applied everywhere
- [ ] WhatsApp FAB button visible on all pages
- [ ] Mobile responsive on 375px+ screens
- [ ] All Tunisian wilayas in address dropdown

---

*Carely.tn — حمي عيلتك على النت 🇹🇳*
*Prompt Version: 1.0 — MVP Focus — 2 Products Only*
