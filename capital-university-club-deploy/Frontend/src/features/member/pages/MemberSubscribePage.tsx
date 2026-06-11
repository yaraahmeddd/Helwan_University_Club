import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from '@/context/AuthContext';
import api from '@/services/axios';
import { Btn } from '@/features/member-portal/components/DashboardComponents';
import { useToast } from '@/components/StaffPagesComponents/ui/use-toast';
import type { ExploreSport, TimeSlotOption } from '@/features/member-portal/types';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from '@/i18n';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80";
const MAX_SPORTS = 4;

function getFullUrl(path?: string | null) {
    if (!path || path === "null") return null;
    const cleanPath = path.trim();
    if (cleanPath.startsWith("http") || cleanPath.startsWith("data:")) return cleanPath;
    const normalizedPath = cleanPath.replace(/\\/g, "/");
    const finalPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${finalPath}`;
}

const pickPositiveAmount = (...values: Array<number | string | null | undefined>): number => {
    for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return 0;
};

interface SubscriptionLookup {
    subscriptionId: number;
    teamId: string;
    status: string;
    subscriptionStatus: string;
    paymentReference: string | null;
    paymentCompletedAt: string | null;
    price: number;
}

interface MemberSubscriptionApi {
    id?: number | string;
    subscription_id?: number | string;
    team_id?: string;
    status?: string;
    subscription_status?: string;
    payment_reference?: string | null;
    payment_completed_at?: string | null;
    price?: number | string;
}

interface SportScheduleApi {
    id: string;
    team_id: string;
    start_time?: string;
    end_time?: string;
    days_ar?: string;
    days_en?: string;
    training_fee?: number | string;
    price?: number | string;
    status?: string;
    field?: {
        name_ar?: string;
        name_en?: string;
    };
}

interface AvailableTeamApi {
    id?: number | string;
    team_id?: number | string;
    name_ar?: string;
    name_en?: string;
    team_name_ar?: string;
    team_name_en?: string;
    sport_id?: number | string;
    sport_name_ar?: string;
    sport_name_en?: string;
    sport?: {
        id?: number | string;
        name_ar?: string;
        name_en?: string;
        sport_image?: string | null;
        price?: number | string;
    };
    training_schedules?: SportScheduleApi[];
    schedules?: SportScheduleApi[];
    for_type?: string;
    team_type?: string;
    audience?: string;
    internal_price?: number | string;
    external_price?: number | string;
    subscription_price?: number | string;
    sport_price?: number | string;
    monthly_fee?: number | string;
    training_fee?: number | string;
    price?: number | string;
}

const FALLBACK_IMAGES: Record<string, string> = {
    "كرة القدم": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    Football: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    "كرة السلة": "https://images.unsplash.com/photo-1546519638405-a9d1b2f14e88?w=800&q=80",
    Basketball: "https://images.unsplash.com/photo-1546519638405-a9d1b2f14e88?w=800&q=80",
    "التنس": "https://images.unsplash.com/photo-1595435064212-36292241cf4f?w=800&q=80",
    Tennis: "https://images.unsplash.com/photo-1595435064212-36292241cf4f?w=800&q=80",
    "السباحة": "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&q=80",
    Swim: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&q=80",
    "الكرة الطائرة": "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80",
    Volleyball: "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80",
    "جمباز": "https://images.unsplash.com/photo-1566932769119-7a1fb6d7691a?w=800&q=80",
};

const getIconForSport = (name: string): string => {
    if (!name) return "🏆";
    const normalizedName = name.toLowerCase();
    if (normalizedName.includes("قدم") || normalizedName.includes("foot")) return "⚽";
    if (normalizedName.includes("سلة") || normalizedName.includes("basket")) return "🏀";
    if (normalizedName.includes("تنس") || normalizedName.includes("tennis")) return "🎾";
    if (normalizedName.includes("سباح") || normalizedName.includes("swim")) return "🏊";
    if (normalizedName.includes("طائرة") || normalizedName.includes("volley")) return "🏐";
    if (normalizedName.includes("جمباز") || normalizedName.includes("gym")) return "🤸";
    return "🏆";
};

const normalizeAudienceType = (value?: string | null): "internal" | "external" | null => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return null;
    if (raw.includes("internal") || raw.includes("داخل")) return "internal";
    if (raw.includes("external") || raw.includes("خارج")) return "external";
    return null;
};

const audienceLabel = (type: "internal" | "external" | null, isEnglish: boolean): string => {
    if (type === "internal") return isEnglish ? "Internal" : "داخلي";
    if (type === "external") return isEnglish ? "External" : "خارجي";
    return isEnglish ? "Not specified" : "غير محدد";
};

export default function MemberSubscribePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language?.startsWith("en");
    const locale = isEnglish ? "en-US" : "ar-EG";
    const tm = (key: string, options?: Record<string, unknown>) => t(key, { ns: "member", ...(options || {}) });

    const [sports, setSports] = useState<ExploreSport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);
    const isTeamMemberMode = !user?.member_id && !!user?.team_member_id;
    const subjectId = Number((isTeamMemberMode ? user?.team_member_id : user?.member_id) || 0);
    const subscribeEndpoint = isTeamMemberMode ? "/team-member-subscriptions/subscribe" : "/member-subscriptions/subscribe";
    const cancelEndpoint = (subscriptionId: number) =>
        isTeamMemberMode
            ? `/team-member-subscriptions/subscriptions/${subscriptionId}/cancel`
            : `/member-subscriptions/${subscriptionId}/cancel`;

    const isPendingPaymentSubscription = useCallback((subscription?: SubscriptionLookup) => {
        if (!subscription) return false;

        const normalizedSubscriptionStatus = String(subscription.subscriptionStatus || "").toLowerCase();
        if (normalizedSubscriptionStatus === "pending_payment") {
            return true;
        }

        const normalizedStatus = String(subscription.status || "").toLowerCase();
        const hasPaymentReference = !!subscription.paymentReference;
        const isPaymentCompleted = !!subscription.paymentCompletedAt;

        return normalizedStatus === "pending" && hasPaymentReference && !isPaymentCompleted;
    }, []);

    const goToPaymentPage = useCallback(
        (args: {
            sportName: string;
            slot: TimeSlotOption;
            subscriptionId: number;
            paymentReference: string;
            amount: number;
            currency: string;
        }) => {
            const params = new URLSearchParams({
                subscriptionId: String(args.subscriptionId),
                paymentReference: args.paymentReference,
                amount: String(args.amount),
                currency: args.currency,
                sportName: args.sportName,
                slotTime: args.slot.time,
                slotDays: args.slot.days,
                court: args.slot.court,
                slotId: args.slot.id || "",
                teamId: args.slot.teamId || "",
            });

            navigate(`${isTeamMemberMode ? "/team-member/payment" : "/member/payment"}?${params.toString()}`);
        },
        [navigate, isTeamMemberMode]
    );

    const loadSports = useCallback(async () => {
        try {
            setLoading(true);
            const sportImageMap: Record<number, string | null> = {};
            const sportPriceMap: Record<number, number> = {};

            try {
                const sportsRes = await api.get("/sports");
                const sportsSource = sportsRes?.data;
                const sportsList =
                    (Array.isArray(sportsSource?.data) && sportsSource.data) ||
                    (Array.isArray(sportsSource?.sports) && sportsSource.sports) ||
                    (Array.isArray(sportsSource) && sportsSource) ||
                    [];

                sportsList.forEach((s: any) => {
                    const sid = Number(s?.id || 0);
                    if (!sid) return;
                    const img = s?.sport_image || s?.image_url || s?.image || null;
                    sportImageMap[sid] = img ? String(img) : null;
                    sportPriceMap[sid] = pickPositiveAmount(s?.price, s?.subscription_price, s?.training_fee);
                });
            } catch (error) {
                console.warn("Failed to load sports images from /sports", error);
            }
            
            const response = await api.get("/teams/available/for-me");
            const source = response?.data;
            const availableTeamsRaw =
                (Array.isArray(source?.data?.teams) && source.data.teams) ||
                (Array.isArray(source?.data) && source.data) ||
                (Array.isArray(source?.teams) && source.teams) ||
                (Array.isArray(source) && source) ||
                [];

            if (!Array.isArray(availableTeamsRaw) || availableTeamsRaw.length === 0) {
                setSports([]);
                return;
            }

            const subscriptionMap: Record<string, SubscriptionLookup> = {};
            if (subjectId) {
                try {
                    const subRes = isTeamMemberMode
                        ? await api.get(`/team-member-subscriptions/${subjectId}/subscriptions`).catch(() =>
                            api.get(`/team-members/${subjectId}/subscriptions`)
                        )
                        : await api.get(`/member-subscriptions/${subjectId}/subscriptions`);
                    const rawSubscriptions =
                        (Array.isArray(subRes.data?.data?.subscriptions) && subRes.data.data.subscriptions) ||
                        (Array.isArray(subRes.data?.data) && subRes.data.data) ||
                        (Array.isArray(subRes.data?.subscriptions) && subRes.data.subscriptions) ||
                        [];

                    rawSubscriptions.forEach((rawSub: unknown) => {
                        const sub = rawSub as MemberSubscriptionApi;
                        if (!sub?.team_id) return;
                        const paymentCompletedAt = sub.payment_completed_at ? String(sub.payment_completed_at) : null;
                        const effectiveStatus = paymentCompletedAt ? "active" : String(sub.status || "pending");
                        const effectiveSubscriptionStatus = paymentCompletedAt
                            ? "active"
                            : String(sub.subscription_status || "pending_admin_approval");
                        subscriptionMap[sub.team_id] = {
                            subscriptionId: Number(sub.subscription_id || sub.id),
                            teamId: String(sub.team_id),
                            status: effectiveStatus,
                            subscriptionStatus: effectiveSubscriptionStatus,
                            paymentReference: sub.payment_reference ? String(sub.payment_reference) : null,
                            paymentCompletedAt,
                            price: Number(sub.price || 0),
                        };
                    });
                } catch (error) {
                    console.warn("Failed to load subscriptions", error);
                }
            }

            const groupedBySport = new Map<string, {
                sportId: number;
                nameAr: string;
                nameEn: string;
                image: string | null;
                slots: TimeSlotOption[];
                defaultPrice: number;
            }>();

            availableTeamsRaw.forEach((rawTeam: unknown) => {
                const team = rawTeam as AvailableTeamApi;
                const sportId = Number(team.sport_id || team.sport?.id || 0);
                if (!sportId) return;

                const sportNameAr = String(team.sport_name_ar || team.sport?.name_ar || (isEnglish ? "Unnamed Sport" : "رياضة غير مسمى"));
                const sportNameEn = String(team.sport_name_en || team.sport?.name_en || "");
                const sportImage = sportImageMap[sportId] || team.sport?.sport_image || null;
                const teamId = String(team.id || team.team_id || "");
                const audienceType = normalizeAudienceType(team.for_type || team.team_type || team.audience);
                const schedules = (Array.isArray(team.training_schedules) ? team.training_schedules : [])
                    .concat(Array.isArray(team.schedules) ? team.schedules : []);
                const minActiveScheduleFee = schedules
                    .filter((schedule) => String(schedule.status || "active").toLowerCase() === "active")
                    .map((schedule) => Number(schedule.training_fee))
                    .filter((fee) => Number.isFinite(fee) && fee > 0)
                    .reduce<number | null>((min, fee) => (min === null || fee < min ? fee : min), null);
                const teamBasePrice = pickPositiveAmount(
                    team.subscription_price,
                    minActiveScheduleFee,
                    team.sport_price,
                    team.sport?.price,
                    sportPriceMap[sportId],
                    audienceType === "internal" ? team.internal_price : null,
                    audienceType === "external" ? team.external_price : null,
                    team.training_fee,
                    team.monthly_fee,
                    team.price
                );

                const slotsFromTeam: TimeSlotOption[] = schedules.length > 0
                    ? schedules.map((schedule, idx) => ({
                        id: String(schedule.id || `${teamId}-schedule-${idx}`),
                        teamId: String(schedule.team_id || teamId || ""),
                        time: `${(schedule.start_time || "").slice(0, 5)} - ${(schedule.end_time || "").slice(0, 5)}`,
                        days: schedule.days_ar || schedule.days_en || "-",
                        court: `${(i18n.language === 'ar' ? (schedule.field?.name_ar || schedule.field?.name_en) : (schedule.field?.name_en || schedule.field?.name_ar)) || (team.name_ar || (i18n.language === 'ar' ? (team.team_name_ar || team.name_en) : (team.name_en || team.team_name_ar)) || team.team_name_en || (isEnglish ? "Team" : "فريق"))} • ${audienceLabel(audienceType, isEnglish)}`,
                        price: teamBasePrice,
                        spots: 10,
                    }))
                    : [{
                        id: `${teamId}-no-schedule`,
                        teamId: teamId || null,
                        time: "—",
                        days: "—",
                        court: `${team.name_ar || (i18n.language === 'ar' ? (team.team_name_ar || team.name_en) : (team.name_en || team.team_name_ar)) || team.team_name_en || (isEnglish ? "Team" : "فريق")} • ${audienceLabel(audienceType, isEnglish)}`,
                        price: teamBasePrice,
                        spots: 10,
                    }];

                const existing = groupedBySport.get(String(sportId));
                if (existing) {
                    existing.slots.push(...slotsFromTeam);
                    existing.defaultPrice = pickPositiveAmount(existing.defaultPrice, teamBasePrice);
                } else {
                    groupedBySport.set(String(sportId), {
                        sportId,
                        nameAr: sportNameAr,
                        nameEn: sportNameEn,
                        image: sportImage,
                        slots: slotsFromTeam,
                        defaultPrice: teamBasePrice,
                    });
                }
            });

            const mapped: ExploreSport[] = Array.from(groupedBySport.values()).map((sportFromApi) => {
                const slots = sportFromApi.slots;
                const sportPrice = sportFromApi.defaultPrice;

                const joinedSlot = slots.find((slot) => {
                    if (!slot.teamId) return false;
                    const subscription = subscriptionMap[slot.teamId];
                    if (!subscription) return false;
                    const status = subscription.status.toLowerCase();
                    return !isPendingPaymentSubscription(subscription) && status !== "declined" && status !== "cancelled";
                });

                const pendingPaymentSlot = slots.find((slot) => {
                    if (!slot.teamId) return false;
                    const subscription = subscriptionMap[slot.teamId];
                    return isPendingPaymentSubscription(subscription);
                });

                const pendingSubscription = pendingPaymentSlot?.teamId
                    ? subscriptionMap[pendingPaymentSlot.teamId]
                    : undefined;
                const joinedSubscription = joinedSlot?.teamId ? subscriptionMap[joinedSlot.teamId] : undefined;

                return {
                    id: sportFromApi.sportId,
                    memberId: subjectId,
                    name: isEnglish
                        ? (sportFromApi.nameEn || sportFromApi.nameAr || "Unnamed Sport")
                        : (sportFromApi.nameAr || sportFromApi.nameEn || "رياضة غير مسمى"),
                    nameEn: sportFromApi.nameEn || "",
                    icon: getIconForSport(sportFromApi.nameAr || sportFromApi.nameEn || ""),
                    img:
                        getFullUrl(sportFromApi.image) ||
                        FALLBACK_IMAGES[sportFromApi.nameAr || ""] ||
                        FALLBACK_IMAGES[sportFromApi.nameEn || ""] ||
                        DEFAULT_IMAGE,
                    slots,
                    defaultPrice: sportPrice,
                    joined: !!joinedSlot,
                    joinedSlotId: joinedSlot?.id,
                    joinedStatus: joinedSubscription?.subscriptionStatus || joinedSubscription?.status,
                    pendingPayment:
                        pendingSubscription?.subscriptionId
                            ? {
                                subscriptionId: pendingSubscription.subscriptionId,
                                paymentReference: pendingSubscription.paymentReference || "",
                                amount: pickPositiveAmount(
                                    pendingSubscription.price,
                                    pendingPaymentSlot?.price,
                                    sportPrice
                                ),
                                currency: "EGP",
                                slotId: pendingPaymentSlot?.id,
                            }
                            : undefined,
                };
            });

            setSports(mapped);
            if (mapped.length > 0) {
                setSelectedSportId(mapped[0].id);
            }
        } catch (error) {
            console.error("Failed to load sports from backend:", error);
            toast({ title: tm("subscribePage.errorTitle"), description: tm("subscribePage.loadError"), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [isPendingPaymentSubscription, isEnglish, t, toast, isTeamMemberMode, subjectId]);

    useEffect(() => {
        loadSports();
    }, [loadSports]);

    const selectedSport = sports.find(s => s.id === selectedSportId);
    
    useEffect(() => {
        if (selectedSport) {
            setSelectedSlotId(selectedSport.joinedSlotId ?? selectedSport.pendingPayment?.slotId ?? null);
        }
    }, [selectedSport]);

    const joinedSportsCount = useMemo(
        () => sports.filter((sport) => sport.joined || !!sport.pendingPayment).length,
        [sports]
    );

    const handleJoin = async () => {
        if (!selectedSport) return;
        
        const joined = selectedSport.joined;
        if (joined) return;

        const pendingPayment = selectedSport.pendingPayment ?? null;
        const hasPendingPayment = !!pendingPayment;

        const selectedSlot = selectedSport.slots.find((s) => s.id === selectedSlotId) ?? null;
        const pendingSlot = pendingPayment?.slotId
            ? selectedSport.slots.find((s) => s.id === pendingPayment.slotId) ?? null
            : null;
        const actionSlot = selectedSlot ?? pendingSlot;

        if (hasPendingPayment) {
            if (!actionSlot) return;
                    const isChangingSlot = selectedSlot && selectedSlot.id !== pendingPayment.slotId;
                    if (isChangingSlot && selectedSlot && selectedSlot.teamId) {
                        setJoining(true);
                        try {
                            try {
                                await api.patch(cancelEndpoint(pendingPayment.subscriptionId));
                            } catch {}
                            const response = await api.post(subscribeEndpoint, {
                                team_id: selectedSlot.teamId,
                                ...(isTeamMemberMode
                                    ? { team_member_id: selectedSport.memberId }
                                    : { member_id: selectedSport.memberId }),
                            });
                    const payload = response?.data || {};
                    const subscriptionData = payload.data || {};
                    const paymentData = payload.payment || {};
                    const nextPayment = {
                        subscriptionId: Number(subscriptionData.id || subscriptionData.subscription_id),
                        paymentReference: String(paymentData.reference || subscriptionData.payment_reference || ""),
                        amount: pickPositiveAmount(paymentData.amount, subscriptionData.price, selectedSlot.price),
                        currency: String(paymentData.currency || "EGP"),
                        slotId: selectedSlot.id,
                    };
                    if (!nextPayment.subscriptionId) {
                        return;
                    }
                        goToPaymentPage({
                            sportName: selectedSport.name,
                            slot: selectedSlot,
                            subscriptionId: nextPayment.subscriptionId,
                        paymentReference: nextPayment.paymentReference,
                        amount: nextPayment.amount,
                        currency: nextPayment.currency,
                    });
                } finally {
                    setJoining(false);
                }
            } else {
                goToPaymentPage({
                    sportName: selectedSport.name,
                    slot: actionSlot,
                    subscriptionId: pendingPayment.subscriptionId,
                    paymentReference: pendingPayment.paymentReference || "",
                    amount: pickPositiveAmount(pendingPayment.amount, actionSlot.price),
                    currency: pendingPayment.currency,
                });
            }
            return;
        }

        if (!selectedSlot || !selectedSlot.teamId) return;

        if (joinedSportsCount >= MAX_SPORTS) {
            toast({
                title: tm("subscribePage.warningTitle"),
                description: tm("subscribePage.maxSports", { max: MAX_SPORTS }),
                variant: "default",
            });
            return;
        }

        setJoining(true);
        try {
            const response = await api.post(subscribeEndpoint, {
                team_id: selectedSlot.teamId,
                ...(isTeamMemberMode
                    ? { team_member_id: selectedSport.memberId }
                    : { member_id: selectedSport.memberId }),
            });

            const payload = response?.data || {};
            const subscriptionData = payload.data || {};
            const paymentData = payload.payment || {};
            const nextPayment = {
                subscriptionId: Number(subscriptionData.id || subscriptionData.subscription_id),
                paymentReference: String(paymentData.reference || subscriptionData.payment_reference || ""),
                amount: pickPositiveAmount(paymentData.amount, subscriptionData.price, selectedSlot.price),
                currency: String(paymentData.currency || "EGP"),
                slotId: selectedSlot.id,
            };

            if (!nextPayment.subscriptionId) {
                throw new Error("Subscription ID is missing. Cannot open payment page.");
            }

            goToPaymentPage({
                sportName: selectedSport.name,
                slot: selectedSlot,
                subscriptionId: nextPayment.subscriptionId,
                paymentReference: nextPayment.paymentReference,
                amount: nextPayment.amount,
                currency: nextPayment.currency,
            });
        } catch (error) {
            console.error("Failed to join sport:", error);
            
            // Check for duplicate subscription error (usually 409 or specific error message)
            const axiosError = error as { response?: { data?: { message?: string; code?: string }; status?: number } };
            const errorMessage = axiosError?.response?.data?.message || "";
            const errorCode = axiosError?.response?.data?.code || "";
            if (errorCode === "MAX_SPORTS_LIMIT_REACHED" || errorMessage.includes("only 4 sports")) {
                toast({ title: tm("subscribePage.warningTitle"), description: tm("subscribePage.maxSports", { max: MAX_SPORTS }), variant: "default" });
                loadSports();
            } else if (errorMessage.includes("already subscribed") || axiosError?.response?.status === 409) {
                toast({ title: tm("subscribePage.warningTitle"), description: tm("subscribePage.alreadyJoined"), variant: "default" });
                loadSports(); // Reload to get actual joined status
            } else {
                toast({ title: tm("subscribePage.errorTitle"), description: tm("subscribePage.joinError"), variant: "destructive" });
            }
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 h-[calc(100vh-120px)]">
                <div className="w-12 h-12 border-4 border-ds-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-ds-text-secondary font-bold">{tm("subscribePage.loadingSports")}</p>
            </div>
        );
    }

    const actionSlot = selectedSport?.slots.find((s) => s.id === selectedSlotId) ?? null;
    const joinedStatus = String(selectedSport?.joinedStatus || "").toLowerCase();
    const isPendingReview = joinedStatus === "pending" || joinedStatus === "pending_admin_approval";

    return (
        <div className="animate-fade-up min-h-[calc(100vh-140px)] lg:h-[calc(100vh-140px)] flex flex-col mt-4 px-4 sm:pl-6 sm:pr-2 mb-6" dir={isEnglish ? "ltr" : "rtl"}>
            <div className="mb-5 flex-shrink-0 flex items-center gap-2">
                <span className="text-ds-primary text-[32px]">🏅</span>
                <h1 className="text-[24px] font-black text-ds-primary tracking-tight">{tm("subscribePage.title")}</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
                {/* Right side: Sports List */}
                <div className="w-full lg:w-[380px] h-[320px] lg:h-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col flex-shrink-0">
                    <div className="p-5 border-b border-gray-100 bg-gradient-to-l from-gray-50/80 to-transparent rounded-t-2xl">
                        <h2 className="text-[17px] font-extrabold text-ds-primary">{tm("subscribePage.availableSports")}</h2>
                        <p className="text-[12px] text-ds-text-secondary mt-1">{tm("subscribePage.availableSportsHint")}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar bg-white rounded-b-2xl">
                        {sports.map(sport => {
                            const isSelected = sport.id === selectedSportId;
                            
                            return (
                                <div 
                                    key={sport.id}
                                    onClick={() => setSelectedSportId(sport.id)}
                                    className={`relative overflow-hidden flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 ${
                                        isSelected 
                                        ? "bg-ds-primary shadow-md transform scale-[0.98] mr-2" 
                                        : "bg-transparent hover:bg-gray-50 border border-transparent hover:border-gray-100"
                                    }`}
                                >
                                    {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-ds-primary to-ds-primary-dark opacity-100 z-0"></div>}
                                    
                                    <div className="flex items-center gap-3 w-full relative z-10">
                                        <img
                                            src={sport.img || DEFAULT_IMAGE}
                                            alt={sport.name}
                                            className="w-11 h-11 rounded-lg object-cover border border-white/30 shadow-sm shrink-0"
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE; }}
                                        />
                                        <div className="text-right flex-1">
                                            <h3 className={`font-bold text-[14px] transition-colors ${isSelected ? "text-white" : "text-ds-text-primary"}`}>{sport.name}</h3>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {sports.length === 0 && (
                            <div className="p-8 text-center text-ds-text-muted text-sm italic">
                                {tm("subscribePage.noSports")}
                            </div>
                        )}
                    </div>
                </div>

                {/* Left side: Sport Details Widget */}
                <div className="flex-1 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col min-h-0 relative overflow-hidden">
                    {selectedSport ? (
                        <>
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-ds-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            
                            <div className="p-7 border-b border-gray-100 bg-white/50 backdrop-blur-sm rounded-t-2xl flex justify-between items-start relative z-10">
                                <div className="text-right">
                                    <h2 className="text-[26px] font-black text-ds-primary tracking-tight">{selectedSport.name}</h2>
                                    <p className="text-[14px] text-ds-text-secondary mt-1">{tm("subscribePage.sportSubtitle", { sport: selectedSport.name })}</p>
                                </div>
                                <img
                                    src={selectedSport.img || DEFAULT_IMAGE}
                                    alt={selectedSport.name}
                                    className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE; }}
                                />
                            </div>
                            
                            <div className="px-7 py-5">
                                <h3 className="text-[17px] font-bold text-ds-text-primary mb-1">{tm("subscribePage.stepChooseTeam")}</h3>
                                <p className="text-[13px] text-ds-text-secondary">{tm("subscribePage.stepChooseTeamHint")}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto px-7 pb-6 space-y-3 custom-scrollbar relative z-10">
                                {selectedSport.slots.length > 0 ? (
                                    selectedSport.slots.map(slot => {
                                        const isSel = selectedSlotId === slot.id;
                                        const isFull = slot.spots === 0;
                                        const isJoinedSlot = selectedSport.joinedSlotId === slot.id && selectedSport.joined;
                                        
                                        return (
                                            <div
                                                key={slot.id}
                                                onClick={() => !isFull && !selectedSport.joined && setSelectedSlotId(slot.id)}
                                                className={`p-4 border-[1.5px] rounded-xl transition-all duration-200 group ${
                                                    isSel
                                                        ? "border-ds-primary bg-[#F0F7FF] shadow-[0_4px_12px_rgb(0,0,0,0.05)] transform scale-[1.01]"
                                                        : isJoinedSlot
                                                            ? "border-ds-success bg-ds-success/5"
                                                            : "border-gray-100 bg-white hover:border-ds-primary/30 hover:shadow-sm"
                                                } ${
                                                    isFull && !isJoinedSlot
                                                        ? "opacity-55 cursor-default group-hover:transform-none"
                                                        : selectedSport.joined
                                                            ? "cursor-default group-hover:transform-none"
                                                            : "cursor-pointer"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {!selectedSport.joined && (
                                                            <div className={`w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors ${isSel ? "border-ds-primary bg-ds-primary" : "border-gray-300 group-hover:border-ds-primary/50"}`}>
                                                                {isSel && <div className="w-[8px] h-[8px] rounded-full bg-white" />}
                                                            </div>
                                                        )}
                                                        {isJoinedSlot && <span className="text-[18px]">✅</span>}
                                                        <span className={`font-extrabold text-[15px] transition-colors ${isSel ? "text-ds-primary" : isJoinedSlot ? "text-ds-success" : "text-gray-700"}`}>
                                                            ⏰ {slot.time}
                                                        </span>
                                                    </div>
                                                    <div className={`rounded-xl px-3.5 py-1.5 text-[13px] font-black transition-colors ${isSel ? "bg-ds-primary text-white" : isJoinedSlot ? "bg-ds-success text-white" : "bg-gray-50 text-gray-700 border border-gray-100"}`}>
                                                        <span className="text-[14px]">{slot.price.toLocaleString(locale)}</span> {tm("subscribePage.currency")}
                                                    </div>
                                                </div>
                                                <div className={`flex gap-5 text-[13px] text-gray-500 ${selectedSport.joined ? "" : "pr-9"}`}>
                                                    <span className="flex items-center gap-1.5"><span className="text-[15px] grayscale opacity-70">📍</span> {slot.court}</span>
                                                    <span className="flex items-center gap-1.5"><span className="text-[15px] grayscale opacity-70">📅</span> {slot.days}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-12 px-6 flex flex-col items-center justify-center text-center text-ds-text-muted text-sm italic border-[1.5px] border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                        <span className="text-3xl mb-3 opacity-30 grayscale">🏀</span>
                                        <p>{tm("subscribePage.noTeams")}</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white rounded-b-2xl shadow-[0_-4px_20px_rgb(0,0,0,0.02)] relative z-10">
                                <div className="w-[190px]">
                                    <Btn
                                        onClick={handleJoin}
                                        disabled={
                                            selectedSport.joined ||
                                            joining ||
                                            (
                                                !selectedSport.pendingPayment &&
                                                !selectedSport.joined &&
                                                joinedSportsCount >= MAX_SPORTS
                                            ) ||
                                            (!selectedSport.pendingPayment && (!selectedSlotId || actionSlot?.spots === 0))
                                        }
                                        variant={selectedSport.joined ? "ghost" : selectedSport.pendingPayment ? "primary" : "primary"}
                                        fullWidth
                                        className="py-3.5 text-[14px] rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        {joining
                                            ? tm("subscribePage.joining")
                                            : selectedSport.pendingPayment
                                                ? tm("subscribePage.pay")
                                                : selectedSport.joined && isPendingReview
                                                    ? tm("subscribePage.pendingReview")
                                                    : selectedSport.joined
                                                        ? tm("subscribePage.joined")
                                                        : tm("subscribePage.submit")}
                                    </Btn>
                                </div>
                                
                                <div className="flex flex-col items-end">
                                    <span className="text-[12px] text-ds-text-secondary mb-1 font-medium">{tm("subscribePage.subscriptionFee")}</span>
                                    {actionSlot ? (
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[13px] text-gray-400 font-bold">{tm("subscribePage.currency")}</span>
                                            <span className="text-[28px] font-black text-ds-primary tracking-tight">
                                                {actionSlot.price.toLocaleString(locale)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[28px] font-black text-gray-300">
                                            -
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-ds-text-muted p-8">
                            <span className="text-5xl mb-5 opacity-40 grayscale">🏆</span>
                            <p className="font-medium text-[15px]">{tm("subscribePage.pickSport")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

