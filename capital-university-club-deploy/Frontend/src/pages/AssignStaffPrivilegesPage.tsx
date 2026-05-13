import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, RefreshCw, Shield, ChevronRight, ChevronLeft, Loader2,
  Users, Check, ChevronDown, ChevronUp, Package, Save, ArrowRight,
} from "lucide-react";
import api from "../services/axios";
import { StaffService } from "../services/staffService";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Badge } from "../components/StaffPagesComponents/ui/badge";
import { useToast } from "../hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffApiItem = {
  id: number;
  first_name_ar?: string;
  last_name_ar?: string;
  first_name_en?: string;
  last_name_en?: string;
  national_id?: string;
  role?: string;
  staff_type?: string;       // fallback for role
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
  nationalId: string;
  role: string;
  status: string;
  startDate: string; // ISO date string, e.g. "2024-03-15"
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

const PAGE_SIZE = 10;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

// ─── Helpers (same as StaffManagementPage) ───────────────────────────────────

const PALETTE = [
  "#1b71bc", "#e05c2a", "#2a9d60", "#7c3aed",
  "#0891b2", "#be185d", "#ca8a04", "#475569",
];
const getColor = (id: number) => PALETTE[id % PALETTE.length];
const getInitials = (ar?: string, en?: string) =>
  (ar || en || "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const formatDate = (v?: string | null) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return v; }
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "مدير النظام",
  SPORTS_DIRECTOR: "مدير الرياضة",
  SPORTS_OFFICER: "موظف رياضي",
  FINANCIAL_DIRECTOR: "المدير المالي",
  REGISTRATION_STAFF: "موظف تسجيل",
  TEAM_MANAGER: "مدير فريق",
  SUPPORT: "الدعم الفني",
  AUDITOR: "المدقق المالي",
  STAFF: "موظف",
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
  const { toast } = useToast();

  // ── VIEW STATE ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<"table" | "assign">("table");
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

        // ── Text search filter ──
        const trim = q.trim().toLowerCase();
        let filtered = trim
          ? data.filter((s) =>
            `${s.first_name_ar ?? ""} ${s.last_name_ar ?? ""}`.includes(q.trim()) ||
            `${s.first_name_en ?? ""} ${s.last_name_en ?? ""}`.toLowerCase().includes(trim) ||
            (s.national_id ?? "").includes(trim)
          )
          : data;

        // ── Date range filter ──
        if (from || to) {
          const fromMs = from ? new Date(from).setHours(0, 0, 0, 0) : -Infinity;
          const toMs = to ? new Date(to).setHours(23, 59, 59, 999) : Infinity;
          filtered = filtered.filter((s) => {
            const raw = s.employment_start_date ?? s.start_date ?? s.created_at;
            if (!raw) return false;
            const ms = new Date(raw).getTime();
            return ms >= fromMs && ms <= toMs;
          });
        }

        const rows: StaffRow[] = filtered.map((s) => ({
          id: s.id,
          nameAr: `${s.first_name_ar ?? ""} ${s.last_name_ar ?? ""}`.trim(),
          nameEn: `${s.first_name_en ?? ""} ${s.last_name_en ?? ""}`.trim(),
          nationalId: s.national_id ?? "",
          // role: prefer the role field, fall back to staff_type string
          role: String(s.role ?? s.staff_type ?? "STAFF").toUpperCase(),
          status: String(s.status ?? "").toLowerCase(),
          startDate: s.employment_start_date ?? s.start_date ?? s.created_at ?? "",
        }));

        setStaffRows(rows);
        setTotalCount(trim || from || to ? rows.length : total);
      } catch {
        toast({ title: "خطأ", description: "فشل تحميل قائمة الموظفين", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => { void fetchStaff(currentPage, search, roleFilter, dateFrom, dateTo); }, [currentPage, search, roleFilter, dateFrom, dateTo]);

  const handleSearchChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(value); setCurrentPage(1); }, 300);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
      name: pkg.name_ar || pkg.name_en || pkg.code || `Package #${pkg.id}`,
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

  const privilegeIdByCode = useMemo(() => {
    const m = new Map<string, number>();
    allPrivileges.forEach((p) => m.set(p.code, p.id));
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

      toast({ title: "✅ تم التعيين بنجاح", description: `تم تعيين ${totalPrivilegesCount} صلاحية لـ ${selectedStaff.nameAr || selectedStaff.nameEn}` });
      setSelectedPackageKeys([]);
      setSelectedExtraPrivilegeIds([]);
    } catch {
      toast({ title: "فشل التعيين", description: "حدث خطأ أثناء تعيين الصلاحيات", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  // ── STEP 1: Table view ─────────────────────────────────────────────────────
  if (step === "table") {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col" dir="rtl">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-background shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                تعيين صلاحيات الموظفين
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                اختر موظفاً للانتقال إلى صفحة تعيين الصلاحيات
              </p>
            </div>
            <button
              onClick={() => void fetchStaff(currentPage, search, roleFilter, dateFrom, dateTo)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              تحديث
            </button>
          </div>

          {/* Role filter tabs */}
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            {[
              { value: "", label: "الكل" },
              { value: "ADMIN", label: "مدير" },
              { value: "SPORTS_DIRECTOR", label: "مدير رياضة" },
              { value: "SPORTS_OFFICER", label: "موظف رياضي" },
              { value: "FINANCIAL_DIRECTOR", label: "مالي" },
              { value: "REGISTRATION_STAFF", label: "تسجيل" },
              { value: "TEAM_MANAGER", label: "مدير فريق" },
              { value: "SUPPORT", label: "دعم فني" },
              { value: "AUDITOR", label: "مدقق" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => handleRoleFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${roleFilter === f.value
                  ? "bg-primary text-primary-foreground shadow-sm"
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="ابحث بالاسم أو الرقم القومي..."
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-9 h-10"
            />
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">من:</span>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 text-sm border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background text-foreground"
            />
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">إلى:</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 text-sm border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background text-foreground"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={clearDateFilter}
                className="h-10 px-3 text-xs font-semibold text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                مسح التاريخ
              </button>
            )}
          </div>

          <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
            {totalCount} موظف
          </Badge>

          <div className="flex-1" />

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`el-${i}`} className="px-1.5 text-muted-foreground text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`min-w-[36px] h-9 rounded-md text-xs font-medium transition-colors border ${currentPage === p
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted text-foreground"
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-sm">جارٍ تحميل الموظفين...</p>
            </div>
          ) : staffRows.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <div className="rounded-full bg-muted/30 p-6 mb-4 w-fit mx-auto">
                <Users className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">لا يوجد موظفون</h3>
              <p className="text-sm">{search || roleFilter ? "لا توجد نتائج مطابقة" : "لم يتم العثور على موظفين"}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground w-10">#</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground">الموظف</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground">الرقم القومي</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground">الوظيفة</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground">بداية العمل</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffRows.map((staff, idx) => (
                  <tr key={staff.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    {/* Avatar + Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: getColor(staff.id) }}
                        >
                          {getInitials(staff.nameAr, staff.nameEn)}
                        </div>
                        <div>
                          <p className="font-semibold leading-tight text-sm">{staff.nameAr || staff.nameEn || "—"}</p>
                          {staff.nameEn && staff.nameAr && (
                            <p className="text-[11px] text-muted-foreground/70 italic" dir="ltr">{staff.nameEn}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* NID */}
                    <td className="px-4 py-3 font-mono text-xs">
                      <span dir="ltr">{staff.nationalId || "—"}</span>
                    </td>
                    {/* Role */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                        {ROLE_LABELS[staff.role] ?? staff.role}
                      </span>
                    </td>
                    {/* Start date */}
                    <td className="px-4 py-3 text-xs tabular-nums">
                      {formatDate(staff.startDate)}
                    </td>
                    {/* Action */}
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                        onClick={() => openAssign(staff)}
                      >
                        تعيين الصلاحيات
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // ── STEP 2: Privileges Assignment ──────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden" dir="rtl">

      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("table")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
          >
            <ChevronRight className="w-4 h-4" />
            العودة للقائمة
          </button>
          <span className="text-muted-foreground/50">/</span>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              صلاحيات: {selectedStaff?.nameAr || selectedStaff?.nameEn}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedStaff && (ROLE_LABELS[selectedStaff.role] ?? selectedStaff.role)}
              {totalPrivilegesCount > 0 && (
                <span className="mr-2 text-orange-600 font-semibold">
                  — {totalPrivilegesCount} صلاحية محددة
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-x-reverse divide-border">

        {/* ── Left column: Packages ─────────────────────────────────────────── */}
        <div className="flex flex-col overflow-hidden border-l border-border">
          <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
            <span className="text-sm font-bold flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              حزم الصلاحيات
            </span>
            {selectedPackageKeys.length > 0 && (
              <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                {selectedPackageKeys.length} محدد
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingPackages ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : packageOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <Package className="h-10 w-10 mb-2 text-muted-foreground/30" />
                <p className="text-sm">لا توجد حزم متاحة</p>
              </div>
            ) : (
              packageOptions.map((pkg) => {
                const isSelected = selectedPackageKeys.includes(pkg.key);
                const isExpanded = expandedPackages.has(pkg.key);
                return (
                  <div
                    key={pkg.key}
                    className={`rounded-xl border-2 transition-all overflow-hidden ${isSelected
                      ? "border-orange-400 bg-orange-50 shadow-sm"
                      : "border-border bg-background hover:border-orange-200"
                      }`}
                  >
                    <div className="flex items-start gap-3 p-3.5 cursor-pointer" onClick={() => togglePackage(pkg.key)}>
                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-orange-500 border-orange-500 text-white" : "border-muted-foreground/30"}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${isSelected ? "text-orange-900" : "text-foreground"}`}>{pkg.name}</p>
                        {pkg.description && (
                          <p className={`text-xs mt-0.5 line-clamp-1 ${isSelected ? "text-orange-700" : "text-muted-foreground"}`}>{pkg.description}</p>
                        )}
                        <span className={`inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-orange-200 text-orange-800" : "bg-muted text-muted-foreground"}`}>{pkg.code}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-semibold ${isSelected ? "text-orange-700" : "text-muted-foreground"}`}>{pkg.privilegeCodes.length} صلاحية</span>
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
                                <p className="text-xs font-medium text-emerald-900 truncate">{priv?.name_ar || priv?.name_en || code}</p>
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
          <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
            <span className="text-sm font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              صلاحيات فردية
            </span>
            {selectedExtraPrivilegeIds.length > 0 && (
              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                {selectedExtraPrivilegeIds.length} محدد
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن صلاحية..."
                className="w-full pr-10 pl-4 py-2 border-2 border-border rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm bg-background"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">✕</button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingPrivileges ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPrivileges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <Shield className="h-10 w-10 mb-2 text-muted-foreground/30" />
                <p className="text-sm">{searchQuery ? "لا توجد نتائج" : "لا توجد صلاحيات متاحة"}</p>
              </div>
            ) : (
              filteredPrivileges.map((group) => (
                <div key={group.module} className="rounded-xl border-2 border-border overflow-hidden">
                  <div className="bg-muted/50 px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{group.module}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {group.items.map((privilege) => {
                      const displayName = privilege.name_ar || privilege.name_en || privilege.code;
                      const isSelected = selectedExtraPrivilegeIds.includes(privilege.id);
                      const inPackage = selectedPackageCodes.has(privilege.code);
                      return (
                        <label
                          key={privilege.id}
                          className={`flex items-center gap-2.5 rounded-lg border-2 px-3 py-2 cursor-pointer transition-all ${inPackage
                            ? "bg-emerald-50 border-emerald-200 opacity-70 cursor-not-allowed"
                            : isSelected
                              ? "bg-blue-50 border-blue-400 shadow-sm"
                              : "bg-background border-border hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-blue-500 shrink-0"
                            checked={isSelected || inPackage}
                            disabled={inPackage}
                            onChange={() => !inPackage && toggleExtra(privilege.id)}
                          />
                          <span className="flex-1 min-w-0">
                            <span className={`block text-xs font-semibold truncate ${inPackage ? "text-emerald-800" : isSelected ? "text-blue-900" : "text-foreground"}`}>
                              {displayName}
                              {inPackage && <span className="mr-1 text-[10px] font-normal text-emerald-600">(في الحزمة)</span>}
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
            ? <><strong className="text-foreground">{totalPrivilegesCount}</strong> صلاحية محددة</>
            : "لم يتم تحديد أي صلاحيات"}
        </p>
        <Button
          onClick={() => void handleAssign()}
          disabled={isSaving || totalPrivilegesCount === 0}
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "جاري الحفظ..." : "حفظ وتعيين الصلاحيات"}
        </Button>
      </div>
    </div>
  );
}
