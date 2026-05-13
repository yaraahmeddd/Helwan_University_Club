-- Update branches to the new 4-branch structure
SET client_encoding = 'UTF8';

UPDATE branches SET
  code = 'MAIN',
  name_en = 'Main Branch - Capital University',
  name_ar = 'الفرع الرئيسي - جامعة العاصمة',
  location_en = 'Capital University Campus, New Capital',
  location_ar = 'حرم جامعة العاصمة، العاصمة الإدارية',
  status = 'active'
WHERE id = 1;

UPDATE branches SET
  code = 'HARAM',
  name_en = 'Haram Branch - Faculty of Physical Education (Boys)',
  name_ar = 'فرع الهرم - كلية التربية الرياضية للبنين',
  location_en = 'Faculty of Physical Education for Boys, Haram, Giza',
  location_ar = 'كلية التربية الرياضية للبنين، الهرم، الجيزة',
  status = 'active'
WHERE id = 2;

UPDATE branches SET
  code = 'ZAMALEK',
  name_en = 'Zamalek Branch - Faculty of Physical Education (Girls)',
  name_ar = 'فرع الزمالك - كلية التربية الرياضية للبنات',
  location_en = 'Faculty of Physical Education for Girls, Zamalek, Cairo',
  location_ar = 'كلية التربية الرياضية للبنات، الزمالك، القاهرة',
  status = 'active'
WHERE id = 3;

UPDATE branches SET
  code = 'MATARIA',
  name_en = 'Mataria Branch - Faculty of Engineering',
  name_ar = 'فرع المطرية - كلية الهندسة',
  location_en = 'Faculty of Engineering, Mataria, Cairo',
  location_ar = 'كلية الهندسة، المطرية، القاهرة',
  status = 'active'
WHERE id = 4;

SELECT id, code, name_ar, status FROM branches ORDER BY id;
