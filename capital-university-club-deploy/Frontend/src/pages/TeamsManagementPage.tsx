import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import {
    Table, TableHeader, TableBody,
    TableRow, TableHead, TableCell,
} from "../components/StaffPagesComponents/ui/table";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Label } from "../components/StaffPagesComponents/ui/label";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription,
} from "../components/StaffPagesComponents/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "../components/StaffPagesComponents/ui/select";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "../components/StaffPagesComponents/ui/popover";
import {
    Pencil, Trash2, Plus, Loader2, X, Clock, Users, Filter,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useLanguage } from "../hooks/useLanguage";
import { adminTableStyles, adminHeadClass, adminCellClass } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { BilingualText } from "../components/StaffPagesComponents/shared/BilingualText";
import { getEntityName, getLocalizedText } from "../lib/localizedDisplay";
import api from "../services/axios";
import { PATTERNS } from "../lib/validation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Sport = { id: number; name_ar: string; name_en: string };
type Field = { id: string; name_ar: string; name_en: string };

type DayPair = { ar: string; en: string };
const DAYS: DayPair[] = [
    { ar: "السبت", en: "Saturday" },
    { ar: "الأحد", en: "Sunday" },
    { ar: "الاثنين", en: "Monday" },
    { ar: "الثلاثاء", en: "Tuesday" },
    { ar: "الأربعاء", en: "Wednesday" },
    { ar: "الخميس", en: "Thursday" },
    { ar: "الجمعة", en: "Friday" },
];

type TeamStatus = "active" | "inactive" | "suspended" | "archived";

interface ApiTeam {
    id: string;
    name_ar: string;
    name_en: string;
    sport_id: number;
    sport?: Sport;
    max_participants: number;
    status: TeamStatus;
    visibility_type?: string;
    price?: number | null;
    training_schedules?: {
        id: string;
        days_ar: string;
        days_en: string;
        start_time: string;
        end_time: string;
        field_id?: string;
        training_fee?: number;
    }[];
}

type TeamTraining = {
    selectedDays: string[];
    startTime: string;
    endTime: string;
    fieldId: string;
    trainingFee: string;
};

type TeamFormState = {
    nameAr: string;
    nameEn: string;
    sportId: string;
    maxParticipants: string;
    status: TeamStatus;
    visibility: string;
    price: string;
    training: TeamTraining;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyTraining = (): TeamTraining => ({
    selectedDays: [], startTime: "", endTime: "", fieldId: "", trainingFee: "",
});

const emptyForm = (): TeamFormState => ({
    nameAr: "", nameEn: "", sportId: "", maxParticipants: "", status: "active",
    visibility: "", price: "",
    training: emptyTraining(),
});

const isArabicOnly = (s: string) => PATTERNS.ARABIC_TEXT.test(s);
const isEnglishOnly = (s: string) => PATTERNS.ENGLISH_TEXT.test(s);

const statusLabel = (s: TeamStatus, t: any) => {
    switch (s) {
        case "active": return t('status.active', { defaultValue: "نشط" });
        case "inactive": return t('status.inactive', { defaultValue: "غير نشط" });
        case "suspended": return t('status.suspended', { defaultValue: "موقوف" });
        case "archived": return t('status.archived', { defaultValue: "مؤرشف" });
    }
};

const statusClass = (s: TeamStatus) => {
    switch (s) {
        case "active": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "inactive": return "bg-rose-50 text-rose-700 border-rose-200";
        case "suspended": return "bg-amber-50 text-amber-700 border-amber-200";
        case "archived": return "bg-gray-50 text-gray-600 border-gray-200";
    }
};

const isValidTimeRange = (start: string, end: string) => start < end;

// ─── TimeSlotPicker (copied from SportsPage) ─────────────────────────────────

const TIME_SLOTS: { value: string; label: string }[] = Array.from({ length: 26 }, (_, i) => {
    const totalMins = 600 + i * 30;
    const h24 = Math.floor(totalMins / 60);
    const min = totalMins % 60;
    const value = `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const period = h24 < 12 ? "AM" : "PM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const label = `${h12}:${String(min).padStart(2, "0")} ${period}`;
    return { value, label };
});

const TimeSlotPicker = ({
    value, onChange, placeholder, lockedValue, title
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    lockedValue?: string;
    title: string;
}) => {
    const [open, setOpen] = useState(false);
    const selected = TIME_SLOTS.find(s => s.value === value);
    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 shadow-sm
            ${selected
                            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-primary/30 bg-background text-primary hover:bg-primary/10"
                        }`}
                >
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {selected ? selected.label : <span className="opacity-60">{placeholder}</span>}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[17rem] p-4 rounded-2xl bg-popover border border-border" align="start" side="bottom" dir="ltr">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs font-bold text-foreground whitespace-nowrap">{title}</span>
                    <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto"
                    onWheelCapture={e => e.stopPropagation()}
                    onTouchMoveCapture={e => e.stopPropagation()}
                >
                    {TIME_SLOTS.map(slot => {
                        const isActive = slot.value === value;
                        const isLocked = slot.value === lockedValue;
                        return (
                            <button key={slot.value} type="button" disabled={isLocked}
                                onClick={() => { if (!isLocked) { onChange(slot.value); setOpen(false); } }}
                                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all duration-200
                  ${isLocked
                                        ? "border-border bg-muted text-muted-foreground opacity-40 cursor-not-allowed line-through"
                                        : isActive
                                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                            : "border-primary/30 bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                    }`}
                            >
                                {slot.label}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamsManagementPage() {
    const { t } = useTranslation('TeamsManagementPage');
    const { language, isRTL } = useLanguage();
    const { toast } = useToast();

    // ── Data ────────────────────────────────────────────────────────────────────
    const [teams, setTeams] = useState<ApiTeam[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(false);

    // ── Filters ─────────────────────────────────────────────────────────────────
    const [filterSports, setFilterSports] = useState<number[]>([]);
    const [sportPopoverOpen, setSportPopoverOpen] = useState(false);
    const [filterStatuses, setFilterStatuses] = useState<TeamStatus[]>([]);
    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
    const [search, setSearch] = useState("");

    // ── Form/modal state ────────────────────────────────────────────────────────
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editTeam, setEditTeam] = useState<ApiTeam | null>(null);
    const [form, setForm] = useState<TeamFormState>(emptyForm());
    const [formError, setFormError] = useState("");
    const [saveLoading, setSaveLoading] = useState(false);

    // ── Delete ──────────────────────────────────────────────────────────────────
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ── Load sports & fields ────────────────────────────────────────────────────
    useEffect(() => {
        api.get<{ data: Sport[] }>("/sports")
            .then(res => setSports(Array.isArray(res?.data?.data) ? res.data.data : []))
            .catch(() => toast({ title: t('toast.warning'), description: t('toast.loadSportsFailed'), variant: "destructive" }));
        api.get<{ data: Field[] }>("/fields")
            .then(res => setFields(Array.isArray(res?.data?.data) ? res.data.data : []))
            .catch(() => { /* non-fatal */ });
    }, [toast, t]);

    // ── Fetch teams ─────────────────────────────────────────────────────────────
    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ data: ApiTeam[] }>("/teams");
            setTeams(Array.isArray(res?.data?.data) ? res.data.data : []);
        } catch {
            toast({ title: t('toast.saveFailedTitle', { defaultValue: "خطأ" }), description: t('toast.loadTeamsFailed'), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast, t]);

    useEffect(() => { void fetchTeams(); }, [fetchTeams]);

    // ── Filtered list (client-side status + search) ──────────────────────────────
    const filtered = teams.filter(t => {
        const matchStatus = filterStatuses.length === 0 || filterStatuses.includes(t.status);
        const matchSport = filterSports.length === 0 || filterSports.includes(t.sport_id);
        const q = search.trim().toLowerCase();
        const matchSearch = !q || t.name_ar.includes(search.trim()) || t.name_en.toLowerCase().includes(q);
        return matchStatus && matchSport && matchSearch;
    });

    // ── Open add ────────────────────────────────────────────────────────────────
    const openAdd = () => {
        setEditTeam(null);
        setForm(emptyForm());
        setFormError("");
        setIsAddOpen(true);
    };

    // ── Open edit — pre-fill entire form ────────────────────────────────────────
    const openEdit = (team: ApiTeam) => {
        setEditTeam(team);
        const sched = team.training_schedules?.[0];
        setForm({
            nameAr: team.name_ar,
            nameEn: team.name_en,
            sportId: String(team.sport_id),
            maxParticipants: String(team.max_participants),
            status: team.status,
            visibility: team.visibility_type ?? "",
            price: team.price != null ? String(team.price) : "",
            training: sched ? {
                selectedDays: (sched.days_ar ?? "").split(", ").filter(Boolean),
                startTime: (sched.start_time ?? "").slice(0, 5),
                endTime: (sched.end_time ?? "").slice(0, 5),
                fieldId: sched.field_id ?? "",
                trainingFee: String(sched.training_fee ?? ""),
            } : emptyTraining(),
        });
        setFormError("");
        setIsAddOpen(true);
    };

    // ── Validation ───────────────────────────────────────────────────────────────
    const validate = (): string => {
        if (!form.nameAr.trim()) return t('validation.nameArRequired');
        if (!form.nameEn.trim()) return t('validation.nameEnRequired');
        if (!editTeam && !form.sportId) return t('validation.sportRequired');
        if (!form.maxParticipants || Number(form.maxParticipants) <= 0) return t('validation.maxParticipantsRequired');
        if (form.training.selectedDays.length === 0) return t('validation.daysRequired');
        if (!form.training.startTime) return t('validation.startTimeRequired');
        if (!form.training.endTime) return t('validation.endTimeRequired');
        if (!isValidTimeRange(form.training.startTime, form.training.endTime)) return t('validation.timeRangeInvalid');
        if (!form.training.trainingFee.trim()) return t('validation.trainingFeeRequired');
        return "";
    };

    // ── Save (create or update) ──────────────────────────────────────────────────
    const handleSave = async () => {
        const err = validate();
        if (err) { setFormError(err); return; }
        setFormError("");
        setSaveLoading(true);
        const trainingBody = {
            days_ar: form.training.selectedDays.join(", "),
            days_en: form.training.selectedDays.map(ar => DAYS.find(d => d.ar === ar)?.en ?? ar).join(", "),
            start_time: form.training.startTime + ":00",
            end_time: form.training.endTime + ":00",
            field_id: form.training.fieldId || undefined,
            training_fee: Number(form.training.trainingFee),
        };
        try {
            if (editTeam) {
                await api.put(`/teams/${editTeam.id}`, {
                    sport_id: Number(form.sportId),
                    name_ar: form.nameAr,
                    name_en: form.nameEn,
                    max_participants: Number(form.maxParticipants),
                    status: form.status,
                    visibility_type: form.visibility || undefined,
                    price: form.price !== "" ? Number(form.price) : undefined,
                    training: trainingBody,
                });
                toast({ title: t('toast.updateSuccessTitle'), description: t('toast.updateSuccess') });
            } else {
                await api.post("/teams", {
                    sport_id: Number(form.sportId),
                    name_ar: form.nameAr,
                    name_en: form.nameEn,
                    max_participants: Number(form.maxParticipants),
                    status: form.status,
                    visibility_type: form.visibility || undefined,
                    price: form.price !== "" ? Number(form.price) : undefined,
                    training: trainingBody,
                });
                toast({ title: t('toast.addSuccessTitle'), description: t('toast.addSuccess') });
            }
            setIsAddOpen(false);
            setEditTeam(null);
            setForm(emptyForm());
            await fetchTeams();
        } catch (err) {
            const e = err as { message?: string };
            toast({ title: t('toast.saveFailedTitle'), description: e?.message ?? t('toast.saveFailed'), variant: "destructive" });
        } finally {
            setSaveLoading(false);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/teams/${deleteId}`);
            toast({ title: t('toast.deleteSuccessTitle'), description: t('toast.deleteSuccess') });
            setDeleteId(null);
            await fetchTeams();
        } catch {
            toast({ title: t('toast.deleteFailed'), variant: "destructive" });
        } finally {
            setDeleteLoading(false);
        }
    };

    const toggleDay = (day: string) =>
        setForm(prev => ({
            ...prev,
            training: {
                ...prev.training,
                selectedDays: prev.training.selectedDays.includes(day)
                    ? prev.training.selectedDays.filter(d => d !== day)
                    : [...prev.training.selectedDays, day],
            },
        }));

    const timeErr = form.training.startTime && form.training.endTime
        && !isValidTimeRange(form.training.startTime, form.training.endTime);

    const isEdit = !!editTeam;
    const hasFilters = filterSports.length > 0 || filterStatuses.length > 0 || search.trim() !== "";

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="h-full flex flex-col overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* ── Header ── */}
            <div className="px-6 py-4 border-b border-border bg-background shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary" />
                            {t('header.title')}
                        </h1>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-muted-foreground">
                                {t('header.totalTeams')} <strong>{teams.length}</strong>
                            </p>
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                {t('header.activeTeams', { count: teams.filter(t => t.status === "active").length })}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                                {t('header.inactiveTeams', { count: teams.filter(t => t.status !== "active").length })}
                            </span>
                        </div>
                    </div>
                    <RoleGuard privilege="CREATE_TEAM">
                        <Button onClick={openAdd} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('actions.addTeam')}
                        </Button>
                    </RoleGuard>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20 shrink-0 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Input
                        placeholder={t('toolbar.searchPlaceholder')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`h-9 ${isRTL ? 'pl-7 pr-3' : 'pr-7 pl-3'}`}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Status filter */}
                <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button className={`flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs transition-colors ${
                            filterStatuses.length > 0 ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                            <Filter className="w-3.5 h-3.5" />
                            {t('toolbar.statusFilter')}
                            {filterStatuses.length > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">{filterStatuses.length}</span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-52 p-0" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="py-1">
                            {([{ key: "active" as TeamStatus, label: t('status.active'), color: "text-emerald-700" }, { key: "inactive" as TeamStatus, label: t('status.inactive'), color: "text-rose-700" }, { key: "suspended" as TeamStatus, label: t('status.suspended'), color: "text-amber-700" }, { key: "archived" as TeamStatus, label: t('status.archived'), color: "text-slate-600" }]).map(({ key, label, color }) => (
                                <label key={key} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors">
                                    <input type="checkbox" checked={filterStatuses.includes(key)}
                                        onChange={() => setFilterStatuses(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key])}
                                        className="w-3.5 h-3.5 rounded accent-primary cursor-pointer" />
                                    <span className={`text-xs font-medium ${color}`}>{label}</span>
                                    <span className="mr-auto text-[10px] text-muted-foreground">{teams.filter(t => t.status === key).length}</span>
                                </label>
                            ))}
                        </div>
                        {filterStatuses.length > 0 && (
                            <div className="flex justify-end px-3 py-2 border-t border-border">
                                <button onClick={() => { setFilterStatuses([]); setStatusPopoverOpen(false); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('toolbar.clearFilter')}</button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Sport filter */}
                <Popover open={sportPopoverOpen} onOpenChange={setSportPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button className={`flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs transition-colors ${
                            filterSports.length > 0 ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                            {t('toolbar.sportFilter')}
                            {filterSports.length > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">{filterSports.length}</span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-52 p-0" dir="rtl">
                        <div className="py-1 max-h-64 overflow-y-auto">
                            {sports.map(s => (
                                <label key={s.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors">
                                    <input type="checkbox" checked={filterSports.includes(s.id)}
                                        onChange={() => setFilterSports(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                                        className="w-3.5 h-3.5 rounded accent-primary cursor-pointer" />
                                    <span className="text-xs font-medium">{getEntityName(s, language)}</span>
                                    <span className="mr-auto text-[10px] text-muted-foreground">{teams.filter(t => t.sport_id === s.id).length}</span>
                                </label>
                            ))}
                        </div>
                        {filterSports.length > 0 && (
                            <div className="flex justify-end px-3 py-2 border-t border-border">
                                <button onClick={() => { setFilterSports([]); setSportPopoverOpen(false); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('toolbar.clearFilter')}</button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                {hasFilters && (
                    <button onClick={() => { setFilterSports([]); setFilterStatuses([]); setSearch(""); void fetchTeams(); }} className="text-xs text-primary hover:underline">
                        {t('toolbar.clearAll')}
                    </button>
                )}
            </div>


            {/* ── Table area ── */}
            <div className={`${adminTableStyles.container} pb-6`}>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="shadow-sm">
                <Table>
                    <TableHeader className={adminTableStyles.header}>
                        <TableRow>
                            <TableHead className={adminHeadClass({ className: "w-10" })}>{t('table.colIndex')}</TableHead>
                            <TableHead className={adminHeadClass()}>{t('table.colName')}</TableHead>
                            <TableHead className={adminHeadClass()}>{t('table.colSport')}</TableHead>
                            <TableHead className={adminHeadClass()}>{t('table.colSchedule')}</TableHead>
                            <TableHead className={adminHeadClass()}>{t('table.colMaxParticipants')}</TableHead>
                            <TableHead className={adminHeadClass({ className: "whitespace-nowrap" })}>{t('table.colStatus')}</TableHead>
                            <TableHead className={adminHeadClass({ center: true, className: "w-[200px]" })}>{t('table.colActions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className={adminTableStyles.body}>
                        <AnimatePresence>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>{t('table.loading')}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-8 h-8 opacity-30" />
                                            <span>{hasFilters ? t('table.noResultsFiltered') : t('table.noResultsEmpty')}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((team, idx) => {
                                    const sched = team.training_schedules?.[0];
                                    const schedDays = sched
                                        ? getLocalizedText(sched.days_ar, sched.days_en, language)
                                        : "";
                                    const schedStr = sched
                                        ? `${schedDays} • ${sched.start_time?.slice(0, 5)} → ${sched.end_time?.slice(0, 5)}`
                                        : "—";
                                    return (
                                        <motion.tr
                                            key={team.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={adminTableStyles.row}
                                        >
                                            <TableCell className={adminCellClass({ size: "muted" })}>{idx + 1}</TableCell>
                                            <TableCell className={adminCellClass()}>
                                                <BilingualText ar={team.name_ar} en={team.name_en} language={language} primaryClassName="font-medium" />
                                            </TableCell>
                                            <TableCell className={adminCellClass()}>{getEntityName(team.sport, language) || "—"}</TableCell>
                                            <TableCell className={adminCellClass({ size: "muted", className: "max-w-[200px]" })}>
                                                <span className="line-clamp-2">{schedStr}</span>
                                            </TableCell>
                                            <TableCell className={adminCellClass()}>{team.max_participants}</TableCell>
                                            <TableCell className={adminCellClass({ className: "whitespace-nowrap" })}>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass(team.status)}`}>
                                                    {statusLabel(team.status, t)}
                                                </span>
                                            </TableCell>
                                            <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                                                <div className={adminTableStyles.actions}>
                                                    <RoleGuard privilege="UPDATE_TEAM">
                                                        <Button
                                                            size="icon" variant="ghost"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                                            onClick={() => openEdit(team)}
                                                            title={t('actions.edit')}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </RoleGuard>
                                                    <RoleGuard privilege="DELETE_TEAM">
                                                        <Button
                                                            size="icon" variant="ghost"
                                                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                                            onClick={() => setDeleteId(team.id)}
                                                            title={t('actions.delete')}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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
            </div>
            {/* ══ Add / Edit Dialog — same structure as SportsPage dialog ══ */}
            <Dialog open={isAddOpen} onOpenChange={val => { if (!val) { setIsAddOpen(false); setEditTeam(null); setForm(emptyForm()); } }}>
                <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] p-0 flex flex-col overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="flex min-h-0 flex-1 flex-col p-6 overflow-hidden">
                        <DialogHeader className="shrink-0">
                            <DialogTitle>{isEdit ? t('form.editTitle') : t('form.addTitle')}</DialogTitle>
                            <DialogDescription>
                                {isEdit ? t('form.editDescription') : t('form.addDescription')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">

                            {/* Sport selector — shown on both create and edit; disabled on edit */}
                            <div>
                                <Label>{t('form.sportLabel')} <span className="text-destructive">*</span></Label>
                                <Select
                                    value={form.sportId}
                                    onValueChange={v => { if (!isEdit) setForm(p => ({ ...p, sportId: v })); }}
                                    disabled={isEdit}
                                >
                                    <SelectTrigger className={isEdit ? "opacity-60 cursor-not-allowed" : ""}>
                                        <SelectValue placeholder={t('form.sportPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sports.map(s => <SelectItem key={s.id} value={String(s.id)}>{getEntityName(s, language)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {isEdit && <p className="text-[11px] text-muted-foreground mt-1">{t('form.sportLockedNote')}</p>}
                            </div>

                            {/* Name row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>{t('form.nameArLabel')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={form.nameAr}
                                        placeholder={t('form.nameArPlaceholder')}
                                        maxLength={100}
                                        onChange={e => {
                                            const v = e.target.value;
                                            if (v === "" || isArabicOnly(v)) setForm(p => ({ ...p, nameAr: v }));
                                            else toast({ title: t('toast.nameArOnlyTitle'), description: t('toast.nameArOnly'), variant: "destructive" });
                                        }}
                                        dir="rtl"
                                    />
                                </div>
                                <div>
                                    <Label>{t('form.nameEnLabel')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        dir="ltr" className={`text-left ${isRTL ? '' : 'text-left'}`}
                                        value={form.nameEn}
                                        placeholder={t('form.nameEnPlaceholder')}
                                        maxLength={100}
                                        onChange={e => {
                                            const v = e.target.value;
                                            if (v === "" || isEnglishOnly(v)) setForm(p => ({ ...p, nameEn: v }));
                                            else toast({ title: t('toast.nameEnOnlyTitle'), description: t('toast.nameEnOnly'), variant: "destructive" });
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Max participants + Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>{t('form.maxParticipantsLabel')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="number" min={1} placeholder={t('form.maxParticipantsPlaceholder')}
                                        value={form.maxParticipants}
                                        onChange={e => setForm(p => ({ ...p, maxParticipants: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>{t('form.statusLabel')}</Label>
                                    <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as TeamStatus }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">{t('status.active')}</SelectItem>
                                            <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
                                            <SelectItem value="suspended">{t('status.suspended')}</SelectItem>
                                            <SelectItem value="archived">{t('status.archived')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Visibility + Price */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>{t('form.visibilityLabel')}</Label>
                                    <Select value={form.visibility || "none"} onValueChange={v => setForm(p => ({ ...p, visibility: v === "none" ? "" : v }))}>
                                        <SelectTrigger><SelectValue placeholder={t('form.visibilityPlaceholder')} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none" className="text-muted-foreground">{t('form.visibilityNone')}</SelectItem>
                                            <SelectItem value="INTERNAL">{t('form.visibilityInternal')}</SelectItem>
                                            <SelectItem value="EXTERNAL">{t('form.visibilityExternal')}</SelectItem>
                                            <SelectItem value="BOTH">{t('form.visibilityBoth')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>{t('form.priceLabel')}</Label>
                                    <Input
                                        type="number" min={0} placeholder={t('form.pricePlaceholder')}
                                        value={form.price}
                                        onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Training block — same card style as SportsPage */}
                            <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
                                <span className="text-sm font-semibold text-primary">{t('form.training.sectionTitle')}</span>

                                {/* Day chips */}
                                <div>
                                    <Label className="text-xs mb-1.5 block">{t('form.training.daysLabel')} <span className="text-destructive">*</span></Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {DAYS.map(day => {
                                            const on = form.training.selectedDays.includes(day.ar);
                                            return (
                                                <button key={day.ar} type="button" onClick={() => toggleDay(day.ar)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150
                            ${on
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "bg-background text-foreground border-border hover:border-primary/60"
                                                        }`}
                                                >
                                                    {isRTL ? day.ar : day.en}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Time pickers */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Label className="text-xs text-muted-foreground whitespace-nowrap">{t('form.training.fromLabel')}</Label>
                                    <TimeSlotPicker
                                        value={form.training.startTime}
                                        placeholder={t('form.training.fromLabel')}
                                        title={t('form.training.timeStartTitle')}
                                        lockedValue={form.training.endTime}
                                        onChange={v => setForm(p => ({ ...p, training: { ...p.training, startTime: v } }))}
                                    />
                                    <Label className="text-xs text-muted-foreground whitespace-nowrap">{t('form.training.toLabel')}</Label>
                                    <TimeSlotPicker
                                        value={form.training.endTime}
                                        placeholder={t('form.training.toLabel')}
                                        title={t('form.training.timeEndTitle')}
                                        lockedValue={form.training.startTime}
                                        onChange={v => setForm(p => ({ ...p, training: { ...p.training, endTime: v } }))}
                                    />
                                </div>
                                {timeErr && <p className="text-[11px] text-destructive">{t('form.training.timeRangeError')}</p>}

                                {/* Field selector */}
                                <div>
                                    <Label className="text-xs mb-1 block">{t('form.training.fieldLabel')} <span className="text-destructive">*</span></Label>
                                    {fields.length === 0 ? (
                                        <p className="text-xs text-amber-600 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-md px-3 py-2">
                                            {t('form.training.fieldNoFields')}
                                        </p>
                                    ) : (
                                        <Select
                                            value={form.training.fieldId || "none"}
                                            onValueChange={val => setForm(p => ({ ...p, training: { ...p.training, fieldId: val === "none" ? "" : val } }))}
                                        >
                                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('form.training.fieldPlaceholder')} /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none" className="text-xs text-muted-foreground">{t('form.training.fieldPlaceholder')}</SelectItem>
                                                {fields.map(f => (
                                                    <SelectItem key={f.id} value={f.id} className="text-xs">
                                                        {getEntityName(f, language)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* Training fee */}
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs whitespace-nowrap shrink-0">{t('form.training.trainingFeeLabel')} <span className="text-destructive">*</span></Label>
                                    <input
                                        type="number" min={0} placeholder="200"
                                        value={form.training.trainingFee}
                                        onChange={e => setForm(p => ({ ...p, training: { ...p.training, trainingFee: e.target.value } }))}
                                        className="w-24 h-8 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>

                            {/* Inline error */}
                            {formError && <p className="text-xs font-medium text-destructive">{formError}</p>}
                        </div>

                        <DialogFooter className="mt-4 border-t pt-4">
                            <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditTeam(null); }} disabled={saveLoading}>
                                {t('form.buttons.cancel')}
                            </Button>
                            <Button onClick={() => void handleSave()} disabled={saveLoading}>
                                {saveLoading ? <><Loader2 className="w-4 h-4 animate-spin ml-1" />{t('form.buttons.saving')}</> : t('form.buttons.save')}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ══ Delete Confirmation Dialog ══ */}
            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader>
                        <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
                        <DialogDescription>{t('deleteDialog.description')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>{t('deleteDialog.cancel')}</Button>
                        <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteLoading}>
                            {deleteLoading ? t('deleteDialog.confirming') : t('deleteDialog.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
