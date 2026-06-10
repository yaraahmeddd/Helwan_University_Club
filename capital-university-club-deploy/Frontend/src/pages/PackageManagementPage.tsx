import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, ShieldCheck, X, AlertTriangle, Eye, Search, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from "../services/axios";
import { useToast } from "../hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { getLanguageOnlyText, localeFontFamily, type DisplayLanguage } from "../lib/localizedDisplay";
import {
  compareLocalizedText,
  getPrivilegeDisplayName,
  getPrivilegeModuleLabel,
  shouldShowPrivilegeCode,
} from "../lib/privilegeModuleLabels";
import { Button } from "../components/StaffPagesComponents/ui/button";

const packageLabel = (pkg: Package, language: DisplayLanguage) =>
  getLanguageOnlyText(pkg.name_ar, pkg.name_en, language) || "—";

const packageDescription = (pkg: Package, language: DisplayLanguage) =>
  getLanguageOnlyText(pkg.description_ar, pkg.description_en, language);

const privilegeLabel = (p: Privilege, language: DisplayLanguage) =>
  getPrivilegeDisplayName(p.name_ar, p.name_en, p.code ?? "", language) || "—";

const theme = {
  primaryDark: "#1F3A5F",
  accentBlue: "#2EA7C9",
  background: "#F4F6F9",
  border: "#E5E7EB",
};

const hiddenHorizontalScrollbar =
  "overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

const PICKER_GRID_CLASS =
  "grid w-full grid-cols-1 min-[520px]:grid-cols-2 gap-2 auto-rows-fr";

const PICKER_CARD_BASE =
  "flex h-full w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-start transition-all min-h-[52px]";

const PICKER_CHECKBOX_BASE =
  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors";

const toModuleId = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type EditPrivilegeItem = {
  id: number;
  name_ar?: string;
  name_en?: string;
  code?: string;
};

type EditModuleGroup = {
  id: string;
  moduleKey: string;
  privileges: EditPrivilegeItem[];
};

interface Privilege {
  id: number;
  name_ar?: string;
  name_en?: string;
  code?: string;
  module?: string;
}

interface Package {
  id: number;
  code: string;
  name_en: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  privileges?: Privilege[];
}

// ─── Privileges Viewer Modal ──────────────────────────────────────────────────
function PrivilegesModal({
  pkg,
  onClose,
}: {
  pkg: Package;
  onClose: () => void;
}) {
  const { t } = useTranslation("PackageManagementPage");
  const { language, isRTL } = useLanguage();
  const [search, setSearch] = useState("");
  const privileges = pkg.privileges ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return privileges;
    return privileges.filter((p) => {
      const label = privilegeLabel(p, language).toLowerCase();
      const modLabel = getPrivilegeModuleLabel(p.module || "", language).toLowerCase();
      return label.includes(q) || modLabel.includes(q);
    });
  }, [privileges, search, language]);

  const grouped = useMemo(() => {
    const hasModules = filtered.some((p) => p.module);
    if (!hasModules) return null;

    const map = new Map<string, Privilege[]>();
    filtered.forEach((p) => {
      const key = p.module || t("privModal.generalModule");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries());
  }, [filtered, t]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      dir={isRTL ? "rtl" : "ltr"}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: theme.border }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${theme.accentBlue}15` }}>
                <ShieldCheck className="w-4 h-4" style={{ color: theme.accentBlue }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: theme.primaryDark }}>{packageLabel(pkg, language)}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  <span className="font-semibold mx-1" style={{ color: theme.accentBlue }}>{privileges.length}</span>
                  {t("privModal.associatedPrivileges")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("privModal.searchPlaceholder")}
              autoFocus
              className={`w-full ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"} py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all`}
              style={{ borderColor: theme.border }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {search && (
            <p className="text-xs text-gray-400 mt-2">
              {t("privModal.resultsCount", { filtered: filtered.length, total: privileges.length })}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t("privModal.noResults")}</p>
            </div>
          ) : grouped ? (
            <div className="space-y-5">
              {grouped.map(([mod, items]) => (
                <div key={mod}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1 ${isRTL ? "text-right" : "text-left"}`}>
                    {getPrivilegeModuleLabel(mod, language)}
                    <span className="mx-1.5 text-gray-300">({items.length})</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((p) => (
                      <span
                        key={p.id}
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: theme.accentBlue }}
                      >
                        {privilegeLabel(p, language)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filtered.map((p) => (
                <span
                  key={p.id}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: theme.accentBlue }}
                >
                  {privilegeLabel(p, language)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t bg-gray-50 shrink-0 flex justify-end" style={{ borderColor: theme.border }}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border hover:bg-gray-100 transition-colors"
            style={{ borderColor: theme.border }}
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteModal({
  pkg,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  pkg: Package;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  const { t } = useTranslation("PackageManagementPage");
  const { language, isRTL } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className={`text-lg font-bold text-gray-900 mb-1 ${isRTL ? "text-right" : "text-left"}`}>{t("deleteModal.title")}</h2>
              <p className={`text-sm text-gray-500 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
                {t("deleteModal.desc1")} <span className="font-bold text-gray-800">"{packageLabel(pkg, language)}"</span>{t("deleteModal.desc2")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t" style={{ borderColor: theme.border }}>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border hover:bg-gray-100 transition-colors disabled:opacity-40"
            style={{ borderColor: theme.border }}
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? t("common.deleting") : t("deleteModal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal (name, description, privileges) ───────────────────────────────
function EditModal({
  pkg,
  onSave,
  onCancel,
  isSaving,
}: {
  pkg: Package;
  onSave: (
    id: number,
    name: string,
    description: string,
    language: DisplayLanguage,
    privilegeIds: number[],
  ) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const { t } = useTranslation("PackageManagementPage");
  const { language, isRTL } = useLanguage();
  const uiLanguage = language;

  const initialName = getLanguageOnlyText(pkg.name_ar, pkg.name_en, language);

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(packageDescription(pkg, language));
  const [error, setError] = useState("");
  const [modules, setModules] = useState<EditModuleGroup[]>([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set((pkg.privileges ?? []).map((p) => p.id)),
  );
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [privSearch, setPrivSearch] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingPrivileges(true);
      try {
        const res = await api.get<{ data?: Record<string, unknown[]> }>("/staff/privileges");
        const grouped = res?.data?.data;
        if (!grouped || Array.isArray(grouped) || typeof grouped !== "object") return;

        const apiModules: EditModuleGroup[] = Object.entries(grouped as Record<string, unknown[]>)
          .map(([moduleName, list]) => ({
            id: toModuleId(moduleName),
            moduleKey: moduleName,
            privileges: Array.isArray(list)
              ? list
                  .map((item) => {
                    const priv = item as Record<string, unknown>;
                    const id = Number(priv?.id);
                    if (!Number.isFinite(id) || id <= 0) return null;
                    return {
                      id,
                      name_ar: String(priv?.name_ar ?? "").trim() || undefined,
                      name_en: String(priv?.name_en ?? "").trim() || undefined,
                      code: String(priv?.code ?? "").trim() || undefined,
                    } as EditPrivilegeItem;
                  })
                  .filter((p): p is EditPrivilegeItem => p !== null)
              : [],
          }))
          .filter((m) => m.privileges.length > 0)
          .sort((a, b) =>
            compareLocalizedText(
              getPrivilegeModuleLabel(a.moduleKey, uiLanguage),
              getPrivilegeModuleLabel(b.moduleKey, uiLanguage),
              uiLanguage,
            ),
          );

        setModules(apiModules);
        setActiveTab(apiModules[0]?.id ?? null);
      } catch {
        setModules([]);
      } finally {
        setLoadingPrivileges(false);
      }
    };
    void load();
  }, [uiLanguage]);

  const scrollTabs = useCallback((direction: "back" | "forward") => {
    const el = tabsRef.current;
    if (!el) return;
    const amount = Math.max(220, Math.floor(el.clientWidth * 0.55));
    const delta = direction === "back"
      ? (isRTL ? amount : -amount)
      : (isRTL ? -amount : amount);
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, [isRTL]);

  const filteredModules = useMemo(() => {
    const q = privSearch.trim().toLowerCase();
    if (!q) return modules;
    return modules
      .map((m) => ({
        ...m,
        privileges: m.privileges.filter((p) => {
          const label = getPrivilegeDisplayName(p.name_ar, p.name_en, p.code ?? "", uiLanguage).toLowerCase();
          const mod = getPrivilegeModuleLabel(m.moduleKey, uiLanguage).toLowerCase();
          return label.includes(q) || mod.includes(q);
        }),
      }))
      .filter((m) => m.privileges.length > 0);
  }, [modules, privSearch, uiLanguage]);

  const currentTab =
    activeTab && filteredModules.some((m) => m.id === activeTab)
      ? activeTab
      : filteredModules[0]?.id ?? null;

  const activeModule = filteredModules.find((m) => m.id === currentTab);

  const togglePrivilege = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError("");
  };

  const toggleModuleAll = (modulePrivs: EditPrivilegeItem[], selectAll: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      modulePrivs.forEach((p) => {
        if (selectAll) next.add(p.id);
        else next.delete(p.id);
      });
      return next;
    });
    setError("");
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError(t("editModal.nameRequired"));
      return;
    }
    if (selectedIds.size === 0) {
      setError(t("editModal.minPrivilege"));
      return;
    }
    onSave(pkg.id, name.trim(), description.trim(), language, Array.from(selectedIds));
  };

  const moduleSelectedCount = activeModule
    ? activeModule.privileges.filter((p) => selectedIds.has(p.id)).length
    : 0;
  const moduleAllSelected = activeModule
    ? activeModule.privileges.length > 0 && moduleSelectedCount === activeModule.privileges.length
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: theme.border }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: theme.primaryDark }}>{t("editModal.title")}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{t("editModal.subtitle")}</p>
          </div>
          <button type="button" onClick={onCancel} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold text-gray-700 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>{t("editModal.nameLabel")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: error && !name.trim() ? "#EF4444" : theme.border }}
                dir="auto"
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold text-gray-700 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>
                {t("editModal.descLabel")} <span className="text-gray-400 font-normal">{t("editModal.optional")}</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder={t("editModal.descPlaceholder")}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                style={{ borderColor: theme.border }}
                dir="auto"
              />
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: theme.border }}>
            <div className="px-4 py-3 border-b bg-gray-50/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: theme.border }}>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t("editModal.privilegesTitle")}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("editModal.privilegesSubtitle")}</p>
              </div>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full whitespace-nowrap">
                {t("editModal.selectedCount", { count: selectedIds.size })}
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                <input
                  type="text"
                  value={privSearch}
                  onChange={(e) => setPrivSearch(e.target.value)}
                  placeholder={t("editModal.searchPlaceholder")}
                  className={`w-full ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"} py-2 text-sm border rounded-lg focus:outline-none focus:ring-2`}
                  style={{ borderColor: theme.border }}
                />
              </div>

              {loadingPrivileges ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("editModal.privilegesLoading")}
                </div>
              ) : filteredModules.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">{t("editModal.noPrivileges")}</p>
              ) : (
                <>
                  <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: theme.border }}>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => scrollTabs("back")} aria-label={t("editModal.scrollPrev")}>
                      {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                    <div ref={tabsRef} className={`flex flex-1 min-w-0 gap-1.5 pb-1 ${hiddenHorizontalScrollbar}`}>
                      {filteredModules.map((mod) => {
                        const count = mod.privileges.filter((p) => selectedIds.has(p.id)).length;
                        const isActive = mod.id === currentTab;
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => setActiveTab(mod.id)}
                            className={`relative flex shrink-0 items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                              isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {getPrivilegeModuleLabel(mod.moduleKey, uiLanguage)}
                            {count > 0 && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${isActive ? "bg-white/20 text-white" : "bg-primary/15 text-primary"}`}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => scrollTabs("forward")} aria-label={t("editModal.scrollNext")}>
                      {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>

                  {activeModule && (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-500">
                        {getPrivilegeModuleLabel(activeModule.moduleKey, uiLanguage)}
                        <span className="mx-1.5 text-gray-300">({activeModule.privileges.length})</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleModuleAll(activeModule.privileges, !moduleAllSelected)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {moduleAllSelected ? t("editModal.deselectAll") : t("editModal.selectAll")}
                      </button>
                    </div>
                  )}

                  {activeModule && (
                    <div className={PICKER_GRID_CLASS}>
                      {activeModule.privileges.map((privilege) => {
                        const isSelected = selectedIds.has(privilege.id);
                        return (
                          <button
                            key={privilege.id}
                            type="button"
                            onClick={() => togglePrivilege(privilege.id)}
                            className={`group ${PICKER_CARD_BASE} ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border bg-card hover:border-primary/30 hover:bg-muted/40"
                            }`}
                          >
                            <span className={`${PICKER_CHECKBOX_BASE} ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50 bg-background group-hover:border-primary/60"}`}>
                              {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium leading-snug line-clamp-2 ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {getPrivilegeDisplayName(privilege.name_ar, privilege.name_en, privilege.code ?? "", uiLanguage) || "—"}
                              </p>
                              {shouldShowPrivilegeCode(uiLanguage) && privilege.code && (
                                <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">{privilege.code}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {error && <p className={`text-xs text-red-500 ${isRTL ? "text-right" : "text-left"}`}>{error}</p>}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-6 py-4 bg-gray-50 border-t shrink-0" style={{ borderColor: theme.border }}>
          <button type="button" onClick={onCancel} disabled={isSaving} className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border hover:bg-gray-100 transition-colors disabled:opacity-40" style={{ borderColor: theme.border }}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || loadingPrivileges}
            className="w-full sm:w-auto px-6 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isSaving ? t("common.saving") : t("editModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Package Card ─────────────────────────────────────────────────────────────
function PackageCard({
  pkg,
  onEdit,
  onDelete,
  onViewPrivileges,
}: {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
  onViewPrivileges: (pkg: Package) => void;
}) {
  const { t } = useTranslation("PackageManagementPage");
  const { language, isRTL } = useLanguage();
  const privCount = pkg.privileges?.length ?? 0;

  const displayName = packageLabel(pkg, language);
  const displayDescription = packageDescription(pkg, language);

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden" style={{ borderColor: theme.border }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${theme.accentBlue}15` }}>
              <ShieldCheck className="w-5 h-5" style={{ color: theme.accentBlue }} />
            </div>
            <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
              <p
                className="font-bold text-gray-900 text-base leading-tight truncate"
                dir="auto"
                style={{ fontFamily: localeFontFamily(language) }}
              >
                {displayName}
              </p>
              {shouldShowPrivilegeCode(language) && (
                <span className="inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-500">{pkg.code}</span>
              )}
              {displayDescription && (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2" dir="auto">
                  {displayDescription}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEdit(pkg)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
              style={{ borderColor: theme.border }}
              title={t("card.editTooltip")}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(pkg)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all"
              style={{ borderColor: theme.border }}
              title={t("card.deleteTooltip")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: theme.border }}>
          {privCount > 0 ? (
            <button
              onClick={() => onViewPrivileges(pkg)}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm"
              style={{
                borderColor: theme.accentBlue,
                color: theme.accentBlue,
                backgroundColor: `${theme.accentBlue}0f`,
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              {t("card.viewPrivileges", { count: privCount })}
            </button>
          ) : (
            <span className="text-xs text-gray-400">{t("card.noPrivileges")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PackageManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation("PackageManagementPage");
  const { isRTL } = useLanguage();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const [editTarget, setEditTarget] = useState<Package | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [viewTarget, setViewTarget] = useState<Package | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/staff/packages");
      const data: Package[] = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data) ? res.data : [];

      const withPrivileges = await Promise.all(
        data.map(async (pkg) => {
          try {
            const privRes = await api.get(`/staff/packages/${pkg.id}/privileges`);
            const privData: Privilege[] = Array.isArray(privRes.data?.data)
              ? privRes.data.data
              : Array.isArray(privRes.data) ? privRes.data : [];
            return { ...pkg, privileges: privData };
          } catch {
            return { ...pkg, privileges: [] };
          }
        })
      );
      setPackages(withPrivileges);
    } catch {
      toast({ title: t("toast.errorTitle"), description: t("toast.loadError"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchPackages(); }, []);

  const handleEdit = async (
    id: number,
    name: string,
    description: string,
    language: DisplayLanguage,
    privilegeIds: number[],
  ) => {
    setIsSaving(true);
    try {
      const payload =
        language === "ar"
          ? {
              name_ar: name,
              ...(description ? { description_ar: description } : { description_ar: null }),
              privilege_ids: privilegeIds,
            }
          : {
              name_en: name,
              ...(description ? { description_en: description } : { description_en: null }),
              privilege_ids: privilegeIds,
            };

      await api.put(`/staff/packages/${id}`, payload);
      toast({ title: t("toast.editSuccessTitle"), description: t("toast.editSuccessDesc") });
      setEditTarget(null);
      void fetchPackages();
    } catch {
      toast({ title: t("toast.errorTitle"), description: t("toast.editError"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/staff/packages/${deleteTarget.id}`);
      toast({ title: t("toast.deleteSuccessTitle"), description: t("toast.deleteSuccessDesc") });
      setDeleteTarget(null);
      void fetchPackages();
    } catch {
      toast({ title: t("toast.errorTitle"), description: t("toast.deleteError"), variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"} style={{ backgroundColor: theme.background }}>

      {viewTarget && (
        <PrivilegesModal pkg={viewTarget} onClose={() => setViewTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteModal
          pkg={deleteTarget}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
      {editTarget && (
        <EditModal
          pkg={editTarget}
          onSave={handleEdit}
          onCancel={() => setEditTarget(null)}
          isSaving={isSaving}
        />
      )}

      <div className="bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: theme.border }}>
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className="text-xl font-bold" style={{ color: theme.primaryDark }}>{t("page.title")}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {loading ? t("page.loading") : t("page.packageCount", { count: packages.length })}
          </p>
        </div>
        <button
          onClick={() => navigate("/staff/dashboard/admin/privilege-packages")}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white shadow-md hover:opacity-90 transition-all"
          style={{ backgroundColor: theme.primaryDark }}
        >
          <Plus className="w-4 h-4" />
          {t("page.addNew")}
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-white border animate-pulse" style={{ borderColor: theme.border }} />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.accentBlue}15` }}>
              <ShieldCheck className="w-8 h-8" style={{ color: theme.accentBlue }} />
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">{t("page.emptyStateTitle")}</h2>
            <p className="text-sm text-gray-400 mb-6">{t("page.emptyStateDesc")}</p>
            <button
              onClick={() => navigate("/staff/dashboard/admin/privilege-packages")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-md"
              style={{ backgroundColor: theme.primaryDark }}
            >
              <Plus className="w-4 h-4" />
              {t("page.createPackage")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
                onViewPrivileges={setViewTarget}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
