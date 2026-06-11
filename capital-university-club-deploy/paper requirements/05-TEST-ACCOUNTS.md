# بيانات الدخول التجريبية — Test Accounts

> **كلمة المرور الافتراضية لجميع الحسابات بعد استعادة `full-dump.sql`:**  
> **`Password@123`**

⚠️ **غيّر كلمات المرور قبل الإطلاق الفعلي (Production).**

---

## موظفين (Staff)

| Email | Role (EN) | Role (AR) |
|-------|-----------|-----------|
| `admin@club.local` | System Administrator | مدير النظام (Amr El Sayed) |
| `sport.manager@club.local` | Sport Activity Manager | مدير النشاط الرياضي |
| `finance.director@club.local` | Director of Financial Affairs | مدير الشؤون المالية |
| `registration@club.local` | Registration Staff | موظف تسجيل |

**مسار الدخول:** `/staff/login` أو `/login` ثم اختيار Staff

---

## أعضاء (Members)

| Email range | Type |
|-------------|------|
| `student1@uni.local` … `student10@uni.local` | Student members |
| `working1@uni.local` … `working8@uni.local` | Working members |

**مسار الدخول:** `/login` → Member portal

---

## لاعبي فرق (Team Members)

يتم إنشاؤهم عبر التسجيل أو لوحة Staff → Add Team Player.  
بعد استعادة الـ dump، راجع جدول `accounts` حيث `role = 'team_member'`.

---

## إعادة تعيين حساب المدير

```bash
cd Backend
npm run create:admin-account
```

ينشئ/يحدّث:

- Email: `admin@club.local`
- Password: `Password@123`

---

## التحقق من تسجيل الدخول (API)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@club.local\",\"password\":\"Password@123\"}"
```

**Response:** JSON يحتوي `token` — استخدمه في `Authorization: Bearer <token>`

---

## بيانات تجريبية في قاعدة البيانات

| Entity | Approx. count |
|--------|---------------|
| Accounts | 56 |
| Members | 38 |
| Staff | 10 |
| Sports | 12 |
| Teams | 16 |
| Branches | 4 |
| Fields | 18 |
| Bookings | 30 |
| Payments | 52 |
| Media Posts | 18 |
