import { useEffect, useMemo, useState } from "react";
import { ChevronDown, X, Search, CheckSquare, Square } from "lucide-react";
import api from "../services/axios";
import { useToast } from "../hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { getLocalizedText } from "../lib/localizedDisplay";

// ─── Brand tokens (unchanged) ────────────────────────────────────────────────
const theme = {
  primaryDark: "#1F3A5F",
  accentBlue: "#2EA7C9",
  background: "#F4F6F9",
  border: "#E5E7EB",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type PrivilegeItem = {
  id: number;
  nameAr?: string;
  nameEn?: string;
  labelKey?: string;
};

type ModuleItem = { id: string; name: string; privileges: PrivilegeItem[] };

const privilegeDisplayName = (
  privilege: PrivilegeItem,
  language: "ar" | "en",
  t: (key: string) => string,
) => {
  if (privilege.labelKey) return t(privilege.labelKey);
  return getLocalizedText(privilege.nameAr, privilege.nameEn, language) || "";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toModuleId = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PrivilegePackageAdminPage() {
  const { toast } = useToast();
  const { t } = useTranslation("PrivilegePackageAdminPage");
  const { language, isRTL } = useLanguage();

  const mockModules: ModuleItem[] = [
    {
      id: "members",
      name: t("modules.members"),
      privileges: [
        { id: -1, labelKey: "mockPrivileges.addMember" },
        { id: -2, labelKey: "mockPrivileges.editMember" },
        { id: -3, labelKey: "mockPrivileges.deleteMember" },
        { id: -4, labelKey: "mockPrivileges.printMemberCard" },
      ],
    },
    {
      id: "teams",
      name: t("modules.teams"),
      privileges: [
        { id: -5, labelKey: "mockPrivileges.addTeam" },
        { id: -6, labelKey: "mockPrivileges.editTeam" },
        { id: -7, labelKey: "mockPrivileges.deleteTeam" },
      ],
    },
    {
      id: "media",
      name: t("modules.media"),
      privileges: [
        { id: -8, labelKey: "mockPrivileges.addMedia" },
        { id: -9, labelKey: "mockPrivileges.deleteMedia" },
      ],
    },
    {
      id: "finance",
      name: t("modules.finance"),
      privileges: [
        { id: -10, labelKey: "mockPrivileges.viewFinance" },
        { id: -11, labelKey: "mockPrivileges.createTransaction" },
        { id: -12, labelKey: "mockPrivileges.editTransaction" },
        { id: -13, labelKey: "mockPrivileges.deleteTransaction" },
      ],
    },
  ];

  const getModuleLabel = (name: string): string => {
    const key = name.toLowerCase().trim().replace(/[-\s]/g, "_");
    const trans = t(`modules.${key}`);
    // If translation doesn't exist, i18next returns the key string
    if (trans && !trans.startsWith("modules.")) {
      return trans;
    }
    const exactTrans = t(`modules.${name.toLowerCase().trim()}`);
    if (exactTrans && !exactTrans.startsWith("modules.")) {
      return exactTrans;
    }
    return name;
  };

  // Form fields
  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Privilege data
  const [modules, setModules] = useState<ModuleItem[]>(mockModules);
  const [loadingModules, setLoadingModules] = useState(true);
  const [selectedPrivileges, setSelectedPrivileges] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // UX state
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [globalSearch, setGlobalSearch] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "selected" | "unselected">("all");
  const [sidebarSearch, setSidebarSearch] = useState("");

  // ── Load privileges from API ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<{ data?: Record<string, unknown[]> }>("/staff/privileges");
        const grouped = res?.data?.data;
        if (!grouped || Array.isArray(grouped) || typeof grouped !== "object") return;

        const apiModules: ModuleItem[] = Object.entries(grouped as Record<string, unknown[]>)
          .map(([moduleName, list]) => ({
            id: toModuleId(moduleName),
            name: getModuleLabel(moduleName),
            privileges: Array.isArray(list)
              ? list
                .map((item) => {
                  const priv = item as Record<string, unknown>;
                  const id = Number(priv?.id);
                  const nameAr = String(priv?.name_ar ?? "").trim();
                  const nameEn = String(priv?.name_en ?? "").trim();
                  const code = String(priv?.code ?? "").trim();
                  return {
                    id,
                    nameAr: nameAr || undefined,
                    nameEn: nameEn || code || undefined,
                  };
                })
                .filter((p) => Number.isFinite(p.id) && p.id > 0 && (p.nameAr || p.nameEn))
              : [],
          }))
          .filter((m) => m.privileges.length > 0);

        if (apiModules.length > 0) {
          setModules(apiModules);
          // Default: expand the first module
          setExpandedModules(new Set([apiModules[0].id]));
        }
      } catch {
        // keep fallback
        setExpandedModules(new Set([mockModules[0].id]));
      } finally {
        setLoadingModules(false);
      }
    };
    void load();
  }, [language, t]);

  // ── Computed values ────────────────────────────────────────────────────────

  const totalPrivileges = useMemo(() => modules.reduce((s, m) => s + m.privileges.length, 0), [modules]);
  const selectedCount = selectedPrivileges.size;


  // Filtered modules for center column
  const filteredModules = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return modules
      .map((m) => {
        let privs = m.privileges;
        if (q) {
          privs = privs.filter((p) => {
            const label = privilegeDisplayName(p, language, t).toLowerCase();
            return label.includes(q) || m.name.toLowerCase().includes(q);
          });
        }
        if (viewFilter === "selected") privs = privs.filter((p) => selectedPrivileges.has(p.id));
        if (viewFilter === "unselected") privs = privs.filter((p) => !selectedPrivileges.has(p.id));
        return { ...m, privileges: privs };
      })
      .filter((m) => m.privileges.length > 0);
  }, [modules, globalSearch, viewFilter, selectedPrivileges, language, t]);

  // Sidebar: selected items grouped by module, filtered by sidebarSearch
  const sidebarGroups = useMemo(() => {
    const sq = sidebarSearch.trim().toLowerCase();
    return modules
      .map((m) => ({
        moduleId: m.id,
        moduleName: m.name,
        items: m.privileges.filter(
          (p) => selectedPrivileges.has(p.id) && (!sq || privilegeDisplayName(p, language, t).toLowerCase().includes(sq))
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [modules, selectedPrivileges, sidebarSearch, language, t]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const togglePrivilege = (id: number) => {
    setSelectedPrivileges((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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

  const toggleExpand = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId);
      return next;
    });
  };

  const handleReset = () => {
    setPackageName(""); setDescription(""); setSelectedPrivileges(new Set()); setError(""); setSidebarSearch(""); setGlobalSearch(""); setViewFilter("all");
  };

  const handleSave = async () => {
    setError("");
    if (!packageName.trim()) { setError(t("errors.nameRequired")); return; }
    if (selectedPrivileges.size === 0) { setError(t("errors.minPrivilege")); return; }
    const privilegeIds = Array.from(selectedPrivileges);
    if (privilegeIds.some((id) => id < 0)) {
      setError(t("errors.notLoaded"));
      return;
    }
    setIsSaving(true);
    try {
      const code = packageName.trim().toUpperCase()
        .replace(/[\u0600-\u06FF\s]+/g, "_").replace(/[^A-Z0-9_]/g, "")
        .replace(/^_+|_+$/g, "") || `PKG_${Date.now()}`;
      await api.post("/staff/packages", {
        code, name_en: packageName.trim(), name_ar: packageName.trim(),
        description: description.trim() || undefined, privilege_ids: privilegeIds,
      });
      toast({ title: t("toast.saveSuccessTitle"), description: t("toast.saveSuccessDesc") });
      handleReset();
    } catch (err) {
      console.error(err);
      setError(t("errors.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden" dir={isRTL ? "rtl" : "ltr"} style={{ backgroundColor: theme.background }}>

      {/* ── Compact Header ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white shrink-0" style={{ borderColor: theme.border }}>
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className="text-xl font-bold" style={{ color: theme.primaryDark }}>{t("page.title")}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {loadingModules ? t("page.loading") : t("page.stats", { total: totalPrivileges, modules: modules.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Progress pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border"
            style={{ borderColor: theme.accentBlue, color: theme.accentBlue, backgroundColor: `${theme.accentBlue}12` }}>
            <span>{selectedCount}</span>
            <span className="text-gray-400 font-normal">/</span>
            <span className="text-gray-500 font-normal">{totalPrivileges}</span>
            <span className="text-gray-500 font-normal text-xs">{t("page.selected")}</span>
          </div>
        </div>
      </div>

      {/* ── 3-column body ── */}
      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── LEFT: Package form (sticky, 25%) ── */}
        <div className={`w-64 shrink-0 flex flex-col ${isRTL ? "border-l" : "border-r"} overflow-y-auto bg-white`} style={{ borderColor: theme.border }}>
          <div className="p-4 space-y-4 flex-1">
            <p className={`text-xs font-bold uppercase tracking-widest text-gray-400 ${isRTL ? "text-right" : "text-left"}`}>{t("page.packageDetails")}</p>

            {/* Package name */}
            <div>
              <label className={`block text-sm font-semibold text-gray-700 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>{t("page.packageName")}</label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder={t("page.packageNamePlaceholder")}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: error && !packageName.trim() ? "#EF4444" : theme.border }}
                dir="auto"
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-semibold text-gray-700 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>
                {t("page.description")} <span className="text-gray-400 font-normal">{t("page.optional")}</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("page.descriptionPlaceholder")}
                rows={3}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                style={{ borderColor: theme.border }}
                dir="auto"
              />
            </div>

            {/* Error */}
            {error && (
              <div className={`text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 ${isRTL ? "text-right" : "text-left"}`}>
                {error}
              </div>
            )}

            {/* Stats */}
            <div className="rounded-xl p-3 border space-y-2" style={{ borderColor: theme.border, backgroundColor: `${theme.accentBlue}08` }}>
              <p className={`text-xs font-bold text-gray-500 uppercase tracking-wide ${isRTL ? "text-right" : "text-left"}`}>{t("page.statsTitle")}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t("page.selectedPrivileges")}</span>
                <span className="font-bold" style={{ color: theme.accentBlue }}>{selectedCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t("page.total")}</span>
                <span className="font-bold text-gray-700">{totalPrivileges}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden" dir="ltr">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${totalPrivileges > 0 ? (selectedCount / totalPrivileges) * 100 : 0}%`, backgroundColor: theme.accentBlue }}
                />
              </div>
              <div className={`text-[10px] text-gray-400 ${isRTL ? "text-right" : "text-left"}`} dir="ltr">
                {totalPrivileges > 0 ? Math.round((selectedCount / totalPrivileges) * 100) : 0}%
              </div>
            </div>

            {/* Module breakdown */}
            {selectedCount > 0 && (
              <div className="space-y-1">
                <p className={`text-xs font-bold text-gray-400 uppercase tracking-wide ${isRTL ? "text-right" : "text-left"}`}>{t("page.moduleDistribution")}</p>
                {modules.map((m) => {
                  const count = m.privileges.filter((p) => selectedPrivileges.has(p.id)).length;
                  if (count === 0) return null;
                  return (
                    <div key={m.id} className="flex items-center justify-between text-xs py-1">
                      <span className="text-gray-600 truncate">{m.name}</span>
                      <span className={`shrink-0 font-semibold text-gray-800 ${isRTL ? "ml-1" : "mr-1"}`} dir="ltr">{count}/{m.privileges.length}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Modules accordion (scrollable, 50%) ── */}
        <div className={`flex-1 flex flex-col min-w-0 ${isRTL ? "border-l" : "border-r"}`} style={{ borderColor: theme.border }}>

          {/* Search + filter bar */}
          <div className="px-4 py-3 border-b bg-white shrink-0" style={{ borderColor: theme.border }}>
            <div className="relative mb-3">
              <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder={t("page.searchPlaceholder")}
                className={`w-full ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"} py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all`}
                style={{ borderColor: theme.border }}
              />
            </div>
            {/* Quick filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "selected", "unselected"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setViewFilter(f)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={viewFilter === f
                    ? { backgroundColor: theme.primaryDark, color: "white" }
                    : { backgroundColor: theme.border, color: "#4B5563" }
                  }
                >
                  {f === "all" ? t("page.all") : f === "selected" ? t("page.selectedFilter", { count: selectedCount }) : t("page.unselectedFilter")}
                </button>
              ))}
              {(globalSearch || viewFilter !== "all") && (
                <button
                  onClick={() => { setGlobalSearch(""); setViewFilter("all"); }}
                  className="px-2 py-1 rounded-full text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> {t("page.clear")}
                </button>
              )}
            </div>
          </div>

          {/* Accordion list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingModules ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-white border animate-pulse" style={{ borderColor: theme.border }} />
              ))
            ) : filteredModules.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">{t("page.noResults")}</div>
            ) : (
              filteredModules.map((m) => {
                const isExpanded = expandedModules.has(m.id);
                const moduleSelected = m.privileges.filter((p) => selectedPrivileges.has(p.id)).length;
                const allSel = moduleSelected === m.privileges.length && m.privileges.length > 0;
                const someSel = moduleSelected > 0 && !allSel;

                return (
                  <div key={m.id} className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: theme.border }}>
                    {/* Module header */}
                    <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(m.id)}>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? "" : (isRTL ? "rotate-90" : "-rotate-90")}`} />
                      <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
                        <p className="font-semibold text-gray-800 text-sm truncate">{m.name}</p>
                        <p className="text-[11px] text-gray-400">{t("page.privilegeCount", { count: m.privileges.length })}</p>
                      </div>

                      {/* Selection badge */}
                      {moduleSelected > 0 && (
                        <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: allSel ? theme.accentBlue : `${theme.accentBlue}99` }} dir="ltr">
                          {moduleSelected}/{m.privileges.length}
                        </span>
                      )}

                      {/* Select all / None toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleModule(m.id); }}
                        className="shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all hover:shadow-sm"
                        style={allSel
                          ? { borderColor: theme.accentBlue, color: theme.accentBlue, backgroundColor: `${theme.accentBlue}12` }
                          : { borderColor: theme.border, color: "#6B7280" }
                        }
                        title={allSel ? t("page.deselectAll") : t("page.selectAll")}
                      >
                        {allSel ? <CheckSquare className="w-3.5 h-3.5" /> : someSel ? <CheckSquare className="w-3.5 h-3.5 opacity-50" /> : <Square className="w-3.5 h-3.5" />}
                        {allSel ? t("page.deselectAll") : t("page.selectAll")}
                      </button>
                    </div>

                    {/* Privilege chips */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2 border-t" style={{ borderColor: theme.border }}>
                        {m.privileges.map((p) => {
                          const sel = selectedPrivileges.has(p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => togglePrivilege(p.id)}
                              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border"
                              style={sel
                                ? { backgroundColor: theme.accentBlue, color: "white", borderColor: theme.accentBlue }
                                : { backgroundColor: "white", color: "#374151", borderColor: theme.border }
                              }
                            >
                              {privilegeDisplayName(p, language, t)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Selected privileges sidebar (sticky, 25%) ── */}
        <div className={`w-64 shrink-0 flex flex-col bg-white ${isRTL ? "border-r" : "border-l"}`} style={{ borderColor: theme.border }}>
          <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("page.selectedTitle")}</p>
              {selectedCount > 0 && (
                <button
                  onClick={() => setSelectedPrivileges(new Set())}
                  className="text-[11px] text-red-500 hover:text-red-600 transition-colors font-medium"
                >
                  {t("page.clearAll")}
                </button>
              )}
            </div>
            {selectedCount > 0 && (
              <div className="relative">
                <Search className={`absolute ${isRTL ? "right-2.5" : "left-2.5"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400`} />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder={t("page.sidebarSearch")}
                  className={`w-full ${isRTL ? "pr-8 pl-2" : "pl-8 pr-2"} py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 transition-all`}
                  style={{ borderColor: theme.border }}
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {selectedCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-gray-400">
                <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${theme.accentBlue}12` }}>
                  <CheckSquare className="w-6 h-6" style={{ color: theme.accentBlue }} />
                </div>
                <p className="text-sm font-medium text-gray-500">{t("page.noSelectedTitle")}</p>
                <p className="text-xs mt-1 leading-relaxed">{t("page.noSelectedDesc")}</p>
              </div>
            ) : sidebarGroups.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">{t("page.noSidebarResults")}</p>
            ) : (
              <div className="space-y-4">
                {sidebarGroups.map((g) => (
                  <div key={g.moduleId}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1 ${isRTL ? "text-right" : "text-left"}`}>{g.moduleName}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: theme.accentBlue }}
                        >
                          {privilegeDisplayName(p, language, t)}
                          <button
                            onClick={() => togglePrivilege(p.id)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            title={t("page.remove")}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Floating action bar ── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-t shrink-0"
        style={{ backgroundColor: "white", borderColor: theme.border }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            <span className="font-bold mx-1" style={{ color: theme.accentBlue }}>{selectedCount}</span> {t("page.selectedSummarySuffix")}
          </span>
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
          >
            {t("page.cancel")}
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            style={{ backgroundColor: theme.primaryDark }}
          >
            {isSaving ? t("page.saving") : t("page.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
