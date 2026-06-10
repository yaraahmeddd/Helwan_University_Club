import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import AppLoader from './components/AppLoader';
const Landingpage = lazy(() => import('./pages/Landingpage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const IdentityVerification = lazy(() => import('./pages/IdentityVerification'));
const DocumentUpload = lazy(() => import('./pages/DocumentUpload'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BranchExplorePage = lazy(() => import('./pages/BranchExplorePage'));
const MemberPortal = lazy(() => import('./pages/MemberPortal'));
const AdminDashboard = lazy(() => import('./pages/Admin'));
const NewRegister = lazy(() => import('./pages/NewRegister'));
const InviteMemberPage = lazy(() => import('./pages/InviteMemberPage'));
const FamilyMemberDetailsPage = lazy(() => import('./pages/FamilyMemberDetailsPage'));
const RegisterPage = lazy(() => import('./features/register/RegisterPage'));
const AssignmentPage = lazy(() => import('./features/register/pages').then(m => ({ default: m.AssignmentPage })));

const StaffDashboard = lazy(() => import('./pages/staffDashboard'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const MemberPendingPage = lazy(() => import('./pages/MemberPendingPage'));

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AppErrorBoundaryWrapper } from './components/shared/AppErrorBoundaryWrapper';
import { GlobalErrorListener } from './components/shared/GlobalErrorListener';
import { Toaster } from './components/StaffPagesComponents/ui/toaster';
import { Toaster as Sonner } from './components/StaffPagesComponents/ui/sonner';
const TeamMemberDashboard = lazy(() => import('./pages/teammemberdashboard'));
const PublicPostDetailsPage = lazy(() => import('./pages/PublicPostDetailsPage'));
const TeamMemberSportPaymentPage = lazy(() => import('./pages/TeamMemberSportPaymentPage'));
const MemberSportPaymentPage = lazy(() => import('./pages/MemberSportPaymentPage'));
const InvitationPage = lazy(() => import('./pages/InvitationPage'));
const JoinBookingPage = lazy(() => import('./pages/JoinBookingPage'));
const SecurityDashboardPage = lazy(() => import('./pages/SecurityDashboardPage'));
const MediaTestingPage = lazy(() => import('./pages/MediaTestingPage'));
const MediaManagerPage = lazy(() => import('./pages/MediaManagerPage'));
const MediaViewerPage = lazy(() => import('./pages/MediaViewerPage'));
const SportInfoPage = lazy(() => import('./pages/SportInfoPage'));
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage'));

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <GlobalErrorListener />
          <AppErrorBoundaryWrapper>
          <Suspense fallback={<AppLoader />}>
            <Routes>
            <Route path="/" element={<Landingpage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<IdentityVerification />} />
            <Route path="/identity-verification" element={<IdentityVerification />} />
            <Route path="/upload-documents" element={<DocumentUpload />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/memberportal" element={<MemberPortal />} />
            <Route path="/new" element={<NewRegister />} />
            <Route path="/re" element={<RegisterPage />} />
            <Route path="/assignment" element={<AssignmentPage />} />
            <Route path="/form" element={<InviteMemberPage />} />
            <Route path="/invite" element={<InviteMemberPage />} />
            <Route path="/invite/:token" element={<InvitationPage />} />
            <Route path="/family-member" element={<FamilyMemberDetailsPage />} />
            <Route path="/branches/:branchId" element={<BranchExplorePage />} />
            <Route path="/news/:id" element={<PublicPostDetailsPage />} />
            <Route path="/lastNews" element={<Navigate to="/?tab=lastNews" replace />} />
            <Route path="/bookings/share/:shareToken" element={<JoinBookingPage />} />
            <Route path="/security/bookings" element={<SecurityDashboardPage />} />
            <Route path="/media-testing" element={<MediaTestingPage />} />
            <Route path="/media-manager" element={<MediaManagerPage />} />
            <Route path="/media-viewer" element={<MediaViewerPage />} />
            <Route path="/sport/:sportKey" element={<SportInfoPage />} />

            {/* Protected Routes - Staff */}
            <Route
              path="/staff/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SPORTS_DIRECTOR", "SPORTS_OFFICER", "FINANCIAL_DIRECTOR", "REGISTRATION_STAFF", "TEAM_MANAGER", "SUPPORT", "AUDITOR", "STAFF"]}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Admin Only Specific (if any, example) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Member Dashboard — active members only (pending members are intercepted by ProtectedRoute) */}
            <Route
              path="/member/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["MEMBER"]}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/payment"
              element={
                <ProtectedRoute allowedRoles={["MEMBER"]}>
                  <MemberSportPaymentPage />
                </ProtectedRoute>
              }
            />

            {/* Pending member holding page */}
            <Route
              path="/member/pending"
              element={
                <ProtectedRoute allowedRoles={["MEMBER"]}>
                  <MemberPendingPage />
                </ProtectedRoute>
              }
            />

            {/* Team Member Dashboard */}
            <Route
              path="/team-member/dashboard"
              element={
                <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
                  <TeamMemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-member/payment"
              element={
                <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
                  <TeamMemberSportPaymentPage />
                </ProtectedRoute>
              }
            />

            <Route path="/unauthorized" element={<ForbiddenPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          </AppErrorBoundaryWrapper>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default Router;

