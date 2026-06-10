import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Search, RefreshCw, Shield, Loader2,
    Users, ArrowRight, Trash2, RotateCcw, AlertTriangle, ShieldOff
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
import { buildPersonName } from "../lib/localizedDisplay";
import { getPrivilegeDisplayName, getPrivilegeModuleLabel, shouldShowPrivilegeCode } from "../lib/privilegeModuleLabels";
import { filterStaffListRows, mapStaffApiItem, staffTypeOptionsFromApi, type StaffListApiItem } from "../lib/staffListUtils";
import { AdminStaffListToolbar } from "../components/StaffPagesComponents/shared/AdminStaffListToolbar";
import { useStaffJobLabels } from "../lib/staffJobLabel";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffType = {
    id: number;
    code: string;
    name_ar?: string;
    name_en?: string;
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
            source: (item.source as "direct" | "package" | "default") ?? "direct", // NEW
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
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [allStaffRows, setAllStaffRows] = useState<StaffRow[]>([]);

    const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);

    useEffect(() => {
        StaffService.getStaffTypes()
            .then((res) => { if (res.success && Array.isArray(res.data)) setStaffTypes(res.data); })
            .catch(() => {});
    }, []);

    const fetchStaff = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/staff", { params: { page: 1, limit: 500 } });
            const raw = res.data;
            const data: StaffListApiItem[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
            const mapped = data.map((s) => {
                const row = mapStaffApiItem(s);
                return {
                    id: row.id,
                    nameAr: `${row.firstNameAr ?? ""} ${row.lastNameAr ?? ""}`.trim(),
                    nameEn: `${row.firstNameEn ?? ""} ${row.lastNameEn ?? ""}`.trim(),
                    firstNameAr: row.firstNameAr,
                    lastNameAr: row.lastNameAr,
                    firstNameEn: row.firstNameEn,
                    lastNameEn: row.lastNameEn,
                    nationalId: row.nationalId,
                    role: String(row.staffTypeCode ?? "STAFF").toUpperCase(),
                    staffTypeId: row.staffTypeId,
                    staffTypeNameAr: row.staffTypeNameAr,
                    staffTypeNameEn: row.staffTypeNameEn,
                    staffTypeCode: row.staffTypeCode,
                    status: row.status,
                    startDate: row.startDate,
                } satisfies StaffRow;
            });
            setAllStaffRows(mapped);
        } catch {
            toast({ title: t("toasts.errorTitle"), description: t("toasts.errorLoad"), variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast, t]);

    const filteredStaffRows = useMemo(
        () => filterStaffListRows(allStaffRows, { search, roleFilter, dateFilter, activeOnly: true }),
        [allStaffRows, search, roleFilter, dateFilter],
    );

    const staffRows = useMemo(
        () => filteredStaffRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [filteredStaffRows, currentPage],
    );

    const totalCount = filteredStaffRows.length;

    useEffect(() => { void fetchStaff(); }, [fetchStaff]);
    useEffect(() => { setCurrentPage(1); }, [search, roleFilter, dateFilter]);

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
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string, error?: string } }, message?: string };
            const errorMessage = err?.response?.data?.message
                || err?.response?.data?.error
                || err?.message
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
                const failedIds = result.failed_attempts.map((f: { privilege_id: number }) => f.privilege_id);
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
        } catch {
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
                            onClick={() => void fetchStaff()}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground disabled:opacity-40"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            {t("table.refresh")}
                        </button>
                    </div>
                </div>

                <AdminStaffListToolbar
                    isRTL={isRTL}
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder={t("table.searchPlaceholder")}
                    dateFilter={dateFilter}
                    onDateFilterChange={setDateFilter}
                    dateFilterLabel={t("toolbar.dateFilter")}
                    filterByDateLabel={t("toolbar.filterByDate")}
                    clearLabel={t("toolbar.clearFilter")}
                    statusFilterLabel={t("toolbar.statusFilter")}
                    clearFilterLabel={t("toolbar.clearFilter")}
                    filterStatuses={[]}
                    onFilterStatusesChange={() => undefined}
                    statusPopoverOpen={false}
                    onStatusPopoverOpenChange={() => undefined}
                    statusOptions={[]}
                    roleFilter={roleFilter}
                    onRoleFilterChange={setRoleFilter}
                    allRolesLabel={t("toolbar.allRoles")}
                    staffTypes={staffTypeOptionsFromApi(staffTypes, language)}
                    showStatusFilter={false}
                />

                <div className="flex flex-col flex-1 overflow-hidden">
                <div className={adminTableStyles.container}>
                    {isLoading ? (
                        <div className="py-20 text-center text-muted-foreground">
                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
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
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
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
                                                className="h-8 px-3 gap-1.5"
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
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>

            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-background shrink-0 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setStep("table")}
                        className={`p-2 -mx-2 hover:bg-muted rounded-full transition-colors text-muted-foreground ${isRTL ? 'mr-0 ml-2' : 'ml-0 mr-2'}`}
                    >
                        <ArrowRight className="w-5 h-5" style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <ShieldOff className="w-5 h-5 text-destructive" />
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
                            {!loadingPrivileges && grantedPrivileges.length > 0 && (
                                <span className={`inline-block ${isRTL ? 'mr-2' : 'ml-2'} font-medium text-foreground`}>
                                    {t("revoke.totalPrivileges")} {grantedPrivileges.length}
                                    {markedIds.length > 0 && (
                                        <span className={`text-destructive ${isRTL ? 'mr-2' : 'ml-2'}`}>
                                            · {t("revoke.toRevoke")} {markedIds.length}
                                        </span>
                                    )}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3 border-b border-border bg-muted/20 shrink-0 flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none`} />
                    <Input
                        placeholder={t("revoke.searchPrivilege")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`h-9 ${isRTL ? 'pr-9' : 'pl-9'} text-sm bg-background`}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={markAll}
                    disabled={loadingPrivileges || grantedPrivileges.length === 0}
                    className="gap-1.5"
                >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {t("revoke.markAll")}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    disabled={markedIds.length === 0}
                    className="gap-1.5"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t("revoke.undo")}
                </Button>
            </div>

            {/* Privilege list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {loadingPrivileges ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {getPrivilegeModuleLabel(group.module, language)}
                                </p>
                                <span className="text-[11px] text-muted-foreground">{group.items.length} {t("revoke.privilegeCount")}</span>
                            </div>
                            <div className="p-2 space-y-1">
                                {group.items.map((priv) => {
                                    const marked = priv.markedForRevocation;
                                    const displayName = getPrivilegeDisplayName(priv.nameAr, priv.nameEn, priv.code, language) || "—";
                                    return (
                                        <label
                                            key={priv.code}
                                            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-all ${
                                                marked
                                                    ? "bg-destructive/5 border-destructive/40 shadow-sm"
                                                    : "bg-background border-border hover:border-destructive/30 hover:bg-muted/40"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-destructive shrink-0"
                                                checked={marked}
                                                onChange={() => toggleRevoke(priv.code)}
                                            />
                                            <span className="flex-1 min-w-0">
                                                <span className={`block text-xs font-semibold truncate ${marked ? "text-destructive line-through" : "text-foreground"}`}>
                                                    {displayName}
                                                </span>
                                                {shouldShowPrivilegeCode(language) && (
                                                <span className={`block text-[10px] font-mono truncate ${marked ? "text-destructive/70 line-through" : "text-muted-foreground"}`}>
                                                    {priv.code}
                                                </span>
                                                )}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] h-5 px-1.5 shrink-0 ${
                                                    priv.source === "direct"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : priv.source === "package"
                                                            ? "bg-primary/10 text-primary border-primary/20"
                                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                                }`}
                                            >
                                                {t(`sources.${priv.source.toLowerCase()}`, { defaultValue: priv.source })}
                                            </Badge>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}

                {failedAttempts.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs font-semibold text-destructive mb-2">{t("revoke.failedAttemptsTitle", { count: failedAttempts.length })}</p>
                        <ul className="space-y-1">
                            {failedAttempts.map((attempt, idx) => (
                                <li key={idx} className={`text-[11px] text-destructive/90 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                                    • <span className="font-mono">{attempt.error}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border bg-background px-6 py-3 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                    {markedIds.length > 0
                        ? <><strong className="text-destructive">{markedIds.length}</strong> {t("revoke.footerTextSelected")}</>
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
