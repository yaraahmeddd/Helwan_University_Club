import { useState, useEffect } from "react";
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
    DialogFooter,
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
import { Plus, Pencil, Check, X, Search, Loader2, Filter } from "lucide-react";
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

type FieldStatus = Field["status"];

const emptyForm = () => ({
    name_ar: "",
    name_en: "",
    sportId: "" as string | number,
    capacity: "",
    status: "active" as FieldStatus,
    isAvailableForBooking: true,
});

const STATUS_OPTIONS: Array<{ key: FieldStatus; labelKey: string; color: string }> = [
    { key: "active", labelKey: "status.active", color: "text-emerald-700" },
    { key: "inactive", labelKey: "status.inactive", color: "text-rose-700" },
    { key: "maintenance", labelKey: "status.maintenance", color: "text-amber-700" },
];

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

    const { toast } = useToast();
    const { t, i18n } = useTranslation("CourtsManagementPage");
    const language = (i18n.resolvedLanguage ?? i18n.language ?? "ar").startsWith("en") ? "en" : "ar";
    const isRTL = language === "ar";

    const getFieldName = (field: Field) =>
        language === "en" ? (field.name_en || field.name_ar) : (field.name_ar || field.name_en);

    const getSportName = (sport?: Sport | Field["sport"]) =>
        sport ? (language === "en" ? (sport.name_en || sport.name_ar) : (sport.name_ar || sport.name_en)) : "";

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

    const filtered = fields.filter((f) => {
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
    });

    const totalCount = fields.length;
    const activeCount = fields.filter((f) => f.status === "active").length;
    const bookingCount = fields.filter((f) => f.is_available_for_booking).length;

    const openAdd = () => {
        setEditField(null);
        setForm(emptyForm());
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
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.name_ar.trim()) {
            toast({
                title: t("toast.validationTitle"),
                description: t("validation.nameArRequired"),
                variant: "destructive"
            });
            return;
        }
        if (!form.name_en.trim()) {
            toast({
                title: t("toast.validationTitle"),
                description: t("validation.nameEnRequired"),
                variant: "destructive"
            });
            return;
        }
        if (!form.sportId) {
            toast({
                title: t("toast.validationTitle"),
                description: t("validation.sportRequired"),
                variant: "destructive"
            });
            return;
        }
        if (form.capacity && Number(form.capacity) < 1) {
            toast({
                title: t("toast.validationTitle"),
                description: t("validation.capacityInvalid"),
                variant: "destructive"
            });
            return;
        }

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

    return (
        <div className="h-full overflow-y-auto p-6 pb-8 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t("header.title")}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {t("header.totalCourts")}{" "}
                        <span className="font-semibold text-foreground">{totalCount}</span>
                    </p>
                </div>
                <RoleGuard privilege="CREATE_FIELD">
                    <Button onClick={openAdd} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" />
                        {t("header.addCourt")}
                    </Button>
                </RoleGuard>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label={t("stats.total")} value={totalCount} color="default" />
                <StatCard label={t("stats.active")} value={activeCount} color="green" />
                <StatCard label={t("stats.bookable")} value={bookingCount} color="blue" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                            {STATUS_OPTIONS.map(({ key, labelKey, color }) => {
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
                                        <span className={`text-xs font-medium ${color}`}>{t(labelKey)}</span>
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
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="shadow-sm rounded-lg overflow-hidden border border-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10 text-center">#</TableHead>
                            <TableHead>{t("table.colCourtName")}</TableHead>
                            <TableHead>{t("table.colSport")}</TableHead>
                            <TableHead className="text-center">{t("table.colCapacity")}</TableHead>
                            <TableHead className="text-center">{t("table.colRequiresBooking")}</TableHead>
                            <TableHead className="text-center">{t("table.colStatus")}</TableHead>
                            <TableHead className="text-center">{t("table.colActions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
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
                                filtered.map((field, index) => {
                                    const isActive = field.status === "active";
                                    return (
                                        <motion.tr
                                            key={field.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-border transition-colors duration-200 hover:bg-accent/10"
                                        >
                                            <TableCell className="text-center text-muted-foreground text-sm font-mono">
                                                {index + 1}
                                            </TableCell>

                                            <TableCell className="font-medium">{getFieldName(field)}</TableCell>

                                            <TableCell className="text-muted-foreground">{getSportName(field.sport) || t("common.notAvailable")}</TableCell>

                                            <TableCell className="text-center font-mono">{field.capacity || t("common.notAvailable")}</TableCell>

                                            <TableCell className="text-center">
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

                                            <TableCell className="text-center">
                                                {isActive ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">
                                                        {t("status.active")}
                                                    </Badge>
                                                ) : field.status === "maintenance" ? (
                                                    <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100">
                                                        {t("status.maintenance")}
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
                                                        {t("status.inactive")}
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <RoleGuard privilege="UPDATE_FIELD">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openEdit(field)}
                                                            className="gap-1 text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                                                        >
                                                            <Pencil className="h-3 w-3" /> {t("actions.edit")}
                                                        </Button>
                                                    </RoleGuard>
                                                    <RoleGuard privilege="MANAGE_FIELD_STATUS">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => toggleActive(field.id)}
                                                            className={
                                                                isActive
                                                                    ? "gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                                    : "gap-1 text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white"
                                                            }
                                                        >
                                                            {isActive ? (
                                                                <><X className="h-3 w-3" /> {t("actions.disable")}</>
                                                            ) : (
                                                                <><Check className="h-3 w-3" /> {t("actions.enable")}</>
                                                            )}
                                                        </Button>
                                                    </RoleGuard>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </motion.div>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!open) setDialogOpen(false);
                }}
            >
                <DialogContent className="w-[95vw] max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
                    <DialogHeader>
                        <DialogTitle>{editField ? t("dialog.editTitle") : t("dialog.addTitle")}</DialogTitle>
                        <DialogDescription>
                            {editField ? t("dialog.editDescription") : t("dialog.addDescription")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="field-name-ar">{t("dialog.fields.nameAr")} <span className="text-destructive">*</span></Label>
                            <Input
                                id="field-name-ar"
                                placeholder={t("dialog.placeholders.nameAr")}
                                value={form.name_ar}
                                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                                dir="rtl"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="field-name-en">{t("dialog.fields.nameEn")} <span className="text-destructive">*</span></Label>
                            <Input
                                id="field-name-en"
                                placeholder={t("dialog.placeholders.nameEn")}
                                value={form.name_en}
                                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                                dir="ltr"
                                className="text-left"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="field-sport">{t("dialog.fields.sport")} <span className="text-destructive">*</span></Label>
                            <Select
                                value={form.sportId ? String(form.sportId) : ""}
                                onValueChange={(val) => setForm({ ...form, sportId: Number(val) })}
                            >
                                <SelectTrigger id="field-sport" className="w-full">
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
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="field-capacity">{t("dialog.fields.capacity")}</Label>
                            <Input
                                id="field-capacity"
                                type="number"
                                min={1}
                                placeholder={t("dialog.placeholders.capacity")}
                                value={form.capacity}
                                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                                dir="ltr"
                                className="text-left"
                            />
                        </div>

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
                                <SelectTrigger id="field-status" className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                    <SelectItem value="active">{t("status.active")}</SelectItem>
                                    <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
                                    <SelectItem value="maintenance">{t("status.maintenance")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className={`gap-2 ${isRTL ? "flex-row-reverse sm:justify-start" : "sm:justify-end"}`}>
                        <Button onClick={handleSave} className="gap-1" disabled={saving}>
                            {saving ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> {t("dialog.buttons.saving")}</>
                            ) : (
                                <><Check className="h-4 w-4" /> {editField ? t("dialog.buttons.saveChanges") : t("dialog.buttons.addCourt")}</>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            disabled={saving}
                        >
                            {t("dialog.buttons.cancel")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatCard({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: "default" | "green" | "blue";
}) {
    const colorMap = {
        default: "bg-muted/40 border-border text-foreground",
        green: "bg-emerald-50 border-emerald-200 text-emerald-700",
        blue: "bg-blue-50 border-blue-200 text-blue-700",
    };

    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-1 ${colorMap[color]}`}>
            <span className="text-xs font-medium opacity-70">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
        </div>
    );
}
