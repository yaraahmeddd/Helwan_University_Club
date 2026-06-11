# متغيرات البيئة — Environment Variables

## ملفات القوالب | Template files

| المشروع | الملف |
|---------|-------|
| Backend | [`Backend/.env.example`](../Backend/.env.example) · [نسخة في هذا المجلد](./Backend.env.example) |
| Frontend | [`Frontend/.env.example`](../Frontend/.env.example) · [نسخة في هذا المجلد](./Frontend.env.example) |

**خطوة مطلوبة:** انسخ كل ملف إلى `.env` في نفس المجلد وعدّل القيم.

---

## Backend (.env)

### قاعدة البيانات (مطلوب)

| Variable | Example | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | عنوان PostgreSQL |
| `DB_PORT` | `5432` | منفذ PostgreSQL |
| `DB_USERNAME` | `postgres` | اسم المستخدم |
| `DB_PASSWORD` | `your_password` | كلمة المرور |
| `DB_NAME` | `Helwan-University-Club` | اسم قاعدة البيانات |

### السيرفر (مطلوب)

| Variable | Example | Description |
|----------|---------|-------------|
| `PORT` | `3000` | منفذ الـ API |
| `NODE_ENV` | `development` | `development` أو `production` |
| `BASE_URL` | `http://localhost:3000` | الرابط العام للملفات المرفوعة |
| `FRONTEND_URL` | `http://localhost:5173` | رابط الواجهة (روابط التسجيل/الدفع) |

### الأمان (مطلوب في الإنتاج)

| Variable | Example | Description |
|----------|---------|-------------|
| `JWT_SECRET` | *(random 32+ bytes)* | سر توقيع JWT — **غيّره دائماً** |
| `JWT_EXPIRES_IN` | `7d` | مدة صلاحية التوكن |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS — قائمة دومينات مفصولة بفاصلة |

> توليد `JWT_SECRET`: `openssl rand -base64 32`

### TypeORM

| Variable | Example | Description |
|----------|---------|-------------|
| `TYPEORM_SYNCHRONIZE` | `false` | **اتركه false** في الإنتاج |
| `TYPEORM_LOGGING` | `false` | تفعيل SQL logs |
| `LOG_LEVEL` | `info` | مستوى السجلات |

### خدمات اختيارية

| Variable | Required? | Description |
|----------|-----------|-------------|
| `GEMINI_API_KEY` | Optional | Google AI Studio — للشات بوت |
| `PAYMOB_API_KEY` | Optional | Paymob — للمدفوعات |
| `PAYMOB_INTEGRATION_ID` | Optional | Paymob integration ID |
| `PAYMOB_IFRAME_ID` | Optional | Paymob iframe ID |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary secret |
| `DEBUG_AUTH` | Optional | `true` لتفعيل logs مصادقة إضافية |
| `DATABASE_URL` | Optional | Connection string (لـ migrate script فقط) |

---

## Frontend (.env)

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_BACKEND_URL` | `http://localhost:3000/api` | Base URL للـ API |

> في الإنتاج: `VITE_BACKEND_URL=https://your-domain.com/api` ثم `npm run build`.

**ملاحظة:** يوجد أيضاً [`Frontend/src/config/backend.ts`](../Frontend/src/config/backend.ts) لضبط `BACKEND_ORIGIN` في التطوير.

---

## مثال .env للتطوير المحلي

### Backend/.env

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=0000
DB_NAME=Deploy

PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

JWT_SECRET=dev-only-change-in-production
JWT_EXPIRES_IN=7d

TYPEORM_SYNCHRONIZE=false
TYPEORM_LOGGING=false
LOG_LEVEL=info

# Optional — leave empty if not using
GEMINI_API_KEY=your_gemini_api_key_here
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
```

### Frontend/.env

```env
VITE_BACKEND_URL=http://localhost:3000/api
```
