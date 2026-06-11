# قاعدة البيانات — Database Backup & Scripts

## 1. النسخة الاحتياطية الكاملة (Backup)

| File | Size | Description |
|------|------|-------------|
| [`database/Capital-Univrsity-Club.sql`](../database/Capital-Univrsity-Club.sql) | ~230 KB | نسخة PostgreSQL كاملة مع بيانات تجريبية |

**يحتوي على:** جداول، بيانات، حسابات تجريبية، رياضات، فرق، حجوزات، …

### استعادة (Restore)

```powershell
psql -U postgres -d "Helwan-University-Club" -f database\full-dump.sql
```

**pgAdmin:** PSQL Tool → `\i 'full/path/to/Capital-Univrsity-Club.sql'`

> احذف التعليقات في أول الملف إذا طلب pgAdmin ذلك (سطر `-- DELETE THIS BEFORE RUNNING`).

---

## 2. Migrations (سكريبتات التحديث)

**المجلد:** [`Backend/migrations/`](../Backend/migrations/)

| File | Purpose |
|------|---------|
| `001_create_media_center_tables.sql` | جداول Media Center |
| `002_default_membership_plans.sql` | خطط العضوية الافتراضية |
| `004_team_training_schedules.sql` | جداول مواعيد التدريب |
| `007_complete_database_refactoring.sql` | Refactoring شامل |
| `008_fix_team_member_teams_updated_at.sql` | إصلاح timestamps |
| `add_performance_indexes.sql` | Indexes للأداء |
| `add_team_subscription_payment_flow_v2.sql` | تدفق دفع الفرق |
| `create_payments_table.sql` | جدول المدفوعات |
| `create_database_views.sql` | Database views |
| … | (13 ملف إجمالاً) |

**تشغيل:**

```bash
cd Backend
npm run migrate
```

---

## 3. SQL Scripts مساعدة

**المجلد:** [`Backend/scripts/`](../Backend/scripts/)

| File | Purpose |
|------|---------|
| `assign-admin-privileges.sql` | صلاحيات المدير |
| `update-membership-plans.sql` | تحديث خطط العضوية |
| `update-branches.sql` | تحديث الفروع |
| `diagnose-privileges.sql` | تشخيص الصلاحيات |

---

## 4. Seed Scripts (TypeScript)

**المجلد:** [`Backend/src/scripts/`](../Backend/src/scripts/)

| Script | Command | Purpose |
|--------|---------|---------|
| `create-admin-account.ts` | `npm run create:admin-account` | حساب مدير |
| `create-sport-test-accounts.ts` | `npm run create:sport-test-accounts` | حسابات رياضة |
| `seed-sports.ts` | manual ts-node | بيانات رياضات |
| `seed-news.ts` | manual ts-node | أخبار تجريبية |
| `full-reseed.ts` | manual ts-node | إعادة seed شاملة |

---

## 5. إنشاء نسخة احتياطية جديدة

### Windows

```powershell
$env:PGPASSWORD = "your_password"
pg_dump -h localhost -U postgres -d "Helwan-University-Club" -F p -f "database\backup-$(Get-Date -Format yyyy-MM-dd).sql"
```

### Linux

```bash
pg_dump -h localhost -U club_user "Helwan-University-Club" > backup-$(date +%F).sql
```

---

## 6. Schema (TypeORM Entities)

**المجلد:** [`Backend/src/entities/`](../Backend/src/entities/)

أهم الجداول:

- `accounts`, `members`, `staff`, `team_members`
- `sports`, `teams`, `team_member_teams`, `member_teams`
- `fields`, `bookings`, `payments`
- `membership_plans`, `member_memberships`
- `audit_logs`, `media_posts`, `branches`, `faculties`, `professions`

**ملاحظة:** `TYPEORM_SYNCHRONIZE=false` في الإنتاج — استخدم dump أو migrations.
