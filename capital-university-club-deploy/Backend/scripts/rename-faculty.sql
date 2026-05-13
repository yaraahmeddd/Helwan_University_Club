-- Rename: كلية التربية الرياضية → كلية علوم الرياضة (Faculty of Sports Science)
SET client_encoding = 'UTF8';

UPDATE branches SET
  name_en = 'Haram Branch - Faculty of Sports Science (Boys)',
  name_ar = 'فرع الهرم - كلية علوم الرياضة للبنين',
  location_en = 'Faculty of Sports Science for Boys, Haram, Giza',
  location_ar = 'كلية علوم الرياضة للبنين، الهرم، الجيزة'
WHERE id = 2;

UPDATE branches SET
  name_en = 'Zamalek Branch - Faculty of Sports Science (Girls)',
  name_ar = 'فرع الزمالك - كلية علوم الرياضة للبنات',
  location_en = 'Faculty of Sports Science for Girls, Zamalek, Cairo',
  location_ar = 'كلية علوم الرياضة للبنات، الزمالك، القاهرة'
WHERE id = 3;

SELECT id, code, name_ar FROM branches ORDER BY id;
