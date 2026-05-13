-- Replace membership plans with the official prices from the PDF
SET client_encoding = 'UTF8';

-- Wipe existing memberships + plans (memberships reference plans via FK)
TRUNCATE TABLE member_memberships RESTART IDENTITY CASCADE;
TRUNCATE TABLE membership_plans   RESTART IDENTITY CASCADE;

-- ─── Working members (Faculty + Salary brackets) ───────────────
INSERT INTO membership_plans
  (member_type_id, plan_code, name_en, name_ar, description_ar, price, currency, duration_months, renewal_price, is_installable, max_installments, is_active, is_for_foreigner)
VALUES
  (1, 'WRK-FAC',  'Faculty Member',
    'عضوية هيئة التدريس',
    'مخصصة لأعضاء هيئة التدريس بالجامعة. تجديد سنوي بسعر رمزي.',
    20000, 'EGP', 12, 300, true, 4, true, false),

  (1, 'WRK-S1', 'Employee — Salary < 5000',
    'موظف — راتب أقل من 5000 ج',
    'للموظفين والمعيدين ومدرسي المساعدين الذين يقل راتبهم عن 5000 جنيه.',
    2000, 'EGP', 12, 300, true, 4, true, false),

  (1, 'WRK-S2', 'Employee — Salary 5000-8000',
    'موظف — راتب من 5000 حتى 8000 ج',
    'للموظفين الذين يتراوح راتبهم بين 5000 و 8000 جنيه.',
    5000, 'EGP', 12, 300, true, 4, true, false),

  (1, 'WRK-S3', 'Employee — Salary 8000-10000',
    'موظف — راتب من 8000 حتى 10000 ج',
    'للموظفين الذين يتراوح راتبهم بين 8000 و 10000 جنيه.',
    8000, 'EGP', 12, 300, true, 4, true, false),

  (1, 'WRK-S4', 'Employee — Salary 10000+',
    'موظف — راتب 10000 ج فأكثر',
    'للموظفين الذين يبلغ راتبهم 10000 جنيه أو أكثر.',
    10000, 'EGP', 12, 300, true, 4, true, false),

  -- ─── Student / Sports member ───────────────────────────────
  (2, 'STU-Y', 'Student / Sports Member',
    'عضوية الطالب أو الرياضي المتميز',
    'تُمنح للطالب أو الرياضي المتميز في أحد الرياضات بالنادي.',
    1000, 'EGP', 12, 1000, true, 2, true, false),

  -- ─── Dependent ──────────────────────────────────────────────
  (4, 'DEP-Y', 'Dependent Member',
    'عضوية التابع',
    'للزوجة، الأبناء، والدا العضو، والطفل اليتيم المتكفل.',
    2000, 'EGP', 12, 2000, true, 2, true, false),

  -- ─── Visitor ────────────────────────────────────────────────
  (7, 'VIS-Y', 'Visitor Member',
    'عضوية زائر',
    'للأعضاء من غير العاملين بجامعة العاصمة (سابقاً جامعة حلوان).',
    5000, 'EGP', 12, 5000, true, 2, true, false),

  -- ─── Seasonal (Egyptian) ────────────────────────────────────
  (6, 'SEAS-6', 'Seasonal — 6 months',
    'عضوية موسمية — 6 أشهر',
    'مدة أقصاها 6 أشهر. يتم الموافقة على العضو فردياً.',
    2000, 'EGP', 6, 2000, false, NULL, true, false),

  -- ─── Foreigner (USD prices) ─────────────────────────────────
  (5, 'FOR-Y-USD', 'Foreigner — Annual',
    'عضوية موسمية للأجانب — سنة',
    'تُجدد بنفس السعر. حامل الجنسية غير المصرية.',
    100, 'USD', 12, 100, false, NULL, true, true),

  (5, 'FOR-H-USD', 'Foreigner — 6 months',
    'عضوية موسمية للأجانب — 6 أشهر',
    'تُجدد بنفس السعر. حامل الجنسية غير المصرية.',
    50, 'USD', 6, 50, false, NULL, true, true),

  (5, 'FOR-M-USD', 'Foreigner — Monthly',
    'عضوية موسمية للأجانب — شهر',
    'تُجدد بنفس السعر. حامل الجنسية غير المصرية.',
    10, 'USD', 1, 10, false, NULL, true, true);

-- Confirmation
SELECT id, plan_code, name_ar, price, currency, duration_months, renewal_price
FROM membership_plans ORDER BY member_type_id, price;
