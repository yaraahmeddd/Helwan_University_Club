import { useCallback, useEffect, useState, useMemo } from "react";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Label } from "../components/StaffPagesComponents/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/StaffPagesComponents/ui/dialog";
import { Plus, Loader2, Pencil, Eye, Trash2, Search, RefreshCw, Building2, XCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../services/axios";
import { useTranslation } from "react-i18next";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import { adminTableStyles, adminHeadClass, adminCellClass, ADMIN_PAGE_SIZE } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { AdminPagination } from "../components/StaffPagesComponents/shared/AdminPagination";
import { BilingualText } from "../components/StaffPagesComponents/shared/BilingualText";
import { getBilingualFieldPlaceholder } from "../lib/localizedDisplay";
import { useLanguage } from "../hooks/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Faculty {
    id: number;
    code: string;
    name_ar: string;
    name_en: string;
}

const PAGE_SIZE = ADMIN_PAGE_SIZE;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FacultyManagementPage() {
    const { toast } = useToast();
    const { t } = useTranslation("FacultyManagementPage");
    const { language, isRTL } = useLanguage();
    
    // State
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    
    // Modals state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editFaculty, setEditFaculty] = useState<Faculty | null>(null);
    const [form, setForm] = useState({ code: "", name_ar: "", name_en: "" });
    const [saveLoading, setSaveLoading] = useState(false);
    
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [assignFaculty, setAssignFaculty] = useState<Faculty | null>(null);
    const [memberIdForAssign, setMemberIdForAssign] = useState("");
    const [memberName, setMemberName] = useState("");
    const [memberLookupState, setMemberLookupState] = useState<"idle" | "loading" | "found" | "notfound">("idle");
    const [assignLoading, setAssignLoading] = useState(false);

    // Fetch data
    const fetchFaculties = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ success: boolean; data: Faculty[] }>("/faculties");
            const list = res?.data?.data;
            if (Array.isArray(list)) {
                setFaculties(list);
            } else {
                setFaculties([]);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : t("errors.fetchFailed");
            toast({ title: t("errors.fetchFailedTitle"), description: message, variant: "destructive" });
            setFaculties([]);
        } finally {
            setLoading(false);
        }
    }, [toast, t]);

    useEffect(() => {
        void fetchFaculties();
    }, [fetchFaculties]);

    // Derived states
    useEffect(() => { setPage(1); }, [search]); // reset to page 1 on search

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return faculties;
        return faculties.filter((f) => 
            f.name_ar.toLowerCase().includes(q) || 
            (f.name_en && f.name_en.toLowerCase().includes(q)) || 
            f.code.toLowerCase().includes(q)
        );
    }, [faculties, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Handlers
    const openAdd = () => {
        setEditFaculty(null);
        setForm({ code: "", name_ar: "", name_en: "" });
        setIsAddOpen(true);
    };

    const openEdit = (faculty: Faculty) => {
        setEditFaculty(faculty);
        setForm({ code: faculty.code, name_ar: faculty.name_ar, name_en: faculty.name_en });
        setIsAddOpen(true);
    };

    const handleSave = async () => {
        if (!form.code.trim() || !form.name_ar.trim() || !form.name_en.trim()) {
            toast({ title: t("errors.missingDataTitle"), description: t("errors.missingDataDesc"), variant: "destructive" });
            return;
        }

        setSaveLoading(true);
        try {
            const body = { code: form.code, name_ar: form.name_ar, name_en: form.name_en };
            if (editFaculty) {
                await api.put(`/faculties/${editFaculty.id}`, body);
                toast({ title: t("success.updatedTitle"), description: t("success.updatedDesc") });
            } else {
                await api.post("/faculties", body);
                toast({ title: t("success.addedTitle"), description: t("success.addedDesc") });
            }
            setIsAddOpen(false);
            void fetchFaculties();
        } catch (err) {
            const e = err as { status?: number, responseData?: { message?: string, error?: string }, message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t("errors.saveFailedDesc");
            toast({ title: t("errors.saveFailedTitle"), description: msg, variant: "destructive" });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/faculties/${deleteId}`);
            toast({ title: t("success.deletedTitle"), description: t("success.deletedDesc") });
            setDeleteId(null);
            void fetchFaculties();
        } catch (err) {
            const e = err as { status?: number, responseData?: { message?: string, error?: string }, message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t("errors.deleteFailedDesc");
            toast({ title: t("errors.deleteFailedTitle"), description: msg, variant: "destructive" });
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
                    const fullName = m.name_ar || m.full_name || [m.first_name_ar, m.last_name_ar].filter(Boolean).join(" ") || t("page.genericMember");
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
    }, [memberIdForAssign, t]);

    const handleAssign = async () => {
        if (!assignFaculty || !memberIdForAssign.trim()) {
            toast({ title: t("errors.missingDataTitle"), description: t("errors.missingMemberDesc"), variant: "destructive" });
            return;
        }
        setAssignLoading(true);
        try {
            await api.post(`/faculties/${assignFaculty.id}/assign-to-member/${memberIdForAssign.trim()}`);
            toast({ title: t("success.assignedTitle"), description: t("success.assignedDesc") });
            setAssignFaculty(null);
            setMemberIdForAssign("");
            setMemberName("");
        } catch (err) {
            const e = err as { status?: number, responseData?: { message?: string, error?: string }, message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t("errors.assignFailedDesc");
            toast({ title: t("errors.assignFailedTitle"), description: msg, variant: "destructive" });
        } finally {
            setAssignLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col gap-0 bg-zinc-50/50" dir={isRTL ? "rtl" : "ltr"}>

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-200/60 bg-white shrink-0 z-10 shadow-[0_1px_3px_0_rgb(0,0,0,0.01)]">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-zinc-900">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        {t("page.title")}
                    </h1>
                    <p className={`text-[13px] font-medium text-zinc-500 mt-1.5 ${isRTL ? "pr-12" : "pl-12"}`}>
                        {t("page.totalFaculties")} <strong className="text-zinc-800">{faculties.length}</strong>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <RoleGuard privilege="CREATE_FACULTY">
                         <Button
                            size="sm"
                            className="gap-2 h-10 px-5 rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 shadow-md shadow-zinc-900/10 transition-all"
                            onClick={openAdd}
                        >
                            <Plus className="w-4 h-4" />
                            {t("page.addFacultyBtn")}
                        </Button>
                    </RoleGuard>
                </div>
            </div>

            {/* ── Main area (Table + Toolbar) ── */}
            <div className="flex flex-1 p-6 overflow-hidden">
                <div className="flex flex-col w-full bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden flex-1">

                    {/* Toolbar: Search + Refresh */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 bg-white shrink-0 flex-wrap">

                        {/* Search Input */}
                        <div className="relative w-full sm:w-80">
                            <Search className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none`} />
                            <Input
                                placeholder={t("page.searchPlaceholder")}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} h-10 text-[13px] bg-zinc-50/50 border-zinc-200/80 rounded-xl focus-visible:ring-primary/20 focus-visible:bg-white transition-all shadow-inner`}
                            />
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={() => { void fetchFaculties(); }}
                            disabled={loading}
                            className="p-2.5 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-500 disabled:opacity-40 border border-transparent hover:border-zinc-200"
                            title={t("page.refreshBtn")}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {/* Native HTML Table */}
                    <div className={adminTableStyles.container} style={{ scrollbarWidth: "none" }}>
                        {loading ? (
                            <div className="py-24 text-center text-zinc-400">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                                <p className="text-sm font-medium tracking-wide">{t("page.fetchingRecords")}</p>
                            </div>
                        ) : filteredRows.length === 0 ? (
                            <div className="py-24 text-center text-zinc-400 flex flex-col items-center">
                                <div className="rounded-full bg-zinc-50 border border-zinc-100 p-6 mb-5">
                                    <Building2 className="h-10 w-10 text-zinc-300" />
                                </div>
                                <h3 className="text-[15px] font-bold text-zinc-800 mb-1.5">{t("page.noFaculties")}</h3>
                                <p className="text-[13px] max-w-sm">
                                    {search ? t("page.noSearchResults", { search }) : t("page.noFacultiesDesc")}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className={adminTableStyles.header}>
                                    <TableRow>
                                        <TableHead className={adminHeadClass({ className: "w-12" })}>{t("table.serial")}</TableHead>
                                        <TableHead className={adminHeadClass()}>{t("table.name")}</TableHead>
                                        <TableHead className={adminHeadClass()}>{t("table.code")}</TableHead>
                                        <TableHead className={adminHeadClass({ center: true })}>{t("table.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className={adminTableStyles.body}>
                                    {pagedRows.map((faculty, idx) => (
                                        <TableRow key={faculty.id} className={adminTableStyles.row}>
                                            <TableCell className={adminCellClass({ size: "muted", className: "font-mono w-12" })}>
                                                {(page - 1) * PAGE_SIZE + idx + 1}
                                            </TableCell>

                                            <TableCell className={adminCellClass()}>
                                                <BilingualText
                                                    ar={faculty.name_ar}
                                                    en={faculty.name_en}
                                                    language={language}
                                                    primaryClassName="font-semibold text-xs"
                                                />
                                            </TableCell>

                                            <TableCell className={adminCellClass()}>
                                                <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-widest border border-border" dir="ltr">
                                                    {faculty.code}
                                                </span>
                                            </TableCell>

                                            <TableCell className={adminCellClass({ center: true })}>
                                                <div className={`${adminTableStyles.actions} transition-opacity`}>
                                                    
                                                    <RoleGuard privilege="UPDATE_FACULTY">
                                                        <button
                                                            title={t("actions.edit")}
                                                            onClick={() => openEdit(faculty)}
                                                            className="p-1.5 rounded-lg hover:bg-zinc-900 hover:text-white text-zinc-500 transition-all shadow-sm border border-transparent hover:border-zinc-800"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    </RoleGuard>

                                                    <RoleGuard privilege="ASSIGN_FACULTY_TO_MEMBER">
                                                        <button
                                                            title={t("actions.assignMember")}
                                                            onClick={() => setAssignFaculty(faculty)}
                                                            className="p-1.5 rounded-lg hover:bg-zinc-900 hover:text-white text-zinc-500 transition-all shadow-sm border border-transparent hover:border-zinc-800"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </RoleGuard>

                                                    <RoleGuard privilege="DELETE_FACULTY">
                                                        <button
                                                            title={t("actions.delete")}
                                                            onClick={() => setDeleteId(faculty.id)}
                                                            className="p-1.5 rounded-lg hover:bg-rose-500 hover:text-white text-zinc-500 transition-all shadow-sm border border-transparent hover:border-rose-600"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </RoleGuard>

                                                </div>
                                            </TableCell>
                                        </TableRow>
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
            </div>

            {/* ── Dialogs ── */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[425px]" dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader className={isRTL ? "text-right" : "text-left"}>
                        <DialogTitle>{editFaculty ? t("modalAdd.editTitle") : t("modalAdd.addTitle")}</DialogTitle>
                        <DialogDescription>
                            {editFaculty ? t("modalAdd.editDesc") : t("modalAdd.addDesc")}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code" className={isRTL ? "text-right" : "text-left"}>{t("modalAdd.codeLabel")}</Label>
                            <Input 
                                id="code" 
                                dir="ltr" 
                                className={`text-left font-mono uppercase`} 
                                value={form.code} 
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                                placeholder={t("modalAdd.codePlaceholder")} 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name_ar" className={isRTL ? "text-right" : "text-left"}>{t("modalAdd.nameArLabel")}</Label>
                            <Input 
                                id="name_ar" 
                                value={form.name_ar} 
                                onChange={(e) => setForm({ ...form, name_ar: e.target.value })} 
                                placeholder={getBilingualFieldPlaceholder("ar", "FacultyManagementPage", "modalAdd.nameArPlaceholder")} 
                                dir={isRTL ? "rtl" : "auto"}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name_en" className={isRTL ? "text-right" : "text-left"}>{t("modalAdd.nameEnLabel")}</Label>
                            <Input 
                                id="name_en" 
                                dir="ltr" 
                                className="text-left" 
                                value={form.name_en} 
                                onChange={(e) => setForm({ ...form, name_en: e.target.value })} 
                                placeholder={getBilingualFieldPlaceholder("en", "FacultyManagementPage", "modalAdd.nameEnPlaceholder")} 
                            />
                        </div>
                    </div>

                    <DialogFooter className={`gap-2 sm:gap-0 ${isRTL ? 'sm:justify-start' : 'sm:justify-end'}`}>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={saveLoading}>{t("common.cancel")}</Button>
                        <Button onClick={() => void handleSave()} disabled={saveLoading} className="w-full sm:w-auto">
                            {saveLoading && <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />}
                            {saveLoading ? t("modalAdd.saving") : t("modalAdd.saveBtn")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader className={isRTL ? "text-right" : "text-left"}>
                        <DialogTitle className="text-destructive">{t("modalDelete.title")}</DialogTitle>
                        <DialogDescription>
                            {t("modalDelete.desc")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className={`gap-2 ${isRTL ? 'sm:justify-start' : 'sm:justify-end'}`}>
                        <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteLoading}>
                            {deleteLoading && <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />}
                            {deleteLoading ? t("modalDelete.deleting") : t("modalDelete.confirmBtn")}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteLoading}>{t("common.cancel")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={assignFaculty !== null} onOpenChange={(open) => { 
                if (!open) { setAssignFaculty(null); setMemberIdForAssign(""); setMemberName(""); } 
            }}>
                <DialogContent dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader className={isRTL ? "text-right" : "text-left"}>
                        <DialogTitle>{t("modalAssign.title")}</DialogTitle>
                        <DialogDescription>
                            {t("modalAssign.desc")} <span className="font-bold underline text-primary">{assignFaculty?.name_ar}</span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <Label htmlFor="memberIdAssign" className={isRTL ? "text-right block" : "text-left block"}>{t("modalAssign.memberIdLabel")}</Label>
                        <div className="relative mt-2">
                            <Input
                                id="memberIdAssign"
                                dir="ltr"
                                className={`text-left font-mono ${isRTL ? 'pr-8 pl-3' : 'pr-3 pl-8'}`}
                                placeholder={t("modalAssign.memberIdPlaceholder")}
                                value={memberIdForAssign}
                                onChange={(e) => setMemberIdForAssign(e.target.value)}
                            />
                            {memberLookupState === "loading" && (
                                <Loader2 className={`absolute ${isRTL ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground`} />
                            )}
                            {memberLookupState === "found" && (
                                <span className={`absolute ${isRTL ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 text-emerald-600 bg-emerald-100 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold`}>✓</span>
                            )}
                        </div>
                        {memberLookupState === "notfound" && (
                            <p className="text-[12px] text-destructive flex items-center gap-1 mt-2">
                                <XCircle className="w-3 h-3" />
                                {t("modalAssign.memberNotFound")}
                            </p>
                        )}
                        {memberLookupState === "idle" && !memberIdForAssign.trim() && (
                            <p className="text-[12px] text-muted-foreground mt-2">
                                {t("modalAssign.enterNumbers")}
                            </p>
                        )}
                        {memberLookupState === "found" && (
                            <p className="text-sm font-medium text-emerald-700 mt-3 p-2 bg-emerald-50 rounded-md border border-emerald-100">
                                {t("modalAssign.nameLabel")} {memberName}
                            </p>
                        )}
                    </div>

                    <DialogFooter className={`gap-2 sm:gap-0 ${isRTL ? 'sm:justify-start' : 'sm:justify-end'}`}>
                        <Button 
                            onClick={() => void handleAssign()} 
                            disabled={assignLoading || memberLookupState !== "found"}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                        >
                            {assignLoading && <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />}
                            {assignLoading ? t("modalAssign.assigning") : t("modalAssign.assignBtn")}
                        </Button>
                        <Button variant="outline" onClick={() => setAssignFaculty(null)} disabled={assignLoading}>{t("common.cancel")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
