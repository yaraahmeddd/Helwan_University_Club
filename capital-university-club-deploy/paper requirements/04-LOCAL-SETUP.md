# خطوات تشغيل المشروع محلياً — Local Setup Guide

## 1. المتطلبات المسبقة

| البرنامج | الإصدار |
|----------|---------|
| Node.js | 18+ (موصى: 20 LTS) |
| npm | 9+ |
| PostgreSQL | 16+ |
| Git (اختياري) | — |

---

## 2. إعداد قاعدة البيانات

### Windows (PowerShell)

```powershell
# إنشاء قاعدة البيانات (مرة واحدة)
psql -U postgres -c "CREATE DATABASE ""Helwan-University-Club"";"
psql -U postgres -d "Helwan-University-Club" -c "CREATE EXTENSION IF NOT EXISTS ""uuid-ossp""; CREATE EXTENSION IF NOT EXISTS ""pgcrypto"";"

# استعادة النسخة الاحتياطية
cd "path\to\capital-university-club-deploy"
psql -U postgres -d "Helwan-University-Club" -f database\full-dump.sql
```

### Linux / macOS

```bash
sudo -u postgres psql -c 'CREATE DATABASE "Helwan-University-Club";'
sudo -u postgres psql -d "Helwan-University-Club" -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS "pgcrypto";'
psql -U postgres -d "Helwan-University-Club" -f database/full-dump.sql
```

> **pgAdmin:** افتح PSQL Tool على قاعدة البيانات ثم: `\i 'C:/path/to/database/full-dump.sql'`

### بديل: Migrations فقط (بدون بيانات تجريبية)

```bash
cd Backend
npm install
# اضبط .env أولاً
npm run migrate
npm run create:admin-account
```

---

## 3. إعداد Backend

```powershell
cd Backend
copy .env.example .env
# عدّل DB_* و JWT_SECRET في .env

npm install
npm run dev
```

**توقع:** `Server running on http://0.0.0.0:3000` و `Database connected successfully`

**تحقق:**

```powershell
curl http://localhost:3000/api/memberships
```

---

## 4. إعداد Frontend

```powershell
cd Frontend
copy .env.example .env
# VITE_BACKEND_URL=http://localhost:3000/api

npm install
npm run dev
```

**توقع:** `Local: http://localhost:5173/` (أو 5174/5175 إذا كان المنفذ مشغولاً)

---

## 5. تسجيل الدخول

افتح المتصفح → `/login` أو `/staff/login`

| Email | Password | Role |
|-------|----------|------|
| `admin@club.local` | `Password@123` | System Administrator |

راجع [05-TEST-ACCOUNTS.md](./05-TEST-ACCOUNTS.md) لمزيد من الحسابات.

---

## 6. Build للإنتاج (اختياري)

```bash
# Backend
cd Backend
npm run build
node dist/index.js

# Frontend
cd Frontend
npm run build
# الملفات في Frontend/dist/
```

---

## 7. استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `Database connection failed` | تحقق من `DB_*` في `.env` وتشغيل PostgreSQL |
| CORS error | أضف منفذ الفرونت إلى `ALLOWED_ORIGINS` |
| 401 على API | سجّل دخول أو تحقق من JWT |
| AI chat لا يعمل | أضف `GEMINI_API_KEY` (اختياري) |
| الدفع لا يعمل | أضف مفاتيح Paymob (اختياري) |
| صور لا تظهر | تحقق من `Backend/uploads/` و `BASE_URL` |

---

## 8. Postman / API Docs

- Postman collections: `Backend/docs/postman/`
- Team Sports API: `Backend/docs/README_TEAM_SPORTS_API.md`
