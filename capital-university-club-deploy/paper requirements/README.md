# حزمة التسليم — نادي جامعة العاصمة (Capital University Club)

> مطابقة لمتطلبات تسليم مشروع التخرج — CITC / Helwan University

## فهرس الملفات

| # | المطلوب | الملف / المسار | الحالة |
|---|---------|----------------|--------|
| 1 | الكود المصدري للواجهة الأمامية (Front-End) | [`Frontend/src/`](../Frontend/src/) | ✅ موجود |
| 2 | الكود المصدري للخلفية (Back-End) | [`Backend/src/`](../Backend/src/) | ✅ موجود |
| 3 | نسخة قاعدة البيانات أو Scripts | [`database/full-dump.sql`](../database/full-dump.sql) + [`Backend/migrations/`](../Backend/migrations/) | ✅ موجود |
| 4 | ملف التقنيات المستخدمة | [01-TECHNOLOGIES.md](./01-TECHNOLOGIES.md) | ✅ تم إعداده |
| 5 | ملف المتطلبات والتبعيات | [02-DEPENDENCIES.md](./02-DEPENDENCIES.md) + `package.json` | ✅ موجود |
| 6 | ملف إعدادات البيئة | [03-ENVIRONMENT-VARIABLES.md](./03-ENVIRONMENT-VARIABLES.md) + `.env.example` | ✅ تم تحديثه |
| 7 | خطوات تشغيل المشروع محلياً | [04-LOCAL-SETUP.md](./04-LOCAL-SETUP.md) | ✅ تم إعداده |
| 8 | بيانات الدخول التجريبية | [05-TEST-ACCOUNTS.md](./05-TEST-ACCOUNTS.md) | ✅ تم إعداده |
| 9 | APIs وخدمات خارجية | [06-EXTERNAL-SERVICES.md](./06-EXTERNAL-SERVICES.md) | ✅ تم إعداده |

---

## هيكل المشروع

```
capital-university-club-deploy/
├── Backend/                 ← Node.js + Express + TypeORM
│   ├── src/                 ← كود المصدر
│   ├── migrations/          ← سكريبتات SQL للتحديثات
│   ├── scripts/             ← سكريبتات SQL مساعدة
│   ├── docs/                ← Postman + توثيق API
│   ├── uploads/             ← ملفات المستخدمين المرفوعة
│   ├── package.json
│   └── .env.example
├── Frontend/                ← React + Vite + TypeScript
│   ├── src/                 ← كود المصدر
│   ├── public/              ← أصول ثابتة
│   ├── dist/                ← Build جاهز للإنتاج (اختياري)
│   ├── package.json
│   └── .env.example
├── database/
│   └── full-dump.sql        ← نسخة احتياطية كاملة (~230 KB)
├── paper requirements/      ← هذا المجلد — وثائق التسليم
└── README-DEPLOY.md         ← دليل النشر على السيرفر
```

---

## تشغيل سريع (ملخص)

راجع [04-LOCAL-SETUP.md](./04-LOCAL-SETUP.md) للتفاصيل الكاملة.

```powershell
# 1) PostgreSQL — استعادة البيانات
psql -U postgres -d "Helwan-University-Club" -f database\full-dump.sql

# 2) Backend
cd Backend
copy .env.example .env
# عدّل DB_* و JWT_SECRET
npm install
npm run dev

# 3) Frontend (نافذة جديدة)
cd Frontend
copy .env.example .env
npm install
npm run dev
```

- الواجهة: http://localhost:5173 (أو المنفذ الذي يظهر في الطرفية)
- الـ API: http://localhost:3000/api
- تسجيل دخول تجريبي: `admin@club.local` / `Password@123`

---

## ملاحظات للمُقيّم

- المشروع ثنائي اللغة (عربي / English) عبر `i18next`.
- المدفوعات عبر **Paymob** (اختياري — يحتاج مفاتيح).
- الشات الذكي عبر **Google Gemini** (اختياري — يحتاج `GEMINI_API_KEY`).
- رفع الملفات محلياً في `Backend/uploads/` (Cloudinary اختياري للصور).

---

**Contact (CITC):** CITC@hq.helwan.edu.eg | 01284907033 | 0225481025
