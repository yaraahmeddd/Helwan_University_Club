import { lazy, Suspense } from "react";
import { TooltipProvider } from '@/components/StaffPagesComponents/ui/tooltip';
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from '@/components/StaffPagesComponents/layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CredentialChangeModal } from '@/components/CredentialChangeModal';
import { useAuth } from '@/context/AuthContext';
import AppLoader from '@/components/AppLoader';
import { AppErrorBoundaryWrapper } from '@/components/shared/AppErrorBoundaryWrapper';
import '@/features/staff/styles/staff-dashboard.css';

const StaffDashboardPage = lazy(() => import('@/features/staff/pages/dashboard/StaffDashboardPage'));
const SportsPage = lazy(() => import('@/features/staff/pages/sports/SportsPage'));
const MembershipsPage = lazy(() => import('@/features/staff/pages/finance/MembershipsPage'));
const RegistrationManagementPage = lazy(() => import('@/features/staff/pages/finance/RegistrationManagementPage'));
// const MembershipFormPage = lazy(() => import('@/features/staff/pages/finance/MembershipFormPage'));
// const FinancePage = lazy(() => import('@/features/staff/pages/finance/FinancePage'));
// const TaskApprovalPage = lazy(() => import('@/features/staff/pages/administration/TaskApprovalPage'));
const AdminPrivilegesPage = lazy(() => import('@/features/staff/pages/administration/AdminPrivilegesPage'));
const NotFoundPage = lazy(() => import('@/shared/pages/NotFoundPage'));
const AuditLogPage = lazy(() => import('@/features/staff/pages/administration/AuditLogPage'));
const MediaManagerPage = lazy(() => import('@/features/staff/pages/media/MediaManagerPage'));
const AddNewStaffPage = lazy(() => import('@/features/staff/pages/administration/AddNewStaffPage'));
const StaffListPage = lazy(() => import('@/features/staff/pages/administration/StaffListPage'));
const StaffManagementPage = lazy(() => import('@/features/staff/pages/administration/StaffManagementPage'));
const StaffProfilePage = lazy(() => import('@/features/staff/pages/administration/StaffProfilePage'));
const PrivilegePackageAdminPage = lazy(() => import('@/features/staff/pages/administration/PrivilegePackageAdminPage'));
const PackageManagementPage = lazy(() => import('@/features/staff/pages/administration/PackageManagementPage'));
const AssignStaffPrivilegesPage = lazy(() => import('@/features/staff/pages/administration/AssignStaffPrivilegesPage'));
const RevokePrivilegesPage = lazy(() => import('@/features/staff/pages/administration/RevokePrivilegesPage'));
const MemberManagementPage = lazy(() => import('@/features/staff/pages/members/MemberManagementPage'));
const StaffAddMemberPage = lazy(() => import('@/features/staff/pages/members/StaffAddMemberPage'));
const StaffAddTeamMemberPage = lazy(() => import('@/features/staff/pages/members/StaffAddTeamMemberPage'));
const SportsMembersPage = lazy(() => import('@/features/staff/pages/members/SportsMembersPage'));
const SportManagementPage = lazy(() => import('@/features/staff/pages/members/SportManagementPage'));
// const SportsRequestsPage = lazy(() => import('@/features/staff/pages/sports/SportsRequestsPage'));
const CourtsManagementPage = lazy(() => import('@/features/staff/pages/sports/CourtsManagementPage'));
const CourtBookingsPage = lazy(() => import('@/features/staff/pages/sports/CourtBookingsPage'));
// const AttendancePage = lazy(() => import('@/features/staff/pages/sports/AttendancePage'));
const TeamsManagementPage = lazy(() => import('@/features/staff/pages/sports/TeamsManagementPage'));
const SubscriptionsPage = lazy(() => import('@/features/staff/pages/finance/SubscriptionsPage'));
const ManageInvitationsPage = lazy(() => import('@/features/staff/pages/sports/ManageInvitationsPage'));
const FacultyManagementPage = lazy(() => import('@/features/staff/pages/organization/FacultyManagementPage'));
const BranchManagementPage = lazy(() => import('@/features/staff/pages/organization/BranchManagementPage'));
const ProfessionManagementPage = lazy(() => import('@/features/staff/pages/organization/ProfessionManagementPage'));

// ─── Ordered list of fallback pages for non-dashboard users ──────────────────
// When a user does NOT have dashboard.view, we redirect them to the first page
// in this list that they have access to. The profile page has no privilege
// requirement so it is always the ultimate fallback.
const FALLBACK_PAGES: Array<{ path: string; privilege?: string }> = [
  { path: "/staff/dashboard/registrations", privilege: "MANAGE_MEMBERSHIP_REQUEST" },
  { path: "/staff/dashboard/members/manage", privilege: "VIEW_MEMBERS" },
  { path: "/staff/dashboard/members/new", privilege: "CREATE_MEMBER" },
  { path: "/staff/dashboard/members/new-team-member", privilege: "ADD_TEAM_MEMBER" },
  { path: "/staff/dashboard/sports", privilege: "VIEW_SPORTS" },
  { path: "/staff/dashboard/memberships", privilege: "VIEW_MEMBERSHIP_PLANS" },
  { path: "/staff/dashboard/finance/subscriptions", privilege: "VIEW_FINANCE" },
  // { path: "/staff/dashboard/tasks", privilege: "VIEW_TASKS" },
  { path: "/staff/dashboard/media-gallery", privilege: "MEDIA_CENTER_CREATE" },
  { path: "/staff/dashboard/audit-log", privilege: "VIEW_AUDIT_LOGS" },
  { path: "/staff/dashboard/faculties", privilege: "VIEW_FACULTIES" },
  { path: "/staff/dashboard/branches", privilege: "VIEW_BRANCHES" },
  { path: "/staff/dashboard/professions", privilege: "VIEW_PROFESSIONS" },
  { path: "/staff/dashboard/admin/staff/manage", privilege: "VIEW_STAFF" },
  { path: "/staff/dashboard/profile"                 /* always accessible */ },
];

/** Redirects admin/senior staff to DashboardPage; others to their first accessible page. */
function SmartIndexRedirect() {
  const { hasPrivilege } = useAuth();

  if (hasPrivilege("dashboard.view")) {
    return <StaffDashboardPage />;
  }

  const target = FALLBACK_PAGES.find(
    (p) => !p.privilege || hasPrivilege(p.privilege)
  );

  return <Navigate to={target?.path ?? "/staff/dashboard/profile"} replace />;
}

const StaffDashboard = () => {
  return (
    <TooltipProvider>
      <CredentialChangeModal />
      <MainLayout>
        <AppErrorBoundaryWrapper compact>
        <Suspense fallback={<AppLoader />}>
          <Routes>
            <Route index element={<SmartIndexRedirect />} />
            <Route path="sports" element={<ProtectedRoute requiredPrivilege="VIEW_SPORTS"><SportsPage /></ProtectedRoute>} />
            {/* <Route path="sports/requests" element={<ProtectedRoute requiredPrivilege="VIEW_SPORTS"><SportsRequestsPage /></ProtectedRoute>} /> */}
            <Route path="sports/courts" element={<ProtectedRoute requiredPrivilege="VIEW_FIELDS"><CourtsManagementPage /></ProtectedRoute>} />
            <Route path="sports/bookings" element={<ProtectedRoute requiredPrivilege="VIEW_SPORTS"><CourtBookingsPage /></ProtectedRoute>} />
            <Route path="sports/invitations" element={<ProtectedRoute requiredPrivilege="VIEW_SPORTS"><ManageInvitationsPage /></ProtectedRoute>} />
            {/* <Route path="sports/attendance" element={<ProtectedRoute requiredPrivilege="VIEW_SPORTS"><AttendancePage /></ProtectedRoute>} /> */}
            <Route path="sports/teams" element={<ProtectedRoute requiredPrivilege="VIEW_TEAMS"><TeamsManagementPage /></ProtectedRoute>} />
            <Route path="profile" element={<StaffProfilePage />} />
            <Route path="memberships" element={<ProtectedRoute requiredPrivilege="VIEW_MEMBERSHIP_PLANS"><MembershipsPage /></ProtectedRoute>} />
            <Route path="registrations" element={<ProtectedRoute requiredPrivilege="MANAGE_MEMBERSHIP_REQUEST"><RegistrationManagementPage /></ProtectedRoute>} />
            {/* <Route path="membership-form" element={<ProtectedRoute requiredPrivilege="VIEW_MEMBERS"><MembershipFormPage /></ProtectedRoute>} /> */}
            <Route path="finance/subscriptions" element={<ProtectedRoute requiredPrivilege="VIEW_FINANCE"><SubscriptionsPage /></ProtectedRoute>} />
            <Route path="admin/privileges" element={<ProtectedRoute requiredPrivilege="VIEW_PRIVILEGES"><AdminPrivilegesPage /></ProtectedRoute>} />
            <Route path="admin/privilege-packages" element={<ProtectedRoute requiredPrivilege="VIEW_PRIVILEGES"><PrivilegePackageAdminPage /></ProtectedRoute>} />
            <Route path="admin/manage-packages" element={<ProtectedRoute requiredPrivilege="VIEW_PRIVILEGES"><PackageManagementPage /></ProtectedRoute>} />
            <Route path="audit-log" element={<ProtectedRoute requiredPrivilege="VIEW_AUDIT_LOGS"><AuditLogPage /></ProtectedRoute>} />
            <Route path="admin/staff/new" element={<ProtectedRoute requiredPrivilege="CREATE_STAFF"><AddNewStaffPage /></ProtectedRoute>} />
            <Route path="admin/staff/list" element={<ProtectedRoute requiredPrivilege="VIEW_STAFF"><StaffListPage /></ProtectedRoute>} />
            <Route path="admin/staff/manage" element={<ProtectedRoute requiredPrivilege="VIEW_STAFF"><StaffManagementPage /></ProtectedRoute>} />
            <Route path="admin/staff/assign-privileges" element={<ProtectedRoute requiredPrivilege="VIEW_PRIVILEGES"><AssignStaffPrivilegesPage /></ProtectedRoute>} />
            <Route path="admin/staff/revoke-privileges" element={<ProtectedRoute requiredPrivilege="VIEW_PRIVILEGES"><RevokePrivilegesPage /></ProtectedRoute>} />
            <Route path="members/manage" element={<ProtectedRoute requiredPrivilege="VIEW_MEMBERS"><MemberManagementPage /></ProtectedRoute>} />
            <Route path="members/sports" element={<ProtectedRoute requiredPrivilege="ASSIGN_SPORT_TO_MEMBER"><SportsMembersPage /></ProtectedRoute>} />
            <Route path="members/sports-view" element={<ProtectedRoute requiredPrivilege="VIEW_TEAM_MEMBERS"><SportManagementPage /></ProtectedRoute>} />
            <Route path="members/new" element={<ProtectedRoute requiredPrivilege="CREATE_MEMBER"><StaffAddMemberPage /></ProtectedRoute>} />
            <Route path="members/new-team-member" element={<ProtectedRoute requiredPrivilege="ADD_TEAM_MEMBER"><StaffAddTeamMemberPage /></ProtectedRoute>} />
            <Route path="media-gallery" element={<ProtectedRoute requiredPrivilege="MEDIA_CENTER_CREATE"><MediaManagerPage /></ProtectedRoute>} />
            <Route path="faculties" element={<ProtectedRoute requiredPrivilege="VIEW_FACULTIES"><FacultyManagementPage /></ProtectedRoute>} />
            <Route path="branches" element={<ProtectedRoute requiredPrivilege="VIEW_BRANCHES"><BranchManagementPage /></ProtectedRoute>} />
            <Route path="professions" element={<ProtectedRoute requiredPrivilege="VIEW_PROFESSIONS"><ProfessionManagementPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        </AppErrorBoundaryWrapper>
      </MainLayout>
    </TooltipProvider>
  );
};

export default StaffDashboard;

