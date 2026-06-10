import React, { useCallback, useEffect, useState, useMemo } from "react";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Label } from "../components/StaffPagesComponents/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/StaffPagesComponents/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/StaffPagesComponents/ui/select";
import { Switch } from "../components/StaffPagesComponents/ui/switch";
import { Plus, Search, RefreshCw, MapPin, Pencil, Trash2, Link, Loader2, Eye, XCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../services/axios";
import { useTranslation } from "react-i18next";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import { adminTableStyles, adminHeadClass, adminCellClass, ADMIN_PAGE_SIZE, adminPageStyles } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { AdminActionButton, AdminRowActions, AdminViewButton } from "../components/StaffPagesComponents/shared/AdminRowActions";
import { AdminPagination } from "../components/StaffPagesComponents/shared/AdminPagination";
import { AdminPageHeader } from "../components/StaffPagesComponents/shared/AdminPageHeader";
import { AdminMemberStatusBadge } from "../components/StaffPagesComponents/shared/AdminMemberStatusBadge";
import { AdminTableCodeChip } from "../components/StaffPagesComponents/shared/AdminTableSharedCells";
import { BilingualText } from "../components/StaffPagesComponents/shared/BilingualText";
import { getBilingualFieldPlaceholder, getLocalizedText } from "../lib/localizedDisplay";
import { useLanguage } from "../hooks/useLanguage";
import { useAdminFieldValidation } from "../hooks/useAdminFieldValidation";
import { validateAdminBranchForm, validateMemberAssignId, toErrorArrayMap } from "../lib/validation/adminForms";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BranchSport {
    id: number;
    sport_id: number;
    status: 'active' | 'inactive';
    sport?: {
        id: number;
        name_ar: string;
        name_en?: string;
    };
}

export interface Branch {
    id: number;
    code?: string;
    name_ar: string;
    name_en?: string;
    location_ar?: string;
    location_en?: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'archived';
    sports_count?: number; 
}

const PAGE_SIZE = ADMIN_PAGE_SIZE;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BranchManagementPage() {
    const { t } = useTranslation('BranchManagementPage');
    const { language, isRTL } = useLanguage();
    const { toast } = useToast();
    const { tVal, handleArabicChange, handleEnglishChange, handleCodeChange, handleDigitsChange } = useAdminFieldValidation();
    
    // State
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    
    // Modals state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editBranch, setEditBranch] = useState<Branch | null>(null);
    const [form, setForm] = useState({ code: "", name_ar: "", name_en: "", location_ar: "", location_en: "", phone: "", status: "active" });
    const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
    const [saveLoading, setSaveLoading] = useState(false);
    
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [assignBranch, setAssignBranch] = useState<Branch | null>(null);
    const [memberIdForAssign, setMemberIdForAssign] = useState("");
    const [memberName, setMemberName] = useState("");
    const [memberLookupState, setMemberLookupState] = useState<"idle" | "loading" | "found" | "notfound">("idle");
    const [assignLoading, setAssignLoading] = useState(false);

    // Branch Sports Panel State
    const [expandedBranchId, setExpandedBranchId] = useState<number | null>(null);
    const [branchSports, setBranchSports] = useState<Record<number, BranchSport[]>>({});
    const [loadingSports, setLoadingSports] = useState<Record<number, boolean>>({});
    
    const [addSportDialogOpen, setAddSportDialogOpen] = useState<number | null>(null);
    const [globalSports, setGlobalSports] = useState<{id: number, nameAr: string}[]>([]);
    const [selectedGlobalSport, setSelectedGlobalSport] = useState<string>("");
    const [addingSport, setAddingSport] = useState(false);
    
    const [deleteBranchSportId, setDeleteBranchSportId] = useState<number | null>(null);
    const [removingSport, setRemovingSport] = useState(false);
    
    // Handlers
    const openAdd = () => {
        setEditBranch(null);
        setForm({ code: "", name_ar: "", name_en: "", location_ar: "", location_en: "", phone: "", status: "active" });
        setFormErrors({});
        setIsAddOpen(true);
    };

    const openEdit = (branch: Branch) => {
        setEditBranch(branch);
        setForm({ 
            code: branch.code || "",
            name_ar: branch.name_ar || "", 
            name_en: branch.name_en || "", 
            location_ar: branch.location_ar || "", 
            location_en: branch.location_en || "",
            phone: branch.phone || "",
            status: branch.status || "active"
        });
        setFormErrors({});
        setIsAddOpen(true);
    };

    const handleSave = async () => {
        const clientErrors = validateAdminBranchForm(form, tVal, { requireCode: !editBranch });
        if (Object.keys(clientErrors).length > 0) {
            setFormErrors(toErrorArrayMap(clientErrors));
            toast({ title: t('toasts.missingDataTitle'), description: t('toasts.missingDataDesc'), variant: "destructive" });
            return;
        }
        setFormErrors({});

        setSaveLoading(true);
        try {
            const body = { 
                code: form.code,
                name_ar: form.name_ar, 
                name_en: form.name_en, 
                location_ar: form.location_ar, 
                location_en: form.location_en,
                phone: form.phone,
                status: form.status
            };
            if (editBranch) {
                await api.put(`/branches/${editBranch.id}`, body);
                toast({ title: t('toasts.updateSuccessTitle'), description: t('toasts.updateSuccessDesc') });
            } else {
                await api.post("/branches", body);
                toast({ title: t('toasts.addSuccessTitle'), description: t('toasts.addSuccessDesc') });
            }
            setIsAddOpen(false);
            void fetchBranches();
        } catch (err) {
            const e = err as { status?: number, responseData?: { message?: string, error?: string, errors?: Record<string, string[]> }, message?: string };
            
            if (e?.responseData?.errors) {
                setFormErrors(e.responseData.errors);
                toast({ title: t('toasts.inputErrorsTitle'), description: t('toasts.inputErrorsDesc'), variant: "destructive" });
            } else {
                const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t('toasts.saveFailedDesc');
                toast({ title: t('toasts.saveFailedTitle'), description: msg, variant: "destructive" });
            }
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/branches/${deleteId}`);
            toast({ title: t('toasts.deleteSuccessTitle'), description: t('toasts.deleteSuccessDesc') });
            setDeleteId(null);
            void fetchBranches();
        } catch (err) {
            const e = err as { status?: number, responseData?: { message?: string, error?: string }, message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t('toasts.deleteFailedDesc');
            toast({ title: t('toasts.deleteFailedTitle'), description: msg, variant: "destructive" });
        } finally {
            setDeleteLoading(false);
        }
    };

    useEffect(() => {
        const numericId = memberIdForAssign.trim().replace(/\D/g, "");
        if (!numericId) {
            setMemberLookupState("idle");
            setMemberName("");
            return;
        }
        setMemberLookupState("loading");
        const timer = setTimeout(async () => {
            try {
                const res = await api.get<{ data: { name_ar?: string, full_name?: string, first_name_ar?: string, last_name_ar?: string } }>(`/members/${numericId}`);
                const m = res?.data?.data;
                if (m) {
                    const fullName = m.name_ar || m.full_name || [m.first_name_ar, m.last_name_ar].filter(Boolean).join(" ") || "عضو";
                    setMemberName(fullName);
                    setMemberLookupState("found");
                } else {
                    setMemberLookupState("notfound");
                }
            } catch {
                setMemberLookupState("notfound");
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [memberIdForAssign]);

    const handleAssign = async () => {
        const memberIdError = validateMemberAssignId(memberIdForAssign, tVal);
        if (!assignBranch || memberIdError) {
            toast({
                title: t('toasts.missingDataTitle'),
                description: memberIdError ?? t('toasts.assignMissingDataDesc'),
                variant: "destructive",
            });
            return;
        }
        setAssignLoading(true);
        try {
            await api.post(`/branches/${assignBranch.id}/assign-to-member/${memberIdForAssign.trim()}`);
            toast({ title: t('toasts.assignSuccessTitle'), description: t('toasts.assignSuccessDesc') });
            setAssignBranch(null);
            setMemberIdForAssign("");
            setMemberName("");
        } catch (err) {
            const e = err as { status?: number, responseData?: { message?: string, error?: string }, message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t('toasts.assignFailedDesc');
            toast({ title: t('toasts.assignFailedTitle'), description: msg, variant: "destructive" });
        } finally {
            setAssignLoading(false);
        }
    };

    const loadBranchSports = async (branchId: number) => {
        setLoadingSports(p => ({ ...p, [branchId]: true }));
        try {
            const res = await api.get<{ data: BranchSport[] }>(`/branches/${branchId}/sports`);
            setBranchSports(p => ({ ...p, [branchId]: res?.data?.data || [] }));
        } catch (err) {
            toast({ title: t('toasts.loadSportsFailedTitle'), description: t('toasts.loadSportsFailedDesc'), variant: "destructive" });
        } finally {
            setLoadingSports(p => ({ ...p, [branchId]: false }));
        }
    };

    const toggleExpand = (branchId: number) => {
        if (expandedBranchId === branchId) {
            setExpandedBranchId(null);
        } else {
            setExpandedBranchId(branchId);
            if (!branchSports[branchId]) {
                void loadBranchSports(branchId);
            }
        }
    };

    const fetchGlobalSports = async () => {
        try {
            const res = await api.get<{ data: { id: number; name_ar: string; name?: string }[] }>('/sports');
            const arr = Array.isArray(res?.data?.data) ? res.data.data : [];
            setGlobalSports(arr.map(s => ({ id: s.id, nameAr: s.name_ar || s.name || "" })));
        } catch {
            // silent fail
        }
    };

    const openAddSport = (branchId: number) => {
        if (globalSports.length === 0) {
            void fetchGlobalSports();
        }
        setSelectedGlobalSport("");
        setAddSportDialogOpen(branchId);
    };

    const handleAddSport = async () => {
        if (!addSportDialogOpen || !selectedGlobalSport) return;
        setAddingSport(true);
        try {
            await api.post("/branch-sports", { branch_id: addSportDialogOpen, sport_id: Number(selectedGlobalSport) });
            toast({ title: t('toasts.addSportSuccessTitle'), description: t('toasts.addSportSuccessDesc') });
            setAddSportDialogOpen(null);
            void loadBranchSports(addSportDialogOpen);
            void fetchBranches();
        } catch (err) {
            const e = err as any;
            const msg = e?.responseData?.error || e?.responseData?.message || t('toasts.addSportFailedDesc');
            toast({ title: t('toasts.addSportFailedTitle'), description: msg, variant: "destructive" });
        } finally {
            setAddingSport(false);
        }
    };

    const toggleBranchSportStatus = async (branchSportId: number, newState: boolean) => {
        const status = newState ? "active" : "inactive";
        try {
            await api.put(`/branch-sports/${branchSportId}`, { status });
            if (expandedBranchId) {
                setBranchSports(p => {
                    const row = p[expandedBranchId]?.map(item => item.id === branchSportId ? { ...item, status } : item);
                    return { ...p, [expandedBranchId]: row };
                });
            }
        } catch (err) {
            toast({ title: t('toasts.updateSportFailedTitle'), description: t('toasts.updateSportFailedDesc'), variant: "destructive" });
            if (expandedBranchId) void loadBranchSports(expandedBranchId);
        }
    };

    const handleRemoveBranchSport = async () => {
        if (!deleteBranchSportId || !expandedBranchId) return;
        setRemovingSport(true);
        try {
            await api.delete(`/branch-sports/${deleteBranchSportId}`);
            toast({ title: t('toasts.removeSportSuccessTitle'), description: t('toasts.removeSportSuccessDesc') });
            setDeleteBranchSportId(null);
            void loadBranchSports(expandedBranchId);
            void fetchBranches();
        } catch (err) {
            toast({ title: t('toasts.removeSportFailedTitle'), description: t('toasts.removeSportFailedDesc'), variant: "destructive" });
        } finally {
            setRemovingSport(false);
        }
    };

    // Fetch data
    const fetchBranches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ success: boolean; data: Branch[] }>("/branches");
            const list = res?.data?.data;
            if (Array.isArray(list)) {
                setBranches(list);
            } else {
                setBranches([]);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : t('toasts.loadBranchesFailedDesc');
            toast({ title: t('toasts.loadBranchesFailedTitle'), description: message, variant: "destructive" });
            setBranches([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        void fetchBranches();
    }, [fetchBranches]);

    // Derived states
    useEffect(() => { setPage(1); }, [search]); // reset to page 1 on search

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return branches;
        return branches.filter((b) => 
            (b.name_ar && b.name_ar.toLowerCase().includes(q)) || 
            (b.name_en && b.name_en.toLowerCase().includes(q)) || 
            (b.location_ar && b.location_ar.toLowerCase().includes(q))
        );
    }, [branches, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>

            <AdminPageHeader
                icon={MapPin}
                title={t('header.title')}
                subtitle={
                    <>
                        {t('header.totalBranches')}:{' '}
                        <strong className="text-foreground">{branches.length}</strong>
                    </>
                }
                actions={
                    <RoleGuard privilege="CREATE_BRANCH">
                        <Button size="sm" className="gap-2" onClick={openAdd}>
                            <Plus className="w-4 h-4" />
                            {t('header.addBranch')}
                        </Button>
                    </RoleGuard>
                }
            />

            <div className={adminPageStyles.toolbar}>
                <div className="relative flex-1 min-w-[180px] max-w-sm">
                    <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                    <Input
                        placeholder={t('toolbar.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${adminPageStyles.toolbarSearch} ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className={`${adminPageStyles.refreshBtn} h-10`}
                    onClick={() => { void fetchBranches(); }}
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    {t('toolbar.refresh')}
                </Button>
            </div>

            <div className={adminTableStyles.shell}>
                    <div className={adminTableStyles.container}>
                        {loading ? (
                            <div className="py-24 text-center text-zinc-400">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                                <p className="text-sm font-medium tracking-wide">{t('table.loading')}</p>
                            </div>
                        ) : filteredRows.length === 0 ? (
                            <div className="py-24 text-center text-zinc-400 flex flex-col items-center">
                                <div className="rounded-full bg-zinc-50 border border-zinc-100 p-6 mb-5">
                                    <MapPin className="h-10 w-10 text-zinc-300" />
                                </div>
                                <h3 className="text-[13px] font-bold text-zinc-800 mb-1.5">{t('table.empty')}</h3>
                                <p className="text-[13px] max-w-sm">
                                    {search ? t('table.emptySearch', { search }) : t('table.emptyInstruction')}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className={adminTableStyles.header}>
                                    <TableRow>
                                        <TableHead className={adminHeadClass({ className: "w-12" })}>{t('table.columns.serial')}</TableHead>
                                        <TableHead className={adminHeadClass()}>{t('table.columns.name')}</TableHead>
                                        <TableHead className={adminHeadClass()}>{t('table.columns.code')}</TableHead>
                                        <TableHead className={adminHeadClass()}>{t('table.columns.location')}</TableHead>
                                        <TableHead className={adminHeadClass({ center: true, className: "whitespace-nowrap" })}>{t('table.columns.status')}</TableHead>
                                        <TableHead className={adminHeadClass({ center: true })}>{t('table.columns.sportsCount')}</TableHead>
                                        <TableHead className={adminHeadClass({ center: true })}>{t('table.columns.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className={adminTableStyles.body}>
                                    {pagedRows.map((branch, idx) => (
                                        <React.Fragment key={branch.id}>
                                            <TableRow className={adminTableStyles.row}>
                                                <TableCell className={adminCellClass({ size: "muted", className: "font-mono w-12" })}>
                                                    {(page - 1) * PAGE_SIZE + idx + 1}
                                                </TableCell>

                                                <TableCell className={adminCellClass()}>
                                                    <BilingualText
                                                        ar={branch.name_ar}
                                                        en={branch.name_en}
                                                        language={language}
                                                        primaryClassName="font-semibold text-xs"
                                                    />
                                                </TableCell>

                                                <TableCell className={adminCellClass()}>
                                                    {branch.code ? (
                                                        <AdminTableCodeChip>{branch.code}</AdminTableCodeChip>
                                                    ) : "—"}
                                                </TableCell>

                                                <TableCell className={adminCellClass({ size: "muted" })}>
                                                    {getLocalizedText(branch.location_ar, branch.location_en, language) || "—"}
                                                </TableCell>

                                                <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                                                    {branch.status ? (
                                                        <AdminMemberStatusBadge status={branch.status} compact />
                                                    ) : "—"}
                                                </TableCell>

                                                <TableCell className={adminCellClass({ center: true })}>
                                                    <AdminTableCodeChip>{branch.sports_count ?? "—"}</AdminTableCodeChip>
                                                </TableCell>

                                                <TableCell className={adminCellClass({ center: true })}>
                                                    <AdminRowActions>
                                                        <RoleGuard privilege="UPDATE_BRANCH">
                                                            <AdminActionButton
                                                                tooltip={t('table.actions.edit')}
                                                                icon={Pencil}
                                                                variant="edit"
                                                                onClick={() => openEdit(branch)}
                                                            />
                                                        </RoleGuard>

                                                        <RoleGuard privilege="ASSIGN_BRANCH_TO_MEMBER">
                                                            <AdminActionButton
                                                                tooltip={t('table.actions.assign')}
                                                                icon={Eye}
                                                                variant="view"
                                                                onClick={() => setAssignBranch(branch)}
                                                            />
                                                        </RoleGuard>

                                                        <RoleGuard privilege="CREATE_BRANCH">
                                                            <AdminActionButton
                                                                tooltip={t('table.actions.sports')}
                                                                icon={Link}
                                                                variant={expandedBranchId === branch.id ? "approve" : "assign"}
                                                                onClick={() => toggleExpand(branch.id)}
                                                            />
                                                        </RoleGuard>

                                                        <RoleGuard privilege="DELETE_BRANCH">
                                                            <AdminActionButton
                                                                tooltip={t('table.actions.delete')}
                                                                icon={Trash2}
                                                                variant="delete"
                                                                onClick={() => setDeleteId(branch.id)}
                                                            />
                                                        </RoleGuard>
                                                    </AdminRowActions>
                                                </TableCell>
                                            </TableRow>
                                            {/* EXPANDED PANEL HERE */}
                                            {expandedBranchId === branch.id && (
                                                <TableRow className="bg-muted/20 border-b border-border">
                                                    <TableCell colSpan={7} className="p-0 border-s-4 border-s-primary/40">
                                                        <div className="p-6">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h4 className="text-[13px] font-bold text-zinc-800 flex items-center gap-2">
                                                                    <Link className="w-4 h-4 text-emerald-600" />
                                                                    {t('sportsPanel.title')} {getLocalizedText(branch.name_ar, branch.name_en, language)}
                                                                </h4>
                                                                <RoleGuard privilege="CREATE_BRANCH">
                                                                    <Button size="sm" onClick={() => openAddSport(branch.id)} className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold rounded-lg px-4">
                                                                        <Plus className="w-3.5 h-3.5" />
                                                                        {t('sportsPanel.addSport')}
                                                                    </Button>
                                                                </RoleGuard>
                                                            </div>
                                                            
                                                            {loadingSports[branch.id] ? (
                                                                <div className="flex justify-center py-6 text-zinc-400">
                                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                                </div>
                                                            ) : !branchSports[branch.id]?.length ? (
                                                                <div className="text-center py-6 bg-white rounded-xl border border-zinc-200/60 shadow-sm">
                                                                    <p className="text-xs text-zinc-500 font-medium">{t('sportsPanel.empty')}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden border-t-0">
                                                                    <Table>
                                                                        <TableHeader className={adminTableStyles.header}>
                                                                            <TableRow>
                                                                                <TableHead className={adminHeadClass()}>{t('sportsPanel.columns.sportName')}</TableHead>
                                                                                <TableHead className={adminHeadClass({ center: true, className: "w-28" })}>{t('sportsPanel.columns.status')}</TableHead>
                                                                                <TableHead className={adminHeadClass({ center: true, className: "w-24" })}>{t('sportsPanel.columns.actions')}</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody className={adminTableStyles.body}>
                                                                            {branchSports[branch.id].map(bs => (
                                                                                <TableRow key={bs.id} className={adminTableStyles.row}>
                                                                                    <TableCell className={adminCellClass()}>
                                                                                        <BilingualText
                                                                                            ar={bs.sport?.name_ar}
                                                                                            en={bs.sport?.name_en}
                                                                                            language={language}
                                                                                            primaryClassName="font-semibold text-xs"
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                                                                                        <RoleGuard privilege="UPDATE_BRANCH" fallback={
                                                                                            <AdminMemberStatusBadge status={bs.status} compact />
                                                                                        }>
                                                                                            <div title={t('sportsPanel.actions.toggleStatus')}>
                                                                                                <Switch 
                                                                                                    checked={bs.status === 'active'}
                                                                                                    onCheckedChange={(val) => void toggleBranchSportStatus(bs.id, val)}
                                                                                                />
                                                                                            </div>
                                                                                        </RoleGuard>
                                                                                    </TableCell>
                                                                                    <TableCell className={adminCellClass({ center: true })}>
                                                                                        <RoleGuard privilege="DELETE_BRANCH">
                                                                                            <AdminRowActions>
                                                                                                <AdminActionButton
                                                                                                    tooltip={t('sportsPanel.actions.remove')}
                                                                                                    icon={Trash2}
                                                                                                    variant="delete"
                                                                                                    onClick={() => setDeleteBranchSportId(bs.id)}
                                                                                                />
                                                                                            </AdminRowActions>
                                                                                        </RoleGuard>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <AdminPagination
                        page={page}
                        totalCount={filteredRows.length}
                        onPageChange={setPage}
                        isRTL={isRTL}
                        disabled={loading}
                    />
            </div>
            
            {/* ── Dialogs ── */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[425px]" dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader>
                        <DialogTitle>{editBranch ? t('modals.addEdit.titleEdit') : t('modals.addEdit.titleAdd')}</DialogTitle>
                        <DialogDescription>
                            {editBranch ? t('modals.addEdit.descEdit') : t('modals.addEdit.descAdd')}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        {!editBranch && (
                            <div className="grid gap-2">
                                <Label htmlFor="code">{t('modals.addEdit.fields.code')} <span className="text-destructive">*</span></Label>
                                <Input 
                                    id="code"
                                    dir="ltr"
                                    className={`text-left font-mono uppercase ${formErrors.code?.length ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                                    value={form.code}
                                    onChange={(e) => handleCodeChange(
                                        e.target.value,
                                        (code) => setForm({ ...form, code }),
                                        (message) => setFormErrors({ ...formErrors, code: message ? [message] : [] }),
                                    )}
                                    placeholder={t('modals.addEdit.fields.codePlaceholder')}
                                    maxLength={50}
                                />
                                <p className="text-[11px] text-zinc-400">{t('modals.addEdit.fields.codeHint')}</p>
                                {formErrors.code?.length > 0 && <span className="text-xs text-destructive">{formErrors.code[0]}</span>}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="name_ar">{t('modals.addEdit.fields.nameAr')} <span className="text-destructive">*</span></Label>
                            <Input 
                                id="name_ar" 
                                value={form.name_ar} 
                                onChange={(e) => handleArabicChange(
                                    e.target.value,
                                    (name_ar) => setForm({ ...form, name_ar }),
                                    (message) => setFormErrors({ ...formErrors, name_ar: message ? [message] : [] }),
                                )} 
                                placeholder={getBilingualFieldPlaceholder('ar', 'BranchManagementPage', 'modals.addEdit.fields.nameArPlaceholder')} 
                                className={formErrors.name_ar?.length ? "border-destructive focus-visible:ring-destructive/20" : ""}
                            />
                            {formErrors.name_ar?.length > 0 && <span className="text-xs text-destructive">{formErrors.name_ar[0]}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name_en">{t('modals.addEdit.fields.nameEn')}</Label>
                            <Input 
                                id="name_en" 
                                dir="ltr" 
                                value={form.name_en} 
                                onChange={(e) => handleEnglishChange(
                                    e.target.value,
                                    (name_en) => setForm({ ...form, name_en }),
                                    (message) => setFormErrors({ ...formErrors, name_en: message ? [message] : [] }),
                                )} 
                                placeholder={getBilingualFieldPlaceholder('en', 'BranchManagementPage', 'modals.addEdit.fields.nameEnPlaceholder')} 
                                className={`text-start ${formErrors.name_en?.length ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                            />
                            {formErrors.name_en?.length > 0 && <span className="text-xs text-destructive">{formErrors.name_en[0]}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location_ar">{t('modals.addEdit.fields.locationAr')} <span className="text-destructive">*</span></Label>
                            <Input 
                                id="location_ar" 
                                value={form.location_ar} 
                                onChange={(e) => handleArabicChange(
                                    e.target.value,
                                    (location_ar) => setForm({ ...form, location_ar }),
                                    (message) => setFormErrors({ ...formErrors, location_ar: message ? [message] : [] }),
                                )} 
                                placeholder={getBilingualFieldPlaceholder('ar', 'BranchManagementPage', 'modals.addEdit.fields.locationArPlaceholder')} 
                                className={formErrors.location_ar?.length ? "border-destructive focus-visible:ring-destructive/20" : ""}
                            />
                            {formErrors.location_ar?.length > 0 && <span className="text-xs text-destructive">{formErrors.location_ar[0]}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location_en">{t('modals.addEdit.fields.locationEn')}</Label>
                            <Input 
                                id="location_en" 
                                dir="ltr" 
                                value={form.location_en} 
                                onChange={(e) => handleEnglishChange(
                                    e.target.value,
                                    (location_en) => setForm({ ...form, location_en }),
                                    (message) => setFormErrors({ ...formErrors, location_en: message ? [message] : [] }),
                                )} 
                                placeholder={getBilingualFieldPlaceholder('en', 'BranchManagementPage', 'modals.addEdit.fields.locationEnPlaceholder')} 
                                className={`text-start ${formErrors.location_en?.length ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                            />
                            {formErrors.location_en?.length > 0 && <span className="text-xs text-destructive">{formErrors.location_en[0]}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">{t('modals.addEdit.fields.status')}</Label>
                            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as 'active' | 'inactive' | 'archived' })}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder={t('modals.addEdit.fields.statusPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">{t('table.status.active')}</SelectItem>
                                    <SelectItem value="inactive">{t('table.status.inactive')}</SelectItem>
                                    <SelectItem value="archived">{t('table.status.archived')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={saveLoading}>{t('modals.addEdit.buttons.cancel')}</Button>
                        <Button onClick={() => void handleSave()} disabled={saveLoading} className="w-full sm:w-auto">
                            {saveLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                            {saveLoading ? t('modals.addEdit.buttons.saving') : t('modals.addEdit.buttons.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Modal ── */}
            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">{t('modals.delete.title')}</DialogTitle>
                        <DialogDescription>
                            {t('modals.delete.desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start">
                        <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteLoading}>
                            {deleteLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                            {deleteLoading ? t('modals.delete.buttons.deleting') : t('modals.delete.buttons.confirm')}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteLoading}>{t('modals.delete.buttons.cancel')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Assign to Member Modal ── */}
            <Dialog open={assignBranch !== null} onOpenChange={(open) => { 
                if (!open) { setAssignBranch(null); setMemberIdForAssign(""); setMemberName(""); } 
            }}>
                <DialogContent dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader>
                        <DialogTitle>{t('modals.assign.title')}</DialogTitle>
                        <DialogDescription>
                            {t('modals.assign.desc')} <span className="font-bold underline text-primary">{assignBranch?.name_ar || assignBranch?.name_en}</span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <Label htmlFor="memberIdAssign">{t('modals.assign.fields.memberId')} <span className="text-destructive">*</span></Label>
                        <div className="relative mt-2">
                            <Input
                                id="memberIdAssign"
                                dir="ltr"
                                className="text-start font-mono pe-8"
                                placeholder={t('modals.assign.fields.memberIdPlaceholder')}
                                value={memberIdForAssign}
                                onChange={(e) => handleDigitsChange(e.target.value, setMemberIdForAssign)}
                            />
                            {memberLookupState === "loading" && (
                                <Loader2 className="absolute end-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            {memberLookupState === "found" && (
                                <span className="absolute end-2 top-1/2 -translate-y-1/2 text-emerald-600 bg-emerald-100 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                            )}
                        </div>
                        {memberLookupState === "notfound" && memberIdForAssign && (
                            <p className="text-xs text-destructive mt-1.5">{t('modals.assign.fields.memberNotFound')}</p>
                        )}
                        {memberLookupState === "found" && (
                            <div className="mt-2 text-sm bg-zinc-50 border border-zinc-100 p-2.5 rounded-lg flex items-center gap-2">
                                <div className="h-6 w-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <MapPin className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-medium text-zinc-800">{memberName}</span>
                            </div>
                        )}
                    </div>
                    
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setAssignBranch(null)} disabled={assignLoading}>{t('modals.assign.buttons.cancel')}</Button>
                        <Button onClick={() => void handleAssign()} disabled={assignLoading || memberLookupState !== "found"}>
                            {assignLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                            {assignLoading ? t('modals.assign.buttons.assigning') : t('modals.assign.buttons.assign')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Add Sport Modal ── */}
            <Dialog open={addSportDialogOpen !== null} onOpenChange={(open) => !open && setAddSportDialogOpen(null)}>
                <DialogContent dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader>
                        <DialogTitle>{t('modals.addSport.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>{t('modals.addSport.fields.sport')} <span className="text-destructive">*</span></Label>
                        <Select value={selectedGlobalSport} onValueChange={setSelectedGlobalSport}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder={t('modals.addSport.fields.sportPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {globalSports.length === 0 ? (
                                    <SelectItem value="none" disabled>{t('modals.addSport.fields.noSports')}</SelectItem>
                                ) : (
                                    globalSports.map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.nameAr}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-start">
                        <Button onClick={() => void handleAddSport()} disabled={addingSport || !selectedGlobalSport} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            {addingSport && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                            {addingSport ? t('modals.addSport.buttons.adding') : t('modals.addSport.buttons.add')}
                        </Button>
                        <Button variant="outline" onClick={() => setAddSportDialogOpen(null)} disabled={addingSport}>{t('modals.addSport.buttons.cancel')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Branch Sport Modal ── */}
            <Dialog open={deleteBranchSportId !== null} onOpenChange={() => setDeleteBranchSportId(null)}>
                <DialogContent dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">{t('modals.removeSport.title')}</DialogTitle>
                        <DialogDescription>
                            {t('modals.removeSport.desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start">
                        <Button variant="destructive" onClick={() => void handleRemoveBranchSport()} disabled={removingSport}>
                            {removingSport && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                            {removingSport ? t('modals.removeSport.buttons.removing') : t('modals.removeSport.buttons.confirm')}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteBranchSportId(null)} disabled={removingSport}>{t('modals.removeSport.buttons.cancel')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
