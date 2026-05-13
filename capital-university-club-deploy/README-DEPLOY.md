# دليل نشر نادي جامعة العاصمة (Capital University Club)

> حزمة نشر كاملة تشمل: الكود المصدري للباك والفرونت، نسخة احتياطية كاملة للقاعدة، والـ dist المبني.

## المحتويات

```
deploy-package/
├── README-DEPLOY.md           ← هذا الملف
├── Backend/                   ← كود الـ Node.js / Express / TypeORM
│   ├── src/                   ← كود الباك
│   ├── migrations/            ← SQL migrations
│   ├── scripts/               ← سكريبتات تشغيل (seed, sync, …)
│   ├── docs/                  ← postman collections + توثيق
│   ├── uploads/               ← ملفات المستخدمين + media news + شعارات
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example           ← قالب متغيرات البيئة (انسخه لـ .env)
├── Frontend/                  ← كود React / Vite
│   ├── src/                   ← كود الفرونت
│   ├── public/                ← assets ثابتة (صور، فيديوهات، شعارات)
│   ├── dist/                  ← الـ build جاهز للنشر (production)
│   ├── package.json
│   └── vite.config.ts
└── database/
    └── full-dump.sql          ← نسخة احتياطية كاملة من قاعدة البيانات
```

---

## متطلبات السيرفر

| البرنامج | الإصدار الموصى به |
|---|---|
| **Node.js** | 18 LTS أو 20 LTS أو 24 |
| **npm** | 9+ |
| **PostgreSQL** | 16، 17، أو 18 |
| **OS** | Ubuntu 22.04+ / Debian 12+ / Windows Server 2019+ |

---

## خطوات النشر (Linux/Ubuntu)

### الخطوة 1 ـ تنصيب الـ prerequisites

```bash
# Node.js (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 18
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update && sudo apt install -y postgresql-18

# Optional: PM2 لإدارة الـ Node service
sudo npm install -g pm2
```

### الخطوة 2 ـ استعادة قاعدة البيانات

```bash
# اعمل DB user و database
sudo -u postgres psql -c "CREATE USER club_user WITH PASSWORD 'STRONG_PASSWORD_HERE';"
sudo -u postgres psql -c "CREATE DATABASE \"Helwan-University-Club\" OWNER club_user;"
sudo -u postgres psql -d "Helwan-University-Club" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"

# استعد البيانات من الـ dump
PGPASSWORD='STRONG_PASSWORD_HERE' psql -h localhost -U club_user -d "Helwan-University-Club" -f database/full-dump.sql
```

### الخطوة 3 ـ تنصيب الباك وتشغيله

```bash
cd Backend
cp .env.example .env
nano .env   # ← عدّل المتغيرات (DB_PASSWORD, JWT_SECRET, ...)

npm install --production
npm run build          # يبني TypeScript → JavaScript في dist/

# تشغيل عبر PM2
pm2 start dist/index.js --name club-backend
pm2 save
pm2 startup     # يعمل خدمة boot
```

### الخطوة 4 ـ نشر الفرونت

#### الخيار أ ـ استخدام الـ dist الجاهز
```bash
# انسخ مجلد Frontend/dist إلى الـ web server
sudo cp -r Frontend/dist/* /var/www/club/
sudo chown -R www-data:www-data /var/www/club
```

#### الخيار ب ـ بناء الفرونت من جديد على السيرفر
```bash
cd Frontend
npm install
npm run build
sudo cp -r dist/* /var/www/club/
```

#### إعداد Nginx
```nginx
server {
    listen 80;
    server_name club.example.com;
    root /var/www/club;
    index index.html;

    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # WebSocket (Socket.io)
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Backend uploads (news images, user files)
    location /uploads/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    client_max_body_size 20M;   # for file uploads
}
```

اعمل enable + restart:
```bash
sudo ln -s /etc/nginx/sites-available/club /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### الخطوة 5 ـ تأمين HTTPS (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d club.example.com
```

---

## خطوات النشر (Windows Server)

### تنصيب
1. حمّل Node.js 20 LTS من https://nodejs.org
2. حمّل PostgreSQL 18 من https://www.postgresql.org/download/windows/
3. ثبّت IIS مع URL Rewrite Module

### استعادة قاعدة البيانات
```powershell
# في PowerShell كـ Administrator
$env:PGPASSWORD = "POSTGRES_PASSWORD"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -c "CREATE DATABASE ""Helwan-University-Club"";"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d "Helwan-University-Club" -c "CREATE EXTENSION IF NOT EXISTS ""uuid-ossp""; CREATE EXTENSION IF NOT EXISTS ""pgcrypto"";"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d "Helwan-University-Club" -f database\full-dump.sql
```

### تشغيل الباك كـ Windows Service
```powershell
cd Backend
copy .env.example .env
# عدّل .env

npm install --production
npm run build

# عبر node-windows أو nssm
nssm install club-backend "C:\Program Files\nodejs\node.exe" "C:\path\to\Backend\dist\index.js"
nssm start club-backend
```

### نشر الفرونت
انسخ `Frontend/dist/*` إلى `C:\inetpub\wwwroot\club\` ـ web.config مرفق.

---

## المتغيرات البيئية المهمة (Backend/.env)

```bash
# قاعدة البيانات
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=club_user
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=Helwan-University-Club

# السيرفر
PORT=3000
NODE_ENV=production

# CORS (اضبط على دومين الموقع الحقيقي)
ALLOWED_ORIGINS=https://club.example.com

# JWT — استبدل بقيمة عشوائية قوية (32+ بايت)
JWT_SECRET=ضع_هنا_سلسلة_عشوائية_طويلة_جداً_وآمنة
JWT_EXPIRES_IN=7d

# TypeORM
TYPEORM_LOGGING=false
TYPEORM_SYNCHRONIZE=false
```

> **مهم جداً**: غيّر `JWT_SECRET` لقيمة عشوائية. مثال:
> ```bash
> openssl rand -base64 32
> ```

---

## ضبط الفرونت لدومين الـ production

في `Frontend/src/config/backend.ts`:
```ts
export const BACKEND_ORIGIN = "https://club.example.com";
export const BACKEND_API_BASE = `${BACKEND_ORIGIN}/api`;
```

ثم: `npm run build` لإعادة البناء.

---

## حسابات اختبار جاهزة (بعد استعادة البيانات)

كلمة السر لكل الحسابات: **`Password@123`** ـ غيّرها قبل الـ go-live.

| الإيميل | الدور |
|---|---|
| `admin@club.local` | Administrator (عمرو السيد) |
| `sport.manager@club.local` | مدير النشاط الرياضي |
| `finance.director@club.local` | مدير الشؤون المالية |
| `registration@club.local` | موظف تسجيل |
| `student1@uni.local` → `student10@uni.local` | أعضاء طلاب |
| `working1@uni.local` → `working8@uni.local` | أعضاء موظفين |

---

## البيانات الموجودة في الـ DB

| الجدول | العدد |
|---|---:|
| Accounts | 56 |
| Members | 38 |
| Staff | 10 |
| Sports | 12 |
| Branches | 4 |
| Fields | 18 |
| Teams | 16 |
| Bookings | 30 |
| Payments | 52 |
| Membership Plans | 12 |
| Media Posts (News) | 18 |
| Announcements | 8 |

---

## التحقق من النشر

بعد الانتهاء:
```bash
# تحقق أن الباك يستجيب
curl http://localhost:3000/api/memberships
# يجب أن يرجع JSON بـ 12 خطة

# تحقق من الـ login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@club.local","password":"Password@123"}'
```

---

## دعم وصيانة

- **اللوقز**: `pm2 logs club-backend` أو `pm2 logs club-backend --lines 200`
- **إعادة تشغيل**: `pm2 restart club-backend`
- **نسخة احتياطية للـ DB**:
  ```bash
  pg_dump -h localhost -U club_user "Helwan-University-Club" > backup-$(date +%F).sql
  ```

---

## قبل الإطلاق الفعلي ـ Checklist

- [ ] تغيير `JWT_SECRET` لقيمة عشوائية قوية
- [ ] تغيير كل كلمات سر الحسابات الافتراضية
- [ ] ضبط `ALLOWED_ORIGINS` لدومين الإنتاج فقط
- [ ] تفعيل HTTPS (Let's Encrypt)
- [ ] تأكيد نسخ احتياطي دوري للـ DB (cron job)
- [ ] إعداد Helmet middleware للـ security headers
- [ ] إعداد rate limiting على `/api/auth/*`
- [ ] حماية endpoints حساسة بـ authMiddleware (راجع التقرير الأمني السابق)
