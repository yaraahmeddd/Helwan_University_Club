import type { DisplayLanguage } from './localizedDisplay';
import { getLocalizedText } from './localizedDisplay';

export type StaffListApiItem = {
  id: number;
  first_name_ar?: string;
  last_name_ar?: string;
  first_name_en?: string;
  last_name_en?: string;
  national_id?: string;
  role?: string;
  staff_type?: string | { id?: number; code?: string; name_ar?: string; name_en?: string };
  staff_type_id?: number;
  status?: string;
  is_active?: boolean;
  employment_start_date?: string;
  created_at?: string;
  start_date?: string;
};

export type StaffListRow = {
  id: number;
  firstNameAr?: string;
  lastNameAr?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  nationalId: string;
  staffTypeId: number;
  staffTypeNameAr?: string;
  staffTypeNameEn?: string;
  staffTypeCode?: string;
  status: string;
  startDate: string;
};

export function parseStaffTypeFields(s: StaffListApiItem) {
  const staffTypeObj = typeof s.staff_type === 'object' && s.staff_type ? s.staff_type : null;
  return {
    staffTypeId: Number(s.staff_type_id ?? staffTypeObj?.id ?? 0),
    staffTypeNameAr: staffTypeObj?.name_ar ?? (typeof s.staff_type === 'string' ? s.staff_type : undefined),
    staffTypeNameEn: staffTypeObj?.name_en,
    staffTypeCode: staffTypeObj?.code,
  };
}

export function mapStaffApiItem(s: StaffListApiItem): StaffListRow {
  const staffType = parseStaffTypeFields(s);
  return {
    id: s.id,
    firstNameAr: s.first_name_ar,
    lastNameAr: s.last_name_ar,
    firstNameEn: s.first_name_en,
    lastNameEn: s.last_name_en,
    nationalId: s.national_id ?? '',
    ...staffType,
    status: String(s.status ?? '').toLowerCase(),
    startDate: s.employment_start_date ?? s.start_date ?? s.created_at ?? '',
  };
}

export function filterStaffListRows(
  rows: StaffListRow[],
  options: {
    search: string;
    roleFilter: string;
    dateFilter: string;
    activeOnly?: boolean;
  },
): StaffListRow[] {
  let result = rows;
  if (options.activeOnly !== false) {
    result = result.filter((r) => r.status !== 'cancelled' && r.status !== 'inactive');
  }
  if (options.roleFilter) {
    result = result.filter((r) => r.staffTypeCode === options.roleFilter);
  }
  if (options.dateFilter) {
    result = result.filter((r) => r.startDate?.startsWith(options.dateFilter));
  }
  const q = options.search.trim().toLowerCase();
  if (q) {
    result = result.filter((r) => {
      const ar = `${r.firstNameAr ?? ''} ${r.lastNameAr ?? ''}`.toLowerCase();
      const en = `${r.firstNameEn ?? ''} ${r.lastNameEn ?? ''}`.toLowerCase();
      return ar.includes(q) || en.includes(q) || (r.nationalId ?? '').includes(options.search.trim());
    });
  }
  return result;
}

export function staffTypeOptionsFromApi(
  staffTypes: Array<{ id: number; code?: string; name_ar?: string; name_en?: string }>,
  language: DisplayLanguage,
) {
  return staffTypes.map((st) => ({
    id: st.id,
    code: st.code,
    label: getLocalizedText(st.name_ar, st.name_en, language) || st.code || `#${st.id}`,
  }));
}
