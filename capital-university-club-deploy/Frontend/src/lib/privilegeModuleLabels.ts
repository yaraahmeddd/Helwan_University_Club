import type { DisplayLanguage } from './localizedDisplay';

const MODULE_NAMES_AR: Record<string, string> = {
  team_management: 'إدارة الفرق',
  field_management: 'إدارة الملاعب',
  bookings: 'الحجوزات',
  member_management: 'إدارة الأعضاء',
  sports_management: 'إدارة الرياضة',
  finance: 'الشؤون المالية',
  staff_management: 'إدارة الموظفين',
  audit: 'التدقيق',
  media: 'الوسائط',
  membership: 'العضويات',
  faculties: 'الكليات',
  system_admin: 'إدارة النظام',
  admin_management: 'الإدارة',
  MEMBERS: 'الأعضاء',
  MEMBER: 'العضو',
  MEMBER_TYPES: 'أنواع الأعضاء',
  TEAM_MEMBERS: 'أعضاء الفريق',
  MEMBERSHIP_PLANS: 'خطط العضوية',
  STAFF: 'الموظفون',
  STAFF_TYPES: 'أنواع الموظفين',
  FINANCE: 'الشؤون المالية',
  EVENTS: 'الفعاليات',
  SPORTS: 'الأنشطة الرياضية',
  MAINTENANCE: 'الصيانة',
  MEDIA: 'الوسائط',
  MEDIA_CENTER: 'المركز الإعلامي',
  MediaGallery: 'معرض الوسائط',
  FACULTIES: 'الكليات',
  PROFESSIONS: 'المهن',
  ADMIN: 'الإدارة',
  PRIVILEGE_MANAGEMENT: 'إدارة الصلاحيات',
  PACKAGE_MANAGEMENT: 'إدارة الحزم',
  General: 'عام',
  general: 'عام',
};

const MODULE_NAMES_EN: Record<string, string> = {
  team_management: 'Team Management',
  field_management: 'Field Management',
  bookings: 'Bookings',
  member_management: 'Member Management',
  sports_management: 'Sports Management',
  finance: 'Finance',
  staff_management: 'Staff Management',
  audit: 'Audit',
  media: 'Media',
  membership: 'Membership',
  faculties: 'Faculties',
  system_admin: 'System Administration',
  admin_management: 'Administration',
  MEMBERS: 'Members',
  MEMBER: 'Member',
  MEMBER_TYPES: 'Member Types',
  TEAM_MEMBERS: 'Team Members',
  MEMBERSHIP_PLANS: 'Membership Plans',
  STAFF: 'Staff',
  STAFF_TYPES: 'Staff Types',
  FINANCE: 'Finance',
  EVENTS: 'Events',
  SPORTS: 'Sports',
  MAINTENANCE: 'Maintenance',
  MEDIA: 'Media',
  MEDIA_CENTER: 'Media Center',
  MediaGallery: 'Media Gallery',
  FACULTIES: 'Faculties',
  PROFESSIONS: 'Professions',
  ADMIN: 'Administration',
  PRIVILEGE_MANAGEMENT: 'Privilege Management',
  PACKAGE_MANAGEMENT: 'Package Management',
  General: 'General',
  general: 'General',
};

function lookupModuleLabel(module: string, map: Record<string, string>): string | undefined {
  if (map[module]) return map[module];
  const lower = module.toLowerCase();
  if (map[lower]) return map[lower];
  const upper = module.toUpperCase();
  if (map[upper]) return map[upper];
  return undefined;
}

function humanizeModuleKey(module: string): string {
  return module.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getPrivilegeModuleLabel(module: string, language: DisplayLanguage): string {
  const key = (module || 'General').trim();
  const map = language === 'ar' ? MODULE_NAMES_AR : MODULE_NAMES_EN;
  return lookupModuleLabel(key, map) ?? humanizeModuleKey(key);
}

export function getPrivilegeDisplayName(
  nameAr: string | undefined | null,
  nameEn: string | undefined | null,
  code: string,
  language: DisplayLanguage,
): string {
  const ar = (nameAr ?? '').trim();
  const en = (nameEn ?? '').trim();
  if (language === 'ar') return ar || code;
  return en || code;
}
