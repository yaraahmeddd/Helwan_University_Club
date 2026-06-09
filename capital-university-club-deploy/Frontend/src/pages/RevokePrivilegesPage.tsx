import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Search, RefreshCw, Shield, ChevronRight, Loader2,
    Users, ArrowRight, Trash2, RotateCcw, AlertTriangle, Lock, ShieldOff,
    Undo, CheckSquare
} from "lucide-react";
import api from "../services/axios";
import { StaffService } from "../services/staffService";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Badge } from "../components/StaffPagesComponents/ui/badge";
import { useToast } from "../hooks/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import { useLanguage } from "../hooks/useLanguage";
import { adminTableStyles, adminHeadClass, adminCellClass, ADMIN_PAGE_SIZE } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { AdminPagination } from "../components/StaffPagesComponents/shared/AdminPagination";
import { PersonNameDisplay } from "../components/StaffPagesComponents/shared/PersonNameDisplay";
import { getLocalizedText, buildPersonName } from "../lib/localizedDisplay";
import { useStaffJobLabels } from "../lib/staffJobLabel";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffApiItem = {
    id: number;
    first_name_ar?: string;
    last_name_ar?: string;
    first_name_en?: string;
    last_name_en?: string;
    national_id?: string;
    role?: string;
    staff_type?: string | {
        id?: number;
        name_ar?: string;
        name_en?: string;
        code?: string;
    };
    staff_type_id?: number;
    status?: string;
    employment_start_date?: string;
    created_at?: string;
    start_date?: string;
};

type StaffRow = {
    id: number;
    nameAr: string;
    nameEn: string;
    firstNameAr?: string;
    lastNameAr?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    nationalId: string;
    role: string;
    staffTypeId: number;
    staffTypeNameAr?: string;
    staffTypeNameEn?: string;
    staffTypeCode?: string;
    status: string;
    startDate: string;
};

const parseStaffTypeFields = (s: StaffApiItem) => {
    const staffTypeObj = typeof s.staff_type === "object" && s.staff_type ? s.staff_type : null;
    return {
        staffTypeId: Number(s.staff_type_id ?? staffTypeObj?.id ?? 0),
        staffTypeNameAr: staffTypeObj?.name_ar ?? (typeof s.staff_type === "string" ? s.staff_type : undefined),
        staffTypeNameEn: staffTypeObj?.name_en,
        staffTypeCode: staffTypeObj?.code,
    };
};

type GrantedPrivilege = {
    id: number;
    code: string;
    nameAr: string;
    nameEn: string;
    module: string;
    source: "direct" | "package" | "default"; // NEW
    can_revoke: boolean; // NEW
    package_id?: number; // NEW
    package_code?: string; // NEW
    reason?: string; // NEW
    markedForRevocation: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = ADMIN_PAGE_SIZE;

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

const formatDisplayDate = (v: string | null | undefined, locale: string) => {
    if (!v) return "—";
    try {
        return new Date(v).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    } catch { return v; }
};

const parseGrantedPrivileges = (response: unknown): Omit<GrantedPrivilege, "markedForRevocation">[] => {
    const out: Omit<GrantedPrivilege, "markedForRevocation">[] = [];
    if (!isRecord(response)) return out;

    const payload = response.data ?? response;
    const arr: unknown[] = Array.isArray((payload as Record<string, unknown>).privileges)
        ? (payload as Record<string, unknown>).privileges as unknown[]
        : Array.isArray(payload)
            ? payload as unknown[]
            : Array.isArray((payload as Record<string, unknown>).data)
                ? (payload as Record<string, unknown>).data as unknown[]
                : [];

    arr.forEach((item) => {
        if (!isRecord(item)) return;
        const id = Number(item.id);
        const code = String(item.code ?? "").trim();
        if (!Number.isFinite(id) || id <= 0 || !code) return;
        out.push({
            id,
            code,
            nameAr: String(item.name_ar ?? ""),
            nameEn: String(item.name_en ?? ""),
            module: String(item.module ?? "General"),
            source: (item.source as string) ?? "direct", // NEW
            can_revoke: item.can_revoke !== false, // NEW - default to true if not present
            package_id: Number(item.package_id) || undefined, // NEW
            package_code: String(item.package_code ?? "") || undefined, // NEW
            reason: String(item.reason ?? ""), // NEW
        });
    });
    return out;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RevokePrivilegesPage() {
    const { t } = useTranslation("RevokePrivilegesPage");
    const { language, isRTL } = useLanguage();
    const { toast } = useToast();
    const { resolveJobLabel } = useStaffJobLabels(language);
    const dateLocale = language === "en" ? "en-US" : "ar-EG";
    const fmtDate = useCallback(
        (v?: string | null) => formatDisplayDate(v, dateLocale),
        [dateLocale],
    );

    // ── VIEW STATE ──────────────────────────────────────────────────────────────
    const [step, setStep] = useState<"table" | "revoke">("table");
    const [selectedStaff, setSelectedStaff] = useState<StaffRow | null>(null);

    // ── STEP 1: Staff Table ─────────────────────────────────────────────────────
    const [staffRows, setStaffRows] = useState<StaffRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchStaff = useCallback(
        async (page: number, q: string, role: string, from: string, to: string) => {
            setIsLoading(true);
            try {
                const params: Record<string, unknown> = { page, limit: PAGE_SIZE };
                if (role) params.role = role;
                const res = await api.get("/staff", { params });
                const raw = res.data;
                const data: StaffApiItem[] = Array.isArray(raw)
                    ? raw : Array.isArray(raw?.data) ? raw.data : [];
                const total: number = raw?.total ?? raw?.meta?.total ?? raw?.pagination?.total ?? data.length;

                const trim = q.trim().toLowerCase();
                let filtered = trim
                    ? data.filter((s) =>
                        `${s.first_name_ar ?? ""} ${s.last_name_ar ?? ""}`.includes(q.trim()) ||
                        `${s.first_name_en ?? ""} ${s.last_name_en ?? ""}`.toLowerCase().includes(trim) ||
                        (s.national_id ?? "").includes(trim)
                    )
                    : data;

                if (from || to) {
                    const fromMs = from ? new Date(from).setHours(0, 0, 0, 0) : -Infinity;
                    const toMs = to ? new Date(to).setHours(23, 59, 59, 999) : Infinity;
                    filtered = filtered.filter((s) => {
                        const rawDate = s.employment_start_date ?? s.start_date ?? s.created_at;
                        if (!rawDate) return false;
                        const ms = new Date(rawDate).getTime();
                        return ms >= fromMs && ms <= toMs;
                    });
                }

                const rows: StaffRow[] = filtered.map((s) => {
                    const staffType = parseStaffTypeFields(s);
                    return {
                        id: s.id,
                        nameAr: `${s.first_name_ar ?? ""} ${s.last_name_ar ?? ""}`.trim(),
                        nameEn: `${s.first_name_en ?? ""} ${s.last_name_en ?? ""}`.trim(),
                        firstNameAr: s.first_name_ar,
                        lastNameAr: s.last_name_ar,
                        firstNameEn: s.first_name_en,
                        lastNameEn: s.last_name_en,
                        nationalId: s.national_id ?? "",
                        role: String(s.role ?? staffType.staffTypeCode ?? "STAFF").toUpperCase(),
                        ...staffType,
                        status: String(s.status ?? "").toLowerCase(),
                        startDate: s.employment_start_date ?? s.start_date ?? s.created_at ?? "",
                    };
                });

                setStaffRows(rows);
                setTotalCount(trim || from || to ? rows.length : total);
            } catch {
                toast({ title: t("toasts.errorTitle"), description: t("toasts.errorLoad"), variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        },
        [toast, t]
    );

    useEffect(() => { void fetchStaff(currentPage, search, roleFilter, dateFrom, dateTo); }, [currentPage, search, roleFilter, dateFrom, dateTo]);

    const handleSearchChange = (value: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setSearch(value); setCurrentPage(1); }, 300);
    };

    const handleRoleFilter = (role: string) => { setRoleFilter(role); setCurrentPage(1); };
    const clearDateFilter = () => { setDateFrom(""); setDateTo(""); setCurrentPage(1); };
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    // ── STEP 2: Revoke state ────────────────────────────────────────────────────
    const [grantedPrivileges, setGrantedPrivileges] = useState<GrantedPrivilege[]>([]);
    const [loadingPrivileges, setLoadingPrivileges] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState<Array<{ privilege_id: number; error: string; code: string }>>([]);

    const fetchPrivileges = useCallback(async (staffId: number) => {
        setLoadingPrivileges(true);
        setFailedAttempts([]);
        try {
            const res = await StaffService.getPrivileges(staffId);
            const parsed = parseGrantedPrivileges(res);
            setGrantedPrivileges(parsed.map((p) => ({ ...p, markedForRevocation: false })));
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message
                || error?.response?.data?.error
                || error?.message
                || t("toasts.errorLoadPrivileges");

            console.error('Error fetching privileges:', error);

            toast({
                title: t("toasts.errorTitle"),
                description: errorMessage,
                variant: "destructive",
            });
            setGrantedPrivileges([]);
        } finally {
            setLoadingPrivileges(false);
        }
    }, [toast, t]);

    const openRevoke = (staff: StaffRow) => {
        setSelectedStaff(staff);
        setSearchQuery("");
        setStep("revoke");
    };

    useEffect(() => {
        if (step === "revoke" && selectedStaff) {
            void fetchPrivileges(selectedStaff.id);
        }
    }, [step, selectedStaff, fetchPrivileges]);

    // ── Revoke logic ────────────────────────────────────────────────────────────
    const toggleRevoke = (code: string) => {
        setGrantedPrivileges((prev) =>
            prev.map((p) => p.code === code ? { ...p, markedForRevocation: !p.markedForRevocation } : p)
        );
    };

    const markAll = () => setGrantedPrivileges((prev) =>
        prev.map((p) => ({ ...p, markedForRevocation: !p.markedForRevocation }))
    );
    const clearAll = () => setGrantedPrivileges((prev) => prev.map((p) => ({ ...p, markedForRevocation: false })));

    const markedIds = useMemo(
        () => grantedPrivileges.filter((p) => p.markedForRevocation).map((p) => p.id),
        [grantedPrivileges]
    );

    const handleRevoke = async () => {
        if (!selectedStaff || markedIds.length === 0) return;
        setIsSaving(true);
        setFailedAttempts([]);
        try {
            const result = await StaffService.revokePrivileges(selectedStaff.id, markedIds, "Revoked from revoke-privileges page");

            if (result.failed_attempts && result.failed_attempts.length > 0) {
                const failedIds = result.failed_attempts.map((f: any) => f.privilege_id);
                const successIds = markedIds.filter(id => !failedIds.includes(id));
                setFailedAttempts(result.failed_attempts);
                toast({
                    title: t("toasts.partialRevokeTitle"),
                    description: t("toasts.partialRevokeDesc", { success: successIds.length, failed: failedIds.length }),
                    variant: "default"
                });
            } else {
                toast({
                    title: t("toasts.revokeSuccessTitle"),
                    description: t("toasts.revokeSuccessDesc", { count: markedIds.length, name: selectedStaff.nameAr || selectedStaff.nameEn })
                });
            }

            // Re-fetch to reflect changes
            await fetchPrivileges(selectedStaff.id);
        } catch (error: any) {
            toast({ title: t("toasts.revokeErrorTitle"), description: t("toasts.revokeErrorDesc"), variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // ── Grouped + filtered view ─────────────────────────────────────────────────
    const filteredGroups = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const map = new Map<string, GrantedPrivilege[]>();
        grantedPrivileges.forEach((p) => {
            if (q && !(p.nameAr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))) return;
            map.set(p.module, [...(map.get(p.module) ?? []), p]);
        });
        return Array.from(map.entries())
            .map(([module, items]) => ({ module, items: [...items].sort((a, b) => (a.nameAr || a.code).localeCompare(b.nameAr || b.code)) }))
            .sort((a, b) => a.module.localeCompare(b.module));
    }, [grantedPrivileges, searchQuery]);

    // ─── STEP 1 RENDER: Staff Table ────────────────────────────────────────────
    if (step === "table") {
        return (
            <div className="h-[calc(100vh-4rem)] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-background shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <ShieldOff className="w-6 h-6 text-red-500" />
                                {t("table.title")}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {t("table.description")}
                            </p>
                        </div>
                        <button
                            onClick={() => void fetchStaff(currentPage, search, roleFilter, dateFrom, dateTo)}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground disabled:opacity-40"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            {t("table.refresh")}
                        </button>
                    </div>

                    {/* Role filter tabs */}
                    <div className="flex items-center gap-1 mt-3 flex-wrap">
                        {[
                            { value: "", label: t("filters.all") },
                            { value: "ADMIN", label: t("filters.admin") },
                            { value: "SPORTS_DIRECTOR", label: t("filters.sportsDirector") },
                            { value: "SPORTS_OFFICER", label: t("filters.sportsOfficer") },
                            { value: "FINANCIAL_DIRECTOR", label: t("filters.financial") },
                            { value: "REGISTRATION_STAFF", label: t("filters.registration") },
                            { value: "TEAM_MANAGER", label: t("filters.teamManager") },
                            { value: "SUPPORT", label: t("filters.support") },
                            { value: "AUDITOR", label: t("filters.auditor") },
                        ].map((f) => (
                            <button
                                key={f.value}
                                onClick={() => handleRoleFilter(f.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${roleFilter === f.value
                                    ? "bg-rose-500 text-white shadow-sm"
                                    : "text-muted-foreground hover:bg-muted"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20 shrink-0 flex-wrap">
                    <div className="relative w-full sm:w-72">
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                        <Input
                            placeholder={t("table.searchPlaceholder")}
                            defaultValue={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className={`h-10 ${isRTL ? 'pr-9' : 'pl-9'}`}
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("table.dateFrom")}</span>
                        <input
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                            className="h-10 px-3 text-sm border-2 border-border rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-background text-foreground"
                        />
                        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("table.dateTo")}</span>
                        <input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                            className="h-10 px-3 text-sm border-2 border-border rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-background text-foreground"
                        />
                        {(dateFrom || dateTo) && (
                            <button
                                onClick={clearDateFilter}
                                className="h-10 px-3 text-xs font-semibold text-rose-600 border-2 border-rose-200 rounded-xl hover:bg-rose-50 transition-colors whitespace-nowrap"
                            >
                                {t("table.clearDate")}
                            </button>
                        )}
                    </div>

                    <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                        {totalCount} {t("table.staffCount")}
                    </Badge>

                    <div className="flex-1" />
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                <div className={adminTableStyles.container}>
                    {isLoading ? (
                        <div className="py-20 text-center text-muted-foreground">
                            <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-3" />
                            <p className="text-sm">{t("table.loading")}</p>
                        </div>
                    ) : staffRows.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground">
                            <div className="rounded-full bg-muted/30 p-6 mb-4 w-fit mx-auto">
                                <Users className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-1">{t("table.noStaffTitle")}</h3>
                            <p className="text-sm">{search || roleFilter ? t("table.noStaffSearch") : t("table.noStaffDesc")}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className={adminTableStyles.header}>
                                <TableRow>
                                    <TableHead className={adminHeadClass({ className: "w-10" })}>{t("table.headers.number")}</TableHead>
                                    <TableHead className={adminHeadClass()}>{t("table.headers.staff")}</TableHead>
                                    <TableHead className={adminHeadClass()}>{t("table.headers.nationalId")}</TableHead>
                                    <TableHead className={adminHeadClass({ center: true })}>{t("table.headers.job")}</TableHead>
                                    <TableHead className={adminHeadClass()}>{t("table.headers.startDate")}</TableHead>
                                    <TableHead className={adminHeadClass({ center: true })}>{t("table.headers.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className={adminTableStyles.body}>
                                {staffRows.map((staff, idx) => (
                                    <TableRow key={staff.id} className={adminTableStyles.row}>
                                        <TableCell className={adminCellClass({ size: "muted", className: "font-mono" })}>
                                            {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                        </TableCell>
                                        <TableCell className={adminCellClass()}>
                                            <PersonNameDisplay
                                                id={staff.id}
                                                names={{
                                                    firstNameAr: staff.firstNameAr,
                                                    lastNameAr: staff.lastNameAr,
                                                    firstNameEn: staff.firstNameEn,
                                                    lastNameEn: staff.lastNameEn,
                                                }}
                                                language={language}
                                            />
                                        </TableCell>
                                        <TableCell className={adminCellClass({ size: "xs", className: "font-mono" })}>
                                            <span dir="ltr">{staff.nationalId || "—"}</span>
                                        </TableCell>
                                        <TableCell className={adminCellClass({ center: true })}>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
                                                {resolveJobLabel({
                                                    staffTypeId: staff.staffTypeId,
                                                    staffTypeNameAr: staff.staffTypeNameAr,
                                                    staffTypeNameEn: staff.staffTypeNameEn,
                                                    staffTypeCode: staff.staffTypeCode,
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell className={adminCellClass({ size: "xs", className: "tabular-nums" })}>{fmtDate(staff.startDate)}</TableCell>
                                        <TableCell className={adminCellClass({ center: true })}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 px-3 gap-1.5 border-rose-300 text-rose-600 hover:bg-rose-50"
                                                onClick={() => openRevoke(staff)}
                                            >
                                                {t("table.revokeAction")}
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <AdminPagination
                    page={currentPage}
                    totalCount={totalCount}
                    onPageChange={setCurrentPage}
                    isRTL={isRTL}
                    disabled={isLoading}
                />
                </div>
            </div>
        );
    }

    // ─── STEP 2 RENDER: Revoke Privileges ──────────────────────────────────────
    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>

            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-background shrink-0">
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => setStep("table")}
                        className={`flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                        <ChevronRight className="w-4 h-4" style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
                        {t("revoke.back")}
                    </button>
                    <span className="text-muted-foreground/50">/</span>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-rose-500" />
                            {t("revoke.title")} {selectedStaff ? buildPersonName({
                                firstNameAr: selectedStaff.firstNameAr,
                                lastNameAr: selectedStaff.lastNameAr,
                                firstNameEn: selectedStaff.firstNameEn,
                                lastNameEn: selectedStaff.lastNameEn,
                            }, language).primary || selectedStaff.nameAr || selectedStaff.nameEn : ""}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedStaff && resolveJobLabel({
                                staffTypeId: selectedStaff.staffTypeId,
                                staffTypeNameAr: selectedStaff.staffTypeNameAr,
                                staffTypeNameEn: selectedStaff.staffTypeNameEn,
                                staffTypeCode: selectedStaff.staffTypeCode,
                            })}
                        </p>
                    </div>
                </div>

                {/* Stats row */}
                {!loadingPrivileges && grantedPrivileges.length > 0 && (
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Shield className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{t("revoke.totalPrivileges")}</span>
                            <span className="font-bold text-foreground">{grantedPrivileges.length}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>{t("revoke.toRevoke")}</span>
                            <span className={`font-bold ${markedIds.length > 0 ? "text-rose-600" : "text-foreground"}`}>
                                {markedIds.length}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Privilege list body */}
            <div className="flex-1 overflow-hidden flex flex-col">

                {/* Search + quick actions bar */}
                <div className="px-6 py-3 border-b border-border bg-muted/10 shrink-0 flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("revoke.searchPrivilege")}
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border-2 border-border rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm bg-background`}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}>✕</button>
                        )}
                    </div>

                    {/* Quick actions */}
                    <button
                        onClick={markAll}
                        disabled={loadingPrivileges || grantedPrivileges.length === 0}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border-2 border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                    >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {t("revoke.markAll")}
                    </button>
                    <button
                        onClick={clearAll}
                        disabled={markedIds.length === 0}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border-2 border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t("revoke.undo")}
                    </button>
                </div>

                {/* Privilege cards */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                    {loadingPrivileges ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
                        </div>
                    ) : grantedPrivileges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                            <Shield className="h-12 w-12 mb-3 text-muted-foreground/30" />
                            <h3 className="text-base font-semibold text-foreground mb-1">{t("revoke.noGrantedPrivilegesTitle")}</h3>
                            <p className="text-sm">{t("revoke.noGrantedPrivilegesDesc")}</p>
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                            <Search className="h-10 w-10 mb-2 text-muted-foreground/30" />
                            <p className="text-sm">{t("revoke.noResults")}</p>
                        </div>
                    ) : (
                        filteredGroups.map((group) => (
                            <div key={group.module} className="rounded-xl border-2 border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center justify-between">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{group.module}</p>
                                    <span className="text-[11px] text-muted-foreground">{group.items.length} {t("revoke.privilegeCount")}</span>
                                </div>
                                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {group.items.map((priv) => {
                                        const marked = priv.markedForRevocation;

                                        return (
                                            <button
                                                key={priv.code}
                                                type="button"
                                                onClick={() => toggleRevoke(priv.code)}
                                                className={`w-full text-right flex items-start gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all cursor-pointer group ${
                                                    marked
                                                        ? "bg-rose-50 border-rose-300 shadow-sm"
                                                        : "bg-background border-border hover:border-rose-200 hover:bg-rose-50/40"
                                                }`}
                                            >
                                                {/* Checkbox/Icon */}
                                                <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                                    marked
                                                        ? "bg-rose-500 text-white"
                                                        : "bg-emerald-100 text-emerald-600 group-hover:bg-rose-100 group-hover:text-rose-500"
                                                }`}>
                                                    {marked
                                                        ? <Trash2 className="w-3.5 h-3.5" />
                                                        : <Shield className="w-3.5 h-3.5" />}
                                                </div>

                                                {/* Text */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-semibold leading-tight truncate ${
                                                        marked ? "text-rose-800 line-through" : "text-foreground"
                                                    }`}>
                                                        {getLocalizedText(priv.nameAr, priv.nameEn, language) || priv.code}
                                                    </p>
                                                    <p className={`text-[10px] font-mono mt-0.5 truncate ${
                                                        marked ? "text-rose-500 line-through" : "text-muted-foreground"
                                                    }`}>
                                                        {priv.code}
                                                    </p>

                                                    {/* Source badge */}
                                                    <div className="mt-1.5 flex items-center gap-1">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[9px] h-5 px-1.5 ${
                                                                priv.source === "direct"
                                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                                                    : priv.source === "package"
                                                                        ? "bg-blue-100 text-blue-700 border-blue-300"
                                                                        : "bg-amber-100 text-amber-700 border-amber-300"
                                                            }`}
                                                        >
                                                            {t(`sources.${priv.source.toLowerCase()}`, { defaultValue: priv.source })}
                                                        </Badge>

                                                        {priv.source === "package" && priv.package_code && (
                                                            <span className="text-[8px] text-muted-foreground truncate">
                                                                ({priv.package_code})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Failed attempts warning */}
                {failedAttempts.length > 0 && (
                    <div className="mx-6 mb-4 p-3 rounded-lg bg-red-50 border-2 border-red-200">
                        <p className="text-xs font-semibold text-red-800 mb-2">{t("revoke.failedAttemptsTitle", { count: failedAttempts.length })}</p>
                        <ul className="space-y-1">
                            {failedAttempts.map((attempt, idx) => (
                                <li key={idx} className={`text-[11px] text-red-700 ${isRTL ? 'ml-0 mr-4' : 'mr-0 ml-4'}`}>
                                    • <span className="font-mono">{attempt.error}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 border-t border-border bg-background px-6 py-3 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                    {markedIds.length > 0
                        ? <><strong className="text-rose-600">{markedIds.length}</strong> {t("revoke.footerTextSelected")}</>
                        : t("revoke.footerTextNone")}
                </p>
                <Button
                    variant="destructive"
                    onClick={() => void handleRevoke()}
                    disabled={isSaving || markedIds.length === 0}
                    className="gap-2"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    {isSaving ? t("revoke.revoking") : t("revoke.confirmRevokeBtn")}
                </Button>
            </div>
        </div>
    );
}
