/**
 * Pre-defined import field schemas matching each admin page's "Add new" form.
 */

import type { ImportFieldDefinition } from './importTypes';

export const FACULTY_IMPORT_FIELDS: ImportFieldDefinition[] = [
  { key: 'code', labelEn: 'Code', labelAr: 'الكود', required: true, example: 'ENG', hintEn: 'Unique faculty code' },
  { key: 'name_ar', labelEn: 'Name (Arabic)', labelAr: 'الاسم (عربي)', required: true, example: 'كلية الهندسة' },
  { key: 'name_en', labelEn: 'Name (English)', labelAr: 'الاسم (إنجليزي)', required: true, example: 'Faculty of Engineering' },
];

export const PROFESSION_IMPORT_FIELDS: ImportFieldDefinition[] = [
  { key: 'code', labelEn: 'Code', labelAr: 'الكود', required: true, example: 'DOC', hintEn: 'Unique profession code' },
  { key: 'name_ar', labelEn: 'Name (Arabic)', labelAr: 'الاسم (عربي)', required: true, example: 'طبيب' },
  { key: 'name_en', labelEn: 'Name (English)', labelAr: 'الاسم (إنجليزي)', required: true, example: 'Doctor' },
];

export const BRANCH_IMPORT_FIELDS: ImportFieldDefinition[] = [
  { key: 'code', labelEn: 'Code', labelAr: 'الكود', required: true, example: 'MAIN' },
  { key: 'name_ar', labelEn: 'Name (Arabic)', labelAr: 'الاسم (عربي)', required: true, example: 'الفرع الرئيسي' },
  { key: 'name_en', labelEn: 'Name (English)', labelAr: 'الاسم (إنجليزي)', required: true, example: 'Main Branch' },
  { key: 'location_ar', labelEn: 'Location (Arabic)', labelAr: 'الموقع (عربي)', example: 'القاهرة' },
  { key: 'location_en', labelEn: 'Location (English)', labelAr: 'الموقع (إنجليزي)', example: 'Cairo' },
  { key: 'phone', labelEn: 'Phone', labelAr: 'الهاتف', example: '01012345678' },
  { key: 'status', labelEn: 'Status', labelAr: 'الحالة', example: 'active', hintEn: 'active | inactive' },
];

export const MEMBERSHIP_PLAN_IMPORT_FIELDS: ImportFieldDefinition[] = [
  { key: 'member_type_id', labelEn: 'Member Type ID', labelAr: 'معرف نوع العضو', required: true, example: '1' },
  { key: 'plan_code', labelEn: 'Plan Code', labelAr: 'كود الباقة', required: true, example: 'STU-001' },
  { key: 'name_ar', labelEn: 'Name (Arabic)', labelAr: 'الاسم (عربي)', required: true, example: 'باقة طالب' },
  { key: 'name_en', labelEn: 'Name (English)', labelAr: 'الاسم (إنجليزي)', required: true, example: 'Student Plan' },
  { key: 'price', labelEn: 'Price', labelAr: 'السعر', required: true, example: '500' },
  { key: 'currency', labelEn: 'Currency', labelAr: 'العملة', example: 'EGP' },
  { key: 'duration_months', labelEn: 'Duration (months)', labelAr: 'المدة (بالأشهر)', required: true, example: '12' },
  { key: 'renewal_price', labelEn: 'Renewal Price', labelAr: 'سعر التجديد', example: '450' },
  { key: 'is_active', labelEn: 'Active', labelAr: 'نشط', example: 'true', hintEn: 'true | false' },
];

export const FIELD_IMPORT_FIELDS: ImportFieldDefinition[] = [
  { key: 'name_ar', labelEn: 'Court Name (Arabic)', labelAr: 'اسم الملعب (عربي)', required: true, example: 'ملعب 1' },
  { key: 'name_en', labelEn: 'Court Name (English)', labelAr: 'اسم الملعب (إنجليزي)', required: true, example: 'Court 1' },
  { key: 'sport_id', labelEn: 'Sport ID', labelAr: 'معرف الرياضة', required: true, example: '1' },
  { key: 'capacity', labelEn: 'Capacity', labelAr: 'السعة', example: '22' },
  { key: 'status', labelEn: 'Status', labelAr: 'الحالة', example: 'active', hintEn: 'active | inactive | maintenance' },
  { key: 'is_available_for_booking', labelEn: 'Booking Available', labelAr: 'متاح للحجز', example: 'true', hintEn: 'true | false' },
];

export const TEAM_IMPORT_FIELDS: ImportFieldDefinition[] = [
  { key: 'sport_id', labelEn: 'Sport ID', labelAr: 'معرف الرياضة', required: true, example: '1' },
  { key: 'name_ar', labelEn: 'Team Name (Arabic)', labelAr: 'اسم الفريق (عربي)', required: true, example: 'فريق كرة القدم' },
  { key: 'name_en', labelEn: 'Team Name (English)', labelAr: 'اسم الفريق (إنجليزي)', required: true, example: 'Football Team' },
  { key: 'max_participants', labelEn: 'Max Participants', labelAr: 'الحد الأقصى للمشاركين', required: true, example: '25' },
  { key: 'status', labelEn: 'Status', labelAr: 'الحالة', example: 'active', hintEn: 'active | inactive' },
  { key: 'visibility_type', labelEn: 'Visibility', labelAr: 'الظهور', example: 'BOTH', hintEn: 'INTERNAL | EXTERNAL | BOTH' },
  { key: 'price', labelEn: 'Price', labelAr: 'السعر', example: '300' },
  { key: 'days_ar', labelEn: 'Training Days (Arabic)', labelAr: 'أيام التدريب (عربي)', required: true, example: 'السبت, الأحد' },
  { key: 'days_en', labelEn: 'Training Days (English)', labelAr: 'أيام التدريب (إنجليزي)', example: 'Saturday, Sunday' },
  { key: 'start_time', labelEn: 'Start Time', labelAr: 'وقت البداية', required: true, example: '09:00', hintEn: 'HH:mm or HH:mm:ss' },
  { key: 'end_time', labelEn: 'End Time', labelAr: 'وقت النهاية', required: true, example: '11:00' },
  { key: 'field_id', labelEn: 'Field ID (UUID)', labelAr: 'معرف الملعب', required: true, example: 'uuid-here' },
  { key: 'training_fee', labelEn: 'Training Fee', labelAr: 'رسوم التدريب', required: true, example: '200' },
];

export const SPORT_IMPORT_FIELDS: ImportFieldDefinition[] = [
  { key: 'name_ar', labelEn: 'Sport Name (Arabic)', labelAr: 'اسم الرياضة (عربي)', required: true, example: 'كرة القدم' },
  { key: 'name_en', labelEn: 'Sport Name (English)', labelAr: 'اسم الرياضة (إنجليزي)', required: true, example: 'Football' },
  { key: 'max_participants', labelEn: 'Max Participants', labelAr: 'الحد الأقصى للمشاركين', example: '30' },
  { key: 'branch_id', labelEn: 'Branch ID', labelAr: 'معرف الفرع', example: '1' },
  { key: 'is_active', labelEn: 'Active', labelAr: 'نشط', example: 'true', hintEn: 'true | false' },
  { key: 'requires_booking', labelEn: 'Requires Booking', labelAr: 'يتطلب حجز', example: 'false', hintEn: 'true | false' },
];

const MEMBER_BASIC_IMPORT_FIELDS: ImportFieldDefinition[] = [
  { key: 'first_name_ar', labelEn: 'First Name (Arabic)', labelAr: 'الاسم الأول (عربي)', required: true, example: 'محمد' },
  { key: 'last_name_ar', labelEn: 'Last Name (Arabic)', labelAr: 'اسم العائلة (عربي)', required: true, example: 'أحمد' },
  { key: 'first_name_en', labelEn: 'First Name (English)', labelAr: 'الاسم الأول (إنجليزي)', required: true, example: 'Mohamed' },
  { key: 'last_name_en', labelEn: 'Last Name (English)', labelAr: 'اسم العائلة (إنجليزي)', required: true, example: 'Ahmed' },
  { key: 'email', labelEn: 'Email', labelAr: 'البريد الإلكتروني', required: true, example: 'member@example.com' },
  { key: 'password', labelEn: 'Password', labelAr: 'كلمة المرور', required: true, example: 'TempPass123!', hintEn: 'Minimum 8 characters' },
  { key: 'phone', labelEn: 'Phone', labelAr: 'الهاتف', required: true, example: '01012345678' },
  { key: 'dob', labelEn: 'Date of Birth', labelAr: 'تاريخ الميلاد', required: true, example: '2000-01-15', hintEn: 'YYYY-MM-DD' },
  { key: 'gender', labelEn: 'Gender', labelAr: 'النوع', required: true, example: 'male', hintEn: 'male | female' },
  { key: 'nationality', labelEn: 'Nationality', labelAr: 'الجنسية', example: 'Egyptian' },
  { key: 'national_id', labelEn: 'National ID', labelAr: 'الرقم القومي', example: '29501011234567', hintEn: '14 digits for Egyptian members' },
  { key: 'passport_number', labelEn: 'Passport Number', labelAr: 'رقم الجواز', example: 'A12345678', hintEn: 'Use for foreigner category' },
  { key: 'address', labelEn: 'Address', labelAr: 'العنوان', example: 'Cairo, Egypt' },
];

export const MEMBER_IMPORT_FIELDS: ImportFieldDefinition[] = [
  {
    key: 'category',
    labelEn: 'Category',
    labelAr: 'الفئة',
    required: true,
    example: 'student',
    hintEn: 'student | staff | visitor | foreigner | dependent | retired. Documents must be completed after import.',
    hintAr: 'student | staff | visitor | foreigner | dependent | retired. يجب إكمال المستندات بعد الاستيراد.',
  },
  ...MEMBER_BASIC_IMPORT_FIELDS,
  { key: 'faculty_id', labelEn: 'Faculty ID', labelAr: 'معرف الكلية', example: '1', hintEn: 'For student category' },
  { key: 'graduation_year', labelEn: 'Graduation Year', labelAr: 'سنة التخرج', example: '2026' },
  { key: 'profession_id', labelEn: 'Profession ID', labelAr: 'معرف المهنة', example: '2', hintEn: 'For staff category' },
  { key: 'department', labelEn: 'Department', labelAr: 'القسم', example: 'Engineering' },
  { key: 'related_member_id', labelEn: 'Related Member ID', labelAr: 'معرف العضو المرتبط', example: '42', hintEn: 'For dependent category' },
  { key: 'relationship_type', labelEn: 'Relationship', labelAr: 'صلة القرابة', example: 'spouse' },
];

export const TEAM_MEMBER_IMPORT_FIELDS: ImportFieldDefinition[] = [
  {
    key: 'category',
    labelEn: 'Category',
    labelAr: 'الفئة',
    required: true,
    example: 'visitor',
    hintEn: 'visitor | student | staff | foreigner | retired. Documents must be completed after import.',
    hintAr: 'visitor | student | staff | foreigner | retired. يجب إكمال المستندات بعد الاستيراد.',
  },
  ...MEMBER_BASIC_IMPORT_FIELDS,
];

export const STAFF_IMPORT_FIELDS: ImportFieldDefinition[] = [
  { key: 'first_name_en', labelEn: 'First Name (English)', labelAr: 'الاسم الأول (إنجليزي)', required: true, example: 'Ahmed' },
  { key: 'first_name_ar', labelEn: 'First Name (Arabic)', labelAr: 'الاسم الأول (عربي)', required: true, example: 'أحمد' },
  { key: 'last_name_en', labelEn: 'Last Name (English)', labelAr: 'اسم العائلة (إنجليزي)', required: true, example: 'Hassan' },
  { key: 'last_name_ar', labelEn: 'Last Name (Arabic)', labelAr: 'اسم العائلة (عربي)', example: 'حسن' },
  { key: 'national_id', labelEn: 'National ID', labelAr: 'الرقم القومي', required: true, example: '29501011234567' },
  { key: 'phone', labelEn: 'Phone', labelAr: 'الهاتف', required: true, example: '01012345678' },
  { key: 'address', labelEn: 'Address', labelAr: 'العنوان', example: 'Cairo' },
  {
    key: 'staff_type_id',
    labelEn: 'Staff Type ID',
    labelAr: 'معرف نوع الموظف',
    required: true,
    example: '7',
    hintEn: 'Staff type ID. Documents must be uploaded separately after import.',
    hintAr: 'معرف نوع الموظف. يجب رفع المستندات بشكل منفصل بعد الاستيراد.',
  },
  { key: 'employment_start_date', labelEn: 'Employment Start Date', labelAr: 'تاريخ بدء العمل', required: true, example: '2024-01-01', hintEn: 'YYYY-MM-DD' },
];

/** Parse boolean-like spreadsheet values */
export function parseBoolish(value: string | undefined, defaultValue = false): boolean {
  const v = String(value ?? '').trim().toLowerCase();
  if (!v) return defaultValue;
  if (['true', '1', 'yes', 'y', 'نعم', 'نشط', 'active'].includes(v)) return true;
  if (['false', '0', 'no', 'n', 'لا', 'inactive'].includes(v)) return false;
  return defaultValue;
}

export function normalizeTime(value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(v)) return v;
  if (/^\d{1,2}:\d{2}$/.test(v)) return `${v}:00`;
  return v;
}
