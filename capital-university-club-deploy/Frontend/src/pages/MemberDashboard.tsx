import { lazy, Suspense } from "react";
import { Toaster } from "../components/StaffPagesComponents/ui/toaster";
import { Toaster as Sonner } from "../components/StaffPagesComponents/ui/sonner";
import { TooltipProvider } from "../components/StaffPagesComponents/ui/tooltip";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../components/StaffPagesComponents/layout/MainLayout";
import { useToast } from "../components/StaffPagesComponents/ui/use-toast";
import AppLoader from "../components/AppLoader";

const MemberHomePage = lazy(() => import("./MemberHomePage"));
const MemberProfilePage = lazy(() => import("./MemberProfilePage"));
const MemberMembershipPage = lazy(() => import("./MemberMembershipPage"));
const MemberSportsPage = lazy(() => import("./MemberSportsPage"));
const MemberSubscribePage = lazy(() => import("./MemberSubscribePage"));
const CourtRentalPage = lazy(() => import("../features/dashboard/pages/CourtRentalPage"));

const MemberDashboard = () => {
    const { toast } = useToast();

    const showToast = (msg: string, t: "success" | "error" | "info") => {
        toast({
            title: msg,
            variant: t === "success" ? "success" : t === "error" ? "destructive" : "default",
        });
    };

    return (
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <MainLayout>
                <div className="p-4 md:p-6 max-w-7xl mx-auto w-full min-h-full pb-8">
                    <Suspense fallback={<AppLoader />}>
                        <Routes>
                            <Route index element={<Navigate to="home" replace />} />
                            <Route path="home" element={<MemberHomePage />} />
                            <Route path="profile" element={<MemberProfilePage />} />
                            <Route path="memberships" element={<MemberMembershipPage />} />
                            <Route path="sports" element={<MemberSportsPage />} />
                            <Route path="subscribe" element={<MemberSubscribePage />} />
                            <Route path="courts" element={<CourtRentalPage showToast={showToast} />} />
                            <Route path="*" element={<Navigate to="home" replace />} />
                        </Routes>
                    </Suspense>
                </div>
            </MainLayout>
        </TooltipProvider>
    );
};

export default MemberDashboard;
