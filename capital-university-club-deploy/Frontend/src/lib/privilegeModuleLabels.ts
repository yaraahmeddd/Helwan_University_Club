import type { DisplayLanguage } from './localizedDisplay';

const MODULE_NAMES_AR: Record<string, string> = {
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
};

const MODULE_NAMES_EN: Record<string, string> = {
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
};

export function getPrivilegeModuleLabel(module: string, language: DisplayLanguage): string {
  const key = module || 'General';
  if (language === 'ar') {
    return MODULE_NAMES_AR[key] ?? key;
  }
  return MODULE_NAMES_EN[key] ?? key.replace(/_/g, ' ');
}
