/**
 * One-time migration: pages/ -> features/* modules
 * Run from Frontend/: node scripts/restructure-modules.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'src');

const moves = [
  // app
  ['router.tsx', 'app/router.tsx'],

  // auth
  ['pages/Login.tsx', 'features/auth/pages/LoginPage.tsx'],
  ['pages/Register.tsx', 'features/auth/pages/LegacyRegisterPage.tsx'],
  ['pages/IdentityVerification.tsx', 'features/auth/pages/IdentityVerificationPage.tsx'],
  ['pages/DocumentUpload.tsx', 'features/auth/pages/DocumentUploadPage.tsx'],
  ['pages/ForbiddenPage.tsx', 'features/auth/pages/ForbiddenPage.tsx'],

  // public
  ['pages/Landingpage.tsx', 'features/public/pages/LandingPage.tsx'],
  ['pages/BranchExplorePage.tsx', 'features/public/pages/BranchExplorePage.tsx'],
  ['pages/PublicPostDetailsPage.tsx', 'features/public/pages/PublicPostDetailsPage.tsx'],
  ['pages/SportInfoPage.tsx', 'features/public/pages/SportInfoPage.tsx'],
  ['pages/Dashboard.tsx', 'features/public/pages/LegacyDashboardPage.tsx'],
  ['pages/MemberPortal.tsx', 'features/public/pages/MemberPortalPage.tsx'],
  ['pages/ReservationPage.tsx', 'features/public/pages/ReservationPage.tsx'],
  ['pages/SportDetailedPG.tsx', 'features/public/pages/SportDetailedPage.tsx'],
  ['pages/degla.tsx', 'features/public/pages/DeglaLandingPage.tsx'],
  ['pages/BranchDetails.tsx', 'features/public/pages/BranchDetailsPage.tsx'],

  // registration (pages + merge register feature)
  ['pages/NewRegister.tsx', 'features/registration/pages/NewRegisterPage.tsx'],
  ['pages/InviteMemberPage.tsx', 'features/registration/pages/InviteMemberPage.tsx'],
  ['pages/InvitationPage.tsx', 'features/registration/pages/InvitationPage.tsx'],
  ['pages/FamilyMemberDetailsPage.tsx', 'features/registration/pages/FamilyMemberDetailsPage.tsx'],

  // member
  ['pages/MemberDashboard.tsx', 'features/member/routes/MemberDashboardRoutes.tsx'],
  ['pages/MemberHomePage.tsx', 'features/member/pages/MemberHomePage.tsx'],
  ['pages/MemberProfilePage.tsx', 'features/member/pages/MemberProfilePage.tsx'],
  ['pages/MemberMembershipPage.tsx', 'features/member/pages/MemberMembershipPage.tsx'],
  ['pages/MemberSportsPage.tsx', 'features/member/pages/MemberSportsPage.tsx'],
  ['pages/MemberSubscribePage.tsx', 'features/member/pages/MemberSubscribePage.tsx'],
  ['pages/MemberPendingPage.tsx', 'features/member/pages/MemberPendingPage.tsx'],
  ['pages/MemberSportPaymentPage.tsx', 'features/member/pages/MemberSportPaymentPage.tsx'],

  // team-member
  ['pages/teammemberdashboard.tsx', 'features/team-member/pages/TeamMemberDashboardPage.tsx'],
  ['pages/TeamMemberSportPaymentPage.tsx', 'features/team-member/pages/TeamMemberSportPaymentPage.tsx'],

  // member-portal (was features/dashboard)
  ['features/dashboard/pages/DashboardPage.tsx', 'features/member-portal/pages/TeamMemberHomePage.tsx'],
  ['features/dashboard/pages/CourtRentalPage.tsx', 'features/member-portal/pages/CourtRentalPage.tsx'],
  ['features/dashboard/pages/SportsExplorePage.tsx', 'features/member-portal/pages/SportsExplorePage.tsx'],
  ['features/dashboard/DashboardComponents.tsx', 'features/member-portal/components/DashboardComponents.tsx'],
  ['features/dashboard/NotificationPanel.tsx', 'features/member-portal/components/NotificationPanel.tsx'],
  ['features/dashboard/SportCard.tsx', 'features/member-portal/components/SportCard.tsx'],
  ['features/dashboard/Toast.tsx', 'features/member-portal/components/Toast.tsx'],
  ['features/dashboard/types.ts', 'features/member-portal/types.ts'],

  // staff shell
  ['pages/staffDashboard.tsx', 'features/staff/routes/StaffDashboardRoutes.tsx'],
  ['pages/staffDashboard.css', 'features/staff/styles/staff-dashboard.css'],

  // staff — dashboard
  ['pages/DashboardPage.tsx', 'features/staff/pages/dashboard/StaffDashboardPage.tsx'],

  // staff — sports
  ['pages/SportsPage.tsx', 'features/staff/pages/sports/SportsPage.tsx'],
  ['pages/CourtsManagementPage.tsx', 'features/staff/pages/sports/CourtsManagementPage.tsx'],
  ['pages/CourtBookingsPage.tsx', 'features/staff/pages/sports/CourtBookingsPage.tsx'],
  ['pages/TeamsManagementPage.tsx', 'features/staff/pages/sports/TeamsManagementPage.tsx'],
  ['pages/ManageInvitationsPage.tsx', 'features/staff/pages/sports/ManageInvitationsPage.tsx'],
  ['pages/SportsRequestsPage.tsx', 'features/staff/pages/sports/SportsRequestsPage.tsx'],
  ['pages/AttendancePage.tsx', 'features/staff/pages/sports/AttendancePage.tsx'],

  // staff — members
  ['pages/MemberManagementPage.tsx', 'features/staff/pages/members/MemberManagementPage.tsx'],
  ['pages/MemberManagementPage_Enhanced.tsx', 'features/staff/pages/members/MemberManagementPageEnhanced.tsx'],
  ['pages/SportsMembersPage.tsx', 'features/staff/pages/members/SportsMembersPage.tsx'],
  ['pages/SportManagementPage.tsx', 'features/staff/pages/members/SportManagementPage.tsx'],
  ['pages/StaffAddMemberPage.tsx', 'features/staff/pages/members/StaffAddMemberPage.tsx'],
  ['pages/StaffAddTeamMemberPage.tsx', 'features/staff/pages/members/StaffAddTeamMemberPage.tsx'],
  ['pages/CardPrintPage.tsx', 'features/staff/pages/members/CardPrintPage.tsx'],

  // staff — finance
  ['pages/MemberShipsPage.tsx', 'features/staff/pages/finance/MembershipsPage.tsx'],
  ['pages/SubscriptionsPage.tsx', 'features/staff/pages/finance/SubscriptionsPage.tsx'],
  ['pages/RegistrationManagementPage.tsx', 'features/staff/pages/finance/RegistrationManagementPage.tsx'],
  ['pages/FinancePage.tsx', 'features/staff/pages/finance/FinancePage.tsx'],
  ['pages/MembershipFormPage.tsx', 'features/staff/pages/finance/MembershipFormPage.tsx'],

  // staff — administration
  ['pages/AdminPrivilegesPage.tsx', 'features/staff/pages/administration/AdminPrivilegesPage.tsx'],
  ['pages/PrivilegePackageAdminPage.tsx', 'features/staff/pages/administration/PrivilegePackageAdminPage.tsx'],
  ['pages/PackageManagementPage.tsx', 'features/staff/pages/administration/PackageManagementPage.tsx'],
  ['pages/AuditLogPage.tsx', 'features/staff/pages/administration/AuditLogPage.tsx'],
  ['pages/AddNewStaffPage.tsx', 'features/staff/pages/administration/AddNewStaffPage.tsx'],
  ['pages/StaffListPage.tsx', 'features/staff/pages/administration/StaffListPage.tsx'],
  ['pages/StaffManagementPage.tsx', 'features/staff/pages/administration/StaffManagementPage.tsx'],
  ['pages/StaffProfile.tsx', 'features/staff/pages/administration/StaffProfilePage.tsx'],
  ['pages/AssignStaffPrivilegesPage.tsx', 'features/staff/pages/administration/AssignStaffPrivilegesPage.tsx'],
  ['pages/RevokePrivilegesPage.tsx', 'features/staff/pages/administration/RevokePrivilegesPage.tsx'],
  ['pages/TaskApprovalPage.tsx', 'features/staff/pages/administration/TaskApprovalPage.tsx'],

  // staff — organization
  ['pages/FacultyManagementPage.tsx', 'features/staff/pages/organization/FacultyManagementPage.tsx'],
  ['pages/BranchManagementPage.tsx', 'features/staff/pages/organization/BranchManagementPage.tsx'],
  ['pages/ProfessionManagementPage.tsx', 'features/staff/pages/organization/ProfessionManagementPage.tsx'],

  // staff — media (nested route)
  ['pages/MediaManagerPage.tsx', 'features/staff/pages/media/MediaManagerPage.tsx'],

  // other feature modules
  ['pages/Admin.tsx', 'features/admin/pages/AdminPage.tsx'],
  ['pages/Analytics.tsx', 'features/admin/pages/AnalyticsPage.tsx'],
  ['pages/SecurityDashboardPage.tsx', 'features/security/pages/SecurityDashboardPage.tsx'],
  ['pages/MediaViewerPage.tsx', 'features/media/pages/MediaViewerPage.tsx'],
  ['pages/MediaTestingPage.tsx', 'features/media/pages/MediaTestingPage.tsx'],
  ['pages/MediaGalleryDashboard.tsx', 'features/media/pages/MediaGalleryDashboardPage.tsx'],
  ['pages/JoinBookingPage.tsx', 'features/bookings/pages/JoinBookingPage.tsx'],
  ['pages/NotFound.tsx', 'shared/pages/NotFoundPage.tsx'],
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function moveFile(fromRel, toRel) {
  const from = path.join(src, fromRel);
  const to = path.join(src, toRel);
  if (!fs.existsSync(from)) {
    console.warn(`SKIP (missing): ${fromRel}`);
    return;
  }
  ensureDir(to);
  fs.renameSync(from, to);
  console.log(`MOVED: ${fromRel} -> ${toRel}`);
}

// Move registration feature folder contents
function moveRegistrationFeature() {
  const regFrom = path.join(src, 'features/register');
  const regTo = path.join(src, 'features/registration');
  if (!fs.existsSync(regFrom)) return;
  if (fs.existsSync(regTo)) {
    // merge: move children
    for (const entry of fs.readdirSync(regFrom)) {
      const s = path.join(regFrom, entry);
      const d = path.join(regTo, entry);
      ensureDir(d);
      if (fs.statSync(s).isDirectory()) {
        fs.cpSync(s, d, { recursive: true });
      } else {
        fs.copyFileSync(s, d);
      }
    }
    fs.rmSync(regFrom, { recursive: true, force: true });
  } else {
    fs.renameSync(regFrom, regTo);
  }
  console.log('MOVED: features/register -> features/registration');
}

for (const [from, to] of moves) {
  moveFile(from, to);
}

moveRegistrationFeature();

// Remove empty pages dir if possible
const pagesDir = path.join(src, 'pages');
if (fs.existsSync(pagesDir)) {
  const remaining = fs.readdirSync(pagesDir);
  if (remaining.length === 0) {
    fs.rmdirSync(pagesDir);
    console.log('REMOVED empty pages/');
  } else {
    console.warn('pages/ still contains:', remaining);
  }
}

// Remove empty features/dashboard if possible
const dashDir = path.join(src, 'features/dashboard');
if (fs.existsSync(dashDir)) {
  fs.rmSync(dashDir, { recursive: true, force: true });
  console.log('REMOVED features/dashboard/');
}

console.log('\nDone moving files.');
