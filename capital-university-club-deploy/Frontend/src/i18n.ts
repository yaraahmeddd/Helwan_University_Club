import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ─── Arabic namespaces ────────────────────────────────────────────────────────
import arCommon from './i18n/locales/ar/common.json';
import arNav from './i18n/locales/ar/nav.json';
import arDashboard from './i18n/locales/ar/dashboard.json';
import arDashboardPage from './i18n/locales/ar/DashboardPage.json';
import arMembers from './i18n/locales/ar/members.json';
import arSports from './i18n/locales/ar/sports.json';
import arFinance from './i18n/locales/ar/finance.json';
import arRegistrations from './i18n/locales/ar/registrations.json';
import arRegistrationManagementPage from './i18n/locales/ar/RegistrationManagementPage.json';
import arFaculties from './i18n/locales/ar/faculties.json';
import arBranches from './i18n/locales/ar/branches.json';
import arProfessions from './i18n/locales/ar/professions.json';
import arMedia from './i18n/locales/ar/media.json';
import arAdmin from './i18n/locales/ar/admin.json';
import arLanding from './i18n/locales/ar/landing.json';
import arTeam from './i18n/locales/ar/team.json';
import arMember from './i18n/locales/ar/member.json';
import arMemberManagementPage from './i18n/locales/ar/MemberManagementPage.json';
import arManageInvitationsPage from './i18n/locales/ar/ManageInvitationsPage.json';
import arSportsPage from './i18n/locales/ar/SportsPage.json';
import arCourtsManagementPage from './i18n/locales/ar/CourtsManagementPage.json';
import arCourtBookingsPage from './i18n/locales/ar/CourtBookingsPage.json';
import arTeamsManagementPage from './i18n/locales/ar/TeamsManagementPage.json';
import arSportsMembersPage from './i18n/locales/ar/SportsMembersPage.json';
import arSportManagementPage from './i18n/locales/ar/SportManagementPage.json';
import arMemberShipsPage from './i18n/locales/ar/MemberShipsPage.json';
import arPackageManagementPage from './i18n/locales/ar/PackageManagementPage.json';
import arPrivilegePackageAdminPage from './i18n/locales/ar/PrivilegePackageAdminPage.json';
import arMediaGalleryDashboard from './i18n/locales/ar/MediaGalleryDashboard.json';
import arBranchManagementPage from './i18n/locales/ar/BranchManagementPage.json';
import arMediaManagerPage from './i18n/locales/ar/MediaManagerPage.json';
import arFacultyManagementPage from './i18n/locales/ar/FacultyManagementPage.json';
import arProfessionManagementPage from './i18n/locales/ar/ProfessionManagementPage.json';
import arAuditLogPage from './i18n/locales/ar/AuditLogPage.json';
import arStaffManagementPage from './i18n/locales/ar/StaffManagementPage.json';
import arAssignStaffPrivilegesPage from './i18n/locales/ar/AssignStaffPrivilegesPage.json';
import arRevokePrivilegesPage from './i18n/locales/ar/RevokePrivilegesPage.json';
import arAddNewStaffPage from './i18n/locales/ar/AddNewStaffPage.json';
import arRegister from './i18n/locales/ar/register.json';
import arStaffAddMemberPage from './i18n/locales/ar/StaffAddMemberPage.json';

// ─── English namespaces ───────────────────────────────────────────────────────
import enCommon from './i18n/locales/en/common.json';
import enNav from './i18n/locales/en/nav.json';
import enDashboard from './i18n/locales/en/dashboard.json';
import enDashboardPage from './i18n/locales/en/DashboardPage.json';
import enMembers from './i18n/locales/en/members.json';
import enSports from './i18n/locales/en/sports.json';
import enFinance from './i18n/locales/en/finance.json';
import enRegistrations from './i18n/locales/en/registrations.json';
import enRegistrationManagementPage from './i18n/locales/en/RegistrationManagementPage.json';
import enFaculties from './i18n/locales/en/faculties.json';
import enBranches from './i18n/locales/en/branches.json';
import enProfessions from './i18n/locales/en/professions.json';
import enMedia from './i18n/locales/en/media.json';
import enAdmin from './i18n/locales/en/admin.json';
import enLanding from './i18n/locales/en/landing.json';
import enTeam from './i18n/locales/en/team.json';
import enMember from './i18n/locales/en/member.json';
import enMemberManagementPage from './i18n/locales/en/MemberManagementPage.json';
import enManageInvitationsPage from './i18n/locales/en/ManageInvitationsPage.json';
import enSportsPage from './i18n/locales/en/SportsPage.json';
import enCourtsManagementPage from './i18n/locales/en/CourtsManagementPage.json';
import enCourtBookingsPage from './i18n/locales/en/CourtBookingsPage.json';
import enTeamsManagementPage from './i18n/locales/en/TeamsManagementPage.json';
import enSportsMembersPage from './i18n/locales/en/SportsMembersPage.json';
import enSportManagementPage from './i18n/locales/en/SportManagementPage.json';
import enMemberShipsPage from './i18n/locales/en/MemberShipsPage.json';
import enPackageManagementPage from './i18n/locales/en/PackageManagementPage.json';
import enPrivilegePackageAdminPage from './i18n/locales/en/PrivilegePackageAdminPage.json';
import enMediaGalleryDashboard from './i18n/locales/en/MediaGalleryDashboard.json';
import enBranchManagementPage from './i18n/locales/en/BranchManagementPage.json';
import enMediaManagerPage from './i18n/locales/en/MediaManagerPage.json';
import enFacultyManagementPage from './i18n/locales/en/FacultyManagementPage.json';
import enProfessionManagementPage from './i18n/locales/en/ProfessionManagementPage.json';
import enAuditLogPage from './i18n/locales/en/AuditLogPage.json';
import enStaffManagementPage from './i18n/locales/en/StaffManagementPage.json';
import enAssignStaffPrivilegesPage from './i18n/locales/en/AssignStaffPrivilegesPage.json';
import enRevokePrivilegesPage from './i18n/locales/en/RevokePrivilegesPage.json';
import enAddNewStaffPage from './i18n/locales/en/AddNewStaffPage.json';
import enRegister from './i18n/locales/en/register.json';
import enStaffAddMemberPage from './i18n/locales/en/StaffAddMemberPage.json';

const RTL_LANGUAGES = new Set(['ar']);

const syncDocumentLanguage = (language?: string) => {
  if (typeof document === 'undefined') return;
  const lang = (language ?? 'ar').split('-')[0];
  const normalized = lang === 'en' ? 'en' : 'ar';
  document.documentElement.lang = normalized;
  document.documentElement.dir = RTL_LANGUAGES.has(normalized) ? 'rtl' : 'ltr';
  localStorage.setItem('dashboard-lang', normalized);
};

i18n.on('languageChanged', syncDocumentLanguage);

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        common: arCommon,
        nav: arNav,
        dashboard: arDashboard,
        DashboardPage: arDashboardPage,
        members: arMembers,
        sports: arSports,
        finance: arFinance,
        registrations: arRegistrations,
        RegistrationManagementPage: arRegistrationManagementPage,
        faculties: arFaculties,
        branches: arBranches,
        professions: arProfessions,
        media: arMedia,
        admin: arAdmin,
        landing: arLanding,
        team: arTeam,
        member: arMember,
        MemberManagementPage: arMemberManagementPage,
        ManageInvitationsPage: arManageInvitationsPage,
        SportsPage: arSportsPage,
        CourtsManagementPage: arCourtsManagementPage,
        CourtBookingsPage: arCourtBookingsPage,
        TeamsManagementPage: arTeamsManagementPage,
        SportsMembersPage: arSportsMembersPage,
        SportManagementPage: arSportManagementPage,
        MemberShipsPage: arMemberShipsPage,
        PackageManagementPage: arPackageManagementPage,
        PrivilegePackageAdminPage: arPrivilegePackageAdminPage,
        MediaGalleryDashboard: arMediaGalleryDashboard,
        BranchManagementPage: arBranchManagementPage,
        MediaManagerPage: arMediaManagerPage,
        FacultyManagementPage: arFacultyManagementPage,
        ProfessionManagementPage: arProfessionManagementPage,
        AuditLogPage: arAuditLogPage,
        StaffManagementPage: arStaffManagementPage,
        AssignStaffPrivilegesPage: arAssignStaffPrivilegesPage,
        RevokePrivilegesPage: arRevokePrivilegesPage,
        AddNewStaffPage: arAddNewStaffPage,
        register: arRegister,
        StaffAddMemberPage: arStaffAddMemberPage,
      },
      en: {
        common: enCommon,
        nav: enNav,
        dashboard: enDashboard,
        DashboardPage: enDashboardPage,
        members: enMembers,
        sports: enSports,
        finance: enFinance,
        registrations: enRegistrations,
        RegistrationManagementPage: enRegistrationManagementPage,
        faculties: enFaculties,
        branches: enBranches,
        professions: enProfessions,
        media: enMedia,
        admin: enAdmin,
        landing: enLanding,
        team: enTeam,
        member: enMember,
        MemberManagementPage: enMemberManagementPage,
        ManageInvitationsPage: enManageInvitationsPage,
        SportsPage: enSportsPage,
        CourtsManagementPage: enCourtsManagementPage,
        CourtBookingsPage: enCourtBookingsPage,
        TeamsManagementPage: enTeamsManagementPage,
        SportsMembersPage: enSportsMembersPage,
        SportManagementPage: enSportManagementPage,
        MemberShipsPage: enMemberShipsPage,
        PackageManagementPage: enPackageManagementPage,
        PrivilegePackageAdminPage: enPrivilegePackageAdminPage,
        MediaGalleryDashboard: enMediaGalleryDashboard,
        BranchManagementPage: enBranchManagementPage,
        MediaManagerPage: enMediaManagerPage,
        FacultyManagementPage: enFacultyManagementPage,
        ProfessionManagementPage: enProfessionManagementPage,
        AuditLogPage: enAuditLogPage,
        StaffManagementPage: enStaffManagementPage,
        AssignStaffPrivilegesPage: enAssignStaffPrivilegesPage,
        RevokePrivilegesPage: enRevokePrivilegesPage,
        AddNewStaffPage: enAddNewStaffPage,
        register: enRegister,
        StaffAddMemberPage: enStaffAddMemberPage,
      },
    },

    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    load: 'languageOnly',         // strips "en-US" → "en", "ar-EG" → "ar"

    defaultNS: 'common',
    ns: [
      'common', 'nav', 'dashboard', 'DashboardPage',
      'members', 'sports', 'finance', 'registrations',
      'RegistrationManagementPage', 'faculties', 'branches',
      'professions', 'media', 'admin', 'landing', 'team', 'member',
      'MemberManagementPage', 'ManageInvitationsPage', 'SportsPage',
      'CourtsManagementPage', 'CourtBookingsPage', 'TeamsManagementPage', 'SportsMembersPage',
      'SportManagementPage', 'MemberShipsPage', 'PackageManagementPage', 'PrivilegePackageAdminPage', 'MediaGalleryDashboard', 'MediaManagerPage', 'FacultyManagementPage', 'BranchManagementPage', 'ProfessionManagementPage', 'AuditLogPage', 'StaffManagementPage', 'AssignStaffPrivilegesPage', 'RevokePrivilegesPage', 'AddNewStaffPage', 'register', 'StaffAddMemberPage'
    ],

    interpolation: { escapeValue: false },

    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'dashboard-lang',
      caches: ['localStorage'],
      // Sanitize cached region-suffixed locales ("ar-EG" → "ar") at runtime.
      convertDetectedLanguage: (lng: string) => lng.split('-')[0],
    },

    keySeparator: '.',
    saveMissing: false,
  })
  .then(() => {
    syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);
  })
  .catch((error) => {
    console.error('Failed to initialize i18n', error);
  });
export default i18n;
