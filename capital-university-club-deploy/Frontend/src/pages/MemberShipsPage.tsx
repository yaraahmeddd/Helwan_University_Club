import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import { Badge } from "../components/StaffPagesComponents/ui/badge";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/StaffPagesComponents/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/StaffPagesComponents/ui/select";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import { Pencil, Search, Trash2, Power, Plus } from "lucide-react";
import { TooltipProvider } from "../components/StaffPagesComponents/ui/tooltip";
import { AdminActionButton, AdminRowActions, AdminViewButton } from "../components/StaffPagesComponents/shared/AdminRowActions";
import { useToast } from "../hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { adminTableStyles, adminHeadClass, adminCellClass, ADMIN_PAGE_SIZE } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { AdminPagination } from "../components/StaffPagesComponents/shared/AdminPagination";
import { BilingualText } from "../components/StaffPagesComponents/shared/BilingualText";
import { getLocalizedText } from "../lib/localizedDisplay";
import api from "../services/axios";

type MembershipApiItem = {
  id: number;
  member_type_id: number;
  plan_code: string;
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  price: string;
  currency: string;
  duration_months: number;
  renewal_price: string;
  is_installable: boolean;
  max_installments?: number | null;
  is_active: boolean;
  is_for_foreigner: boolean;
  min_age?: number | null;
  max_age?: number | null;
  created_at?: string;
  updated_at?: string;
};

type MembershipTypeItem = {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
};

type MembershipsResponse = {
  success?: boolean;
  message?: string;
  data?: MembershipApiItem[];
};

type MemberTypesResponse = {
  success?: boolean;
  data?: MembershipTypeItem[];
};

const PAGE_SIZE = ADMIN_PAGE_SIZE;

export default function MembershipsPage() {
  const { t } = useTranslation("MemberShipsPage");
  const { language, isRTL } = useLanguage();
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [memberships, setMemberships] = useState<MembershipApiItem[]>([]);
  const [memberTypes, setMemberTypes] = useState<MembershipTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipApiItem | null>(null);
  const [editPlan, setEditPlan] = useState<MembershipApiItem | null>(null);
  const [deletePlan, setDeletePlan] = useState<MembershipApiItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    member_type_id: "",
    plan_code: "",
    name_ar: "",
    name_en: "",
    price: "",
    currency: "EGP",
    duration_months: "",
    renewal_price: "",
    is_active: true,
  });
  const [creating, setCreating] = useState(false);
  const [editForm, setEditForm] = useState({
    plan_code: "",
    name_ar: "",
    name_en: "",
    price: "",
    currency: "EGP",
    duration_months: "",
    renewal_price: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [resParams, resTypes] = await Promise.all([
          api.get<MembershipsResponse>("/membership-plans"),
          api.get<MemberTypesResponse>("/member-types")
        ]);

        const list = resParams?.data?.data;
        if (Array.isArray(list)) {
          setMemberships(list);
        } else if (Array.isArray(resParams?.data)) {
          setMemberships(resParams.data as MembershipApiItem[]);
        } else {
          setMemberships([]);
        }

        if (resTypes?.data?.data && Array.isArray(resTypes.data.data)) {
          setMemberTypes(resTypes.data.data);
        }

      } catch (err) {
        const message = err instanceof Error ? err.message : t("toast.loadErrorDesc");
        toast({ title: t("toast.loadErrorTitle"), description: message, variant: "destructive" });
        setMemberships([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [toast, t]);

  const refreshPlans = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<MembershipsResponse>("/membership-plans");
      const list = res?.data?.data;
      if (Array.isArray(list)) {
        setMemberships(list);
      } else if (Array.isArray(res?.data)) {
        setMemberships(res.data as MembershipApiItem[]);
      } else {
        setMemberships([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t("toast.loadPlansErrorDesc");
      toast({ title: t("toast.loadPlansErrorTitle"), description: message, variant: "destructive" });
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setCreateForm({
      member_type_id: "",
      plan_code: "",
      name_ar: "",
      name_en: "",
      price: "",
      currency: "EGP",
      duration_months: "",
      renewal_price: "",
      is_active: true,
    });
    setCreateOpen(true);
  };

  const saveCreate = async () => {
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        member_type_id: createForm.member_type_id,
        plan_code: createForm.plan_code,
        name_ar: createForm.name_ar,
        name_en: createForm.name_en,
        price: createForm.price,
        currency: createForm.currency,
        duration_months: createForm.duration_months,
        renewal_price: createForm.renewal_price,
        is_active: createForm.is_active,
      };

      const res = await api.post<{ message: string }>("/membership-plans", payload);
      toast({ title: t("toast.createSuccessTitle"), description: res?.data?.message || t("toast.createSuccessDesc") });
      setCreateOpen(false);
      await refreshPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("toast.createErrorDesc");
      toast({ title: t("toast.createErrorTitle"), description: message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (plan: MembershipApiItem) => {
    setEditPlan(plan);
    setEditForm({
      plan_code: plan.plan_code,
      name_ar: plan.name_ar,
      name_en: plan.name_en,
      price: String(plan.price ?? ""),
      currency: plan.currency ?? "EGP",
      duration_months: String(plan.duration_months ?? ""),
      renewal_price: String(plan.renewal_price ?? ""),
      is_active: !!plan.is_active,
    });
  };

  const saveEdit = async () => {
    if (!editPlan) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        plan_code: editForm.plan_code,
        name_ar: editForm.name_ar,
        name_en: editForm.name_en,
        price: Number(editForm.price),
        currency: editForm.currency,
        duration_months: editForm.duration_months,
        renewal_price: editForm.renewal_price,
        is_active: editForm.is_active,
      };

      const res = await api.put<{ message: string }>(`/membership-plans/${editPlan.id}`, payload);
      toast({ title: t("toast.editSuccessTitle"), description: res?.data?.message || t("toast.editSuccessDesc") });
      setEditPlan(null);
      await refreshPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("toast.editErrorDesc");
      toast({ title: t("toast.editErrorTitle"), description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletePlan) return;
    setDeleting(true);
    try {
      const res = await api.delete<{ message: string }>(`/membership-plans/${deletePlan.id}`);
      toast({ title: t("toast.deleteSuccessTitle"), description: res?.data?.message || t("toast.deleteSuccessDesc") });
      setDeletePlan(null);
      await refreshPlans();
    } catch (err: unknown) {
      const error = err as Record<string, unknown>;
      if (error && typeof error === "object" && "response" in error) {
        const response = error.response as Record<string, unknown>;
        if (response?.status === 409) {
          toast({
            title: t("toast.deleteConflictTitle"),
            description: t("toast.deleteConflictDesc"),
            variant: "destructive",
          });
        } else {
          const message = err instanceof Error ? err.message : t("toast.deleteErrorDesc");
          toast({ title: t("toast.deleteErrorTitle"), description: message, variant: "destructive" });
        }
      } else {
        const message = err instanceof Error ? err.message : t("toast.deleteErrorDesc");
        toast({ title: t("toast.deleteErrorTitle"), description: message, variant: "destructive" });
      }
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (plan: MembershipApiItem) => {
    setToggling(plan.id);
    try {
      const res = await api.patch<{ message: string }>(`/membership-plans/${plan.id}/status`, { is_active: !plan.is_active });
      toast({ title: t("toast.statusSuccessTitle"), description: res?.data?.message || t("toast.statusSuccessDesc") });
      await refreshPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("toast.statusErrorDesc");
      toast({ title: t("toast.statusErrorTitle"), description: message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return memberships;
    return memberships.filter((m) => {
      return (
        (m.plan_code || "").toLowerCase().includes(q) ||
        (m.name_ar || "").toLowerCase().includes(q) ||
        (m.name_en || "").toLowerCase().includes(q)
      );
    });
  }, [memberships, search]);

  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getMemberTypeName = (id: number) => {
    const type = memberTypes.find(t => t.id === id);
    if (!type) return String(id);
    return getLocalizedText(type.name_ar, type.name_en, language);
  };

  return (
    <TooltipProvider>
    <RoleGuard privilege="VIEW_MEMBERSHIP_PLANS">
      <div className="h-full flex flex-col overflow-y-auto p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <RoleGuard privilege="CREATE_MEMBERSHIP_PLAN">
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t("create.title")}
            </Button>
          </RoleGuard>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`shadow-sm ${adminTableStyles.container}`}>
          <Table>
            <TableHeader className={adminTableStyles.header}>
              <TableRow>
                <TableHead className={adminHeadClass()}>{t("table.code")}</TableHead>
                <TableHead className={adminHeadClass()}>{t("table.memberType")}</TableHead>
                <TableHead className={adminHeadClass()}>{t("table.name")}</TableHead>
                <TableHead className={adminHeadClass()}>{t("table.price")}</TableHead>
                <TableHead className={adminHeadClass()}>{t("table.durationMonths")}</TableHead>
                <TableHead className={adminHeadClass()}>{t("table.status")}</TableHead>
                <TableHead className={adminHeadClass({ center: true, className: "w-[260px]" })}>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={adminTableStyles.body}>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    {t("table.loading")}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((m) => (
                  <TableRow key={m.id} className={adminTableStyles.row}>
                    <TableCell className={adminCellClass({ className: "font-poppins" })}>{m.plan_code}</TableCell>
                    <TableCell className={adminCellClass()}>{getMemberTypeName(m.member_type_id)}</TableCell>
                    <TableCell className={adminCellClass()}>
                      <BilingualText ar={m.name_ar} en={m.name_en} language={language} primaryClassName="font-medium" />
                    </TableCell>
                    <TableCell className={adminCellClass({ className: "font-poppins" })}>{m.price} {m.currency}</TableCell>
                    <TableCell className={adminCellClass({ className: "font-poppins" })}>{m.duration_months}</TableCell>
                    <TableCell className={adminCellClass()}>
                      <Badge className={m.is_active ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                        {m.is_active ? t("status.active") : t("status.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                      <AdminRowActions>
                        <AdminViewButton tooltip={t("rowActions.viewDetails")} onClick={() => setSelectedPlan(m)} />
                        <RoleGuard privilege="UPDATE_MEMBERSHIP_PLAN">
                          <AdminActionButton
                            tooltip={t("action.edit")}
                            icon={Pencil}
                            variant="edit"
                            onClick={() => openEdit(m)}
                          />
                        </RoleGuard>
                        <RoleGuard privilege="CHANGE_MEMBERSHIP_PLAN_STATUS">
                          <AdminActionButton
                            tooltip={toggling === m.id ? "..." : (m.is_active ? t("action.deactivate") : t("action.activate"))}
                            icon={Power}
                            variant="status"
                            onClick={() => void toggleStatus(m)}
                            disabled={toggling === m.id}
                            loading={toggling === m.id}
                          />
                        </RoleGuard>
                        <RoleGuard privilege="DELETE_MEMBERSHIP_PLAN">
                          <AdminActionButton
                            tooltip={t("action.delete")}
                            icon={Trash2}
                            variant="delete"
                            onClick={() => setDeletePlan(m)}
                          />
                        </RoleGuard>
                      </AdminRowActions>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    {t("table.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </motion.div>

        <AdminPagination
          page={page}
          totalCount={filtered.length}
          onPageChange={setPage}
          isRTL={isRTL}
          disabled={isLoading}
        />

        <Dialog open={selectedPlan !== null} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="max-w-2xl" dir={isRTL ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className={isRTL ? "text-right" : "text-left"}>{t("detail.title")}</DialogTitle>
              <DialogDescription className={isRTL ? "text-right" : "text-left"}>{t("detail.description")}</DialogDescription>
            </DialogHeader>

            {selectedPlan && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">{t("table.code")}</div>
                  <div className="font-poppins font-semibold">{selectedPlan.plan_code}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("table.memberType")}</div>
                  <div className="font-medium">{getMemberTypeName(selectedPlan.member_type_id)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("table.status")}</div>
                  <div className="font-medium">{selectedPlan.is_active ? t("status.active") : t("status.inactive")}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("detail.nameAr")}</div>
                  <div className="font-medium">{selectedPlan.name_ar}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("detail.nameEn")}</div>
                  <div className="font-medium" dir="ltr">{selectedPlan.name_en}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("table.price")}</div>
                  <div className="font-poppins font-semibold">{selectedPlan.price} {selectedPlan.currency}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("table.durationMonths")}</div>
                  <div className="font-poppins font-semibold">{selectedPlan.duration_months}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("detail.renewalPrice")}</div>
                  <div className="font-poppins font-semibold">{selectedPlan.renewal_price} {selectedPlan.currency}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("detail.installable")}</div>
                  <div className="font-medium">{selectedPlan.is_installable ? t("common.yes") : t("common.no")}</div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPlan(null)}>{t("common.close")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editPlan !== null} onOpenChange={() => setEditPlan(null)}>
          <DialogContent className="max-w-2xl" dir={isRTL ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className={isRTL ? "text-right" : "text-left"}>{t("edit.title")}</DialogTitle>
              <DialogDescription className={isRTL ? "text-right" : "text-left"}>{t("edit.description")}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2 text-sm font-medium">{t("table.code")}</div>
                <Input value={editForm.plan_code} onChange={(e) => setEditForm((p) => ({ ...p, plan_code: e.target.value }))} />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("edit.currency")}</div>
                <Input value={editForm.currency} onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value }))} dir="ltr" className="text-left" />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("detail.nameAr")}</div>
                <Input value={editForm.name_ar} onChange={(e) => setEditForm((p) => ({ ...p, name_ar: e.target.value }))} />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("detail.nameEn")}</div>
                <Input value={editForm.name_en} onChange={(e) => setEditForm((p) => ({ ...p, name_en: e.target.value }))} dir="ltr" className="text-left" />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("table.price")}</div>
                <Input type="number" value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("detail.renewalPrice")}</div>
                <Input type="number" value={editForm.renewal_price} onChange={(e) => setEditForm((p) => ({ ...p, renewal_price: e.target.value }))} />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("table.durationMonths")}</div>
                <Input type="number" value={editForm.duration_months} onChange={(e) => setEditForm((p) => ({ ...p, duration_months: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 mt-7">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="h-4 w-4 accent-[hsl(var(--huc-accentBlue))]"
                />
                <span className="text-sm font-medium">{t("status.active")}</span>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => void saveEdit()} disabled={saving}>{saving ? t("common.saving") : t("common.save")}</Button>
              <Button variant="outline" onClick={() => setEditPlan(null)} disabled={saving}>{t("common.cancel")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl" dir={isRTL ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className={isRTL ? "text-right" : "text-left"}>{t("create.title")}</DialogTitle>
              <DialogDescription className={isRTL ? "text-right" : "text-left"}>{t("create.description")}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2 text-sm font-medium">{t("table.memberType")}</div>
                <Select
                  value={String(createForm.member_type_id)}
                  onValueChange={(val) => setCreateForm((p) => ({ ...p, member_type_id: val }))}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("create.selectMemberType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {memberTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {getLocalizedText(type.name_ar, type.name_en, language)} ({type.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("edit.currency")}</div>
                <Input
                  value={createForm.currency}
                  onChange={(e) => setCreateForm((p) => ({ ...p, currency: e.target.value }))}
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("table.code")}</div>
                <Input value={createForm.plan_code} onChange={(e) => setCreateForm((p) => ({ ...p, plan_code: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 mt-7">
                <input
                  type="checkbox"
                  checked={createForm.is_active}
                  onChange={(e) => setCreateForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="h-4 w-4 accent-[hsl(var(--huc-accentBlue))]"
                />
                <span className="text-sm font-medium">{t("status.active")}</span>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("detail.nameAr")}</div>
                <Input value={createForm.name_ar} onChange={(e) => setCreateForm((p) => ({ ...p, name_ar: e.target.value }))} />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("detail.nameEn")}</div>
                <Input
                  value={createForm.name_en}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name_en: e.target.value }))}
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("table.price")}</div>
                <Input type="number" value={createForm.price} onChange={(e) => setCreateForm((p) => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("detail.renewalPrice")}</div>
                <Input
                  type="number"
                  value={createForm.renewal_price}
                  onChange={(e) => setCreateForm((p) => ({ ...p, renewal_price: e.target.value }))}
                />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">{t("table.durationMonths")}</div>
                <Input
                  type="number"
                  value={createForm.duration_months}
                  onChange={(e) => setCreateForm((p) => ({ ...p, duration_months: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => void saveCreate()} disabled={creating}>
                {creating ? t("common.saving") : t("common.save")}
              </Button>
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>{t("common.cancel")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deletePlan !== null} onOpenChange={() => setDeletePlan(null)}>
          <DialogContent className="max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className={isRTL ? "text-right" : "text-left"}>{t("delete.title")}</DialogTitle>
              <DialogDescription className={isRTL ? "text-right" : "text-left"}>
                {t("delete.description", { name: getLocalizedText(deletePlan?.name_ar, deletePlan?.name_en, language) })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="destructive" onClick={() => void confirmDelete()} disabled={deleting}>
                {deleting ? t("common.deleting") : t("action.delete")}
              </Button>
              <Button variant="outline" onClick={() => setDeletePlan(null)} disabled={deleting}>{t("common.cancel")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
    </TooltipProvider>
  );
}
