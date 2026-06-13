import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Search, X, Loader2, RefreshCw } from "lucide-react";
import { computePaymentStatus, getDaysUntilRenewal } from '@/data/paymentsData';
import { Input } from '@/components/StaffPagesComponents/ui/input';
import { Button } from '@/components/StaffPagesComponents/ui/button';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/StaffPagesComponents/ui/select';
import DateRangeFilter from '@/components/StaffPagesComponents/shared/DateRangeFilter';
import type { DateRange } from '@/components/StaffPagesComponents/shared/DateRangeFilter';
import api from '@/services/axios';
import { useLanguage } from '@/hooks/useLanguage';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';
import { adminTableStyles, adminHeadClass, adminCellClass } from '@/components/StaffPagesComponents/shared/adminTableStyles';
import { PersonNameDisplay } from '@/components/StaffPagesComponents/shared/PersonNameDisplay';
import { BilingualText } from '@/components/StaffPagesComponents/shared/BilingualText';
import { getLocalizedText } from '@/lib/localizedDisplay';
import { useAdminFormatters, getAdminLocale } from '@/components/StaffPagesComponents/shared/adminFormatters';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/StaffPagesComponents/ui/table';
import { useTableExport } from '@/utils/reportExport/useTableExport';
import { AdminReportToolbar } from '@/components/StaffPagesComponents/shared/AdminReportToolbar';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Link as LinkIcon, CreditCard as CreditCardIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/StaffPagesComponents/ui/dropdown-menu';
import { AdminPaymobModal } from '@/components/StaffPagesComponents/shared/AdminPaymobModal';

// ─── Types from API ───────────────────────────────────────────────────────────

interface ApiMemberSub {
    id: number;
    member_id: number;
    member?: {
        id: number;
        first_name_ar?: string;
        last_name_ar?: string;
        national_id?: string;
    };
    team_id: number;
    team?: { id: number; name_ar?: string; name_en?: string; price?: number | string | null; subscription_price?: number | string | null };
    status: string;
    price: number | string;       // actual column on member_teams
    monthly_fee?: number | string; // alias if backend remaps it
    registration_fee?: number | string | null;
    payment_status?: string;
    payment_reference?: string;
    start_date?: string | null;
    end_date?: string | null;
    created_at: string;
    approved_at?: string | null;
}

interface ApiTeamMemberSub {
    id: number;
    team_member_id: number;
    team_member?: {
        id: number;
        first_name_ar?: string;
        last_name_ar?: string;
        national_id?: string;
    };
    team_id: number;
    team?: { id: number; name_ar?: string; name_en?: string; price?: number | string | null; subscription_price?: number | string | null };
    status: string;
    price: number | string;       // actual column on team_member_teams
    monthly_fee?: number | string; // alias if backend remaps it
    registration_fee?: number | string | null;
    payment_status?: string;
    payment_reference?: string;
    start_date?: string | null;
    end_date?: string | null;
    created_at: string;
    approved_at?: string | null;
}

interface SubscriptionStats {
    members?: { pending?: number; approved?: number; active?: number; declined?: number; cancelled?: number };
    teamMembers?: { pending?: number; approved?: number; active?: number; declined?: number; cancelled?: number };
}

interface SubRow {
    id: string;
    memberType: "member" | "team_member";
    memberCode: string;
    memberId: number;
    memberNameAr: string;
    memberNameEn: string;
    teamNameAr: string;
    teamNameEn: string;
    status: string;
    paymentStatus: string;
    paymentReference?: string;
    monthlyFee: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    approvedAt: string;
}

const statusClsMap: Record<string, string> = {
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    approved: "border-blue-200 bg-blue-50 text-blue-700",
    active: "border-emerald-200 bg-emerald-100 text-emerald-700",
    declined: "border-red-200 bg-red-100 text-red-700",
    cancelled: "border-gray-200 bg-gray-100 text-gray-600",
};

const toAlertStatus = (endDate?: string | null, status?: string): "active" | "expiring" | "overdue" => {
    if (!endDate || status === "cancelled" || status === "declined") return "active";
    return computePaymentStatus(endDate);
};

export default function SubscriptionsPage() {
    const { language, isRTL } = useLanguage();
    const { t } = useLocalizedTranslation("finance");
    const { t: tCommon } = useLocalizedTranslation("common");

    const { fmtDate } = useAdminFormatters();
    const dateLocale = getAdminLocale(language);
    const { toast } = useToast();

    const statusLabel = useCallback(
        (status: string) => t(`subscriptions.status.${status}`, { defaultValue: status }),
        [t],
    );

    const [rows, setRows] = useState<SubRow[]>([]);
    const [stats, setStats] = useState<SubscriptionStats>({});
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<"all" | "member" | "team_member">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

    const [paymobModalOpen, setPaymobModalOpen] = useState(false);
    const [selectedRowForPaymob, setSelectedRowForPaymob] = useState<SubRow | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [memRes, tmRes, statsRes] = await Promise.allSettled([
                api.get<{ success: boolean; data: ApiMemberSub[] }>("/subscriptions/members/pending/all"),
                api.get<{ success: boolean; data: ApiTeamMemberSub[] }>("/subscriptions/team-members/pending/all"),
                api.get<{ success: boolean; data: SubscriptionStats }>("/subscriptions/stats/summary"),
            ]);

            const memberSubs: ApiMemberSub[] =
                memRes.status === "fulfilled" && memRes.value?.data?.data
                    ? memRes.value.data.data
                    : [];

            const tmSubs: ApiTeamMemberSub[] =
                tmRes.status === "fulfilled" && tmRes.value?.data?.data
                    ? tmRes.value.data.data
                    : [];

            if (statsRes.status === "fulfilled" && statsRes.value?.data?.data) {
                setStats(statsRes.value.data.data);
            }

            const memberRows: SubRow[] = memberSubs.map((s) => ({
                id: `member-${s.id}`,
                memberType: "member",
                memberCode: s.member?.national_id
                    ? `MEM-${String(s.member.national_id).slice(-4)}`
                    : `MEM-${s.member_id}`,
                memberId: s.member_id,
                memberNameAr: `${s.member?.first_name_ar ?? ""} ${s.member?.last_name_ar ?? ""}`.trim(),
                memberNameEn: "",
                teamNameAr: s.team?.name_ar ?? "",
                teamNameEn: s.team?.name_en ?? "",
                status: s.status,
                paymentStatus: s.payment_status ?? "unpaid",
                paymentReference: s.payment_reference,
                monthlyFee: Number(s.price) || Number(s.monthly_fee) || Number(s.team?.price) || Number(s.team?.subscription_price) || 0,
                startDate: s.start_date ?? "",
                endDate: s.end_date ?? "",
                createdAt: s.created_at,
                approvedAt: s.approved_at ?? "",
            }));

            const tmRows: SubRow[] = tmSubs.map((s) => ({
                id: `team_member-${s.id}`,
                memberType: "team_member",
                memberCode: s.team_member?.national_id
                    ? `TM-${String(s.team_member.national_id).slice(-4)}`
                    : `TM-${s.team_member_id}`,
                memberId: s.team_member_id,
                memberNameAr: `${s.team_member?.first_name_ar ?? ""} ${s.team_member?.last_name_ar ?? ""}`.trim(),
                memberNameEn: "",
                teamNameAr: s.team?.name_ar ?? "",
                teamNameEn: s.team?.name_en ?? "",
                status: s.status,
                paymentStatus: s.payment_status ?? "unpaid",
                paymentReference: s.payment_reference,
                monthlyFee: Number(s.price) || Number(s.monthly_fee) || Number(s.team?.price) || Number(s.team?.subscription_price) || 0,
                startDate: s.start_date ?? "",
                endDate: s.end_date ?? "",
                createdAt: s.created_at,
                approvedAt: s.approved_at ?? "",
            }));

            setRows([...memberRows, ...tmRows]);
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCopyLink = useCallback((row: SubRow) => {
        if (!row.paymentReference) {
            toast({ title: t("subscriptions.errors.error"), description: t("subscriptions.errors.noPaymentReference", { defaultValue: "No payment reference found for this subscription." }), variant: "destructive" });
            return;
        }
        const subscriptionId = row.id.split("-").pop();
        const baseUrl = window.location.origin;
        const url = row.memberType === "member" 
            ? `${baseUrl}/member/payment?subscriptionId=${subscriptionId}&paymentReference=${row.paymentReference}&amount=${row.monthlyFee}&sportName=${encodeURIComponent(row.teamNameEn || row.teamNameAr)}`
            : `${baseUrl}/team-member/payment?subscriptionId=${subscriptionId}&paymentReference=${row.paymentReference}&amount=${row.monthlyFee}&sportName=${encodeURIComponent(row.teamNameEn || row.teamNameAr)}`;
            
        navigator.clipboard.writeText(url).then(() => {
            toast({ title: t("subscriptions.success.success"), description: t("subscriptions.success.linkCopied", { defaultValue: "Payment link copied to clipboard." }) });
        }).catch(() => {
            toast({ title: t("subscriptions.errors.error"), description: t("subscriptions.errors.copyFailed", { defaultValue: "Failed to copy link." }), variant: "destructive" });
        });
    }, [t, toast]);

    const handleOpenPaymob = useCallback((row: SubRow) => {
        if (!row.paymentReference) {
            toast({ title: t("subscriptions.errors.error"), description: t("subscriptions.errors.noPaymentReference", { defaultValue: "No payment reference found for this subscription." }), variant: "destructive" });
            return;
        }
        setSelectedRowForPaymob(row);
        setPaymobModalOpen(true);
    }, [t, toast]);

    const handlePaymobSuccess = useCallback(() => {
        setPaymobModalOpen(false);
        toast({ title: t("subscriptions.success.success"), description: t("subscriptions.success.paymentCompleted", { defaultValue: "Payment completed successfully." }) });
        void fetchAll();
    }, [fetchAll, t, toast]);

    useEffect(() => { void fetchAll(); }, [fetchAll]);

    const computedStats = useMemo(() => {
        const m = stats.members ?? {};
        const tm = stats.teamMembers ?? {};
        return {
            total: (m.pending ?? 0) + (m.approved ?? 0) + (m.active ?? 0) +
                (tm.pending ?? 0) + (tm.approved ?? 0) + (tm.active ?? 0),
            pending: (m.pending ?? 0) + (tm.pending ?? 0),
            approved: (m.approved ?? 0) + (tm.approved ?? 0),
            active: (m.active ?? 0) + (tm.active ?? 0),
        };
    }, [stats]);

    const hasFilter = statusFilter !== "all" || typeFilter !== "all" ||
        searchQuery.trim() !== "" || !!(dateRange.from || dateRange.to);

    const clearFilters = () => {
        setStatusFilter("all"); setTypeFilter("all");
        setSearchQuery(""); setDateRange({ from: undefined, to: undefined });
    };

    const filtered = useMemo(() => {
        return rows.filter((r) => {
            if (statusFilter !== "all" && r.status !== statusFilter) return false;
            if (typeFilter !== "all" && r.memberType !== typeFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                const memberLabel = getLocalizedText(r.memberNameAr, r.memberNameEn, language);
                const teamLabel = getLocalizedText(r.teamNameAr, r.teamNameEn, language);
                const match = r.memberCode.toLowerCase().includes(q) ||
                    memberLabel.includes(searchQuery.trim()) ||
                    memberLabel.toLowerCase().includes(q) ||
                    teamLabel.includes(searchQuery.trim()) ||
                    teamLabel.toLowerCase().includes(q);
                if (!match) return false;
            }
            if (dateRange.from && r.endDate && r.endDate < dateRange.from) return false;
            if (dateRange.to && r.endDate && r.endDate > dateRange.to) return false;
            return true;
        }).sort((a, b) => {
            const getScore = (r: SubRow) => {
                const alert = toAlertStatus(r.endDate, r.status);
                if (alert === "overdue") return 0;
                if (alert === "expiring") return 1;
                
                const statusOrder: Record<string, number> = { pending: 2, approved: 3, active: 4, declined: 5, cancelled: 6 };
                return statusOrder[r.status] ?? 7;
            };

            const scoreA = getScore(a);
            const scoreB = getScore(b);
            
            if (scoreA !== scoreB) return scoreA - scoreB;
            
            // Tie-breaker: newest first
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [rows, statusFilter, typeFilter, searchQuery, dateRange, language]);

    const statCards = useMemo(() => [
        { key: "total", value: computedStats.total, color: "text-foreground", bg: "bg-muted/30" },
        { key: "pending", value: computedStats.pending, color: "text-amber-700", bg: "bg-amber-50" },
        { key: "approved", value: computedStats.approved, color: "text-blue-700", bg: "bg-blue-50" },
        { key: "active", value: computedStats.active, color: "text-emerald-700", bg: "bg-emerald-50" },
    ], [computedStats]);

    const formatCurrency = (amount: number) =>
        amount > 0
            ? `${amount.toLocaleString(dateLocale)} ${t("subscriptions.currency")}`
            : "—";

    const exportHandle = useTableExport({
        reportId: "subscriptions",
        titleEn: "Subscriptions Report",
        titleAr: "تقرير الاشتراكات",
        columns: [
            {
                headerEn: "Code",
                headerAr: "الكود",
                accessor: (r: SubRow) => r.memberCode,
                width: 14,
            },
            {
                headerEn: "Name",
                headerAr: "الاسم",
                accessor: (r: SubRow) => getLocalizedText(r.memberNameAr, r.memberNameEn, language),
                width: 22,
            },
            {
                headerEn: "Type",
                headerAr: "النوع",
                accessor: (r: SubRow) => t(`subscriptions.memberType.${r.memberType}`),
                width: 14,
            },
            {
                headerEn: "Team",
                headerAr: "الفريق",
                accessor: (r: SubRow) => getLocalizedText(r.teamNameAr, r.teamNameEn, language) || "—",
                width: 18,
            },
            {
                headerEn: "Monthly Fee",
                headerAr: "الرسوم الشهرية",
                accessor: (r: SubRow) => formatCurrency(r.monthlyFee),
                width: 14,
            },
            {
                headerEn: "Start Date",
                headerAr: "تاريخ البداية",
                accessor: (r: SubRow) => (r.startDate ? fmtDate(r.startDate) : "—"),
                width: 14,
            },
            {
                headerEn: "End Date",
                headerAr: "تاريخ النهاية",
                accessor: (r: SubRow) => (r.endDate ? fmtDate(r.endDate) : "—"),
                width: 14,
            },
            {
                headerEn: "Status",
                headerAr: "الحالة",
                accessor: (r: SubRow) => statusLabel(r.status),
                width: 12,
            },
        ],
        rows: filtered,
    });

    const renewalHint = (alertStatus: "active" | "expiring" | "overdue", days: number) => {
        const count = Math.abs(days);
        if (alertStatus === "overdue") {
            return t("subscriptions.renewal.overdue_other", { count, defaultValue: `متأخر ${count} يوم` });
        }
        return t("subscriptions.renewal.remaining_other", { count, defaultValue: `متبقي ${count} يوم` });
    };

    return (
        <div className="h-full flex flex-col overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>

            <div className="px-6 py-4 border-b border-border bg-background shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-primary" />
                        {t("subscriptions.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {t("subscriptions.subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <AdminReportToolbar export={exportHandle} rowCount={filtered.length} />
                    <Button variant="outline" size="sm" onClick={() => void fetchAll()} disabled={loading} className="gap-1">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        {t("subscriptions.refresh")}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 shrink-0">
                {statCards.map((card) => (
                    <div key={card.key} className={`rounded-xl border border-border p-4 ${card.bg}`}>
                        <p className="text-xs text-muted-foreground mb-1">{t(`subscriptions.stats.${card.key}`)}</p>
                        <p className={`text-2xl font-bold ${card.color}`}>
                            {loading ? <span className="opacity-40">—</span> : card.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="px-6 pb-4 shrink-0 flex flex-wrap items-end gap-3">

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">{t("subscriptions.filters.status")}</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-40 text-xs">
                            <SelectValue placeholder={t("subscriptions.filters.allStatuses")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("subscriptions.filters.allStatuses")}</SelectItem>
                            <SelectItem value="pending">{statusLabel("pending")}</SelectItem>
                            <SelectItem value="approved">{statusLabel("approved")}</SelectItem>
                            <SelectItem value="active">{statusLabel("active")}</SelectItem>
                            <SelectItem value="declined">{statusLabel("declined")}</SelectItem>
                            <SelectItem value="cancelled">{statusLabel("cancelled")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">{t("subscriptions.filters.type")}</span>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                        <SelectTrigger className="h-9 w-44 text-xs">
                            <SelectValue placeholder={t("subscriptions.filters.allMembers")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("subscriptions.filters.allMembers")}</SelectItem>
                            <SelectItem value="member">{t("subscriptions.memberType.member")}</SelectItem>
                            <SelectItem value="team_member">{t("subscriptions.memberType.team_member")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">{t("subscriptions.filters.endDate")}</span>
                    <DateRangeFilter
                        value={dateRange}
                        onChange={setDateRange}
                        placeholder={t("subscriptions.filters.endDatePlaceholder")}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">{t("subscriptions.filters.search")}</span>
                    <div className="relative">
                        <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground ${isRTL ? "right-2.5" : "left-2.5"}`} />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("subscriptions.filters.searchPlaceholder")}
                            className={`h-9 text-xs w-48 ${isRTL ? "pr-8" : "pl-8"}`}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRTL ? "left-2" : "right-2"}`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {hasFilter && (
                    <Button variant="ghost" size="sm" className="text-xs h-9 self-end" onClick={clearFilters}>
                        {t("subscriptions.filters.clearFilters")}
                    </Button>
                )}

                <span className={`text-xs text-muted-foreground self-end pb-1 ${isRTL ? "mr-auto" : "ml-auto"}`}>
                    {t("subscriptions.filters.results", { count: filtered.length })}
                </span>
            </div>

            <div className={`flex-1 px-6 pb-6 ${adminTableStyles.container}`}>
                <div className="rounded-xl border border-border overflow-hidden">
                    <Table>
                        <TableHeader className={adminTableStyles.header}>
                            <TableRow>
                                <TableHead className={adminHeadClass({ className: "w-10" })}>{t("subscriptions.table.index")}</TableHead>
                                <TableHead className={adminHeadClass()}>{t("subscriptions.table.code")}</TableHead>
                                <TableHead className={adminHeadClass()}>{t("subscriptions.table.name")}</TableHead>
                                <TableHead className={adminHeadClass()}>{t("subscriptions.table.type")}</TableHead>
                                <TableHead className={adminHeadClass()}>{t("subscriptions.table.team")}</TableHead>
                                <TableHead className={adminHeadClass()}>{t("subscriptions.table.monthlyFee")}</TableHead>
                                <TableHead className={adminHeadClass()}>{t("subscriptions.table.startDate")}</TableHead>
                                <TableHead className={adminHeadClass()}>{t("subscriptions.table.endDate")}</TableHead>
                                <TableHead className={adminHeadClass({ center: true })}>{t("subscriptions.table.status")}</TableHead>
                                <TableHead className={adminHeadClass({ center: true })}>{t("subscriptions.table.actions", { defaultValue: "Actions" })}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={adminTableStyles.body}>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-16">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="text-sm">{tCommon("loading")}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-16 text-sm text-muted-foreground">
                                        {rows.length === 0
                                            ? t("subscriptions.empty.none")
                                            : t("subscriptions.empty.noMatch")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((r, idx) => {
                                    const alertStatus = toAlertStatus(r.endDate, r.status);
                                    const days = r.endDate ? getDaysUntilRenewal(r.endDate) : null;
                                    const statusCls = statusClsMap[r.status] ?? "border-gray-200 bg-gray-100 text-gray-600";

                                    return (
                                        <TableRow key={r.id} className={adminTableStyles.row}>
                                            <TableCell className={adminCellClass({ size: "muted" })}>{idx + 1}</TableCell>

                                            <TableCell className={adminCellClass()}>
                                                <span className="font-mono text-xs font-semibold">{r.memberCode}</span>
                                            </TableCell>

                                            <TableCell className={adminCellClass()}>
                                                <PersonNameDisplay
                                                    id={r.memberId}
                                                    names={{
                                                        firstNameAr: r.memberNameAr.split(" ")[0],
                                                        lastNameAr: r.memberNameAr.split(" ").slice(1).join(" "),
                                                        firstNameEn: r.memberNameEn.split(" ")[0],
                                                        lastNameEn: r.memberNameEn.split(" ").slice(1).join(" "),
                                                    }}
                                                    language={language}
                                                    showAvatar={false}
                                                    fallback={r.memberType === "team_member"
                                                        ? t("subscriptions.fallback.teamPlayer", { id: r.memberId })
                                                        : t("subscriptions.fallback.member", { id: r.memberId })}
                                                />
                                            </TableCell>

                                            <TableCell className={adminCellClass()}>
                                                {r.memberType === "team_member" ? (
                                                    <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                                                        {t("subscriptions.memberType.team_member")}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                                                        {t("subscriptions.memberType.member")}
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className={adminCellClass({ size: "muted" })}>
                                                <BilingualText
                                                    ar={r.teamNameAr}
                                                    en={r.teamNameEn}
                                                    language={language}
                                                    fallback={t("subscriptions.fallback.team", { id: r.memberId })}
                                                />
                                            </TableCell>

                                            <TableCell className={adminCellClass({ className: "font-semibold tabular-nums" })} dir="ltr">
                                                {formatCurrency(r.monthlyFee)}
                                            </TableCell>

                                            <TableCell className={adminCellClass({ size: "muted", className: "whitespace-nowrap" })}>
                                                {fmtDate(r.startDate)}
                                            </TableCell>

                                            <TableCell className={adminCellClass()}>
                                                {r.endDate ? (
                                                    <div>
                                                        <p className={`text-sm font-medium whitespace-nowrap ${alertStatus === "overdue" ? "text-rose-600" :
                                                                alertStatus === "expiring" ? "text-amber-600" : ""
                                                            }`}>
                                                            {fmtDate(r.endDate)}
                                                        </p>
                                                        {days !== null && alertStatus !== "active" && (
                                                            <p className={`text-[10px] font-semibold ${alertStatus === "overdue" ? "text-rose-400" : "text-amber-400"
                                                                }`}>
                                                                {renewalHint(alertStatus, days)}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </TableCell>

                                            <TableCell className={adminCellClass({ center: true })}>
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${statusCls}`}>
                                                    {statusLabel(r.status)}
                                                </span>
                                            </TableCell>

                                            <TableCell className={adminCellClass({ center: true })}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {(r.status === "pending" || r.paymentStatus === "unpaid") && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleOpenPaymob(r)} className="cursor-pointer gap-2">
                                                                    <CreditCardIcon className="h-4 w-4" />
                                                                    {t("subscriptions.actions.payViaPaymob", { defaultValue: "Pay via Paymob" })}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleCopyLink(r)} className="cursor-pointer gap-2">
                                                                    <LinkIcon className="h-4 w-4" />
                                                                    {t("subscriptions.actions.copyPaymentLink", { defaultValue: "Copy Payment Link" })}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {selectedRowForPaymob && (
                <AdminPaymobModal
                    isOpen={paymobModalOpen}
                    onClose={() => setPaymobModalOpen(false)}
                    onSuccess={handlePaymobSuccess}
                    paymentReference={selectedRowForPaymob.paymentReference!}
                    amount={selectedRowForPaymob.monthlyFee}
                    description={getLocalizedText(selectedRowForPaymob.teamNameAr, selectedRowForPaymob.teamNameEn, language)}
                />
            )}
        </div>
    );
}
