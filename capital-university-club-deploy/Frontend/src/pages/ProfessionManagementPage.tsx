import { useCallback, useEffect, useState, useMemo } from "react";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Label } from "../components/StaffPagesComponents/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/StaffPagesComponents/ui/dialog";
import { Plus, Loader2, Pencil, Eye, Trash2, Search, RefreshCw, Briefcase, XCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../services/axios";
import { useTranslation } from "react-i18next";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import { adminTableStyles, adminHeadClass, adminCellClass, ADMIN_PAGE_SIZE, adminPageStyles } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { AdminActionButton, AdminRowActions } from "../components/StaffPagesComponents/shared/AdminRowActions";
import { AdminPagination } from "../components/StaffPagesComponents/shared/AdminPagination";
import { AdminPageHeader } from "../components/StaffPagesComponents/shared/AdminPageHeader";
import { AdminTableCodeChip } from "../components/StaffPagesComponents/shared/AdminTableSharedCells";
import { BilingualText } from "../components/StaffPagesComponents/shared/BilingualText";
import { getBilingualFieldPlaceholder } from "../lib/localizedDisplay";
import { useLanguage } from "../hooks/useLanguage";
import { FieldInlineError } from "../components/StaffPagesComponents/shared/FieldInlineError";
import { useAdminFieldValidation } from "../hooks/useAdminFieldValidation";
import { validateAdminCodeNameForm, validateMemberAssignId } from "../lib/validation/adminForms";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profession {
    id: number;
    code: string;
    name_ar: string;
    name_en: string;
}

const PAGE_SIZE = ADMIN_PAGE_SIZE;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfessionManagementPage() {
    const { toast } = useToast();
    const { t } = useTranslation("ProfessionManagementPage");
    const { language, isRTL } = useLanguage();
    const { tVal, handleArabicChange, handleEnglishChange, handleCodeChange, handleDigitsChange } = useAdminFieldValidation();

    // ── Data state ──────────────────────────────────────────────────────────
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Search & pagination ─────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // ── Fetch ───────────────────────────────────────────────────────────────
    const fetchProfessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ success: boolean; data: Profession[] }>("/professions");
            const list = res?.data?.data;
            if (Array.isArray(list)) {
                setProfessions(list);
            } else {
                setProfessions([]);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : t("errors.fetchFailed");
            toast({ title: t("errors.fetchFailedTitle"), description: message, variant: "destructive" });
            setProfessions([]);
        } finally {
            setLoading(false);
        }
    }, [toast, t]);

    useEffect(() => {
        void fetchProfessions();
    }, [fetchProfessions]);

    // ── Reset page on search change ─────────────────────────────────────────
    useEffect(() => { setPage(1); }, [search]);

    // ── Derived: filtered + paged rows ──────────────────────────────────────
    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return professions;
        return professions.filter((p) =>
            p.name_ar.toLowerCase().includes(q) ||
            (p.name_en && p.name_en.toLowerCase().includes(q)) ||
            p.code.toLowerCase().includes(q)
        );
    }, [professions, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── Create / Edit modal state ────────────────────────────────────────────
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editProfession, setEditProfession] = useState<Profession | null>(null);
    const [form, setForm] = useState({ code: "", name_ar: "", name_en: "" });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
    const [saveLoading, setSaveLoading] = useState(false);

    const openAdd = () => {
        setEditProfession(null);
        setForm({ code: "", name_ar: "", name_en: "" });
        setFieldErrors({});
        setIsAddOpen(true);
    };

    const openEdit = (profession: Profession) => {
        setEditProfession(profession);
        setForm({ code: profession.code, name_ar: profession.name_ar, name_en: profession.name_en });
        setFieldErrors({});
        setIsAddOpen(true);
    };

    const handleSave = async () => {
        const errors = validateAdminCodeNameForm(form, tVal, { requireCode: true, requireNameEn: true });
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            toast({ title: t("errors.missingDataTitle"), description: t("errors.missingDataDesc"), variant: "destructive" });
            return;
        }
        setFieldErrors({});        setSaveLoading(true);
        try {
            const body = { code: form.code, name_ar: form.name_ar, name_en: form.name_en };
            if (editProfession) {
                await api.put(`/professions/${editProfession.id}`, body);
                toast({ title: t("success.updatedTitle"), description: t("success.updatedDesc") });
            } else {
                await api.post("/professions", body);
                toast({ title: t("success.addedTitle"), description: t("success.addedDesc") });
            }
            setIsAddOpen(false);
            void fetchProfessions();
        } catch (err) {
            const e = err as { status?: number; responseData?: { message?: string; error?: string }; message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t("errors.saveFailedDesc");
            toast({ title: t("errors.saveFailedTitle"), description: msg, variant: "destructive" });
        } finally {
            setSaveLoading(false);
        }
    };

    // ── Delete state + handler ────────────────────────────────────────────
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/professions/${deleteId}`);
            toast({ title: t("success.deletedTitle"), description: t("success.deletedDesc") });
            setDeleteId(null);
            void fetchProfessions();
        } catch (err) {
            const e = err as { status?: number; responseData?: { message?: string; error?: string }; message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t("errors.deleteFailedDesc");
            toast({ title: t("errors.deleteFailedTitle"), description: msg, variant: "destructive" });
        } finally {
            setDeleteLoading(false);
        }
    };

    // ── Assign-to-member state + handler ─────────────────────────────────
    const [assignProfession, setAssignProfession] = useState<Profession | null>(null);
    const [memberIdForAssign, setMemberIdForAssign] = useState("");
    const [memberName, setMemberName] = useState("");
    const [memberLookupState, setMemberLookupState] = useState<"idle" | "loading" | "found" | "notfound">("idle");
    const [assignLoading, setAssignLoading] = useState(false);

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
                const res = await api.get<{ data: { name_ar?: string; full_name?: string; first_name_ar?: string; last_name_ar?: string } }>(`/members/${numericId}`);
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
        const memberIdError = validateMemberAssignId(memberIdForAssign, tVal);
        if (!assignProfession || memberIdError) {
            toast({
                title: t("errors.missingDataTitle"),
                description: memberIdError ?? t("errors.missingMemberDesc"),
                variant: "destructive",
            });
            return;
        }
        setAssignLoading(true);
        try {
            await api.post(`/professions/${assignProfession.id}/assign-to-member/${memberIdForAssign.trim()}`);
            toast({ title: t("success.assignedTitle"), description: t("success.assignedDesc") });
            setAssignProfession(null);
            setMemberIdForAssign("");
            setMemberName("");
        } catch (err) {
            const e = err as { status?: number; responseData?: { message?: string; error?: string }; message?: string };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t("errors.assignFailedDesc");
            toast({ title: t("errors.assignFailedTitle"), description: msg, variant: "destructive" });
        } finally {
            setAssignLoading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <div className="h-[calc(100vh-4rem)] flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>

                <AdminPageHeader
                    icon={Briefcase}
                    title={t("page.title")}
                    subtitle={
                        <>
                            {t("page.totalProfessions")}{" "}
                            <strong className="text-foreground">{professions.length}</strong>
                        </>
                    }
                    actions={
                        <RoleGuard privilege="CREATE_PROFESSION">
                            <Button size="sm" className="gap-2" onClick={openAdd}>
                                <Plus className="w-4 h-4" />
                                {t("page.addProfessionBtn")}
                            </Button>
                        </RoleGuard>
                    }
                />

                <div className={adminPageStyles.toolbar}>
                    <div className="relative flex-1 min-w-[180px] max-w-sm">
                        <Search className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
                        <Input
                            placeholder={t("page.searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${adminPageStyles.toolbarSearch} ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className={`${adminPageStyles.refreshBtn} h-10`}
                        onClick={() => { void fetchProfessions(); }}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        {t("page.refreshBtn")}
                    </Button>
                </div>

                <div className={adminTableStyles.shell}>
                        <div className={adminTableStyles.container}>
                            {loading ? (
                                <div className="py-24 text-center text-zinc-400">
                                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                                    <p className="text-sm font-medium tracking-wide">{t("page.fetchingRecords")}</p>
                                </div>
                            ) : filteredRows.length === 0 ? (
                                <div className="py-24 text-center text-zinc-400 flex flex-col items-center">
                                    <div className="rounded-full bg-zinc-50 border border-zinc-100 p-6 mb-5">
                                        <Briefcase className="h-10 w-10 text-zinc-300" />
                                    </div>
                                    <h3 className="text-[13px] font-bold text-zinc-800 mb-1.5">{t("page.noProfessions")}</h3>
                                    <p className="text-[13px] max-w-sm">
                                        {search ? t("page.noSearchResults", { search }) : t("page.noProfessionsDesc")}
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
                                        {pagedRows.map((profession, idx) => (
                                            <TableRow key={profession.id} className={adminTableStyles.row}>
                                                <TableCell className={adminCellClass({ size: "muted", className: "font-mono w-12" })}>
                                                    {(page - 1) * PAGE_SIZE + idx + 1}
                                                </TableCell>

                                                <TableCell className={adminCellClass()}>
                                                    <BilingualText
                                                        ar={profession.name_ar}
                                                        en={profession.name_en}
                                                        language={language}
                                                        primaryClassName="font-semibold text-xs"
                                                    />
                                                </TableCell>

                                                <TableCell className={adminCellClass()}>
                                                    <AdminTableCodeChip>{profession.code}</AdminTableCodeChip>
                                                </TableCell>

                                                <TableCell className={adminCellClass({ center: true })}>
                                                    <AdminRowActions>
                                                        <RoleGuard privilege="UPDATE_PROFESSION">
                                                            <AdminActionButton
                                                                tooltip={t("actions.edit")}
                                                                icon={Pencil}
                                                                variant="edit"
                                                                onClick={() => openEdit(profession)}
                                                            />
                                                        </RoleGuard>

                                                        <RoleGuard privilege="ASSIGN_PROFESSION_TO_MEMBER">
                                                            <AdminActionButton
                                                                tooltip={t("actions.assignMember")}
                                                                icon={Eye}
                                                                variant="view"
                                                                onClick={() => { setAssignProfession(profession); setMemberIdForAssign(""); setMemberName(""); setMemberLookupState("idle"); }}
                                                            />
                                                        </RoleGuard>

                                                        <RoleGuard privilege="DELETE_PROFESSION">
                                                            <AdminActionButton
                                                                tooltip={t("actions.delete")}
                                                                icon={Trash2}
                                                                variant="delete"
                                                                onClick={() => setDeleteId(profession.id)}
                                                            />
                                                        </RoleGuard>
                                                    </AdminRowActions>
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

            {/* ── Create / Edit Dialog ── */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[425px]" dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader className={isRTL ? "text-right" : "text-left"}>
                        <DialogTitle>{editProfession ? t("modalAdd.editTitle") : t("modalAdd.addTitle")}</DialogTitle>
                        <DialogDescription>
                            {editProfession
                                ? t("modalAdd.editDesc")
                                : t("modalAdd.addDesc")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="prof-code" className={isRTL ? "text-right" : "text-left"}>{t("modalAdd.codeLabel")}</Label>
                            <Input
                                id="prof-code"
                                dir="ltr"
                                className={`text-left font-mono uppercase ${fieldErrors.code ? "border-destructive" : ""}`}
                                value={form.code}
                                onChange={(e) => handleCodeChange(
                                    e.target.value,
                                    (code) => setForm({ ...form, code }),
                                    (message) => setFieldErrors((prev) => ({ ...prev, code: message })),
                                )}
                                placeholder={t("modalAdd.codePlaceholder")}
                            />
                            <FieldInlineError message={fieldErrors.code} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prof-name-ar" className={isRTL ? "text-right" : "text-left"}>{t("modalAdd.nameArLabel")}</Label>
                            <Input
                                id="prof-name-ar"
                                value={form.name_ar}
                                onChange={(e) => handleArabicChange(
                                    e.target.value,
                                    (name_ar) => setForm({ ...form, name_ar }),
                                    (message) => setFieldErrors((prev) => ({ ...prev, name_ar: message })),
                                )}
                                placeholder={getBilingualFieldPlaceholder("ar", "ProfessionManagementPage", "modalAdd.nameArPlaceholder")}
                                dir={isRTL ? "rtl" : "auto"}
                                className={fieldErrors.name_ar ? "border-destructive" : ""}
                            />
                            <FieldInlineError message={fieldErrors.name_ar} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prof-name-en" className={isRTL ? "text-right" : "text-left"}>{t("modalAdd.nameEnLabel")}</Label>
                            <Input
                                id="prof-name-en"
                                dir="ltr"
                                className={`text-left ${fieldErrors.name_en ? "border-destructive" : ""}`}
                                value={form.name_en}
                                onChange={(e) => handleEnglishChange(
                                    e.target.value,
                                    (name_en) => setForm({ ...form, name_en }),
                                    (message) => setFieldErrors((prev) => ({ ...prev, name_en: message })),
                                )}
                                placeholder={getBilingualFieldPlaceholder("en", "ProfessionManagementPage", "modalAdd.nameEnPlaceholder")}
                            />
                            <FieldInlineError message={fieldErrors.name_en} />
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

            {/* ── Delete Confirmation Dialog ── */}
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

            {/* ── Assign to Member Dialog ── */}
            <Dialog open={assignProfession !== null} onOpenChange={(open) => {
                if (!open) { setAssignProfession(null); setMemberIdForAssign(""); setMemberName(""); }
            }}>
                <DialogContent dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader className={isRTL ? "text-right" : "text-left"}>
                        <DialogTitle>{t("modalAssign.title")}</DialogTitle>
                        <DialogDescription>
                            {t("modalAssign.desc")} <span className="font-bold underline text-primary">{assignProfession?.name_ar}</span>
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
                                onChange={(e) => handleDigitsChange(e.target.value, setMemberIdForAssign)}
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
                        <Button variant="outline" onClick={() => setAssignProfession(null)} disabled={assignLoading}>{t("common.cancel")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
