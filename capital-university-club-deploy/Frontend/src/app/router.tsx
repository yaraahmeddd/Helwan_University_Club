import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import AppLoader from '@/components/AppLoader';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';
import { AppErrorBoundaryWrapper } from '@/components/shared/AppErrorBoundaryWrapper';
import { GlobalErrorListener } from '@/components/shared/GlobalErrorListener';
import { Toaster } from '@/components/StaffPagesComponents/ui/toaster';
import { Toaster as Sonner } from '@/components/StaffPagesComponents/ui/sonner';

const LandingPage = lazy(() => import('@/features/public/pages/LandingPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const LegacyRegisterPage = lazy(() => import('@/features/auth/pages/LegacyRegisterPage'));
const IdentityVerificationPage = lazy(() => import('@/features/auth/pages/IdentityVerificationPage'));
const DocumentUploadPage = lazy(() => import('@/features/auth/pages/DocumentUploadPage'));
const LegacyDashboardPage = lazy(() => import('@/features/public/pages/LegacyDashboardPage'));
const BranchExplorePage = lazy(() => import('@/features/public/pages/BranchExplorePage'));
const MemberPortalPage = lazy(() => import('@/features/public/pages/MemberPortalPage'));
const AdminPage = lazy(() => import('@/features/admin/pages/AdminPage'));
const NewRegisterPage = lazy(() => import('@/features/registration/pages/NewRegisterPage'));
const InviteMemberPage = lazy(() => import('@/features/registration/pages/InviteMemberPage'));
const FamilyMemberDetailsPage = lazy(() => import('@/features/registration/pages/FamilyMemberDetailsPage'));
const RegisterPage = lazy(() => import('@/features/registration/RegisterPage'));
const AssignmentPage = lazy(() =>
  import('@/features/registration/pages').then((m) => ({ default: m.AssignmentPage })),
);

const StaffDashboardRoutes = lazy(() => import('@/features/staff/routes/StaffDashboardRoutes'));
const MemberDashboardRoutes = lazy(() => import('@/features/member/routes/MemberDashboardRoutes'));
const MemberPendingPage = lazy(() => import('@/features/member/pages/MemberPendingPage'));

const TeamMemberDashboardPage = lazy(() => import('@/features/team-member/pages/TeamMemberDashboardPage'));
const PublicPostDetailsPage = lazy(() => import('@/features/public/pages/PublicPostDetailsPage'));
const TeamMemberSportPaymentPage = lazy(() => import('@/features/team-member/pages/TeamMemberSportPaymentPage'));
const MemberSportPaymentPage = lazy(() => import('@/features/member/pages/MemberSportPaymentPage'));
const InvitationPage = lazy(() => import('@/features/registration/pages/InvitationPage'));
const JoinBookingPage = lazy(() => import('@/features/bookings/pages/JoinBookingPage'));
const SecurityDashboardPage = lazy(() => import('@/features/security/pages/SecurityDashboardPage'));
const MediaTestingPage = lazy(() => import('@/features/media/pages/MediaTestingPage'));
const MediaManagerPage = lazy(() => import('@/features/staff/pages/media/MediaManagerPage'));
const MediaViewerPage = lazy(() => import('@/features/media/pages/MediaViewerPage'));
const SportInfoPage = lazy(() => import('@/features/public/pages/SportInfoPage'));
const ForbiddenPage = lazy(() => import('@/features/auth/pages/ForbiddenPage'));

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
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<LegacyRegisterPage />} />
                <Route path="/verify" element={<IdentityVerificationPage />} />
                <Route path="/identity-verification" element={<IdentityVerificationPage />} />
                <Route path="/upload-documents" element={<DocumentUploadPage />} />
                <Route path="/upload" element={<DocumentUploadPage />} />
                <Route path="/dashboard" element={<LegacyDashboardPage />} />
                <Route path="/memberportal" element={<MemberPortalPage />} />
                <Route path="/new" element={<NewRegisterPage />} />
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
                <Route
                  path="/security/bookings"
                  element={
                    <ProtectedRoute allowedRoles={['SECURITY', 'ADMIN', 'STAFF']}>
                      <SecurityDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/media-testing" element={<MediaTestingPage />} />
                <Route path="/media-manager" element={<MediaManagerPage />} />
                <Route path="/media-viewer" element={<MediaViewerPage />} />
                <Route path="/sport/:sportKey" element={<SportInfoPage />} />

                <Route
                  path="/staff/dashboard/*"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SPORTS_DIRECTOR', 'SPORTS_OFFICER', 'FINANCIAL_DIRECTOR', 'REGISTRATION_STAFF', 'TEAM_MANAGER', 'SUPPORT', 'AUDITOR', 'STAFF']}>
                      <StaffDashboardRoutes />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/member/dashboard/*"
                  element={
                    <ProtectedRoute allowedRoles={['MEMBER']}>
                      <MemberDashboardRoutes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/member/payment"
                  element={
                    <ProtectedRoute allowedRoles={['MEMBER']}>
                      <MemberSportPaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/member/pending"
                  element={
                    <ProtectedRoute allowedRoles={['MEMBER']}>
                      <MemberPendingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/team-member/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
                      <TeamMemberDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/team-member/payment"
                  element={
                    <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
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
