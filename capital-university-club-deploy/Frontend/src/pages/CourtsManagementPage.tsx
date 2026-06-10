import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../components/StaffPagesComponents/ui/table";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Label } from "../components/StaffPagesComponents/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../components/StaffPagesComponents/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/StaffPagesComponents/ui/select";
import { Badge } from "../components/StaffPagesComponents/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../components/StaffPagesComponents/ui/popover";
import { Plus, Pencil, Check, X, Search, Loader2, Filter, RefreshCw, LayoutGrid, Power } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {
    getAllFields,
    createField,
    updateField,
    updateFieldStatus,
    updateBookingSettings,
    type Field
} from "../services/fieldsApi";
import { fetchActiveSports, type Sport } from "../services/sportsApi";
import { Switch } from "../components/StaffPagesComponents/ui/switch";
import { useLanguage } from "../hooks/useLanguage";
import { adminTableStyles, adminHeadClass, adminCellClass, adminDialogStyles, adminPageStyles, ADMIN_PAGE_SIZE } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { AdminPageHeader } from "../components/StaffPagesComponents/shared/AdminPageHeader";
import { AdminPagination } from "../components/StaffPagesComponents/shared/AdminPagination";
import { AdminMemberStatusBadge } from "../components/StaffPagesComponents/shared/AdminMemberStatusBadge";
import { getAdminStatusConfig } from "../components/StaffPagesComponents/shared/adminMemberStatus";
import { AdminActionButton, AdminRowActions } from "../components/StaffPagesComponents/shared/AdminRowActions";
import { FieldInlineError } from "../components/StaffPagesComponents/shared/FieldInlineError";
import { BilingualText } from "../components/StaffPagesComponents/shared/BilingualText";
import { getBilingualFieldPlaceholder, getLocalizedText } from "../lib/localizedDisplay";

type FieldStatus = Field["status"];

type FieldFormErrors = {
    name_ar?: string;
    name_en?: string;
    sportId?: string;
    capacity?: string;
};

const PAGE_SIZE = ADMIN_PAGE_SIZE;

const emptyForm = () => ({
    name_ar: "",
    name_en: "",
    sportId: "" as string | number,
    capacity: "",
    status: "active" as FieldStatus,
    isAvailableForBooking: true,
});

const COURT_STATUS_OPTIONS: FieldStatus[] = ["active", "inactive", "maintenance"];

export default function CourtsManagementPage() {
    const [fields, setFields] = useState<Field[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [filterSports, setFilterSports] = useState<number[]>([]);
    const [sportPopoverOpen, setSportPopoverOpen] = useState(false);
    const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editField, setEditField] = useState<Field | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [fieldErrors, setFieldErrors] = useState<FieldFormErrors>({});
    const [page, setPage] = useState(1);

    const { toast } = useToast();
    const { t } = useTranslation("CourtsManagementPage");
    const { t: tStatus } = useTranslation("common");
    const { language, isRTL } = useLanguage();

    const getFieldName = (field: Field) =>
        getLocalizedText(field.name_ar, field.name_en, language);

    const getSportName = (sport?: Sport | Field["sport"]) =>
        sport ? getLocalizedText(sport.name_ar, sport.name_en, language) : "";

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [fieldsData, sportsData] = await Promise.all([
                    getAllFields(),
                    fetchActiveSports(),
                ]);
                setFields(fieldsData);
                setSports(sportsData);
            } catch (error) {
                console.error("Error loading data:", error);
                toast({
                    title: t("toast.errorTitle"),
                    description: t("toast.loadFailed"),
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };
        void loadInitialData();
    }, [toast, t]);

    const uniqueSports = Array.from(
        new Map(fields.map((f) => [f.sport_id, getSportName(f.sport)])).entries()
    ).map(([id, name]) => ({ id, name }));

    const filtered = useMemo(() => fields.filter((f) => {
        const normalizedSearch = search.trim().toLowerCase();
        const matchSearch = normalizedSearch
            ? f.name_ar.toLowerCase().includes(normalizedSearch) ||
            f.name_en.toLowerCase().includes(normalizedSearch) ||
            (f.sport?.name_ar || "").toLowerCase().includes(normalizedSearch) ||
            (f.sport?.name_en || "").toLowerCase().includes(normalizedSearch)
            : true;
        const matchSport =
            filterSports.length === 0 ? true : filterSports.includes(f.sport_id);
        const matchStatus =
            filterStatuses.length === 0 ? true : filterStatuses.includes(f.status);
        return matchSearch && matchSport && matchStatus;
    }), [fields, search, filterSports, filterStatuses]);

    useEffect(() => {
        setPage(1);
    }, [search, filterSports, filterStatuses]);

    const pagedFields = useMemo(
        () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [filtered, page],
    );

    const totalCount = fields.length;
    const activeCount = fields.filter((f) => f.status === "active").length;
    const bookingCount = fields.filter((f) => f.is_available_for_booking).length;

    const openAdd = () => {
        setEditField(null);
        setForm(emptyForm());
        setFieldErrors({});
        setDialogOpen(true);
    };

    const openEdit = (field: Field) => {
        setEditField(field);
        setForm({
            name_ar: field.name_ar,
            name_en: field.name_en,
            sportId: field.sport_id,
            capacity: String(field.capacity || ""),
            status: field.status,
            isAvailableForBooking: field.is_available_for_booking,
        });
        setFieldErrors({});
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditField(null);
        setForm(emptyForm());
        setFieldErrors({});
    };

    const collectFieldErrors = (): FieldFormErrors => {
        const errors: FieldFormErrors = {};
        if (!form.name_ar.trim()) errors.name_ar = t("validation.nameArRequired");
        if (!form.name_en.trim()) errors.name_en = t("validation.nameEnRequired");
        if (!form.sportId) errors.sportId = t("validation.sportRequired");
        if (form.capacity && Number(form.capacity) < 1) errors.capacity = t("validation.capacityInvalid");
        return errors;
    };

    const handleSave = async () => {
        const errors = collectFieldErrors();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});

        try {
            setSaving(true);
            const displayName = language === "en" ? form.name_en.trim() : form.name_ar.trim();

            if (editField) {
                const updated = await updateField(editField.id, {
                    name_ar: form.name_ar.trim(),
                    name_en: form.name_en.trim(),
                    sport_id: Number(form.sportId),
                    capacity: form.capacity ? Number(form.capacity) : undefined,
                    status: form.status,
                });

                await updateBookingSettings(editField.id, {
                    is_available_for_booking: form.isAvailableForBooking,
                });

                setFields((prev) =>
                    prev.map((f) => (f.id === editField.id ? { ...updated, is_available_for_booking: form.isAvailableForBooking } : f))
                );

                toast({
                    title: t("toast.updateSuccessTitle"),
                    description: t("toast.updateSuccessDescription", { name: displayName })
                });
            } else {
                const newField = await createField({
                    name_ar: form.name_ar.trim(),
                    name_en: form.name_en.trim(),
                    sport_id: Number(form.sportId),
                    capacity: form.capacity ? Number(form.capacity) : undefined,
                    status: form.status,
                    is_available_for_booking: form.isAvailableForBooking,
                });

                setFields((prev) => [...prev, newField]);

                toast({
                    title: t("toast.createSuccessTitle"),
                    description: t("toast.createSuccessDescription", { name: displayName })
                });
            }

            setDialogOpen(false);
            setEditField(null);
            setForm(emptyForm());
        } catch (error) {
            console.error("Error saving field:", error);
            const message = error instanceof Error ? error.message : t("toast.saveFailed");
            toast({
                title: t("toast.errorTitle"),
                description: message,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (id: string) => {
        try {
            const field = fields.find((f) => f.id === id);
            if (!field) return;

            const newStatus = field.status === "active" ? "inactive" : "active";
            const updated = await updateFieldStatus(id, newStatus);

            setFields((prev) =>
                prev.map((f) => (f.id === id ? updated : f))
            );

            toast({
                title: newStatus === "active" ? t("toast.activatedTitle") : t("toast.deactivatedTitle"),
                description: t(newStatus === "active" ? "toast.activatedDescription" : "toast.deactivatedDescription", {
                    name: getFieldName(field),
                }),
            });
        } catch (error) {
            console.error("Error toggling status:", error);
            const message = error instanceof Error ? error.message : t("toast.statusUpdateFailed");
            toast({
                title: t("toast.errorTitle"),
                description: message,
                variant: "destructive",
            });
        }
    };

    const reloadData = async () => {
        try {
            setLoading(true);
            const [fieldsData, sportsData] = await Promise.all([
                getAllFields(),
                fetchActiveSports(),
            ]);
            setFields(fieldsData);
            setSports(sportsData);
        } catch (error) {
            console.error("Error loading data:", error);
            toast({
                title: t("toast.errorTitle"),
                description: t("toast.loadFailed"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
            <AdminPageHeader
                icon={LayoutGrid}
                title={t("header.title")}
                subtitle={
                    <>
                        {t("header.totalCourts")}{" "}
                        <strong className="text-foreground">{totalCount}</strong>
                        <span className="mx-2 text-border">·</span>
                        <span className={adminPageStyles.statChip + " text-emerald-700 bg-emerald-50"}>
                            {t("stats.active")}: {activeCount}
                        </span>
                        <span className={adminPageStyles.statChip + " text-blue-700 bg-blue-50"}>
                            {t("stats.bookable")}: {bookingCount}
                        </span>
                    </>
                }
                actions={
                    <>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => void reloadData()} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            {t("filters.refresh")}
                        </Button>
                        <RoleGuard privilege="CREATE_FIELD">
                            <Button size="sm" className="gap-2" onClick={openAdd}>
                                <Plus className="h-4 w-4" />
                                {t("header.addCourt")}
                            </Button>
                        </RoleGuard>
                    </>
                }
            />

            <div className={adminPageStyles.toolbar}>
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none`} />
                    <Input
                        dir={isRTL ? "rtl" : "ltr"}
                        placeholder={t("filters.searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={isRTL ? "pr-9" : "pl-9"}
                    />
                </div>

                <Popover open={sportPopoverOpen} onOpenChange={setSportPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button className={`flex items-center gap-1.5 h-10 px-3 rounded-md border text-sm transition-colors
                            ${filterSports.length > 0
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-input bg-background text-muted-foreground hover:bg-muted"}`}>
                            {t("filters.allSports")}
                            {filterSports.length > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                                    {filterSports.length}
                                </span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-48 p-0" dir={isRTL ? "rtl" : "ltr"}>
                        <div className="py-1 max-h-64 overflow-y-auto">
                            {uniqueSports.map((s) => {
                                const checked = filterSports.includes(Number(s.id));
                                const count = fields.filter(f => f.sport_id === Number(s.id)).length;
                                return (
                                    <label key={s.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                setFilterSports(prev =>
                                                    prev.includes(Number(s.id))
                                                        ? prev.filter(id => id !== Number(s.id))
                                                        : [...prev, Number(s.id)]
                                                );
                                            }}
                                            className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                                        />
                                        <span className="text-xs font-medium">{s.name || t("common.notAvailable")}</span>
                                        <span className="ms-auto text-[10px] text-muted-foreground">{count}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {filterSports.length > 0 && (
                            <div className="flex justify-end px-3 py-2 border-t border-border">
                                <button
                                    onClick={() => { setFilterSports([]); setSportPopoverOpen(false); }}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t("filters.clear")}
                                </button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button className={`flex items-center gap-1.5 h-10 px-3 rounded-md border text-sm transition-colors
                            ${filterStatuses.length > 0
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-input bg-background text-muted-foreground hover:bg-muted"}`}>
                            <Filter className="w-3.5 h-3.5" />
                            {t("filters.status")}
                            {filterStatuses.length > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                                    {filterStatuses.length}
                                </span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-48 p-0" dir={isRTL ? "rtl" : "ltr"}>
                        <div className="py-1">
                            {COURT_STATUS_OPTIONS.map((key) => {
                                const cfg = getAdminStatusConfig(key);
                                const checked = filterStatuses.includes(key);
                                const count = fields.filter(f => f.status === key).length;
                                return (
                                    <label key={key} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                setFilterStatuses(prev =>
                                                    prev.includes(key)
                                                        ? prev.filter(s => s !== key)
                                                        : [...prev, key]
                                                );
                                            }}
                                            className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                                        />
                                        <span className={`text-xs font-medium ${cfg.color}`}>{tStatus(cfg.labelKey)}</span>
                                        <span className="ms-auto text-[10px] text-muted-foreground">{count}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {filterStatuses.length > 0 && (
                            <div className="flex justify-end px-3 py-2 border-t border-border">
                                <button
                                    onClick={() => { setFilterStatuses([]); setStatusPopoverOpen(false); }}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t("filters.clear")}
                                </button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
                <span className={adminPageStyles.toolbarResults}>
                    {t("filters.results", { count: filtered.length })}
                </span>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="flex-1 overflow-hidden border-t border-border bg-card flex flex-col">
                    <div className={adminTableStyles.container}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Table>
                    <TableHeader className={adminTableStyles.header}>
                        <TableRow>
                            <TableHead className={adminHeadClass({ center: true, className: "w-10" })}>#</TableHead>
                            <TableHead className={adminHeadClass()}>{t("table.colCourtName")}</TableHead>
                            <TableHead className={adminHeadClass()}>{t("table.colSport")}</TableHead>
                            <TableHead className={adminHeadClass({ center: true })}>{t("table.colCapacity")}</TableHead>
                            <TableHead className={adminHeadClass({ center: true })}>{t("table.colRequiresBooking")}</TableHead>
                            <TableHead className={adminHeadClass({ center: true })}>{t("table.colStatus")}</TableHead>
                            <TableHead className={adminHeadClass({ center: true, className: "w-[148px]" })}>{t("table.colActions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className={adminTableStyles.body}>
                        <AnimatePresence>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>{t("table.loading")}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                                        {t("table.noResults")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pagedFields.map((field, index) => {
                                    const isActive = field.status === "active";
                                    const rowNumber = (page - 1) * PAGE_SIZE + index + 1;
                                    return (
                                        <motion.tr
                                            key={field.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={adminTableStyles.row}
                                        >
                                            <TableCell className={adminCellClass({ center: true, size: "muted", className: "font-mono" })}>
                                                {rowNumber}
                                            </TableCell>

                                            <TableCell className={adminCellClass()}>
                                                <BilingualText ar={field.name_ar} en={field.name_en} language={language} primaryClassName="font-medium" />
                                            </TableCell>

                                            <TableCell className={adminCellClass({ size: "muted" })}>{getSportName(field.sport) || t("common.notAvailable")}</TableCell>

                                            <TableCell className={adminCellClass({ center: true, className: "font-mono" })}>{field.capacity || t("common.notAvailable")}</TableCell>

                                            <TableCell className={adminCellClass({ center: true })}>
                                                {field.is_available_for_booking ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 gap-1">
                                                        <Check className="h-3 w-3" /> {t("common.yes")}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground gap-1">
                                                        <X className="h-3 w-3" /> {t("common.no")}
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className={adminCellClass({ center: true })}>
                                                <AdminMemberStatusBadge status={field.status} compact />
                                            </TableCell>

                                            <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                                                <AdminRowActions>
                                                    <RoleGuard privilege="UPDATE_FIELD">
                                                        <AdminActionButton
                                                            tooltip={t("actions.edit")}
                                                            icon={Pencil}
                                                            variant="edit"
                                                            onClick={() => openEdit(field)}
                                                        />
                                                    </RoleGuard>
                                                    <RoleGuard privilege="MANAGE_FIELD_STATUS">
                                                        <AdminActionButton
                                                            tooltip={isActive ? t("actions.disable") : t("actions.enable")}
                                                            icon={Power}
                                                            variant="status"
                                                            onClick={() => void toggleActive(field.id)}
                                                        />
                                                    </RoleGuard>
                                                </AdminRowActions>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </motion.div>
                    </div>

                    <AdminPagination
                        page={page}
                        totalCount={filtered.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                        isRTL={isRTL}
                        disabled={loading}
                    />
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
                <DialogContent className={`${adminDialogStyles.content} max-w-lg`} dir={isRTL ? "rtl" : "ltr"}>
                    <div className={`${adminDialogStyles.panel} max-h-[90vh]`}>
                        <div className="px-6 py-4 border-b border-border bg-muted/20 shrink-0">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    {editField ? <Pencil className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                                </div>
                                <DialogHeader className="space-y-1 text-start">
                                    <DialogTitle className="text-lg font-bold">
                                        {editField ? t("dialog.editTitle") : t("dialog.addTitle")}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editField ? t("dialog.editDescription") : t("dialog.addDescription")}
                                    </DialogDescription>
                                </DialogHeader>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0">
                            <section className="rounded-xl border border-border bg-card overflow-hidden">
                                <div className="px-4 py-3 border-b border-border bg-muted/30">
                                    <h3 className="text-sm font-semibold text-foreground">{t("dialog.basicInfo")}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t("dialog.basicInfoHint")}</p>
                                </div>
                                <div className="p-4 space-y-4">
                        <div>
                            <Label htmlFor="field-name-ar" className="mb-1.5 block">{t("dialog.fields.nameAr")} <span className="text-destructive">*</span></Label>
                            <Input
                                id="field-name-ar"
                                placeholder={getBilingualFieldPlaceholder("ar", "CourtsManagementPage", "dialog.placeholders.nameAr")}
                                value={form.name_ar}
                                onChange={(e) => {
                                    setForm({ ...form, name_ar: e.target.value });
                                    setFieldErrors((prev) => ({ ...prev, name_ar: undefined }));
                                }}
                                dir="rtl"
                                className={`h-10 ${fieldErrors.name_ar ? "border-destructive" : ""}`}
                            />
                            <FieldInlineError message={fieldErrors.name_ar} />
                        </div>

                        <div>
                            <Label htmlFor="field-name-en" className="mb-1.5 block">{t("dialog.fields.nameEn")} <span className="text-destructive">*</span></Label>
                            <Input
                                id="field-name-en"
                                placeholder={getBilingualFieldPlaceholder("en", "CourtsManagementPage", "dialog.placeholders.nameEn")}
                                value={form.name_en}
                                onChange={(e) => {
                                    setForm({ ...form, name_en: e.target.value });
                                    setFieldErrors((prev) => ({ ...prev, name_en: undefined }));
                                }}
                                dir="ltr"
                                className={`text-start h-10 ${fieldErrors.name_en ? "border-destructive" : ""}`}
                            />
                            <FieldInlineError message={fieldErrors.name_en} />
                        </div>

                        <div>
                            <Label htmlFor="field-sport" className="mb-1.5 block">{t("dialog.fields.sport")} <span className="text-destructive">*</span></Label>
                            <Select
                                value={form.sportId ? String(form.sportId) : ""}
                                onValueChange={(val) => {
                                    setForm({ ...form, sportId: Number(val) });
                                    setFieldErrors((prev) => ({ ...prev, sportId: undefined }));
                                }}
                            >
                                <SelectTrigger id="field-sport" className={`w-full h-10 ${fieldErrors.sportId ? "border-destructive" : ""}`}>
                                    <SelectValue placeholder={t("dialog.placeholders.sport")} />
                                </SelectTrigger>
                                <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                    {sports.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {getSportName(s)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldInlineError message={fieldErrors.sportId} />
                        </div>

                        <div>
                            <Label htmlFor="field-capacity" className="mb-1.5 block">{t("dialog.fields.capacity")}</Label>
                            <Input
                                id="field-capacity"
                                type="number"
                                min={1}
                                placeholder={t("dialog.placeholders.capacity")}
                                value={form.capacity}
                                onChange={(e) => {
                                    setForm({ ...form, capacity: e.target.value });
                                    setFieldErrors((prev) => ({ ...prev, capacity: undefined }));
                                }}
                                dir="ltr"
                                className={`text-start h-10 max-w-[200px] ${fieldErrors.capacity ? "border-destructive" : ""}`}
                            />
                            <FieldInlineError message={fieldErrors.capacity} />
                        </div>
                                </div>
                            </section>

                            <section className="rounded-xl border border-border bg-card overflow-hidden">
                                <div className="px-4 py-3 border-b border-border bg-muted/30">
                                    <h3 className="text-sm font-semibold text-foreground">{t("dialog.settingsTitle")}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t("dialog.settingsHint")}</p>
                                </div>
                                <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                                <Label htmlFor="field-booking" className="cursor-pointer font-medium text-sm">
                                    {t("dialog.fields.booking")}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {form.isAvailableForBooking ? t("dialog.booking.availableHint") : t("dialog.booking.unavailableHint")}
                                </span>
                            </div>
                            <Switch
                                id="field-booking"
                                dir="ltr"
                                checked={form.isAvailableForBooking}
                                onCheckedChange={(val) => setForm({ ...form, isAvailableForBooking: val })}
                                className="shrink-0"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                                <Label htmlFor="field-status" className="cursor-pointer font-medium text-sm">
                                    {t("dialog.fields.status")}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {form.status === "active" ? t("dialog.status.activeHint") : form.status === "maintenance" ? t("dialog.status.maintenanceHint") : t("dialog.status.inactiveHint")}
                                </span>
                            </div>
                            <Select
                                value={form.status}
                                onValueChange={(val) => setForm({ ...form, status: val as FieldStatus })}
                            >
                                <SelectTrigger id="field-status" className="w-32 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                    <SelectItem value="active">{tStatus(getAdminStatusConfig("active").labelKey)}</SelectItem>
                                    <SelectItem value="inactive">{tStatus(getAdminStatusConfig("inactive").labelKey)}</SelectItem>
                                    <SelectItem value="maintenance">{tStatus(getAdminStatusConfig("maintenance").labelKey)}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                                </div>
                            </section>
                        </div>

                        <div className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-end gap-2">
                            <Button variant="outline" onClick={closeDialog} disabled={saving}>
                                {t("dialog.buttons.cancel")}
                            </Button>
                            <Button onClick={() => void handleSave()} disabled={saving} className="gap-2">
                                {saving ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> {t("dialog.buttons.saving")}</>
                                ) : (
                                    editField ? t("dialog.buttons.saveChanges") : t("dialog.buttons.addCourt")
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
