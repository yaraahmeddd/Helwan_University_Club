# التقنيات المستخدمة — Technologies Used

## نظرة عامة | Overview

**Capital University Club** — نظام إدارة نادي جامعي شامل (أعضاء، موظفين، رياضات، فرق، حجوزات، مدفوعات، إعلام، تدقيق).

---

## الواجهة الأمامية | Front-End

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| **React** | 19.x | واجهة المستخدم |
| **TypeScript** | 5.9 | Typing آمن |
| **Vite** | 7.x | Build tool & dev server |
| **React Router** | 7.x | التوجيه (Routing) |
| **Tailwind CSS** | 4.x | التنسيق |
| **Radix UI** | — | مكونات UI (Dialog, Select, …) |
| **TanStack Query** | 5.x | جلب البيانات والـ cache |
| **Axios** | 1.x | HTTP client |
| **i18next** | 25.x | الترجمة (AR / EN) |
| **React Hook Form + Zod** | — | النماذج والتحقق |
| **Framer Motion** | — | الحركات |
| **Recharts** | — | الرسوم البيانية |
| **ExcelJS** | — | تصدير Excel |
| **html2pdf.js** | — | تصدير PDF |
| **Socket.io Client** | 4.x | إشعارات فورية |
| **Lucide React** | — | الأيقونات |

**المجلد:** `Frontend/src/`  
**البنية:** Feature-based modules (`features/auth`, `features/staff`, `features/member-portal`, …)

---

## الخلفية | Back-End

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| **Node.js** | 18+ / 20 LTS | Runtime |
| **Express** | 5.x | REST API |
| **TypeScript** | 5.9 | Typing |
| **TypeORM** | 0.3.x | ORM |
| **PostgreSQL** | 16–18 | قاعدة البيانات |
| **bcrypt** | 6.x | تشفير كلمات المرور |
| **jsonwebtoken** | 9.x | JWT Authentication |
| **Socket.io** | 4.x | WebSocket (إشعارات) |
| **Multer** | — | رفع الملفات |
| **express-validator** | — | التحقق من المدخلات |

**المجلد:** `Backend/src/`  
**البنية:** Controllers → Services → Entities (Repository pattern)

---

## قاعدة البيانات | Database

| التقنية | الاستخدام |
|---------|-----------|
| **PostgreSQL** | قاعدة البيانات الرئيسية |
| **uuid-ossp / pgcrypto** | Extensions |
| **SQL migrations** | `Backend/migrations/*.sql` |
| **pg_dump backup** | `database/full-dump.sql` |

---

## خدمات خارجية (اختيارية) | External Services

| الخدمة | الاستخدام |
|--------|-----------|
| **Paymob** | بوابة الدفع الإلكتروني (مصر) |
| **Google Gemini AI** | شات بوت مساعد |
| **Cloudinary** | رفع صور (اختياري — البديل: تخزين محلي) |

---

## أدوات التطوير | Dev Tools

| الأداة | الاستخدام |
|--------|-----------|
| **ESLint** | Linting (Frontend) |
| **nodemon + ts-node** | Hot reload (Backend dev) |
| **Postman collections** | `Backend/docs/postman/` |

---

## البنية المعمارية | Architecture

```
┌─────────────┐     HTTP/WS      ┌─────────────┐     SQL      ┌──────────────┐
│   React     │ ◄──────────────► │   Express   │ ◄──────────► │  PostgreSQL  │
│   (Vite)    │   /api + socket  │  TypeORM    │              │              │
└─────────────┘                  └─────────────┘              └──────────────┘
       │                                │
       │                                ├── Paymob (payments)
       │                                ├── Gemini (AI chat)
       └── i18n AR/EN                   └── Local uploads / Cloudinary
```

---

## متطلبات التشغيل | Runtime Requirements

- Node.js 18 LTS أو أحدث (موصى: 20 LTS)
- npm 9+
- PostgreSQL 16+ مع extensions: `uuid-ossp`, `pgcrypto`
- متصفح حديث (Chrome, Edge, Firefox)
