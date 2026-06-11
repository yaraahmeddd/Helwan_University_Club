import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, Package, Shield, Loader2, Check,
  Search, X, Save, RotateCcw,
} from "lucide-react";
import api from '@/services/axios';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from "react-i18next";
import { useLanguage } from '@/hooks/useLanguage';
import { compareLocalizedText, getPrivilegeDisplayName, getPrivilegeModuleLabel, shouldShowPrivilegeCode } from '@/lib/privilegeModuleLabels';
import { FormErrorAlert } from '@/components/shared/FormErrorAlert';
import { getApiErrorMessage } from '@/lib/appErrors';
import { useAdminFieldValidation } from '@/hooks/useAdminFieldValidation';
import { validateAdminPackageForm } from '@/lib/validation/adminForms';
import { Input } from '@/components/StaffPagesComponents/ui/input';
import { Button } from '@/components/StaffPagesComponents/ui/button';
import { Badge } from '@/components/StaffPagesComponents/ui/badge';
import { AdminPageHeader } from '@/components/StaffPagesComponents/shared/AdminPageHeader';

const theme = {
  primaryDark: "#1F3A5F",
  accentBlue: "#2EA7C9",
  background: "#F4F6F9",
  border: "#E5E7EB",
};

const hiddenHorizontalScrollbar =
  "overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

type PrivilegeItem = {
  id: number;
  nameAr?: string;
  nameEn?: string;
  code?: string;
  labelKey?: string;
};

type ModuleItem = {
  id: string;
  moduleKey: string;
  privileges: PrivilegeItem[];
};

const toModuleId = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const privilegeDisplayName = (
  privilege: PrivilegeItem,
  language: "ar" | "en",
  t: (key: string) => string,
) => {
  if (privilege.labelKey) return t(privilege.labelKey);
  return getPrivilegeDisplayName(privilege.nameAr, privilege.nameEn, privilege.code ?? "", language);
};

export default function PrivilegePackageAdminPage() {
  const { toast } = useToast();
  const { t } = useTranslation("PrivilegePackageAdminPage");
  const { t: tCommon } = useTranslation("common");
  const { language, isRTL } = useLanguage();
  const { tVal } = useAdminFieldValidation();

  const mockModules: ModuleItem[] = useMemo(() => [
    {
      id: "members",
      moduleKey: "members",
      privileges: [
        { id: -1, labelKey: "mockPrivileges.addMember" },
        { id: -2, labelKey: "mockPrivileges.editMember" },
        { id: -3, labelKey: "mockPrivileges.deleteMember" },
        { id: -4, labelKey: "mockPrivileges.printMemberCard" },
      ],
    },
    {
      id: "teams",
      moduleKey: "teams",
      privileges: [
        { id: -5, labelKey: "mockPrivileges.addTeam" },
        { id: -6, labelKey: "mockPrivileges.editTeam" },
        { id: -7, labelKey: "mockPrivileges.deleteTeam" },
      ],
    },
    {
      id: "media",
      moduleKey: "media",
      privileges: [
        { id: -8, labelKey: "mockPrivileges.addMedia" },
        { id: -9, labelKey: "mockPrivileges.deleteMedia" },
      ],
    },
    {
      id: "finance",
      moduleKey: "finance",
      privileges: [
        { id: -10, labelKey: "mockPrivileges.viewFinance" },
        { id: -11, labelKey: "mockPrivileges.createTransaction" },
        { id: -12, labelKey: "mockPrivileges.editTransaction" },
        { id: -13, labelKey: "mockPrivileges.deleteTransaction" },
      ],
    },
  ], []);

  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const [modules, setModules] = useState<ModuleItem[]>(mockModules);
  const [loadingModules, setLoadingModules] = useState(true);
  const [selectedPrivileges, setSelectedPrivileges] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const [globalSearch, setGlobalSearch] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "selected" | "unselected">("all");
  const [selectedSearch, setSelectedSearch] = useState("");
  const [activeModuleTab, setActiveModuleTab] = useState<string | null>(null);
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
    const load = async () => {
      try {
        const res = await api.get<{ data?: Record<string, unknown[]> }>("/staff/privileges");
        const grouped = res?.data?.data;
        if (!grouped || Array.isArray(grouped) || typeof grouped !== "object") return;

        const apiModules: ModuleItem[] = Object.entries(grouped as Record<string, unknown[]>)
          .map(([moduleName, list]) => ({
            id: toModuleId(moduleName),
            moduleKey: moduleName,
            privileges: Array.isArray(list)
              ? list
                .map((item) => {
                  const priv = item as Record<string, unknown>;
                  const id = Number(priv?.id);
                  const nameAr = String(priv?.name_ar ?? "").trim();
                  const nameEn = String(priv?.name_en ?? "").trim();
                  const code = String(priv?.code ?? "").trim();
                  return { id, nameAr: nameAr || undefined, nameEn: nameEn || undefined, code: code || undefined };
                })
                .filter((p) => Number.isFinite(p.id) && p.id > 0 && (p.nameAr || p.nameEn || p.code))
              : [],
          }))
          .filter((m) => m.privileges.length > 0)
          .sort((a, b) =>
            compareLocalizedText(
              getPrivilegeModuleLabel(a.moduleKey, language),
              getPrivilegeModuleLabel(b.moduleKey, language),
              language,
            ),
          );

        if (apiModules.length > 0) {
          setModules(apiModules);
          setActiveModuleTab(apiModules[0].id);
        }
      } catch {
        setActiveModuleTab(mockModules[0]?.id ?? null);
      } finally {
        setLoadingModules(false);
      }
    };
    void load();
  }, [language, mockModules]);

  const totalPrivileges = useMemo(
    () => modules.reduce((s, m) => s + m.privileges.length, 0),
    [modules],
  );
  const selectedCount = selectedPrivileges.size;

  const filteredModules = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return modules
      .map((m) => {
        let privs = m.privileges;
        if (q) {
          privs = privs.filter((p) => {
            const label = privilegeDisplayName(p, language, t).toLowerCase();
            const mod = getPrivilegeModuleLabel(m.moduleKey, language).toLowerCase();
            return label.includes(q) || mod.includes(q) || m.moduleKey.toLowerCase().includes(q);
          });
        }
        if (viewFilter === "selected") privs = privs.filter((p) => selectedPrivileges.has(p.id));
        if (viewFilter === "unselected") privs = privs.filter((p) => !selectedPrivileges.has(p.id));
        return { ...m, privileges: privs };
      })
      .filter((m) => m.privileges.length > 0);
  }, [modules, globalSearch, viewFilter, selectedPrivileges, language, t]);

  const currentModuleTab =
    activeModuleTab && filteredModules.some((m) => m.id === activeModuleTab)
      ? activeModuleTab
      : filteredModules[0]?.id ?? null;

  const activeModule = useMemo(
    () => filteredModules.find((m) => m.id === currentModuleTab) ?? null,
    [filteredModules, currentModuleTab],
  );

  const selectedItems = useMemo(() => {
    const sq = selectedSearch.trim().toLowerCase();
    const items: Array<{ moduleKey: string; privilege: PrivilegeItem }> = [];
    modules.forEach((m) => {
      m.privileges.forEach((p) => {
        if (!selectedPrivileges.has(p.id)) return;
        const label = privilegeDisplayName(p, language, t).toLowerCase();
        if (sq && !label.includes(sq)) return;
        items.push({ moduleKey: m.moduleKey, privilege: p });
      });
    });
    return items;
  }, [modules, selectedPrivileges, selectedSearch, language, t]);

  const togglePrivilege = (id: number) => {
    setSelectedPrivileges((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleModule = (moduleId: string) => {
    const m = modules.find((x) => x.id === moduleId);
    if (!m) return;
    setSelectedPrivileges((prev) => {
      const next = new Set(prev);
      const allSel = m.privileges.every((p) => next.has(p.id));
      if (allSel) m.privileges.forEach((p) => next.delete(p.id));
      else m.privileges.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const handleReset = () => {
    setPackageName("");
    setDescription("");
    setSelectedPrivileges(new Set());
    setError("");
    setSelectedSearch("");
    setGlobalSearch("");
    setViewFilter("all");
  };

  const handleSave = async () => {
    setError("");
    const formErrors = validateAdminPackageForm({ name: packageName, description }, tVal);
    if (Object.keys(formErrors).length > 0) {
      setError(Object.values(formErrors)[0] ?? t("errors.nameRequired"));
      return;
    }
    if (selectedPrivileges.size === 0) {
      setError(t("errors.minPrivilege"));
      return;
    }
    const privilegeIds = Array.from(selectedPrivileges);
    if (privilegeIds.some((id) => id < 0)) {
      setError(t("errors.notLoaded"));
      return;
    }
    setIsSaving(true);
    try {
      const code = packageName.trim().toUpperCase()
        .replace(/[\u0600-\u06FF\s]+/g, "_")
        .replace(/[^A-Z0-9_]/g, "")
        .replace(/^_+|_+$/g, "") || `PKG_${Date.now()}`;
      await api.post("/staff/packages", {
        code,
        name_en: packageName.trim(),
        name_ar: packageName.trim(),
        description: description.trim() || undefined,
        privilege_ids: privilegeIds,
      });
      toast({ title: t("toast.saveSuccessTitle"), description: t("toast.saveSuccessDesc") });
      handleReset();
    } catch (err) {
      setError(getApiErrorMessage(err, tCommon, t("errors.saveError")));
    } finally {
      setIsSaving(false);
    }
  };

  const activeModuleSelectedCount = activeModule
    ? activeModule.privileges.filter((p) => selectedPrivileges.has(p.id)).length
    : 0;
  const activeModuleAllSelected = activeModule
    ? activeModule.privileges.length > 0 && activeModuleSelectedCount === activeModule.privileges.length
    : false;

  return (
    <div
      className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
      lang={language}
    >
      <AdminPageHeader
        icon={Package}
        title={t("page.title")}
        subtitle={
          loadingModules
            ? t("page.loading")
            : t("page.stats", { total: totalPrivileges, modules: modules.length })
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-border bg-primary/5 px-3 py-2 text-center min-w-[88px]">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("page.selectedPrivileges")}</p>
              <p className="text-lg font-bold text-primary">{selectedCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-center min-w-[88px]">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("page.total")}</p>
              <p className="text-lg font-bold text-foreground">{totalPrivileges}</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-center min-w-[88px]">
              <p className="text-[10px] uppercase tracking-wide text-primary">{t("page.modulesCount")}</p>
              <p className="text-lg font-bold text-primary">{modules.length}</p>
            </div>
          </div>
        }
      />

      {/* Main scroll area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 space-y-6">

          {/* Package details — horizontal form row */}
          <section className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: theme.border }}>
            <div className="px-5 py-4 border-b bg-gray-50/80" style={{ borderColor: theme.border }}>
              <h2 className="font-semibold text-base text-gray-900">{t("page.packageDetails")}</h2>
              <p className="text-xs text-gray-500 mt-1">{t("page.packageDetailsSubtitle")}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold text-gray-700 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>
                    {t("page.packageName")}
                  </label>
                  <Input
                    value={packageName}
                    onChange={(e) => { setPackageName(e.target.value); setError(""); }}
                    placeholder={t("page.packageNamePlaceholder")}
                    className="h-10"
                    dir="auto"
                    style={{ borderColor: error && !packageName.trim() ? "#EF4444" : undefined }}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold text-gray-700 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>
                    {t("page.description")}{" "}
                    <span className="text-gray-400 font-normal">{t("page.optional")}</span>
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("page.descriptionPlaceholder")}
                    className="h-10"
                    dir="auto"
                  />
                </div>
              </div>
              <FormErrorAlert message={error} onDismiss={() => setError("")} />
            </div>
          </section>

          {/* Privileges — horizontal tabs + grid */}
          <section className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: theme.border }}>
            <div className="px-5 py-4 border-b bg-gray-50/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" style={{ borderColor: theme.border }}>
              <div>
                <h2 className="font-semibold text-base flex items-center gap-2 text-gray-900">
                  <Shield className="w-4 h-4" style={{ color: theme.accentBlue }} />
                  {t("page.privilegesTitle")}
                </h2>
                <p className="text-xs text-gray-500 mt-1">{t("page.privilegesSubtitle")}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:flex-1 lg:max-w-xl lg:ms-auto">
                <div className="relative flex-1">
                  <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none`} />
                  <Input
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder={t("page.searchPlaceholder")}
                    className={`h-9 ${isRTL ? "pr-9" : "pl-9"} text-sm`}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-b flex flex-wrap gap-1.5" style={{ borderColor: theme.border }}>
              {(["all", "selected", "unselected"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setViewFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={viewFilter === f
                    ? { backgroundColor: theme.primaryDark, color: "white" }
                    : { backgroundColor: theme.border, color: "#4B5563" }}
                >
                  {f === "all" ? t("page.all") : f === "selected" ? t("page.selectedFilter", { count: selectedCount }) : t("page.unselectedFilter")}
                </button>
              ))}
              {(globalSearch || viewFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => { setGlobalSearch(""); setViewFilter("all"); }}
                  className="px-2 py-1.5 rounded-full text-xs text-gray-500 hover:text-red-500 transition-colors inline-flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> {t("page.clear")}
                </button>
              )}
            </div>

            <div className="p-5">
              {loadingModules ? (
                <div className="flex items-center justify-center gap-3 py-12 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.accentBlue }} />
                  <p className="text-sm">{t("page.loading")}</p>
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 border border-dashed rounded-xl bg-gray-50/50" style={{ borderColor: theme.border }}>
                  <Shield className="w-10 h-10 opacity-30 mb-3" />
                  <p className="text-sm font-medium">{t("page.noResults")}</p>
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
                      aria-label={t("page.scrollPrev")}
                    >
                      {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                    <div ref={moduleTabsRef} className={`flex gap-2 flex-1 min-w-0 pb-1 ${hiddenHorizontalScrollbar}`}>
                      {filteredModules.map((m) => {
                        const moduleSelectedCount = m.privileges.filter((p) => selectedPrivileges.has(p.id)).length;
                        const isActive = m.id === currentModuleTab;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setActiveModuleTab(m.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border"
                            style={isActive
                              ? { backgroundColor: theme.primaryDark, color: "white", borderColor: theme.primaryDark }
                              : { backgroundColor: "#F9FAFB", color: "#6B7280", borderColor: theme.border }}
                          >
                            {getPrivilegeModuleLabel(m.moduleKey, language)}
                            {moduleSelectedCount > 0 && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
                                style={isActive
                                  ? { backgroundColor: "rgba(255,255,255,0.2)", color: "white" }
                                  : { backgroundColor: `${theme.accentBlue}20`, color: theme.accentBlue }}
                                dir="ltr"
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
                      aria-label={t("page.scrollNext")}
                    >
                      {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    {activeModule && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 h-8 text-xs gap-1.5 hidden sm:inline-flex"
                        onClick={() => toggleModule(activeModule.id)}
                      >
                        {activeModuleAllSelected ? t("page.deselectAll") : t("page.selectAll")}
                      </Button>
                    )}
                  </div>

                  {activeModule ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                      {activeModule.privileges.map((p) => {
                        const isSelected = selectedPrivileges.has(p.id);
                        const displayName = privilegeDisplayName(p, language, t);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePrivilege(p.id)}
                            className="group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-start transition-all min-h-[52px]"
                            style={isSelected
                              ? { borderColor: theme.accentBlue, backgroundColor: `${theme.accentBlue}10`, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }
                              : { borderColor: theme.border, backgroundColor: "white" }}
                          >
                            <div
                              className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
                              style={isSelected
                                ? { backgroundColor: theme.accentBlue, borderColor: theme.accentBlue, color: "white" }
                                : { borderColor: "#D1D5DB", backgroundColor: "white" }}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="text-xs font-semibold leading-tight line-clamp-2"
                                style={{ color: isSelected ? theme.accentBlue : "#111827" }}
                              >
                                {displayName}
                              </p>
                              {p.code && shouldShowPrivilegeCode(language) && (
                                <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate">{p.code}</p>
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

          {/* Selected preview — horizontal chips */}
          <section className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: theme.border }}>
            <div className="px-5 py-4 border-b bg-gray-50/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderColor: theme.border }}>
              <div>
                <h2 className="font-semibold text-base text-gray-900">{t("page.selectedTitle")}</h2>
                <p className="text-xs text-gray-500 mt-1">{t("page.selectedPreviewSubtitle")}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCount > 0 && (
                  <>
                    <div className="relative w-full sm:w-48">
                      <Search className={`absolute ${isRTL ? "right-2.5" : "left-2.5"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none`} />
                      <Input
                        value={selectedSearch}
                        onChange={(e) => setSelectedSearch(e.target.value)}
                        placeholder={t("page.sidebarSearch")}
                        className={`h-8 text-xs ${isRTL ? "pr-8" : "pl-8"}`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setSelectedPrivileges(new Set())}
                    >
                      {t("page.clearAll")}
                    </Button>
                  </>
                )}
                {selectedCount > 0 && (
                  <Badge className="shrink-0" style={{ backgroundColor: `${theme.accentBlue}15`, color: theme.accentBlue }}>
                    {selectedCount}
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-5">
              {selectedCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 border border-dashed rounded-xl bg-gray-50/40" style={{ borderColor: theme.border }}>
                  <Check className="w-8 h-8 mb-3 opacity-30" style={{ color: theme.accentBlue }} />
                  <p className="text-sm font-medium text-gray-500">{t("page.noSelectedTitle")}</p>
                  <p className="text-xs mt-1 max-w-sm">{t("page.noSelectedDesc")}</p>
                </div>
              ) : selectedItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">{t("page.noSidebarResults")}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map(({ moduleKey, privilege: p }) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 max-w-full rounded-lg border px-2.5 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: theme.accentBlue, borderColor: theme.accentBlue }}
                    >
                      <span className="truncate">{privilegeDisplayName(p, language, t)}</span>
                      <span className="opacity-70 text-[10px] shrink-0 hidden sm:inline">
                        ({getPrivilegeModuleLabel(moduleKey, language)})
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePrivilege(p.id)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors shrink-0"
                        aria-label={t("page.remove")}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t bg-white"
        style={{ borderColor: theme.border }}
      >
        <p className="text-sm text-gray-600">
          <span className="font-bold mx-1" style={{ color: theme.accentBlue }}>{selectedCount}</span>
          {t("page.selectedSummarySuffix")}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {t("page.cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="gap-2 min-w-[140px] text-white"
            style={{ backgroundColor: theme.primaryDark }}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? t("page.saving") : t("page.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
