import { useCallback, useEffect, useState, useMemo } from "react";
import {
    AlertCircle,
    Calendar,
    Clock,
    CreditCard,
    Dumbbell,
    Filter,
    Plus,
    Trophy,
} from "lucide-react";
import { Button } from '@/components/StaffPagesComponents/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/StaffPagesComponents/ui/popover';
import api from '@/services/axios';
import { useAuth } from '@/context/AuthContext';
import { AuthService } from '@/services/authService';
import type { EnrolledSport } from '@/features/member-portal/types';
import { Card, Badge, StatChip, ProgressBar } from '@/features/member-portal/components/DashboardComponents';
import { useTranslation } from "react-i18next";
import i18n from '@/i18n';
import {
    buildMonthEvents,
    getEffectiveEndDate,
    STATUS_COLORS,
    getMonthName,
    getDayNameShort,
    localizeDays
} from '@/features/member-portal/calendarUtils';
import { resolveSportImageForSport } from '@/lib/sportImageUrl';

/* â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
interface SportSubscription extends EnrolledSport {
    startDate: string;
    endDate: string;
    price: number;
    schedule?: string;
}

/* â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const MAX_SPORTS = 4;
const LS_KEY = (memberId: number | string) => `member_pending_sports_${memberId}`;

/* â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const statusColor = (s: EnrolledSport["status"]) =>
    s === "Ù†Ø´Ø·" ? "#16A34A" : s === "Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±" ? "#3B82F6" : s === "Ù‚Ø§Ø¯Ù…" ? "#F59E0B" : "#8FA3BB";

const getSportIconFromName = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("Ù‚Ø¯Ù…") || n.includes("ÙƒØ±Ø© Ø§Ù„Ù‚Ø¯Ù…") || n.includes("foot")) return "âš½";
    if (n.includes("Ø³Ù„Ø©") || n.includes("ÙƒØ±Ø© Ø§Ù„Ø³Ù„Ø©") || n.includes("basket")) return "ðŸ€";
    if (n.includes("ØªÙ†Ø³") || n.includes("tennis")) return "ðŸŽ¾";
    if (n.includes("Ø³Ø¨Ø§Ø­") || n.includes("Ø§Ù„Ø³Ø¨Ø§Ø­Ø©") || n.includes("swim")) return "ðŸŠ";
    if (n.includes("Ø·Ø§Ø¦Ø±") || n.includes("Ø§Ù„ÙƒØ±Ø© Ø§Ù„Ø·Ø§Ø¦Ø±Ø©") || n.includes("volley")) return "ðŸ";
    if (n.includes("Ø¬Ù…Ø¨Ø§Ø²") || n.includes("gym")) return "ðŸ¤¸";
    return "ðŸ…";
};

function SportIcon({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
    const n = (name ?? "").toLowerCase();
    const cls = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    if (n.includes("Ø³Ø¨Ø§Ø­") || n.includes("swim")) return <span>ðŸŠ</span>;
    if (n.includes("ÙƒØ±Ø©") || n.includes("ball") || n.includes("Ù‚Ø¯Ù…")) return <span>âš½</span>;
    if (n.includes("ØªÙ†Ø³") || n.includes("tennis")) return <span>ðŸŽ¾</span>;
    if (n.includes("Ù…Ù„Ø§ÙƒÙ…") || n.includes("ÙƒØ§Ø±Ø§ØªÙ‡") || n.includes("box")) return <span>ðŸ¥Š</span>;
    if (n.includes("Ù„ÙŠØ§Ù‚") || n.includes("gym") || n.includes("fitness")) return <Dumbbell className={cls} />;
    if (n.includes("Ø¬Ù…Ø¨Ø§Ø²") || n.includes("gymn")) return <span>ðŸ¤¸</span>;
    return <Trophy className={cls} />;
}

function savePendingToStorage(userId: number | string | undefined | null, list: SportSubscription[]) {
    if (!userId) return;
    try { localStorage.setItem(`${LS_KEY}_${userId}`, JSON.stringify(list)); }
    catch { /* storage full / unavailable */ }
}

const TrainingCard: React.FC<{ sport: SportSubscription; delay: number }> = ({ sport, delay }) => {
    const { t, i18n } = useTranslation("team");
    const isRtl = i18n.resolvedLanguage?.startsWith('ar') || i18n.language.startsWith('ar');
    const displayName = isRtl
        ? (sport.nameAr || sport.nameEn || sport.name)
        : (sport.nameEn || sport.nameAr || sport.name);
    const sessionDays = localizeDays(sport.nextDay || "-", isRtl);
    const locale = isRtl ? "ar-EG" : "en-US";
    const pct = sport.total > 0 ? Math.round((sport.attended / sport.total) * 100) : 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Determine the actual end date for calculation (earliest of endOfMonth, 1-month limit, or sport.endDate)
    const rawStart = sport.startDate || (sport as any).start_date;
    const rawEnd = sport.endDate || (sport as any).end_date;
    const subEndDate = getEffectiveEndDate(rawStart, rawEnd);

    let calcEndDate = subEndDate && subEndDate < endOfMonth ? subEndDate : new Date(endOfMonth);

    let remainingDynamic = 0;
    if (Array.isArray(sport.weekdays) && sport.weekdays.length > 0) {
        for (let d = new Date(today); d <= calcEndDate; d.setDate(d.getDate() + 1)) {
            if (sport.weekdays.includes(d.getDay())) remainingDynamic++;
        }
    } else {
        remainingDynamic = Math.max(0, Math.floor((calcEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    }
    return (
        <Card
            className="mb-2.5 animate-fade-up border-none shadow-sm hover:shadow-md transition-all duration-300"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Header */}
            <div className="flex flex-col gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div
                        className="w-[50px] h-[50px] rounded-lg flex items-center justify-center text-[26px] overflow-hidden relative shrink-0"
                        style={{ background: (sport.color || "#1E6FB9") + "15" }}
                    >
                        {sport.img ? (
                            <img src={sport.img} alt={displayName} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <SportIcon name={displayName} />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-[16px] mb-1 leading-tight break-words">{displayName}</div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge label={t(`sports.status.${sport.status === "Ù†Ø´Ø·" ? "active" : sport.status === "Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±" ? "pending" : "upcoming"}`)} color={statusColor(sport.status)} />
                            {(sport.startDate || (sport as any).start_date) && (
                                <span className="text-[10px] text-ds-text-muted font-bold break-words">
                                    {(sport.startDate || (sport as any).start_date).split('T')[0]} - {subEndDate?.toISOString().split('T')[0]}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next session pill */}
                <div
                    className="w-full rounded-xl px-3 py-2 border-[1.5px] border-dashed"
                    style={{
                        background: (sport.color || "#1E6FB9") + "0D",
                        borderColor: (sport.color || "#1E6FB9") + "55"
                    }}
                >
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="text-[10px] text-ds-text-muted">{t("my_sports.next_session")}</span>
                        <span
                            className="font-bold text-[12px] leading-5 break-words whitespace-normal"
                            style={{ color: sport.color || "#1E6FB9" }}
                        >
                            {sessionDays}
                        </span>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
                            <span className="font-semibold break-words">{sport.nextTime || "-"}</span>
                            <span className="text-ds-border">Â·</span>
                            <span className="font-semibold break-words">{sport.court || "-"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-1.5 mb-2.5">
                <StatChip icon="✓" label={t("training_card.attended")} val={sport.attended} color="#16A34A" />
                <StatChip icon="✕" label={t("training_card.absent")} val={sport.absent} color="#DC2626" />
                <StatChip icon="…" label={t("training_card.remaining")} val={remainingDynamic} color="#1F6FD5" />
            </div>

            {/* Progress */}
            <div>
                <div className="flex justify-between mb-2 text-[13px]">
                    <span className="text-ds-text-secondary">{t("training_card.attendance_rate")}</span>
                    <span className="font-extrabold" style={{ color: sport.color || "#1E6FB9" }}>{pct}%</span>
                </div>
                <ProgressBar value={sport.attended} max={sport.total || 1} color={sport.color || "#1E6FB9"} />
                <div className="text-[11px] text-ds-text-muted mt-1.5">
                    {t("training_card.sessions_completed", { attended: sport.attended, total: sport.total })}
                </div>
            </div>
        </Card>
    );
};

/* â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function MemberSportsPage() {
    /* Separate state slices as required */
    const { t, i18n } = useTranslation("team");
    const isRtl = i18n.resolvedLanguage?.startsWith('ar') || i18n.language.startsWith('ar');
    const locale = isRtl ? "ar-EG" : "en-US";
    const [approvedSports, setApprovedSports] = useState<SportSubscription[]>([]);
    const [pendingSports, setPendingSports] = useState<SportSubscription[]>([]);
    const [serverBookings, setServerBookings] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedKey, setSelectedKey] = useState<string | null>(() =>
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    );
    const [filterSport, setFilterSport] = useState<string | number | null>(null);
    const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
    const { user } = useAuth();

    // â”€â”€ Confirmed Bookings combined (Server + LocalStorage) â”€â”€
    const combinedBookings = useMemo(() => {
        try {
            const userId = user?.member_id || user?.team_member_id;
            const local = userId ? JSON.parse(localStorage.getItem(`confirmed_bookings_${userId}`) || "[]") : [];

            // Deduplicate: server bookings take precedence
            const serverMapped = serverBookings.map(b => ({
                id: b.id,
                date: (b.start_time || b.date || "").split('T')[0],
                time: (b.start_time || "").split('T')[1]?.slice(0, 5) || b.time_from || "",
                court: isRtl
                    ? ((i18n.language === 'ar' ? (b.field?.name_ar || b.field?.name_en) : (b.field?.name_en || b.field?.name_ar)) || b.facility_name || "ملعب")
                    : (b.field?.name_en || b.field?.name_ar || b.facility_name || "Court"),
                isServer: true
            }));

            const combined = [...serverMapped];
            local.forEach((lb: any) => {
                if (!combined.some(sb => String(sb.id) === String(lb.id))) {
                    combined.push(lb);
                }
            });
            return combined;
        } catch { return []; }
    }, [user, serverBookings, isRtl]);

    /* Merged list for display â€” approved first, then pending */
    const allSubscriptions: SportSubscription[] = useMemo(() => [
        ...approvedSports,
        ...pendingSports.filter(
            (p) => !approvedSports.some(
                (a) => a.id === p.id || a.nameAr === p.nameAr
            )
        ),
    ], [approvedSports, pendingSports]);

    /* Filtered by status checkboxes */
    const filteredSubscriptions = useMemo(() =>
        filterStatuses.length === 0
            ? allSubscriptions
            : allSubscriptions.filter(s => filterStatuses.includes(s.status)),
        [allSubscriptions, filterStatuses]
    );

    const totalSlotsFilled = allSubscriptions.length;

    // â”€â”€ Month events (cached for grid) â”€â”€
    const events = useMemo(() => buildMonthEvents(viewYear, viewMonth, allSubscriptions, combinedBookings), [viewYear, viewMonth, allSubscriptions, combinedBookings]);
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
        setSelectedKey(null);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
        setSelectedKey(null);
    };

    const selectedEvents = selectedKey
        ? (events.get(selectedKey) ?? []).filter(e => filterSport === null || e.sportId === filterSport)
        : [];

    const monthlySummary = {
        attended: Array.from(events.values()).flat().filter(e => e.status === "attended" || e.status === "Ø­Ø¶ÙˆØ±").length,
        absent: Array.from(events.values()).flat().filter(e => e.status === "absent" || e.status === "ØºÙŠØ§Ø¨").length,
        upcoming: Array.from(events.values()).flat().filter(e => e.status === "upcoming" || e.status === "Ù‚Ø§Ø¯Ù…").length,
    };

    // Ø¯ÙŠÙ†Ø§Ù…ÙŠÙƒÙŠ: Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ Ù„ÙƒÙ„ Ø±ÙŠØ§Ø¶Ø© Ø­ØªÙ‰ Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø´Ù‡Ø± Ø§Ù„Ø­Ø§Ù„ÙŠ
    const totalRemainingDynamic = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        let sum = 0;
        for (const s of allSubscriptions) {
            const rawStart = s.startDate || (s as any).start_date;
            const rawEnd = s.endDate || (s as any).end_date;
            const subEndDate = getEffectiveEndDate(rawStart, rawEnd);

            let calcEndDate = subEndDate && subEndDate < endOfMonth ? subEndDate : new Date(endOfMonth);

            if (Array.isArray(s.weekdays) && s.weekdays.length > 0) {
                for (let d = new Date(today); d <= calcEndDate; d.setDate(d.getDate() + 1)) {
                    if (s.weekdays.includes(d.getDay())) sum++;
                }
            } else {
                sum += Math.max(0, Math.floor((calcEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
            }
        }
        return sum;
    }, [allSubscriptions]);

    /* â”€â”€â”€ On mount: load approved from API + pending from localStorage â”€â”€ */
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const meRes = await api.get("/auth/me");
            const meData = meRes.data?.data?.user ?? meRes.data?.user ?? meRes.data;
            const memberId: number = meData.member_id || meData.team_member_id;

            if (!memberId) {
                setLoading(false);
                return;
            }

            // Gate "My Sports" by real member-subscriptions state to avoid showing unpaid drafts.
            let allowedSportIds = new Set<string>();
            let allowedSportNames = new Set<string>();
            try {
                const subRes = await api.get(`/member-subscriptions/${memberId}/subscriptions`);
                const rawSubs =
                    (Array.isArray(subRes.data?.data?.subscriptions) && subRes.data.data.subscriptions) ||
                    (Array.isArray(subRes.data?.data) && subRes.data.data) ||
                    (Array.isArray(subRes.data?.subscriptions) && subRes.data.subscriptions) ||
                    [];

                rawSubs.forEach((sub: any) => {
                    const status = String(sub?.status || "").toLowerCase();
                    const subscriptionStatus = String(sub?.subscription_status || sub?.subscriptionStatus || "").toLowerCase();
                    const hasConfirmedPayment = Boolean(sub?.payment_completed_at || sub?.paymentCompletedAt);
                    const isCancelledLike =
                        status === "cancelled" ||
                        status === "declined" ||
                        subscriptionStatus === "cancelled" ||
                        subscriptionStatus === "declined";
                    const isPendingPayment =
                        status === "pending_payment" ||
                        subscriptionStatus === "pending_payment" ||
                        status === "awaiting_payment" ||
                        subscriptionStatus === "awaiting_payment";

                    const isAllowed = !isCancelledLike && !isPendingPayment && (
                        hasConfirmedPayment ||
                        status === "active" ||
                        status === "approved" ||
                        subscriptionStatus === "active" ||
                        subscriptionStatus === "approved" ||
                        subscriptionStatus === "pending_admin_approval"
                    );

                    if (!isAllowed) return;

                    const sportId = sub?.team?.sport_id ?? sub?.sport_id ?? sub?.sport?.id;
                    if (sportId != null) allowedSportIds.add(String(sportId));

                    const sportNameAr = sub?.team?.sport?.name_ar ?? sub?.sport?.name_ar ?? sub?.sport_name_ar;
                    const sportNameEn = sub?.team?.sport?.name_en ?? sub?.sport?.name_en ?? sub?.sport_name_en;
                    if (sportNameAr) allowedSportNames.add(String(sportNameAr).trim());
                    if (sportNameEn) allowedSportNames.add(String(sportNameEn).trim());
                });
            } catch {
                // If this endpoint fails, keep existing behavior instead of blocking page.
                allowedSportIds = new Set<string>();
                allowedSportNames = new Set<string>();
            }

            // 1. Fetch Attendance and Joined Sports Stats
            const statsRes = await AuthService.getMemberAttendanceStats(memberId);
            let approvedList: SportSubscription[] = [];

            if (statsRes.success && statsRes.data) {
                const { sports: backendSports } = statsRes.data;

                const dayMap: Record<string, number> = {
                    "Sunday": 0, "Ø§Ù„Ø§Ø­Ø¯": 0, "Ø§Ù„Ø£Ø­Ø¯": 0,
                    "Monday": 1, "Ø§Ù„Ø§Ø«Ù†ÙŠÙ†": 1, "Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†": 1,
                    "Tuesday": 2, "Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡": 2,
                    "Wednesday": 3, "Ø§Ù„Ø§Ø±Ø¨Ø¹Ø§Ø¡": 3, "Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡": 3,
                    "Thursday": 4, "Ø§Ù„Ø®Ù…ÙŠØ³": 4,
                    "Friday": 5, "Ø§Ù„Ø¬Ù…Ø¹Ø©": 5,
                    "Saturday": 6, "Ø§Ù„Ø³Ø¨Øª": 6
                };

                approvedList = backendSports.reduce((acc: SportSubscription[], s: any, idx: number) => {
                    const rawStatus = String(s.status || "").toLowerCase();
                    const rawSubscriptionStatus = String(s.subscription_status || s.subscriptionStatus || "").toLowerCase();
                    const hasConfirmedPayment = Boolean(
                        s.payment_completed_at ||
                        s.paymentCompletedAt ||
                        s.confirmed_payment_at ||
                        s.confirmedPaymentAt
                    );
                    const isPendingPayment =
                        rawStatus === "pending_payment" ||
                        rawSubscriptionStatus === "pending_payment" ||
                        rawStatus === "awaiting_payment" ||
                        rawSubscriptionStatus === "awaiting_payment" ||
                        (!hasConfirmedPayment && (rawStatus === "pending_payment" || rawSubscriptionStatus === "pending_payment"));

                    // Do not show unpaid subscriptions in "My Sports" (e.g. user pressed Back on payment page).
                    if (isPendingPayment) return acc;

                    const sportIdRaw = s.sport_id ?? s.id;
                    const sportNameAr = s.sport_name_ar || s.name_ar || s.sport_name || s.name || "رياضة";
                    const sportNameEn = s.sport_name_en || s.name_en || s.sport_name || s.name || "";
                    const matchesAllowedSubscription =
                        allowedSportIds.size === 0
                            ? true
                            : allowedSportIds.has(String(sportIdRaw)) ||
                              allowedSportNames.has(String(sportNameAr).trim()) ||
                              (sportNameEn ? allowedSportNames.has(String(sportNameEn).trim()) : false);

                    if (!matchesAllowedSubscription) return acc;

                    const firstSched = s.schedules?.[0];
                    const weekdaysSet = new Set<number>();
                    (s.schedules || []).forEach((sched: any) => {
                        const dArs = (sched.days_ar || "").split(/[ØŒ,]/).map((d: string) => d.trim());
                        const dEns = (sched.days_en || "").split(/[ØŒ,]/).map((d: string) => d.trim());
                        dArs.forEach((d: string) => { if (dayMap[d] !== undefined) weekdaysSet.add(dayMap[d]); });
                        dEns.forEach((d: string) => { if (dayMap[d] !== undefined) weekdaysSet.add(dayMap[d]); });
                    });

                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    const remainingThisMonth = Math.max(0, endOfMonth.getDate() - today.getDate());

                    const displaySportName = isRtl
                        ? (sportNameAr || sportNameEn || "رياضة")
                        : (sportNameEn || sportNameAr || "Sport");

                    acc.push({
                        id: String(s.id || idx + 1),
                        sportId: String(sportIdRaw || idx + 1),
                        name: displaySportName,
                        nameAr: sportNameAr,
                        nameEn: sportNameEn,
                        icon: getSportIconFromName(displaySportName),
                        img: resolveSportImageForSport(s.sport_image || s.sportImage || null, s.sport_name_en || s.nameEn || null) || null,
                        status:
                            s.status === "approved" ||
                            s.status === "active" ||
                            rawSubscriptionStatus === "approved" ||
                            rawSubscriptionStatus === "active"
                            ? "Ù†Ø´Ø·"
                            : ((s.status === "pending" || rawSubscriptionStatus === "pending" || !s.status) && hasConfirmedPayment)
                                ? "Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±"
                                : "Ù‚Ø§Ø¯Ù…",
                        nextDay: isRtl
                            ? (firstSched?.days_ar || firstSched?.days_en || "قريباً")
                            : (firstSched?.days_en || firstSched?.days_ar || "Soon"),
                        nextTime: firstSched ? `${firstSched.start_time} - ${firstSched.end_time}` : "-",
                        court: isRtl
                            ? ((i18n.language === 'ar' ? (firstSched?.field?.name_ar || firstSched?.field?.name_en) : (firstSched?.field?.name_en || firstSched?.field?.name_ar)) || "ملعب النادي")
                            : (firstSched?.field?.name_en || firstSched?.field?.name_ar || "Club Court"),
                        attended: s.stats.attended,
                        absent: s.stats.absent,
                        remaining: remainingThisMonth,
                        total: s.stats.total || 0,
                        color: ["#16A34A", "#1F6FD5", "#F59E0B", "#DC2626"][idx % 4],
                        weekdays: Array.from(weekdaysSet),
                        records: s.stats.records || [],
                        startDate: s.start_date || s.subscriptionDate || s.created_at || "",
                        endDate: s.end_date || s.endDate || "",
                        price: s.price || 0,
                        createdAt: s.created_at
                    } as SportSubscription);

                    return acc;
                }, []);
            }

            setApprovedSports(approvedList);

            // 2. Fetch Court Bookings from Server
            try {
                const bRes = await api.get(`/members/${memberId}/bookings`);
                const bList = Array.isArray(bRes.data?.data) ? bRes.data.data : (Array.isArray(bRes.data) ? bRes.data : []);
                setServerBookings(bList);
            } catch {
                setServerBookings([]);
            }

            // Clear legacy browser-side pending cache so cancelled payment drafts
            // cannot reappear here after the server has removed them.
            savePendingToStorage(memberId, []);
            setPendingSports([]);
        } catch {
            setError("ÙØ´Ù„ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø±ÙŠØ§Ø¶Ø§Øª. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.");
        } finally {
            setLoading(false);
        }
    }, [isRtl]);

    useEffect(() => { void loadData(); }, [loadData]);

    /* â”€â”€â”€ 5. UI Render â”€â”€â”€ */
    return (
        <div className="flex flex-col gap-6 animate-fade-up px-1 sm:px-0" dir={isRtl ? "rtl" : "ltr"}>
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className={`flex flex-col gap-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-[#2EA7C9]" />
                        <h1 className="text-[26px] sm:text-[32px] font-black text-[#214474] tracking-tight">{t("my_sports.title")}</h1>
                    </div>
                    <p className="text-muted-foreground font-medium opacity-80 flex items-center gap-2">
                        {t("my_sports.limit", { count: totalSlotsFilled, max: MAX_SPORTS })}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Status filter popover */}
                    <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                        <PopoverTrigger asChild>
                            <button className={`flex items-center gap-1.5 h-10 px-3 rounded-xl border text-sm font-bold transition-colors
                                ${filterStatuses.length > 0
                                    ? "border-[#2EA7C9] bg-[#2EA7C9]/10 text-[#2EA7C9]"
                                    : "border-border bg-white text-muted-foreground hover:bg-muted"}`}>
                                <Filter className="w-4 h-4" />
                                {t("my_sports.status_filter")}
                                {filterStatuses.length > 0 && (
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2EA7C9] text-white text-[9px] font-bold">
                                        {filterStatuses.length}
                                    </span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align={isRtl ? "end" : "start"} className="w-52 p-0" dir={isRtl ? "rtl" : "ltr"}>
                            <div className="py-1">
                                {([
                                    { key: "Ù†Ø´Ø·", label: t("sports.status.active"), color: "text-emerald-700" },
                                    { key: "Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±", label: t("sports.status.pending"), color: "text-blue-700" },
                                    { key: "Ù‚Ø§Ø¯Ù…", label: t("sports.status.upcoming"), color: "text-amber-700" },
                                ]).map(({ key, label, color }) => {
                                    const checked = filterStatuses.includes(key);
                                    const count = allSubscriptions.filter(s => s.status === key).length;
                                    return (
                                        <label key={key} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {
                                                    setFilterStatuses(prev =>
                                                        prev.includes(key)
                                                            ? prev.filter(s => s !== key)
                                                            : [...prev, key]
                                                    );
                                                }}
                                                className="w-3.5 h-3.5 rounded accent-[#2EA7C9] cursor-pointer"
                                            />
                                            <span className={`text-xs font-medium ${color}`}>{label}</span>
                                            <span className={`${isRtl ? 'mr-auto' : 'ml-auto'} text-[10px] text-muted-foreground`}>{count}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {filterStatuses.length > 0 && (
                                <div className={`flex justify-end px-3 py-2 border-t border-border ${isRtl ? '' : 'justify-start'}`}>
                                    <button
                                        onClick={() => { setFilterStatuses([]); setStatusPopoverOpen(false); }}
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {t("my_sports.clear")}
                                    </button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>

                    <Button
                        onClick={() => (window.location.href = "/member/dashboard/subscribe")}
                        className="bg-[#2EA7C9] hover:bg-[#2589a5] text-white rounded-xl px-5 sm:px-6 h-11 sm:h-12 font-bold flex items-center gap-2 shadow-lg shadow-[#2EA7C9]/20 transition-all hover:scale-[1.02]"
                    >
                        <Plus className="h-5 w-5" />
                        {t("my_sports.subscribe")}
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 border-4 border-[#2EA7C9] border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-bold">{t("my_sports.loading")}</p>
                </div>
            ) : error ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-border flex flex-col items-center gap-4">
                    <AlertCircle className="w-12 h-12 text-red-500 opacity-80" />
                    <h3 className="text-xl font-bold text-[#214474]">{isRtl ? "حدث خطأ أثناء التحميل" : "Error loading data"}</h3>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={loadData} variant="outline" className="mt-2 rounded-xl border-[#2EA7C9] text-[#2EA7C9] hover:bg-[#2EA7C9]/5">
                        {isRtl ? "إعادة المحاولة" : "Retry"}
                    </Button>
                </div>
            ) : allSubscriptions.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-border flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-[#2EA7C9]/10 rounded-full flex items-center justify-center">
                        <Dumbbell className="w-10 h-10 text-[#2EA7C9]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#214474]">{t("my_sports.empty")}</h3>
                    <p className="text-muted-foreground max-w-md">
                        {isRtl ? "لم تقم بالاشتراك في أي رياضة بعد. ابدأ الآن واستكشف الرياضات المتاحة في النادي!" : "You haven't joined any sports yet. Start now and explore the available sports in the club!"}
                    </p>
                    <Button
                        onClick={() => (window.location.href = "/member/dashboard/subscribe")}
                        className="bg-[#2EA7C9] hover:bg-[#2589a5] text-white rounded-xl px-8 h-12 font-bold mt-2"
                    >
                        {isRtl ? "استكشاف الرياضات" : "Explore Sports"}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(380px,520px)] gap-6 items-start">
                    {/* Training Cards Column */}
                    <div>
                        <div className={`font-bold text-[15px] text-ds-text-secondary mb-3 flex items-center gap-2 ${isRtl ? '' : 'flex-row-reverse'}`}>
                            <span>🏋️</span> {t("dashboard.my_sports_section")}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredSubscriptions.map((s, i) => (
                                <TrainingCard key={s.id} sport={s} delay={i * 70} />
                            ))}
                        </div>
                    </div>

                    {/* Calendar + Sidebar Column */}
                    <div className="flex flex-col gap-4 2xl:sticky 2xl:top-20">
                        {/* Monthly Summary Chips */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                                { label: t("training_card.attended"), val: monthlySummary.attended, color: "#16A34A", bg: "#F0FDF4" },
                                { label: t("training_card.absent"), val: monthlySummary.absent, color: "#DC2626", bg: "#FEF2F2" },
                                { label: t("training_card.remaining"), val: totalRemainingDynamic, color: "#1F6FD5", bg: "#EBF3FF" },
                            ].map(({ label, val, color, bg }) => (
                                <div key={label} className="flex-1 text-center rounded-xl p-3 border border-ds-border" style={{ background: bg, borderColor: color + "25" }}>
                                    <div className="text-xl font-black" style={{ color }}>{val}</div>
                                    <div className="text-[11px] text-ds-text-muted font-bold">{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Calendar Card */}
                        <Card className="p-4 border-none shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={prevMonth} className="w-9 h-9 rounded-xl border border-ds-border bg-ds-border/10 cursor-pointer text-lg flex items-center justify-center hover:bg-ds-border/20 transition-colors">{"<"}</button>
                                <div className="text-center">
                                    <span className="font-black text-lg text-ds-text-primary">{getMonthName(viewMonth, t)} {viewYear}</span>
                                </div>
                                <button onClick={nextMonth} className="w-9 h-9 rounded-xl border border-ds-border bg-ds-border/10 cursor-pointer text-lg flex items-center justify-center hover:bg-ds-border/20 transition-colors">{">"}</button>
                            </div>

                            {/* Sport Filter Pills */}
                            <div className="flex gap-1.5 mb-4 flex-wrap">
                                <button
                                    onClick={() => setFilterSport(null)}
                                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all border ${filterSport === null ? 'bg-ds-primary text-white border-ds-primary' : 'bg-white text-ds-text-secondary border-ds-border hover:bg-ds-border/10'}`}
                                >
                                    {t("dashboard.calendar.filter_all")}
                                </button>
                                {allSubscriptions.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setFilterSport(filterSport === s.id ? null : s.id)}
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all border`}
                                        style={{
                                            background: filterSport === s.id ? s.color + "15" : "white",
                                            color: filterSport === s.id ? s.color : "#4A5568",
                                            borderColor: filterSport === s.id ? s.color : "#DDE5F0"
                                        }}
                                    >
                                        {s.icon} {isRtl ? (s.nameAr || s.nameEn || s.name) : (s.nameEn || s.nameAr || s.name)}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-px mb-1">
                                {[0, 1, 2, 3, 4, 5, 6].map(d => (
                                    <div key={d} className="text-center text-[11px] font-black text-ds-text-muted py-2">
                                        {getDayNameShort(d, t)}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-px bg-ds-border/20 rounded-lg overflow-hidden border border-ds-border/20">
                                {Array.from({ length: totalCells }, (_, i) => {
                                    const dayNum = i - firstDay + 1;
                                    if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} className="min-h-[80px] bg-ds-border/5" />;
                                    const dKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                                    const dayEvts = (events.get(dKey) ?? []).filter(e => filterSport === null || e.sportId === filterSport);
                                    const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && dayNum === today.getDate();
                                    const isSel = selectedKey === dKey;
                                    const hasEvts = dayEvts.length > 0;
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => hasEvts && setSelectedKey(isSel ? null : dKey)}
                                            className={`min-h-[80px] p-1.5 border-r border-b border-ds-border/10 transition-all cursor-pointer bg-white hover:bg-ds-primary/5 ${isSel ? 'bg-ds-primary-light border-ds-primary z-10' : isToday ? 'bg-ds-teal-light border-ds-teal/70' : ''} ${!hasEvts && 'cursor-default'}`}
                                        >
                                            <div className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center mb-1 ${isToday ? 'bg-ds-teal text-white' : isSel ? 'text-ds-primary' : 'text-ds-text-primary'}`}>{dayNum}</div>
                                            <div className="flex flex-col gap-1">
                                                {dayEvts.slice(0, 2).map((ev, ei) => (
                                                    <div
                                                        key={ei}
                                                        className="rounded-[4px] p-[2px_4px] text-[9px] font-bold border-r-2 truncate"
                                                        style={{ background: ev.color + "18", borderRightColor: ev.color, color: ev.color }}
                                                    >
                                                        {ev.name}
                                                    </div>
                                                ))}
                                                {dayEvts.length > 2 && <div className="text-[8px] text-ds-text-muted font-bold mr-1">+{dayEvts.length - 2} {isRtl ? "المزيد" : "more"}</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Selected Day Detail Card */}
                        <Card className="p-4 border-none shadow-sm min-h-[150px]">
                            {selectedKey ? (
                                <>
                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                        <span className="font-extrabold text-sm text-ds-text-primary">
                                            📅 {new Date(selectedKey + "T12:00:00").toLocaleDateString(isRtl ? "ar-EG" : "en-US", { weekday: "long", day: "numeric", month: "long" })}
                                        </span>
                                    </div>
                                    {selectedEvents.length === 0 ? (
                                        <div className="text-center text-ds-text-muted py-8 text-xs italic">{t("dashboard.calendar.no_sessions")}</div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {selectedEvents.map((ev, i) => {
                                                const sc = STATUS_COLORS[ev.status as keyof typeof STATUS_COLORS] || { bg: '#f3f4f6', text: '#4b5563' };
                                                return (
                                                    <div key={i} className="rounded-2xl p-4 border-r-4 transition-all shadow-sm" style={{ background: ev.color + "0C", borderColor: ev.color + "20", borderRightColor: ev.color }}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">{ev.icon}</span>
                                                                <span className="font-black text-[15px]" style={{ color: ev.color }}>{ev.name}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.text }}>{ev.status}</span>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div className="flex items-center gap-1.5 text-ds-text-secondary">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span className="text-[11px] font-bold">{ev.time}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-ds-text-secondary">
                                                                <CreditCard className="w-3.5 h-3.5" />
                                                                <span className="text-[11px] font-bold">{ev.court}</span>
                                                            </div>
                                                            {ev.price ? (
                                                                <div className="flex items-center gap-1.5 text-ds-orange">
                                                                    <span className="text-[11px] font-black">💰 {ev.price.toLocaleString(locale)} {t("sports.currency")}</span>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-10 flex flex-col items-center gap-2 opacity-40">
                                    <Calendar className="w-12 h-12 text-ds-text-muted" />
                                    <div className="font-bold text-sm text-ds-text-secondary">{t("dashboard.calendar.select_day")}</div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}


