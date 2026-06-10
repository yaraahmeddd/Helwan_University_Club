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
  audit_logs: 'سجلات التدقيق',
  media: 'الوسائط',
  membership: 'العضويات',
  memberships: 'العضويات',
  members: 'الأعضاء',
  faculties: 'الكليات',
  branches: 'الفروع',
  fields: 'الملاعب',
  sports: 'الرياضة',
  teams: 'الفرق',
  staff: 'الموظفون',
  posts: 'المنشورات',
  professions: 'المهن',
  packages: 'الحزم',
  privileges: 'الصلاحيات',
  invitations: 'الدعوات',
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
  audit_logs: 'Audit Logs',
  media: 'Media',
  membership: 'Membership',
  memberships: 'Memberships',
  members: 'Members',
  faculties: 'Faculties',
  branches: 'Branches',
  fields: 'Fields',
  sports: 'Sports',
  teams: 'Teams',
  staff: 'Staff',
  posts: 'Posts',
  professions: 'Professions',
  packages: 'Packages',
  privileges: 'Privileges',
  invitations: 'Invitations',
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

function safeLocaleCompare(a: string, b: string, locale: string): number {
  try {
    return a.localeCompare(b, locale);
  } catch {
    return a.localeCompare(b);
  }
}

function humanizeModuleKey(module: string): string {
  return module.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function compareLocalizedText(a: string, b: string, language: DisplayLanguage): number {
  const locale = language === 'ar' ? 'ar' : 'en';
  return safeLocaleCompare(a, b, locale);
}

export function getPrivilegeModuleLabel(module: string, language: DisplayLanguage): string {
  const key = (module || 'General').trim();
  const map = language === 'ar' ? MODULE_NAMES_AR : MODULE_NAMES_EN;
  const label = lookupModuleLabel(key, map);
  if (label) return label;
  if (language === 'ar') return MODULE_NAMES_AR.General ?? 'عام';
  return humanizeModuleKey(key);
}

/** Privilege label for UI — Arabic shows Arabic name only; English shows English name, then code. */
export function getPrivilegeDisplayName(
  nameAr: string | undefined | null,
  nameEn: string | undefined | null,
  code: string,
  language: DisplayLanguage,
): string {
  const ar = (nameAr ?? '').trim();
  const en = (nameEn ?? '').trim();
  if (language === 'ar') return ar;
  return en || code;
}

/** Privilege codes (e.g. CREATE_MEMBER) are English — hide them in Arabic UI. */
export function shouldShowPrivilegeCode(language: DisplayLanguage): boolean {
  return language !== 'ar';
}
