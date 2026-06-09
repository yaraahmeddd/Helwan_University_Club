import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, RefreshCw, Shield, Loader2,
  Users, Check, ChevronDown, ChevronUp, Package, Save, ArrowRight,
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
import { AdminStaffListToolbar } from "../components/StaffPagesComponents/shared/AdminStaffListToolbar";
import { buildPersonName, getLanguageOnlyText, getLocalizedText } from "../lib/localizedDisplay";
import { getPrivilegeModuleLabel } from "../lib/privilegeModuleLabels";
import { filterStaffListRows, mapStaffApiItem, staffTypeOptionsFromApi, type StaffListApiItem } from "../lib/staffListUtils";
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

type PrivilegeApiItem = {
  id: number;
  code: string;
  name_en?: string;
  name_ar?: string;
  module?: string;
};

type PackageApiItem = {
  id: number;
  code?: string;
  name_ar?: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
};

type PackageOption = {
  key: string;
  backendId: number;
  code: string;
  name: string;
  description?: string;
  privilegeCodes: string[];
};

const PAGE_SIZE = ADMIN_PAGE_SIZE;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

// ─── Helpers (same as StaffManagementPage) ───────────────────────────────────

const formatDisplayDate = (v: string | null | undefined, locale: string) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
  } catch { return v; }
};

const normalizePrivilegesResponse = (response: unknown): PrivilegeApiItem[] => {
  if (!isRecord(response)) return [];
  const payload = response.data;
  const arr = Array.isArray(payload) ? payload : isRecord(payload)
    ? Object.values(payload).flat() : [];
  const out: PrivilegeApiItem[] = [];
  arr.forEach((item) => {
    if (!isRecord(item)) return;
    const id = Number(item.id);
    const code = String(item.code ?? "").trim();
    if (!Number.isFinite(id) || !code) return;
    out.push({
      id, code,
      name_en: String(item.name_en ?? ""),
      name_ar: String(item.name_ar ?? ""),
      module: String(item.module ?? "General"),
    });
  });
  return out;
};

const normalizePackageCodes = (response: unknown): string[] => {
  const raw = isRecord(response) && Array.isArray(response.data)
    ? response.data : Array.isArray(response) ? response : [];
  return Array.from(new Set(
    raw.map((i) => isRecord(i) ? String(i.code ?? "").trim() : "").filter(Boolean)
  ));
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssignStaffPrivilegesPage() {
  const { t } = useTranslation("AssignStaffPrivilegesPage");
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const { resolveJobLabel } = useStaffJobLabels(language);
  const dateLocale = language === "en" ? "en-US" : "ar-EG";
  const fmtDate = useCallback(
    (v?: string | null) => formatDisplayDate(v, dateLocale),
    [dateLocale],
  );

  // ── VIEW STATE ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<"table" | "assign">("table");
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

  const openAssign = (staff: StaffRow) => {
    setSelectedStaff(staff);
    setSelectedPackageKeys([]);
    setSelectedExtraPrivilegeIds([]);
    setSearchQuery("");
    setStep("assign");
  };

  // ── STEP 2: Privileges Assignment ──────────────────────────────────────────
  const [backendPackages, setBackendPackages] = useState<PackageApiItem[]>([]);
  const [selectedPackageKeys, setSelectedPackageKeys] = useState<string[]>([]);
  const [packageCodesByKey, setPackageCodesByKey] = useState<Record<string, string[]>>({});
  const [loadingPackages, setLoadingPackages] = useState(false);

  const [allPrivileges, setAllPrivileges] = useState<PrivilegeApiItem[]>([]);
  const [selectedExtraPrivilegeIds, setSelectedExtraPrivilegeIds] = useState<number[]>([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (step !== "assign") return;
    setLoadingPackages(true);
    StaffService.getPackages()
      .then((r) => setBackendPackages(r.success && Array.isArray(r.data) ? r.data : []))
      .catch(() => setBackendPackages([]))
      .finally(() => setLoadingPackages(false));
  }, [step]);

  useEffect(() => {
    if (step !== "assign") return;
    setLoadingPrivileges(true);
    StaffService.getAllPrivileges()
      .then((r) => setAllPrivileges(normalizePrivilegesResponse(r)))
      .catch(() => setAllPrivileges([]))
      .finally(() => setLoadingPrivileges(false));
  }, [step]);

  const packageOptions = useMemo<PackageOption[]>(() =>
    backendPackages.map((pkg) => ({
      key: `backend:${pkg.id}`,
      backendId: pkg.id,
      code: pkg.code || `PKG_${pkg.id}`,
      name: getLocalizedText(pkg.name_ar, pkg.name_en, language) || pkg.code || `Package #${pkg.id}`,
      description: pkg.description_ar || pkg.description_en,
      privilegeCodes: packageCodesByKey[`backend:${pkg.id}`] || [],
    })),
    [backendPackages, packageCodesByKey]
  );

  const selectedPackages = useMemo(
    () => packageOptions.filter((p) => selectedPackageKeys.includes(p.key)),
    [packageOptions, selectedPackageKeys]
  );

  const selectedPackageCodes = useMemo(() => {
    const s = new Set<string>();
    selectedPackages.forEach((p) => p.privilegeCodes.forEach((c) => s.add(c)));
    return s;
  }, [selectedPackages]);

  // Lazy-load package privilege codes
  useEffect(() => {
    const missing = selectedPackages.filter((p) => !packageCodesByKey[p.key]);
    if (!missing.length) return;
    let cancelled = false;
    (async () => {
      const updates: Record<string, string[]> = {};
      await Promise.all(missing.map(async (p) => {
        try { updates[p.key] = normalizePackageCodes(await StaffService.getPackagePrivileges(p.backendId)); }
        catch { updates[p.key] = []; }
      }));
      if (!cancelled) setPackageCodesByKey((prev) => ({ ...prev, ...updates }));
    })();
    return () => { cancelled = true; };
  }, [packageCodesByKey, selectedPackages]);

  const privilegeCodeById = useMemo(() => {
    const m = new Map<number, string>();
    allPrivileges.forEach((p) => m.set(p.id, p.code));
    return m;
  }, [allPrivileges]);

  // De-dupe extra picks covered by packages
  useEffect(() => {
    setSelectedExtraPrivilegeIds((prev) => {
      const f = prev.filter((id) => { const c = privilegeCodeById.get(id); return !c || !selectedPackageCodes.has(c); });
      return f.length === prev.length ? prev : f;
    });
  }, [privilegeCodeById, selectedPackageCodes]);

  const groupedPrivileges = useMemo(() => {
    const map = new Map<string, PrivilegeApiItem[]>();
    allPrivileges.forEach((p) => {
      const mod = p.module || "General";
      map.set(mod, [...(map.get(mod) ?? []), p]);
    });
    return Array.from(map.entries())
      .map(([module, items]) => ({
        module,
        items: [...items].sort((a, b) => (a.name_ar || a.code).localeCompare(b.name_ar || b.code)),
      }))
      .sort((a, b) => a.module.localeCompare(b.module));
  }, [allPrivileges]);

  const filteredPrivileges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return groupedPrivileges
      .map((g) => ({
        module: g.module,
        items: g.items.filter((p) =>
          !q ||
          (p.name_ar ?? "").toLowerCase().includes(q) ||
          (p.name_en ?? "").toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groupedPrivileges, searchQuery]);

  const totalPrivilegesCount = selectedPackageCodes.size + selectedExtraPrivilegeIds.length;

  const togglePackage = (key: string) =>
    setSelectedPackageKeys((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const toggleExpand = (key: string) =>
    setExpandedPackages((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const toggleExtra = (id: number) =>
    setSelectedExtraPrivilegeIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleAssign = async () => {
    if (!selectedStaff) return;
    setIsSaving(true);
    try {
      const pkgIds = selectedPackages.map((p) => p.backendId).filter((id) => id > 0);
      if (pkgIds.length > 0) await StaffService.assignPackages(selectedStaff.id, pkgIds);

      const pkgCodes = new Set(selectedPackages.flatMap((p) => p.privilegeCodes));
      const extraIds = selectedExtraPrivilegeIds.filter((id) => {
        const c = privilegeCodeById.get(id); return !c || !pkgCodes.has(c);
      });
      if (extraIds.length > 0)
        await StaffService.grantPrivileges(selectedStaff.id, extraIds, "Assigned from assign-privileges page");

      const staffName = buildPersonName({
        firstNameAr: selectedStaff.firstNameAr,
        lastNameAr: selectedStaff.lastNameAr,
        firstNameEn: selectedStaff.firstNameEn,
        lastNameEn: selectedStaff.lastNameEn,
      }, language).primary || selectedStaff.nameAr || selectedStaff.nameEn;

      toast({
        title: t("toasts.assignSuccessTitle"),
        description: t("toasts.assignSuccessDesc", { count: totalPrivilegesCount, name: staffName }),
      });
      setSelectedPackageKeys([]);
      setSelectedExtraPrivilegeIds([]);
    } catch {
      toast({
        title: t("toasts.assignFailedTitle"),
        description: t("toasts.assignFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  // ── STEP 1: Table view ─────────────────────────────────────────────────────
  if (step === "table") {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-background shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                        {resolveJobLabel({
                          staffTypeId: staff.staffTypeId,
                          staffTypeNameAr: staff.staffTypeNameAr,
                          staffTypeNameEn: staff.staffTypeNameEn,
                          staffTypeCode: staff.staffTypeCode,
                        })}
                      </span>
                    </TableCell>
                    <TableCell className={adminCellClass({ size: "xs", className: "tabular-nums" })}>
                      {fmtDate(staff.startDate)}
                    </TableCell>
                    <TableCell className={adminCellClass({ center: true })}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                        onClick={() => openAssign(staff)}
                      >
                        {t("table.assignAction")}
                        <ArrowRight className="w-3.5 h-3.5" style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
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

  // ── STEP 2: Privileges Assignment ──────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background shrink-0 flex items-center justify-between shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStep("table")}
            className={`p-2 -mx-2 hover:bg-muted rounded-full transition-colors text-muted-foreground ${isRTL ? 'mr-0 ml-2' : 'ml-0 mr-2'}`}
          >
            <ArrowRight className="w-5 h-5" style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t("assign.title")} {selectedStaff ? buildPersonName({
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
              <span className={`inline-block ${isRTL ? 'mr-2' : 'ml-2'} font-medium text-foreground`}>
                {t("assign.selectedCount", { count: totalPrivilegesCount })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-x-reverse divide-border">

        {/* ── Left column: Packages ─────────────────────────────────────────── */}
        <div className="flex flex-col overflow-hidden border-l border-border">
          <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {t("assign.packagesTitle")}
            </h2>
            {selectedPackageKeys.length > 0 && (
              <Badge className="bg-primary/10 text-primary border-0 text-xs">
                {t("assign.selectedPackagesCount", { count: selectedPackageKeys.length })}
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingPackages ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : packageOptions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed">
                <Package className="w-10 h-10 mx-auto opacity-20 mb-2" />
                {t("assign.noPackages")}
              </div>
            ) : (
              packageOptions.map((pkg) => {
                const isSelected = selectedPackageKeys.includes(pkg.key);
                const isExpanded = expandedPackages.has(pkg.key);
                return (
                  <div
                    key={pkg.key}
                    className={`rounded-xl border-2 transition-all overflow-hidden ${isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:border-primary/30"
                      }`}
                  >
                    <div className="flex items-start gap-3 p-3.5 cursor-pointer" onClick={() => togglePackage(pkg.key)}>
                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>{pkg.name}</p>
                        {pkg.description && (
                          <p className={`text-xs mt-0.5 line-clamp-1 ${isSelected ? "text-primary/80" : "text-muted-foreground"}`}>{pkg.description}</p>
                        )}
                        <span className={`inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{pkg.code}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>{t("assign.packagePrivilegesCount", { count: pkg.privilegeCodes.length })}</span>
                        {pkg.privilegeCodes.length > 0 && (
                          <button onClick={(e) => { e.stopPropagation(); toggleExpand(pkg.key); }} className="p-1 rounded hover:bg-muted transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1 border-t border-orange-200 bg-white/60">
                        <div className="grid grid-cols-2 gap-1.5">
                          {pkg.privilegeCodes.map((code) => {
                            const priv = allPrivileges.find((p) => p.code === code);
                            return (
                              <div key={code} className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1.5">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                <p className="text-xs font-medium text-emerald-900 truncate">{getLocalizedText(priv?.name_ar, priv?.name_en, language) || code}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right column: Individual Privileges ───────────────────────────── */}
        <div className="flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/20 shrink-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-semibold text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {t("assign.individualPrivilegesTitle")}
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                <Input
                  placeholder={t("assign.searchPrivilege")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`h-9 ${isRTL ? 'pr-9' : 'pl-9'} text-sm bg-background`}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingPrivileges ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPrivileges.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto opacity-20 mb-3" />
                {searchQuery ? t("assign.noResults") : t("assign.noPrivileges")}
              </div>
            ) : (
              filteredPrivileges.map((group) => (
                <div key={group.module} className="rounded-xl border-2 border-border overflow-hidden">
                  <div className="bg-muted/50 px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{getPrivilegeModuleLabel(group.module, language)}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {group.items.map((privilege) => {
                      const displayName = getLanguageOnlyText(privilege.name_ar, privilege.name_en, language) || privilege.code;
                      const isSelected = selectedExtraPrivilegeIds.includes(privilege.id);
                      const inPackage = selectedPackageCodes.has(privilege.code);
                      return (
                        <label
                          key={privilege.id}
                          className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-all ${inPackage
                            ? "bg-emerald-50 border-emerald-200 opacity-70 cursor-not-allowed"
                            : isSelected
                              ? "bg-primary/5 border-primary shadow-sm"
                              : "bg-background border-border hover:border-primary/30 hover:bg-muted/40"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-primary shrink-0"
                            checked={isSelected || inPackage}
                            disabled={inPackage}
                            onChange={() => !inPackage && toggleExtra(privilege.id)}
                          />
                          <Badge variant="secondary" className="bg-muted text-muted-foreground shrink-0">
                            <Check className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {t("assign.selectedBadge")}
                          </Badge>
                          <span className="flex-1 min-w-0">
                            <span className={`block text-xs font-semibold truncate ${inPackage ? "text-emerald-800" : isSelected ? "text-primary" : "text-foreground"}`}>
                              {displayName}
                              {inPackage && <span className={`text-[10px] font-normal text-emerald-600 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t("assign.inPackage")}</span>}
                            </span>
                            <span className={`block text-[10px] font-mono truncate ${inPackage ? "text-emerald-700" : isSelected ? "text-blue-600" : "text-muted-foreground"}`}>
                              {privilege.code}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Save bar */}
      <div className="shrink-0 border-t border-border bg-background px-6 py-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalPrivilegesCount > 0
            ? t("assign.footerSelected", { count: totalPrivilegesCount })
            : t("assign.noPrivileges")}
        </p>
        <Button
          onClick={() => void handleAssign()}
          disabled={isSaving || totalPrivilegesCount === 0}
          className="gap-2"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? t("assign.saving") : t("table.assignAction")}
        </Button>
      </div>
    </div>
  );
}
