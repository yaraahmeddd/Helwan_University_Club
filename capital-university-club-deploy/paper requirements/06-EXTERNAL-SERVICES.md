# الخدمات الخارجية و APIs — External Services

## 1. PostgreSQL (مطلوب)

**النوع:** قاعدة بيانات  
**الاستخدام:** تخزين كل بيانات النظام

**الإعداد:**

1. ثبّت PostgreSQL 16+
2. أنشئ قاعدة `Helwan-University-Club`
3. فعّل extensions: `uuid-ossp`, `pgcrypto`
4. استعد `database/full-dump.sql`
5. اضبط `DB_*` في `Backend/.env`

---

## 2. Paymob — بوابة الدفع (اختياري)

**النوع:** Payment gateway (Egypt)  
**الاستخدام:** اشتراكات العضوية، اشتراكات الفرق، حجوزات الملاعب

**المسارات:** `Backend/src/services/PaymobService.ts`, `Backend/src/routes/PaymobRoutes.ts`

**متغيرات البيئة:**

```env
PAYMOB_API_KEY=your_api_key
PAYMOB_INTEGRATION_ID=123456
PAYMOB_IFRAME_ID=789012
```

**الإعداد:**

1. سجّل في [Paymob Accept](https://accept.paymob.com/)
2. من Dashboard → Settings → Account Info → API Key
3. أنشئ Integration (Card / Wallet) واحصل على Integration ID
4. احصل على iFrame ID من Paymob portal
5. ضع القيم في `Backend/.env` وأعد تشغيل السيرفر

**بدون Paymob:** باقي النظام يعمل؛ عمليات الدفع ستفشل أو تستخدم وضع تجريبي حسب الشاشة.

---

## 3. Google Gemini AI — الشات بوت (اختياري)

**النوع:** Generative AI API  
**الاستخدام:** مساعد ذكي في الواجهة

**المسارات:** `Backend/src/controllers/ai.controller.ts`, `Backend/src/routes/AiRoutes.ts`

**متغير البيئة:**

```env
GEMINI_API_KEY=your_google_ai_studio_key
```

**الإعداد:**

1. افتح [Google AI Studio](https://aistudio.google.com/apikey)
2. أنشئ API Key
3. ضعه في `Backend/.env` **بدون** أقواس `[ ]`
4. أعد تشغيل Backend

**بدون المفتاح:** API يرجع `503 AI service is not configured`.

---

## 4. Cloudinary — رفع الصور (اختياري)

**النوع:** Cloud media storage  
**الاستخدام:** بعض مسارات رفع الصور (البديل الافتراضي: تخزين محلي)

**المسار:** `Backend/src/utils/cloudinaryUpload.ts`

**متغيرات البيئة:**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**الإعداد:**

1. سجّل في [Cloudinary](https://cloudinary.com/)
2. من Dashboard → Account Details
3. انسخ Cloud name, API Key, API Secret

**بدون Cloudinary:** الملفات تُحفظ في `Backend/uploads/` (Local storage).

---

## 5. Socket.io — إشعارات فورية (مدمج)

**النوع:** WebSocket (self-hosted)  
**الاستخدام:** إشعارات Staff / Members

**لا يحتاج API key خارجي** — يعمل على نفس منفذ Backend (`PORT=3000`).

**Frontend:** `socket.io-client` يتصل بـ `BACKEND_ORIGIN`.

**Nginx (production):** proxy `/socket.io/` — راجع `README-DEPLOY.md`.

---

## 6. JWT — المصادقة (مدمج)

**لا خدمة خارجية** — يستخدم `JWT_SECRET` من `.env`.

---

## ملخص: ما هو مطلوب للتشغيل الكامل؟

| Service | Required for demo? | Required for production? |
|---------|-------------------|-------------------------|
| PostgreSQL | ✅ Yes | ✅ Yes |
| JWT (local) | ✅ Yes | ✅ Yes |
| Local file storage | ✅ Yes | ✅ Yes |
| Paymob | ❌ Optional | ✅ For real payments |
| Gemini AI | ❌ Optional | ❌ Optional |
| Cloudinary | ❌ Optional | ❌ Optional (local works) |
