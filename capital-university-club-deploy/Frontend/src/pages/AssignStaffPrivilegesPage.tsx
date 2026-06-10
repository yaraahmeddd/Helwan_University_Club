import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, RefreshCw, Shield, Loader2,
  Users, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Package, Save, ArrowRight,
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
import { buildPersonName, getLocalizedText, localeFontFamily } from "../lib/localizedDisplay";
import { getPrivilegeDisplayName, getPrivilegeModuleLabel } from "../lib/privilegeModuleLabels";
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

const hiddenHorizontalScrollbar =
  "overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

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
    setActivePrivilegeTab(null);
    setExpandedPackages(new Set());
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
  const [activePrivilegeTab, setActivePrivilegeTab] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const moduleTabsRef = useRef<HTMLDivElement>(null);

  const scrollModuleTabs = useCallback((direction: "back" | "forward") => {
    const el = moduleTabsRef.current;
    if (!el) return;
    const amount = Math.max(220, Math.floor(el.clientWidth * 0.55));
    const delta = direction === "back"
      ? (isRTL ? amount : -amount)
      : (isRTL ? -amount : amount);
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, [isRTL]);

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
      name: getLocalizedText(pkg.name_ar, pkg.name_en, language) || pkg.code || t("assign.packageFallback", { id: pkg.id }),
      description: getLocalizedText(pkg.description_ar, pkg.description_en, language) || undefined,
      privilegeCodes: packageCodesByKey[`backend:${pkg.id}`] || [],
    })),
    [backendPackages, packageCodesByKey, language, t]
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

  // Pre-fetch privilege codes for all packages (shows accurate counts in cards)
  useEffect(() => {
    if (step !== "assign" || backendPackages.length === 0) return;
    let cancelled = false;
    (async () => {
      const updates: Record<string, string[]> = {};
      await Promise.all(
        backendPackages.map(async (pkg) => {
          const key = `backend:${pkg.id}`;
          if (packageCodesByKey[key]) {
            updates[key] = packageCodesByKey[key];
            return;
          }
          try {
            updates[key] = normalizePackageCodes(await StaffService.getPackagePrivileges(pkg.id));
          } catch {
            updates[key] = [];
          }
        }),
      );
      if (!cancelled) setPackageCodesByKey((prev) => ({ ...prev, ...updates }));
    })();
    return () => { cancelled = true; };
  }, [step, backendPackages]);

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
    const sortLocale = language === "ar" ? "ar" : "en";
    return Array.from(map.entries())
      .map(([module, items]) => ({
        module,
        items: [...items].sort((a, b) =>
          getPrivilegeDisplayName(a.name_ar, a.name_en, a.code, language).localeCompare(
            getPrivilegeDisplayName(b.name_ar, b.name_en, b.code, language),
            sortLocale,
          ),
        ),
      }))
      .sort((a, b) =>
        getPrivilegeModuleLabel(a.module, language).localeCompare(
          getPrivilegeModuleLabel(b.module, language),
          sortLocale,
        ),
      );
  }, [allPrivileges, language]);

  const filteredPrivileges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return groupedPrivileges
      .map((g) => ({
        module: g.module,
        items: g.items.filter((p) => {
          if (!q) return true;
          const displayName = getPrivilegeDisplayName(p.name_ar, p.name_en, p.code, language).toLowerCase();
          const moduleLabel = getPrivilegeModuleLabel(g.module, language).toLowerCase();
          return (
            displayName.includes(q) ||
            (p.name_ar ?? "").toLowerCase().includes(q) ||
            (p.name_en ?? "").toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            moduleLabel.includes(q)
          );
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [groupedPrivileges, searchQuery, language]);

  const totalPrivilegesCount = selectedPackageCodes.size + selectedExtraPrivilegeIds.length;
  const selectedExtraCount = selectedExtraPrivilegeIds.length;

  useEffect(() => {
    if (filteredPrivileges.length === 0) {
      setActivePrivilegeTab(null);
      return;
    }
    if (!activePrivilegeTab || !filteredPrivileges.some((g) => g.module === activePrivilegeTab)) {
      setActivePrivilegeTab(filteredPrivileges[0].module);
    }
  }, [filteredPrivileges, activePrivilegeTab]);

  const activePrivilegeGroup = useMemo(
    () => filteredPrivileges.find((g) => g.module === activePrivilegeTab) ?? null,
    [filteredPrivileges, activePrivilegeTab],
  );

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
  const staffDisplayName = selectedStaff
    ? buildPersonName({
        firstNameAr: selectedStaff.firstNameAr,
        lastNameAr: selectedStaff.lastNameAr,
        firstNameEn: selectedStaff.firstNameEn,
        lastNameEn: selectedStaff.lastNameEn,
      }, language).primary || selectedStaff.nameAr || selectedStaff.nameEn
    : "";

  const staffJobLabel = selectedStaff
    ? resolveJobLabel({
        staffTypeId: selectedStaff.staffTypeId,
        staffTypeNameAr: selectedStaff.staffTypeNameAr,
        staffTypeNameEn: selectedStaff.staffTypeNameEn,
        staffTypeCode: selectedStaff.staffTypeCode,
      })
    : "";

  return (
    <div
      className="h-[calc(100vh-4rem)] flex flex-col bg-muted/20"
      dir={isRTL ? "rtl" : "ltr"}
      lang={language}
      style={{ fontFamily: localeFontFamily(language) }}
    >
      {/* Top bar */}
      <div className="shrink-0 border-b border-border bg-background">
        <div className="px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setStep("table")}
              className="mt-0.5 p-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground shrink-0"
              aria-label={t("assign.back")}
            >
              <ArrowRight className="w-4 h-4" style={{ transform: isRTL ? "none" : "rotate(180deg)" }} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("assign.back")}
              </p>
              <h1 className="text-xl font-bold text-foreground truncate">{staffDisplayName}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {staffJobLabel && (
                  <Badge variant="secondary" className="text-[11px] font-semibold">
                    {staffJobLabel}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{t("assign.subtitle")}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center min-w-[88px]">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("assign.summaryPackages")}</p>
              <p className="text-lg font-bold text-foreground">{selectedPackageKeys.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center min-w-[88px]">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("assign.summaryIndividual")}</p>
              <p className="text-lg font-bold text-foreground">{selectedExtraCount}</p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-center min-w-[88px]">
              <p className="text-[10px] uppercase tracking-wide text-primary">{t("assign.summaryTotal")}</p>
              <p className="text-lg font-bold text-primary">{totalPrivilegesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content — single column, horizontal sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 space-y-6">
          {/* ── Packages (horizontal grid) ── */}
          <section className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-semibold text-base flex items-center gap-2 text-foreground">
                  <Package className="w-4 h-4 text-primary" />
                  {t("assign.packagesTitle")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{t("assign.packagesSubtitle")}</p>
              </div>
              {selectedPackageKeys.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-0 w-fit">
                  {t("assign.selectedPackagesCount", { count: selectedPackageKeys.length })}
                </Badge>
              )}
            </div>

            <div className="p-5">
              {loadingPackages ? (
                <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-sm">{t("assign.loadingPackages")}</p>
                </div>
              ) : packageOptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-border rounded-xl bg-muted/10">
                  <Package className="w-10 h-10 opacity-30 mb-3" />
                  <p className="text-sm font-medium">{t("assign.noPackages")}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {packageOptions.map((pkg) => {
                      const isSelected = selectedPackageKeys.includes(pkg.key);
                      const isExpanded = expandedPackages.has(pkg.key);
                      const hasPrivileges = pkg.privilegeCodes.length > 0;

                      return (
                        <div
                          key={pkg.key}
                          className={`rounded-xl border transition-all flex flex-col ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                              : "border-border bg-card hover:border-primary/25 hover:shadow-sm"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => togglePackage(pkg.key)}
                            className="text-start p-4 flex items-start gap-3 flex-1"
                          >
                            <div
                              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/35 bg-background"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-semibold leading-snug line-clamp-2 ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {pkg.name}
                              </p>
                              <Badge variant="outline" className="mt-2 text-[10px] font-mono">
                                {pkg.code}
                              </Badge>
                              {pkg.description && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{pkg.description}</p>
                              )}
                              <p className={`text-xs mt-2 font-medium ${isSelected ? "text-primary/80" : "text-muted-foreground"}`}>
                                {t("assign.packagePrivilegesCount", { count: pkg.privilegeCodes.length })}
                              </p>
                            </div>
                          </button>
                          {hasPrivileges && (
                            <div className="px-4 pb-3 pt-0 border-t border-border/60 mt-auto">
                              <button
                                type="button"
                                onClick={() => toggleExpand(pkg.key)}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full pt-2"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {isExpanded ? t("assign.hidePrivileges") : t("assign.showPrivileges")}
                              </button>
                            </div>
                          )}
                          {isExpanded && hasPrivileges && (
                            <div className="border-t border-border bg-muted/15 px-3 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {pkg.privilegeCodes.map((code) => {
                                  const priv = allPrivileges.find((p) => p.code === code);
                                  const label = getPrivilegeDisplayName(
                                    priv?.name_ar,
                                    priv?.name_en,
                                    code,
                                    language,
                                  );
                                  return (
                                    <span
                                      key={code}
                                      className="inline-flex items-center gap-1 max-w-full rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground"
                                      title={label}
                                    >
                                      <Check className="w-3 h-3 text-primary shrink-0" />
                                      <span className="truncate">{label}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── Individual privileges (full width) ── */}
          <section className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start justify-between gap-3 lg:block">
                <div>
                  <h2 className="font-semibold text-base flex items-center gap-2 text-foreground">
                    <Shield className="w-4 h-4 text-primary" />
                    {t("assign.individualPrivilegesTitle")}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">{t("assign.privilegesSubtitle")}</p>
                </div>
                {selectedExtraCount > 0 && (
                  <Badge className="bg-primary/10 text-primary border-0 shrink-0 lg:hidden">
                    {t("assign.individualSelectedCount", { count: selectedExtraCount })}
                  </Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:flex-1 lg:max-w-xl lg:ms-auto">
                <div className="relative flex-1">
                  <Search
                    className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`}
                  />
                  <Input
                    placeholder={t("assign.searchPrivilege")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`h-9 ${isRTL ? "pr-9" : "pl-9"} text-sm bg-background`}
                  />
                </div>
                {selectedExtraCount > 0 && (
                  <Badge className="bg-primary/10 text-primary border-0 hidden lg:inline-flex shrink-0">
                    {t("assign.individualSelectedCount", { count: selectedExtraCount })}
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-5">
              {loadingPrivileges ? (
                <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-sm">{t("assign.loadingPrivileges")}</p>
                </div>
              ) : filteredPrivileges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-border rounded-xl bg-muted/10">
                  <Shield className="w-10 h-10 opacity-30 mb-3" />
                  <p className="text-sm font-medium">
                    {searchQuery ? t("assign.noResults") : t("assign.noPrivileges")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => scrollModuleTabs("back")}
                      aria-label={t("assign.scrollPrev")}
                    >
                      {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                    <div ref={moduleTabsRef} className={`flex gap-2 flex-1 min-w-0 pb-1 ${hiddenHorizontalScrollbar}`}>
                      {filteredPrivileges.map((group) => {
                        const moduleSelectedCount = group.items.filter((p) =>
                          selectedExtraPrivilegeIds.includes(p.id),
                        ).length;
                        const isActive = group.module === activePrivilegeTab;
                        return (
                          <button
                            key={group.module}
                            type="button"
                            onClick={() => setActivePrivilegeTab(group.module)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                              isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
                            }`}
                          >
                            {getPrivilegeModuleLabel(group.module, language)}
                            {moduleSelectedCount > 0 && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
                                  isActive ? "bg-white/20 text-white" : "bg-primary/15 text-primary"
                                }`}
                              >
                                {moduleSelectedCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => scrollModuleTabs("forward")}
                      aria-label={t("assign.scrollNext")}
                    >
                      {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>

                  {activePrivilegeGroup ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                      {activePrivilegeGroup.items.map((privilege) => {
                        const displayName = getPrivilegeDisplayName(
                          privilege.name_ar,
                          privilege.name_en,
                          privilege.code,
                          language,
                        );
                        const isSelected = selectedExtraPrivilegeIds.includes(privilege.id);
                        const inPackage = selectedPackageCodes.has(privilege.code);

                        return (
                          <button
                            key={privilege.id}
                            type="button"
                            disabled={inPackage}
                            onClick={() => !inPackage && toggleExtra(privilege.id)}
                            className={`group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-start transition-all min-h-[52px] ${
                              inPackage
                                ? "border-emerald-200 bg-emerald-50/70 opacity-80 cursor-not-allowed"
                                : isSelected
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                inPackage
                                  ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                                  : isSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-muted-foreground/35 bg-background group-hover:border-primary/40"
                              }`}
                            >
                              {(isSelected || inPackage) && <Check className="w-2.5 h-2.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-xs font-semibold leading-tight line-clamp-2 ${
                                  inPackage ? "text-emerald-900" : isSelected ? "text-primary" : "text-foreground"
                                }`}
                              >
                                {displayName}
                              </p>
                              <p className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
                                {privilege.code}
                              </p>
                              {inPackage && (
                                <p className="text-[10px] text-emerald-700 mt-1 font-medium">{t("assign.inPackage")}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border bg-background px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {totalPrivilegesCount > 0 ? (
            <span>
              {t("assign.footerBreakdown", {
                packages: selectedPackageKeys.length,
                individual: selectedExtraCount,
                total: totalPrivilegesCount,
              })}
            </span>
          ) : (
            t("assign.footerEmpty")
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button type="button" variant="outline" onClick={() => setStep("table")} disabled={isSaving}>
            {t("assign.back")}
          </Button>
          <Button
            onClick={() => void handleAssign()}
            disabled={isSaving || totalPrivilegesCount === 0}
            className="gap-2 min-w-[140px]"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? t("assign.saving") : t("table.assignAction")}
          </Button>
        </div>
      </div>
    </div>
  );
}
