import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Search, X, Loader2, RefreshCw } from "lucide-react";
import { computePaymentStatus, getDaysUntilRenewal } from "../data/paymentsData";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Button } from "../components/StaffPagesComponents/ui/button";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "../components/StaffPagesComponents/ui/select";
import DateRangeFilter from "../components/StaffPagesComponents/shared/DateRangeFilter";
import type { DateRange } from "../components/StaffPagesComponents/shared/DateRangeFilter";
import api from "../services/axios";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import i18n from "../i18n";

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
    team?: { id: number; name_ar?: string; name_en?: string };
    status: string;           // pending | approved | active | declined | cancelled
    monthly_fee: number | string;
    registration_fee?: number | string | null;
    payment_status?: string;
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
    team?: { id: number; name_ar?: string; name_en?: string };
    status: string;
    monthly_fee: number | string;
    registration_fee?: number | string | null;
    payment_status?: string;
    start_date?: string | null;
    end_date?: string | null;
    created_at: string;
    approved_at?: string | null;
}

interface SubscriptionStats {
    members?: { pending?: number; approved?: number; active?: number; declined?: number; cancelled?: number };
    teamMembers?: { pending?: number; approved?: number; active?: number; declined?: number; cancelled?: number };
}

// ─── Unified display row ──────────────────────────────────────────────────────

interface SubRow {
    id: string;
    memberType: "member" | "team_member";
    memberCode: string;
    memberName: string;
    teamName: string;
    status: string;
    paymentStatus: string;
    monthlyFee: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    approvedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (v?: string | null) => {
    if (!v) return "—";
    try {
        return new Date(v).toLocaleDateString("ar-EG", {
            day: "numeric", month: "long", year: "numeric",
        });
    } catch { return v; }
};

// Map API status to display-layer payment-alert status (for sorting/coloring)
const toAlertStatus = (endDate?: string | null, status?: string): "active" | "expiring" | "overdue" => {
    if (!endDate || status === "cancelled" || status === "declined") return "active";
    return computePaymentStatus(endDate);
};

const statusLabelMap: Record<string, { label: string; cls: string }> = {
    pending: { label: "في الانتظار", cls: "border-amber-200 bg-amber-50 text-amber-700" },
    approved: { label: "موافق عليه", cls: "border-blue-200 bg-blue-50 text-blue-700" },
    active: { label: "نشط", cls: "border-emerald-200 bg-emerald-100 text-emerald-700" },
    declined: { label: "مرفوض", cls: "border-red-200 bg-red-100 text-red-700" },
    cancelled: { label: "ملغى", cls: "border-gray-200 bg-gray-100 text-gray-600" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
    // ── State ─────────────────────────────────────────────────────────────────
    const [rows, setRows] = useState<SubRow[]>([]);
    const [stats, setStats] = useState<SubscriptionStats>({});
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<"all" | "member" | "team_member">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

    // ── Fetch ─────────────────────────────────────────────────────────────────

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
                memberName: s.member
                    ? `${s.member.first_name_ar ?? ""} ${s.member.last_name_ar ?? ""}`.trim()
                    : `عضو #${s.member_id}`,
                teamName: (i18n.language === 'ar' ? (s.team?.name_ar || s.team?.name_en) : (s.team?.name_en || s.team?.name_ar)) || `فريق #${s.team_id}`,
                status: s.status,
                paymentStatus: s.payment_status ?? "unpaid",
                monthlyFee: Number(s.monthly_fee) || 0,
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
                memberName: s.team_member
                    ? `${s.team_member.first_name_ar ?? ""} ${s.team_member.last_name_ar ?? ""}`.trim()
                    : `لاعب #${s.team_member_id}`,
                teamName: (i18n.language === 'ar' ? (s.team?.name_ar || s.team?.name_en) : (s.team?.name_en || s.team?.name_ar)) || `فريق #${s.team_id}`,
                status: s.status,
                paymentStatus: s.payment_status ?? "unpaid",
                monthlyFee: Number(s.monthly_fee) || 0,
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

    useEffect(() => { void fetchAll(); }, [fetchAll]);

    // ── Computed Stats ────────────────────────────────────────────────────────

    const computedStats = useMemo(() => {
        const m = stats.members ?? {};
        const t = stats.teamMembers ?? {};
        return {
            total: (m.pending ?? 0) + (m.approved ?? 0) + (m.active ?? 0) +
                (t.pending ?? 0) + (t.approved ?? 0) + (t.active ?? 0),
            pending: (m.pending ?? 0) + (t.pending ?? 0),
            approved: (m.approved ?? 0) + (t.approved ?? 0),
            active: (m.active ?? 0) + (t.active ?? 0),
        };
    }, [stats]);

    // ── Filter & Sort ─────────────────────────────────────────────────────────

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
                const match = r.memberCode.toLowerCase().includes(q) ||
                    r.memberName.includes(q) || r.teamName.includes(q);
                if (!match) return false;
            }
            if (dateRange.from && r.endDate && r.endDate < dateRange.from) return false;
            if (dateRange.to && r.endDate && r.endDate > dateRange.to) return false;
            return true;
        }).sort((a, b) => {
            const order: Record<string, number> = { pending: 0, approved: 1, active: 2, declined: 3, cancelled: 4 };
            return (order[a.status] ?? 5) - (order[b.status] ?? 5);
        });
    }, [rows, statusFilter, typeFilter, searchQuery, dateRange]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="h-full flex flex-col overflow-hidden" dir="rtl">

            {/* ── Page Header ── */}
            <div className="px-6 py-4 border-b border-border bg-background shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        الاشتراكات والدفع
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        متابعة حالة الاشتراكات وطلبات العضوية في الفرق
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void fetchAll()} disabled={loading} className="gap-1 shrink-0">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    تحديث
                </Button>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 shrink-0">
                {[
                    { label: "إجمالي الطلبات", value: computedStats.total, color: "text-foreground", bg: "bg-muted/30" },
                    { label: "في الانتظار", value: computedStats.pending, color: "text-amber-700", bg: "bg-amber-50" },
                    { label: "موافق عليها", value: computedStats.approved, color: "text-blue-700", bg: "bg-blue-50" },
                    { label: "نشطة", value: computedStats.active, color: "text-emerald-700", bg: "bg-emerald-50" },
                ].map((card) => (
                    <div key={card.label} className={`rounded-xl border border-border p-4 ${card.bg}`}>
                        <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                        <p className={`text-2xl font-bold ${card.color}`}>
                            {loading ? <span className="opacity-40">—</span> : card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Filters Bar ── */}
            <div className="px-6 pb-4 shrink-0 flex flex-wrap items-end gap-3">

                {/* Status filter */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">الحالة</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-40 text-xs">
                            <SelectValue placeholder="كل الحالات" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">كل الحالات</SelectItem>
                            <SelectItem value="pending">في الانتظار</SelectItem>
                            <SelectItem value="approved">موافق عليه</SelectItem>
                            <SelectItem value="active">نشط</SelectItem>
                            <SelectItem value="declined">مرفوض</SelectItem>
                            <SelectItem value="cancelled">ملغى</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Type filter */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">النوع</span>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                        <SelectTrigger className="h-9 w-44 text-xs">
                            <SelectValue placeholder="كل الأعضاء" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">كل الأعضاء</SelectItem>
                            <SelectItem value="member">عضو اجتماعي</SelectItem>
                            <SelectItem value="team_member">لاعب فريق</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date range filter on end_date */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">تاريخ الانتهاء</span>
                    <DateRangeFilter
                        value={dateRange}
                        onChange={setDateRange}
                        placeholder="فلترة بتاريخ الانتهاء"
                    />
                </div>

                {/* Search */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">بحث</span>
                    <div className="relative">
                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="اسم / كود / فريق..."
                            className="h-9 pr-8 text-xs w-48"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {hasFilter && (
                    <Button variant="ghost" size="sm" className="text-xs h-9 self-end" onClick={clearFilters}>
                        مسح الفلاتر ×
                    </Button>
                )}

                <span className="text-xs text-muted-foreground self-end pb-1 mr-auto">
                    {filtered.length} نتيجة
                </span>
            </div>

            {/* ── Table ── */}
            <div className="flex-1 overflow-auto px-6 pb-6">
                <div className="rounded-xl border border-border overflow-hidden">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
                            <TableRow>
                                <TableHead className="px-4 py-3 text-right font-semibold text-xs text-muted-foreground w-10">#</TableHead>
                                <TableHead className="px-4 py-3 text-right font-semibold text-xs text-muted-foreground">الكود</TableHead>
                                <TableHead className="px-4 py-3 text-right font-semibold text-xs text-muted-foreground">الاسم</TableHead>
                                <TableHead className="px-4 py-3 text-right font-semibold text-xs text-muted-foreground">النوع</TableHead>
                                <TableHead className="px-4 py-3 text-right font-semibold text-xs text-muted-foreground">الفريق</TableHead>
                                <TableHead className="px-4 py-3 text-right font-semibold text-xs text-muted-foreground">الرسوم الشهرية</TableHead>
                                <TableHead className="px-4 py-3 text-right font-semibold text-xs text-muted-foreground">تاريخ البداية</TableHead>
                                <TableHead className="px-4 py-3 text-right font-semibold text-xs text-muted-foreground">تاريخ الانتهاء</TableHead>
                                <TableHead className="px-4 py-3 text-center font-semibold text-xs text-muted-foreground">الحالة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-border">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-16">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="text-sm">جاري التحميل…</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-16 text-sm text-muted-foreground">
                                        {rows.length === 0
                                            ? "لا توجد اشتراكات معلقة في الوقت الحالي"
                                            : "لا توجد اشتراكات تطابق الفلاتر المحددة"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((r, idx) => {
                                    const alertStatus = toAlertStatus(r.endDate, r.status);
                                    const days = r.endDate ? getDaysUntilRenewal(r.endDate) : null;
                                    const { label: statusLabel, cls: statusCls } =
                                        statusLabelMap[r.status] ?? { label: r.status, cls: "border-gray-200 bg-gray-100 text-gray-600" };

                                    return (
                                        <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="px-4 py-3 text-xs text-muted-foreground">{idx + 1}</TableCell>

                                            {/* Code */}
                                            <TableCell className="px-4 py-3">
                                                <span className="font-mono text-xs font-semibold">{r.memberCode}</span>
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell className="px-4 py-3 text-sm">{r.memberName || "—"}</TableCell>

                                            {/* Type badge */}
                                            <TableCell className="px-4 py-3">
                                                {r.memberType === "team_member" ? (
                                                    <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                                                        لاعب فريق
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                                                        عضو اجتماعي
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Team */}
                                            <TableCell className="px-4 py-3 text-sm text-muted-foreground">{r.teamName}</TableCell>

                                            {/* Monthly fee */}
                                            <TableCell className="px-4 py-3 text-sm font-semibold tabular-nums" dir="ltr">
                                                {r.monthlyFee > 0 ? `${r.monthlyFee.toLocaleString("ar-EG")} ج.م` : "—"}
                                            </TableCell>

                                            {/* Start date */}
                                            <TableCell className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                {fmtDate(r.startDate)}
                                            </TableCell>

                                            {/* End date with alert */}
                                            <TableCell className="px-4 py-3">
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
                                                                {alertStatus === "overdue"
                                                                    ? `متأخر ${Math.abs(days)} يوم`
                                                                    : `فاضل ${days} يوم`}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </TableCell>

                                            {/* Status badge */}
                                            <TableCell className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${statusCls}`}>
                                                    {statusLabel}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
