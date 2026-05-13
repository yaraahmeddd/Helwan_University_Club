SET client_encoding = 'UTF8';

UPDATE staff
SET first_name_ar = 'عمرو',
    last_name_ar  = 'السيد',
    first_name_en = 'Amr',
    last_name_en  = 'El Sayed'
WHERE id = 1;

SELECT id, first_name_ar, last_name_ar, first_name_en, last_name_en FROM staff WHERE id = 1;
