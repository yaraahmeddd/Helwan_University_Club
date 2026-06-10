import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateId } from "../utils/id";
import { motion, AnimatePresence } from "framer-motion";
import { mockSports } from "../data/mockData";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import { useLanguage } from "../hooks/useLanguage";
import { adminTableStyles, adminHeadClass, adminCellClass, adminPageStyles, adminDialogStyles, ADMIN_PAGE_SIZE } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { AdminPagination } from "../components/StaffPagesComponents/shared/AdminPagination";
import { AdminMemberStatusBadge } from "../components/StaffPagesComponents/shared/AdminMemberStatusBadge";
import { AdminPageHeader } from "../components/StaffPagesComponents/shared/AdminPageHeader";
import { AdminActionButton, AdminRowActions, AdminViewButton } from "../components/StaffPagesComponents/shared/AdminRowActions";
import { FieldInlineError } from "../components/StaffPagesComponents/shared/FieldInlineError";
import { PersonNameDisplay } from "../components/StaffPagesComponents/shared/PersonNameDisplay";
import { getBilingualFieldPlaceholder, getLanguageOnlyText, getLocalizedText } from "../lib/localizedDisplay";
import { SportImage } from "../components/StaffPagesComponents/shared/SportImage";
import { TooltipProvider } from "../components/StaffPagesComponents/ui/tooltip";
import { PATTERNS } from "../lib/validation";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Label } from "../components/StaffPagesComponents/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/StaffPagesComponents/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/StaffPagesComponents/ui/select";
import { Switch } from "../components/StaffPagesComponents/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "../components/StaffPagesComponents/ui/popover";
import { Pencil, Trash2, Plus, Loader2, UploadCloud, X, Clock, AlertCircle, Trophy, RefreshCw } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../services/axios";
import { useTranslation } from "react-i18next";
import { useAdminFormatters } from "../components/StaffPagesComponents/shared/adminFormatters";


// ─── Types ────────────────────────────────────────────────────────────────────

interface Sport {
  id: number;
  nameAr: string;
  nameEn: string;
  membersCount: number;
  price: number;
  maxParticipants: number;
  status: string;
  imageUrl?: string | null;
  is_active?: boolean;
  branch_id?: number | null;
  requires_booking?: boolean;
  schedules?: ApiSchedule[];
  hasTeams?: boolean;
}

type SportFormFieldErrors = {
  nameAr?: string;
  nameEn?: string;
  photo?: string;
  branchId?: string;
  maxParticipants?: string;
};

type ApiSchedule = {
  id?: string;
  day?: string;
  from?: string;
  to?: string;
};

/** Day pair — ar/en for the backend */
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

type TeamTraining = {
  selectedDays: string[];  // array of Arabic day names
  startTime: string;       // "HH:mm"
  endTime: string;         // "HH:mm"
  fieldId: string;         // UUID
  trainingFee: string;     // number as string
};

type Team = {
  id: string;               // client-side UUID, not sent to backend
  apiId?: string;           // backend team ID — set when loaded from API (existing team)
  nameAr: string;           // → name_ar
  nameEn: string;           // → name_en
  maxParticipants: string;  // → max_participants (number)
  subscriptionPrice: string;// → subscription_price (number)
  visibility: string;       // → visibility_type: INTERNAL | EXTERNAL | BOTH
  price: string;            // → price (number)
  training: TeamTraining;
};

type ApiField = {
  id: string;
  name_ar: string;
  name_en: string;
  sport_id?: number;
  status?: string;
};

type ExistingTeam = {
  id: string;
  name_ar: string;
  name_en: string;
  max_participants?: number;
  training_schedules?: {
    days_ar?: string;
    start_time?: string;
    end_time?: string;
    field_id?: string;
    training_fee?: number;
  }[];
};

const emptyTraining = (): TeamTraining => ({
  selectedDays: [],
  startTime: "",
  endTime: "",
  fieldId: "",
  trainingFee: "",
});

const emptyTeam = (): Team => ({
  id: generateId(),
  nameAr: "",
  nameEn: "",
  maxParticipants: "",
  subscriptionPrice: "",
  visibility: "",
  price: "",
  training: emptyTraining(),
});


// Generate 30-min slots 06:00 → 23:30 in "HH:mm" (24-h stored) + "h:mm AM/PM" (display)
// 10:00 AM → 11:00 PM  (26 slots × 30 min)
const TIME_SLOTS: { value: string; label: string }[] = Array.from({ length: 26 }, (_, i) => {
  const totalMins = 600 + i * 30; // starts at 10:00
  const h24 = Math.floor(totalMins / 60);
  const min = totalMins % 60;
  const value = `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  const period = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const label = `${h12}:${String(min).padStart(2, "0")} ${period}`;
  return { value, label };
});

// ─── TimeSlotPicker ───────────────────────────────────────────────────────────

const TimeSlotPicker = ({
  value,
  onChange,
  placeholder,
  lockedValue,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  lockedValue?: string;
}) => {
  const { t, i18n } = useTranslation('SportsPage');
  const [open, setOpen] = useState(false);
  const selected = TIME_SLOTS.find((s) => s.value === value);
  const title = placeholder === t('form.from') ? t('form.startTimeTitle') : t('form.endTimeTitle');

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
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

      <PopoverContent
        className="w-[17rem] p-4 rounded-2xl bg-popover border border-border"
        align="start"
        side="bottom"
        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Divider title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-bold text-foreground whitespace-nowrap">{title}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Slot grid */}
        <div
          className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto"
          onWheelCapture={(e) => e.stopPropagation()}
          onTouchMoveCapture={(e) => e.stopPropagation()}
        >
          {TIME_SLOTS.map((slot) => {
            const isActive = slot.value === value;
            const isLocked = slot.value === lockedValue;
            return (
              <button
                key={slot.value}
                type="button"
                disabled={isLocked}
                onClick={() => { if (!isLocked) { onChange(slot.value); setOpen(false); } }}
                title={isLocked ? t('form.slotLockedTooltip') : undefined}
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

type SportApiItem = {
  id: number;
  name?: string;
  name_ar?: string;
  name_en?: string;
  price?: number | string;
  membersCount?: number;
  members_count?: number;
  sport_image?: string | null;
  is_active?: boolean;
  status?: string;
  max_participants?: number;
  branch_id?: number | null;
  requires_booking?: boolean;
  // Relations included by getAllSports
  training_schedules?: { id?: string; days_ar?: string; start_time?: string; end_time?: string }[];
  teams?: { id?: string }[];          // included when backend eager-loads teams
};

type ApiBranch = {
  id: number;
  name_ar: string;
  name_en?: string;
};

type SportsListResponse = {
  success?: boolean;
  message?: string;
  data?: SportApiItem[];
};

type ApiMember = {
  id: number;
  first_name_ar: string;
  last_name_ar: string;
  first_name_en: string;
  last_name_en: string;
  phone?: string | null;
  national_id: string;
  status: string;
  created_at: string;
  team_member_teams?: { id: number; team_name: string; status: string }[];
};

// ─── Fallback data ────────────────────────────────────────────────────────────

const fallbackSports: Sport[] = (mockSports as { id: number; name: string; membersCount: number; price: number }[]).map((s) => ({
  id: s.id,
  nameAr: s.name,
  nameEn: "",
  membersCount: s.membersCount,
  price: s.price,
  maxParticipants: 0,
  status: "active",
  imageUrl: null,
}));

// ─── FileBox for sport image ──────────────────────────────────────────────────

const ImageUploadBox = ({
  preview,
  onSelect,
  inputRef,
}: {
  preview: string | null;
  onSelect: (dataUrl: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  const { t } = useTranslation('SportsPage');
  return (
  <div
    onClick={() => inputRef.current?.click()}
    className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group min-h-[160px]
      ${preview ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
  >
    <input
      ref={inputRef}
      type="file"
      hidden
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") onSelect(reader.result);
        };
        reader.readAsDataURL(file);
      }}
    />
    {preview ? (
      <div className="flex min-h-[200px] w-full items-center justify-center p-4">
        <img src={preview} alt="Preview" className="max-h-[188px] max-w-full object-contain" />
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground group-hover:text-primary transition-colors">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <UploadCloud className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-medium">{t('form.uploadClick')}</p>
        <p className="text-xs opacity-60">PNG, JPG, WEBP</p>
      </div>
    )}
    {preview && (
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-sm font-semibold flex items-center gap-2">
          <UploadCloud className="w-4 h-4" /> {t('form.uploadChange')}
        </span>
      </div>
    )}
  </div>
);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isValidTimeRange = (from: string, to: string) => {
  if (!from || !to) return false;
  return from < to;
};

const resolveSportStatusKey = (sport: Sport): string => {
  const hasSchedules = (sport.schedules && sport.schedules.length > 0) || sport.hasTeams === true;

  if (sport.is_active === false || sport.status === "inactive") return "inactive";
  if (sport.status === "pending") return "pending";
  if (sport.status === "rejected") return "rejected";
  if (!hasSchedules) return "draft";
  return "active";
};

const isSportDraftStatus = (sport: Sport) => resolveSportStatusKey(sport) === "draft";

const formatMaxParticipants = (value: number, t: (key: string) => string) =>
  value > 0 ? String(value) : t("table.unlimited");

const PAGE_SIZE = ADMIN_PAGE_SIZE;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SportsPage() {
  const { t } = useTranslation('SportsPage');
  const { language, isRTL } = useLanguage();
  const { fmtDate } = useAdminFormatters();

  const [sports, setSports] = useState<Sport[]>([]);
  const [editSport, setEditSport] = useState<Sport | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ nameAr: "", nameEn: "", isActive: true, branchId: "", maxParticipants: "" });
  const [fieldErrors, setFieldErrors] = useState<SportFormFieldErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsError, setTeamsError] = useState("");
  const [requiresBooking, setRequiresBooking] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "draft" | "inactive">("all");
  const [membersSport, setMembersSport] = useState<Sport | null>(null);
  const [dialogMembers, setDialogMembers] = useState<ApiMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [fields, setFields] = useState<ApiField[]>([]);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const { toast } = useToast();
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const sportDisplayName = useCallback((s: Pick<Sport, "nameAr" | "nameEn">) => {
    return getLanguageOnlyText(s.nameAr, s.nameEn, language) || "—";
  }, [language]);

  const mapApiSport = useCallback((item: SportApiItem): Sport => {
    const nameAr = item.name_ar || (item.name && !item.name_en ? item.name : "") || "";
    const nameEn = item.name_en || (item.name && !item.name_ar ? item.name : "") || "";
    const membersCount = item.membersCount ?? item.members_count ?? 0;
    const priceNum = typeof item.price === "string" ? Number(item.price) : item.price;
    const directSchedules = Array.isArray(item.training_schedules) ? item.training_schedules : [];
    const hasTeams = Array.isArray(item.teams) ? item.teams.length > 0 : directSchedules.length > 0;
    return {
      id: item.id,
      nameAr,
      nameEn,
      membersCount,
      price: typeof priceNum === "number" && !Number.isNaN(priceNum) ? priceNum : 0,
      maxParticipants: item.max_participants ?? 0,
      status: item.status ?? "pending",
      imageUrl: item.sport_image ?? null,
      is_active: item.is_active ?? true,
      branch_id: item.branch_id ?? null,
      requires_booking: item.requires_booking ?? false,
      schedules: directSchedules as ApiSchedule[],
      hasTeams,
    };
  }, []);

  const fetchSports = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<SportsListResponse>("/sports");
      const list = res?.data?.data;
      if (Array.isArray(list)) {
        setSports(list.map(mapApiSport));
      } else {
        setSports(fallbackSports);
      }
    } catch (err) {
      setSports(fallbackSports);
      toast({ title: t('toast.loadError'), description: t('toast.loadError'), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [mapApiSport, toast]);

  useEffect(() => {
    void fetchSports();
  }, [fetchSports]);

  // ── Fetch fields from API for team training field selector ──────────────────
  const fetchFields = useCallback(async () => {
    console.log('[SportsPage][fetchFields] جاري تحميل قائمة الملاعب من GET /api/fields');
    try {
      const res = await api.get<{ success: boolean; data: ApiField[] }>('/fields');
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setFields(list);
      console.log('[SportsPage][fetchFields] تم تحميل', list.length, 'ملعب:', list.map(f => ({ id: f.id, name: f.name_ar })));
    } catch (err) {
      console.warn('[SportsPage][fetchFields] فشل تحميل الملاعب:', err);
    }
  }, []);

  useEffect(() => { void fetchFields(); }, [fetchFields]);

  // ── Fetch branches ───────────────────────────────────────────────────────────
  const fetchBranches = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: ApiBranch[] }>('/branches');
      setBranches(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      console.warn('[SportsPage][fetchBranches] فشل تحميل الفروع:', err);
    }
  }, []);

  useEffect(() => { void fetchBranches(); }, [fetchBranches]);

  const handleSave = async () => {
    const nextErrors: SportFormFieldErrors = {};

    if (!form.nameAr.trim()) nextErrors.nameAr = t("validation.requiredNameAr");
    else if (!isArabicOnly(form.nameAr.trim())) nextErrors.nameAr = t("validation.arOnly");

    if (!form.nameEn.trim()) nextErrors.nameEn = t("validation.requiredNameEn");
    else if (!isEnglishOnly(form.nameEn.trim())) nextErrors.nameEn = t("validation.enOnly");

    if (!imagePreview) nextErrors.photo = t("validation.requiredPhoto");
    if (!form.branchId) nextErrors.branchId = t("validation.requiredBranch");

    if (form.maxParticipants.trim()) {
      const maxP = Number(form.maxParticipants);
      if (!Number.isFinite(maxP) || maxP < 0 || !Number.isInteger(maxP)) {
        nextErrors.maxParticipants = t("validation.invalidMaxParticipants");
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});

    // ─── Team validation (only when teams have been added) ───
    if (teams.length > 0) {
      for (const t of teams) {
        const teamName = t.nameAr || t.nameEn;
        if (!t.nameAr.trim() || !t.nameEn.trim()) {
          setTeamsError(t('toast.teamsErrorName'));
          return;
        }
        const maxP = Number(t.maxParticipants);
        if (!t.maxParticipants || isNaN(maxP) || maxP <= 0) {
          setTeamsError(t('toast.teamsErrorMax'));
          return;
        }
        const tr = t.training;
        if (!tr.startTime || !tr.endTime) {
          setTeamsError(t('toast.teamsErrorTime', { name: teamName }));
          return;
        }
        if (!isValidTimeRange(tr.startTime, tr.endTime)) {
          setTeamsError(t('toast.teamsErrorTimeRange', { name: teamName }));
          return;
        }
        if (tr.selectedDays.length === 0) {
          setTeamsError(t('toast.teamsErrorDays', { name: teamName }));
          return;
        }
        if (!tr.fieldId) {
          setTeamsError(t('toast.teamsErrorField', { name: teamName }));
          return;
        }
        const fee = Number(tr.trainingFee);
        if (tr.trainingFee === "" || isNaN(fee) || fee < 0) {
          setTeamsError(t('toast.teamsErrorFee', { name: teamName }));
          return;
        }
      }
    }
    setTeamsError("");

    setSaveLoading(true);
    try {
      // ─── Build POST body exactly as backend expects ───
      const teamsPayload = teams.map(t => ({
        name_ar: t.nameAr,
        name_en: t.nameEn,
        max_participants: Number(t.maxParticipants),
        subscription_price: Number(t.subscriptionPrice) || 0,
        visibility_type: t.visibility || undefined,
        price: t.price !== "" ? Number(t.price) : undefined,
        training: {
          days_ar: t.training.selectedDays.join(", "),
          days_en: t.training.selectedDays
            .map(ar => DAYS.find(d => d.ar === ar)?.en ?? ar)
            .join(", "),
          start_time: t.training.startTime + ":00",
          end_time: t.training.endTime + ":00",
          field_id: t.training.fieldId,
          training_fee: Number(t.training.trainingFee),
        },
      }));

      if (editSport) {
        // Step 1: Update sport basic info
        const body: Record<string, unknown> = {
          name_ar: form.nameAr,
          name_en: form.nameEn,
          is_active: form.isActive,
          requires_booking: requiresBooking,
          max_participants: form.maxParticipants.trim() ? Number(form.maxParticipants) : 0,
        };
        if (form.branchId) body.branch_id = Number(form.branchId);
        if (imagePreview !== null) body.sport_image = imagePreview;
        console.log(`[SportsPage][handleSave] PUT /api/sports/${editSport.id}`, body);
        await api.put<{ message: string; data: unknown }>(`/sports/${editSport.id}`, body);
        console.log('[SportsPage][handleSave] PUT نجح');

        // Step 2: Only POST truly new teams (those without an apiId from the backend)
        const newTeams = teams.filter(t => !t.apiId);
        console.log(`[SportsPage][handleSave] ${newTeams.length} فريق جديد للحفظ (من أصل ${teams.length} إجمالاً)`);
        for (const t of newTeams) {
          const teamBody = {
            sport_id: editSport.id,
            name_ar: t.nameAr,
            name_en: t.nameEn,
            max_participants: Number(t.maxParticipants),
            subscription_price: Number(t.subscriptionPrice) || 0,
            visibility_type: t.visibility || undefined,
            price: t.price !== "" ? Number(t.price) : undefined,
            training: {
              days_ar: t.training.selectedDays.join(", "),
              days_en: t.training.selectedDays
                .map(ar => DAYS.find(d => d.ar === ar)?.en ?? ar)
                .join(", "),
              start_time: t.training.startTime + ":00",
              end_time: t.training.endTime + ":00",
              field_id: t.training.fieldId || undefined,
              training_fee: Number(t.training.trainingFee),
            },
          };
          console.log('[SportsPage][handleSave] POST /api/teams', teamBody);
          await api.post('/teams', teamBody);
        }

        toast({ title: t('toast.updateTitle'), description: t('toast.updateSuccess') });
      } else {
        const body: Record<string, unknown> = {
          name_ar: form.nameAr,
          name_en: form.nameEn,
          is_active: form.isActive,
          requires_booking: requiresBooking,
          max_participants: form.maxParticipants.trim() ? Number(form.maxParticipants) : 0,
          ...(teams.length > 0 ? { teams: teamsPayload } : {}),
        };
        if (form.branchId) body.branch_id = Number(form.branchId);
        if (imagePreview !== null) body.sport_image = imagePreview;
        console.log('[SportsPage][handleSave] POST /api/sports', JSON.stringify(body, null, 2));
        const res = await api.post<{ message: string; data: unknown }>('/sports', body);
        console.log('[SportsPage][handleSave] POST نجح:', res?.data);
        toast({ title: t('toast.addSuccessTitle'), description: res?.data?.message || t('toast.addSuccessDesc') });
      }

      setEditSport(null);
      setIsAddOpen(false);
      setForm({ nameAr: "", nameEn: "", isActive: true, branchId: "", maxParticipants: "" });
      setFieldErrors({});
      setImagePreview(null);
      setTeams([]);
      setTeamsError("");
      setRequiresBooking(false);
      await fetchSports();
    } catch (err) {
      const e = err as { status?: number; message?: string; responseData?: { error?: string; message?: string } };
      const message = e?.responseData?.error || e?.responseData?.message || e?.message || 'حدث خطأ غير متوقع';
      console.error('[SportsPage][handleSave] خطأ:', { status: e?.status, message, raw: err });
      toast({ title: t('toast.saveErrorTitle'), description: message, variant: 'destructive' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    console.log('[SportsPage][handleDelete] حذف رياضة id:', deleteId);
    setDeleteLoading(true);
    try {
      const res = await api.delete<{ message: string }>(`/sports/${deleteId}`);
      console.log('[SportsPage][handleDelete] تم الحذف:', res?.data);
      toast({ title: t('toast.deleteSuccessTitle'), description: res?.data?.message || t('toast.deleteSuccessDesc') });
      setDeleteId(null);
      await fetchSports();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      console.error('[SportsPage][handleDelete] خطأ:', err);
      toast({ title: t('toast.deleteErrorTitle'), description: message, variant: 'destructive' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = async (sport: Sport) => {
    console.log('[SportsPage][openEdit] فتح ديالوج التعديل للرياضة:', sport);
    setEditSport(sport);
    setForm({
      nameAr: sport.nameAr,
      nameEn: sport.nameEn,
      isActive: sport.is_active ?? true,
      branchId: sport.branch_id != null ? String(sport.branch_id) : "",
      maxParticipants: sport.maxParticipants > 0 ? String(sport.maxParticipants) : "",
    });
    setFieldErrors({});
    setImagePreview(sport.imageUrl ?? null);
    setTeams([emptyTeam()]);
    setTeamsError("");
    setRequiresBooking(sport.requires_booking ?? false);
    setIsAddOpen(true);

    // Fetch existing teams for this sport
    try {
      console.log(`[SportsPage][openEdit] GET /api/teams?sport_id=${sport.id}`);
      const res = await api.get<{ data: ExistingTeam[] }>(`/teams?sport_id=${sport.id}`);
      const existing = res?.data?.data ?? [];
      console.log('[SportsPage][openEdit] فرق موجودة:', existing.length);
      if (existing.length > 0) {
        setTeams(existing.map(t => ({
          id: generateId(),
          apiId: t.id,            // ← tracks that this team already exists in backend
          nameAr: t.name_ar,
          nameEn: t.name_en,
          maxParticipants: String(t.max_participants ?? 20),
          subscriptionPrice: "",
          visibility: (t as any).visibility_type ?? "",
          price: (t as any).price != null ? String((t as any).price) : "",
          training: t.training_schedules?.[0] ? {
            selectedDays: (t.training_schedules[0].days_ar ?? "").split(", ").filter(Boolean),
            startTime: (t.training_schedules[0].start_time ?? "").slice(0, 5),
            endTime: (t.training_schedules[0].end_time ?? "").slice(0, 5),
            fieldId: t.training_schedules[0].field_id ?? "",
            trainingFee: String(t.training_schedules[0].training_fee ?? ""),
          } : emptyTraining(),
        })));
      } else {
        setTeams([]);
      }
    } catch (err) {
      console.warn('[SportsPage][openEdit] فشل تحميل الفرق:', err);
      setTeams([]);
    }
  };

  const openAdd = () => {
    console.log('[SportsPage][openAdd] فتح ديالوج إضافة رياضة جديدة. الملاعب المتاحة:', fields.length);
    setEditSport(null);
    setForm({ nameAr: "", nameEn: "", isActive: true, branchId: "", maxParticipants: "" });
    setFieldErrors({});
    setImagePreview(null);
    setTeams([]);
    setTeamsError("");
    setRequiresBooking(false);
    setIsAddOpen(true);
  };

  const fetchMembersForSport = useCallback(async (sportName: string) => {
    console.log('[SportsPage][fetchMembersForSport] GET /api/sports/team-members/sport/', sportName);
    setMembersLoading(true);
    setDialogMembers([]);
    try {
      const encoded = encodeURIComponent(sportName);
      const res = await api.get<{ success?: boolean; data?: ApiMember[] }>(
        `/sports/team-members/sport/${encoded}`
      );
      const members = Array.isArray(res?.data?.data) ? res.data.data! : [];
      setDialogMembers(members);
      console.log('[SportsPage][fetchMembersForSport] تم تحميل', members.length, 'عضو');
    } catch (err) {
      console.warn('[SportsPage][fetchMembersForSport] فشل:', err);
      setDialogMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const openMembers = (sport: Sport) => {
    console.log('[SportsPage][openMembers] عرض أعضاء رياضة:', sport.nameAr || sport.nameEn);
    setMembersSport(sport);
    const apiName = sport.nameEn || sport.nameAr;
    void fetchMembersForSport(apiName);
  };

  const isArabicOnly = (text: string): boolean => PATTERNS.ARABIC_TEXT.test(text);

  const handleNameArChange = (value: string) => {
    if (value === "" || isArabicOnly(value)) {
      setForm({ ...form, nameAr: value });
      setFieldErrors((prev) => ({ ...prev, nameAr: undefined }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, nameAr: t("validation.arOnly") }));
  };

  const isEnglishOnly = (text: string): boolean => PATTERNS.ENGLISH_TEXT.test(text);

  const handleNameEnChange = (value: string) => {
    if (value === "" || isEnglishOnly(value)) {
      setForm({ ...form, nameEn: value });
      setFieldErrors((prev) => ({ ...prev, nameEn: undefined }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, nameEn: t("validation.enOnly") }));
  };

  const filteredSports = useMemo(() => sports.filter((sport) => {
    if (filterTab === "all") return true;
    const hasSchedules = sport.schedules && sport.schedules.length > 0;
    if (filterTab === "inactive") return sport.is_active === false;
    if (filterTab === "draft") return sport.is_active !== false && !hasSchedules;
    if (filterTab === "active") return sport.is_active !== false && hasSchedules;
    return true;
  }), [sports, filterTab]);

  useEffect(() => {
    setPage(1);
  }, [filterTab]);

  const pagedSports = useMemo(
    () => filteredSports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredSports, page],
  );

  const filterTabs = (["all", "active", "draft", "inactive"] as const).map((tab) => ({
    id: tab,
    label:
      tab === "all" ? t('filter.all')
        : tab === "active" ? t('filter.active')
          : tab === "draft" ? t('filter.draft')
            : t('filter.inactive'),
    count: tab === "all"
      ? sports.length
      : sports.filter((sport) => {
        const hasSchedules = (sport.schedules && sport.schedules.length > 0) || sport.hasTeams === true;
        if (tab === "inactive") return sport.is_active === false;
        if (tab === "draft") return sport.is_active !== false && !hasSchedules;
        if (tab === "active") return sport.is_active !== false && hasSchedules;
        return true;
      }).length,
  }));

  return (
    <TooltipProvider delayDuration={200}>
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <AdminPageHeader
        icon={Trophy}
        title={t('header.title')}
        subtitle={t('header.subtitle', { count: sports.length })}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void fetchSports()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('header.refresh')}
            </Button>
            <RoleGuard privilege="CREATE_SPORT">
              <Button size="sm" className="gap-2" onClick={openAdd}>
                <Plus className="h-4 w-4" />
                {t('header.addButton')}
              </Button>
            </RoleGuard>
          </>
        }
      />

      <div className={adminPageStyles.toolbar}>
        <div className={adminPageStyles.toolbarTabGroup}>
          {filterTabs.map(({ id, label, count }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilterTab(id)}
              className={`${adminPageStyles.toolbarTab} ${filterTab === id ? adminPageStyles.toolbarTabActive : adminPageStyles.toolbarTabInactive}`}
            >
              {label}
              <span className="text-[11px] font-bold tabular-nums opacity-70">({count})</span>
            </button>
          ))}
        </div>
        <span className={adminPageStyles.toolbarResults}>
          {t('header.results', { count: filteredSports.length })}
        </span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-hidden border-t border-border bg-card mx-0 flex flex-col">
          <div className={adminTableStyles.container}>
            <Table className={adminTableStyles.table}>
          <TableHeader className={adminTableStyles.header}>
            <TableRow>
              <TableHead className={adminHeadClass({ className: "w-28" })}></TableHead>
              <TableHead className={adminHeadClass()}>{t('table.name')}</TableHead>
              <TableHead className={adminHeadClass({ center: true, className: "whitespace-nowrap" })}>{t('table.maxParticipants')}</TableHead>
              <TableHead className={adminHeadClass({ className: "whitespace-nowrap" })}>{t('table.status')}</TableHead>
              <TableHead className={adminHeadClass({ center: true, className: "whitespace-nowrap" })}>{t('table.bookingAvailable')}</TableHead>
              <TableHead className={adminHeadClass({ center: true, className: "w-[148px]" })}>{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={adminTableStyles.body}>
            <AnimatePresence>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{t('loading')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                        <Trophy className="w-7 h-7 opacity-40" />
                      </div>
                      <p className="font-medium">{t('empty')}</p>
                      <RoleGuard privilege="CREATE_SPORT">
                        <Button size="sm" className="gap-2 mt-1" onClick={openAdd}>
                          <Plus className="h-4 w-4" />
                          {t('header.addButton')}
                        </Button>
                      </RoleGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pagedSports.map((sport) => {
                  const statusKey = resolveSportStatusKey(sport);
                  return (
                    <motion.tr
                      key={sport.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={adminTableStyles.row}
                    >
                      <TableCell className={adminCellClass({ className: "py-2" })}>
                        <SportImage
                          src={sport.imageUrl}
                          nameEn={sport.nameEn}
                          alt={sportDisplayName(sport)}
                          size="table"
                        />
                      </TableCell>
                      <TableCell className={adminCellClass()}>
                        <span className="font-medium" dir="auto">{sportDisplayName(sport)}</span>
                      </TableCell>
                      <TableCell className={adminCellClass({ center: true, className: "tabular-nums font-medium" })}>
                        {formatMaxParticipants(sport.maxParticipants, t)}
                      </TableCell>
                      <TableCell className={adminCellClass({ className: "whitespace-nowrap" })}>
                        <span title={isSportDraftStatus(sport) ? t('status.draftTooltip') : undefined}>
                          <AdminMemberStatusBadge status={statusKey} compact />
                        </span>
                      </TableCell>
                      <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            sport.requires_booking
                              ? "bg-sky-100 text-sky-700 border-sky-200"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {sport.requires_booking ? t("table.bookingYes") : t("table.bookingNo")}
                        </span>
                      </TableCell>
                      <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })} onClick={(e) => e.stopPropagation()}>
                        <AdminRowActions>
                          <AdminViewButton
                            tooltip={t('actions.viewMembers')}
                            onClick={() => openMembers(sport)}
                          />
                          <RoleGuard privilege="UPDATE_SPORT">
                            <AdminActionButton
                              tooltip={t('actions.edit')}
                              icon={Pencil}
                              variant="edit"
                              onClick={() => void openEdit(sport)}
                            />
                          </RoleGuard>
                          <RoleGuard privilege="DELETE_SPORT">
                            <AdminActionButton
                              tooltip={t('actions.delete')}
                              icon={Trash2}
                              variant="delete"
                              onClick={() => setDeleteId(sport.id)}
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
          </div>

          <AdminPagination
            page={page}
            totalCount={filteredSports.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            isRTL={isRTL}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditSport(null);
            setImagePreview(null);
          }
        }}
      >
        <DialogContent className={`${adminDialogStyles.content} max-w-3xl`} dir={isRTL ? 'rtl' : 'ltr'}>
          <div className={`${adminDialogStyles.panel} max-h-[90vh]`}>
            <div className="px-6 py-4 border-b border-border bg-muted/20 shrink-0">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  {editSport ? <Pencil className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                </div>
                <DialogHeader className="space-y-1 text-start">
                  <DialogTitle className="text-lg font-bold">
                    {editSport ? t('dialog.editTitle') : t('dialog.addTitle')}
                  </DialogTitle>
                  <DialogDescription>
                    {editSport ? t('dialog.editDesc') : t('dialog.addDesc')}
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">
              <section className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-semibold text-foreground">{t('form.basicInfo')}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('form.basicInfoHint')}</p>
                </div>
                <div className="p-4 space-y-4">
              {/* Photo upload */}
              <div>
                <Label className="mb-2 block">{t('form.photoLabel')} <span className="text-destructive">*</span></Label>
                <ImageUploadBox
                  preview={imagePreview}
                  onSelect={(url) => {
                    setImagePreview(url);
                    setFieldErrors((prev) => ({ ...prev, photo: undefined }));
                  }}
                  inputRef={imageInputRef}
                />
                <FieldInlineError message={fieldErrors.photo} />
                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setImagePreview(null); if (imageInputRef.current) imageInputRef.current.value = ""; }}
                    className="mt-2 h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3.5 h-3.5 me-1" />
                    {t('form.removePhoto')}
                  </Button>
                )}
              </div>

              {/* Status + Branch row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block">{t('form.status')}</Label>
                  <Select
                    value={form.isActive ? "active" : "inactive"}
                    onValueChange={v => setForm(f => ({ ...f, isActive: v === "active" }))}
                  >
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('form.active')}</SelectItem>
                      <SelectItem value="inactive">{t('form.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block">{t('form.branch')} <span className="text-destructive">*</span></Label>
                  <Select
                    value={form.branchId || "none"}
                    onValueChange={v => {
                      setForm(f => ({ ...f, branchId: v === "none" ? "" : v }));
                      setFieldErrors((prev) => ({ ...prev, branchId: undefined }));
                    }}
                  >
                    <SelectTrigger className={`h-10 ${fieldErrors.branchId ? "border-destructive" : ""}`}>
                      <SelectValue placeholder={t('form.branchPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-muted-foreground">{t('form.noBranch')}</SelectItem>
                      {branches.map(b => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {getLanguageOnlyText(b.name_ar, b.name_en, language) || b.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInlineError message={fieldErrors.branchId} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t('form.nameArLabel')} <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.nameAr}
                    onChange={(e) => handleNameArChange(e.target.value)}
                    placeholder={getBilingualFieldPlaceholder('ar', 'SportsPage', 'form.nameArPlaceholder')}
                    maxLength={100}
                    className={`h-10 ${fieldErrors.nameAr ? "border-destructive" : ""}`}
                    aria-invalid={!!fieldErrors.nameAr}
                  />
                  <FieldInlineError message={fieldErrors.nameAr} />
                </div>
                <div>
                  <Label>{t('form.nameEnLabel')} <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.nameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    dir="ltr"
                    className={`text-start h-10 ${fieldErrors.nameEn ? "border-destructive" : ""}`}
                    placeholder={getBilingualFieldPlaceholder('en', 'SportsPage', 'form.nameEnPlaceholder')}
                    maxLength={100}
                    aria-invalid={!!fieldErrors.nameEn}
                  />
                  <FieldInlineError message={fieldErrors.nameEn} />
                </div>
              </div>

              <div>
                <Label>{t('form.maxParticipantsLabel')}</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.maxParticipants}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, maxParticipants: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, maxParticipants: undefined }));
                  }}
                  placeholder={t('form.maxParticipantsPlaceholder')}
                  className={`h-10 max-w-[200px] ${fieldErrors.maxParticipants ? "border-destructive" : ""}`}
                />
                <FieldInlineError message={fieldErrors.maxParticipants} />
              </div>
                </div>
              </section>

              {/* ─── Teams Section ─── */}
              <section className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t('form.teamsLabel')}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('form.teamsHint')}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1.5 shrink-0"
                    onClick={() => {
                      const tNew = emptyTeam();
                      console.log('[SportsPage][addTeam] new team:', tNew.id);
                      setTeams(prev => [...prev, tNew]);
                      setTeamsError("");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {t('form.addTeam')}
                  </Button>
                </div>

                <div className="p-4 space-y-3">
                {teamsError && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{teamsError}</span>
                  </div>
                )}

                {teams.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">{t('form.noTeams')}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1.5 mt-3"
                      onClick={() => setTeams([emptyTeam()])}
                    >
                      <Plus className="h-4 w-4" />
                      {t('form.addTeam')}
                    </Button>
                  </div>
                ) : null}

                <AnimatePresence initial={false}>
                  {teams.map((team, teamIdx) => {
                    const upd = (patch: Partial<Team>) =>
                      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, ...patch } : t));
                    const updTr = (patch: Partial<TeamTraining>) =>
                      setTeams(prev => prev.map(t =>
                        t.id === team.id ? { ...t, training: { ...t.training, ...patch } } : t));
                    const toggleDay = (ar: string) => {
                      const next = team.training.selectedDays.includes(ar)
                        ? team.training.selectedDays.filter(d => d !== ar)
                        : [...team.training.selectedDays, ar];
                      updTr({ selectedDays: next });
                    };
                    const timeErr = team.training.startTime && team.training.endTime
                      && !isValidTimeRange(team.training.startTime, team.training.endTime);

                    return (
                      <motion.div key={team.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }}
                        className="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-primary">{t('form.teamTitle', { n: teamIdx + 1 })}</span>
                          {(teams.length > 1 || !team.apiId) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => { console.log('[SportsPage][removeTeam]', team.id); setTeams(prev => prev.filter(t => t.id !== team.id)); }}
                              className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              aria-label={t('actions.delete')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Bilingual names */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs mb-1 block">{t('form.teamNameArLabel')} <span className="text-destructive">*</span></Label>
                            <input type="text" value={team.nameAr}
                              onChange={e => { upd({ nameAr: e.target.value }); if (teamsError) setTeamsError(""); }}
                              placeholder={getBilingualFieldPlaceholder('ar', 'SportsPage', 'form.teamNameArPlaceholder')}
                              className="w-full h-8 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Team Name (EN) <span className="text-destructive">*</span></Label>
                            <input type="text" dir="ltr" value={team.nameEn}
                              onChange={e => { upd({ nameEn: e.target.value }); if (teamsError) setTeamsError(""); }}
                              placeholder="e.g. Under 18 Team"
                              className="w-full h-8 rounded-md border border-border bg-background px-3 text-sm text-start focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                        </div>

                        {/* Max participants + Subscription price */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap shrink-0">{t('form.maxParticipants')} <span className="text-destructive">*</span></Label>
                            <input type="number" min={1} value={team.maxParticipants}
                              onChange={e => { upd({ maxParticipants: e.target.value }); if (teamsError) setTeamsError(""); }}
                              placeholder="20"
                              className="w-20 h-8 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap shrink-0">{t('form.subscriptionPrice')}</Label>
                            <input type="number" min={0} value={team.subscriptionPrice}
                              onChange={e => upd({ subscriptionPrice: e.target.value })}
                              placeholder="0"
                              className="w-20 h-8 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                        </div>

                        {/* Visibility + Price — matches TeamsManagementPage */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs mb-1 block">العضوية</Label>
                            <Select
                              value={team.visibility || "none"}
                              onValueChange={val => upd({ visibility: val === "none" ? "" : val })}
                            >
                              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="اختر العضوية" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none" className="text-xs text-muted-foreground">— بدون تحديد —</SelectItem>
                                <SelectItem value="INTERNAL" className="text-xs">داخلي</SelectItem>
                                <SelectItem value="EXTERNAL" className="text-xs">خارجي</SelectItem>
                                <SelectItem value="BOTH" className="text-xs">داخلي و خارجي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap shrink-0">السعر (ج.م)</Label>
                            <input type="number" min={0} value={team.price}
                              onChange={e => upd({ price: e.target.value })}
                              placeholder="0"
                              className="w-24 h-8 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                        </div>

                        {/* Training block */}
                        <div className="space-y-2 rounded-md border border-border/60 bg-background p-2.5">
                          <span className="text-xs font-semibold text-muted-foreground">{t('form.trainingLabel')}</span>

                          {/* Day chips */}
                          <div>
                            <Label className="text-xs mb-1.5 block">{t('form.trainingDays')} <span className="text-destructive">*</span></Label>
                            <div className="flex flex-wrap gap-1.5">
                              {DAYS.map(day => {
                                const on = team.training.selectedDays.includes(day.ar);
                                return (
                                  <button key={day.ar} type="button" onClick={() => toggleDay(day.ar)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150
                                      ${on ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-foreground border-border hover:border-primary/60"}`}>
                                    {isRTL ? day.ar : day.en}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Time pickers */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Label className="text-xs text-muted-foreground whitespace-nowrap">{t('form.from')}</Label>
                            <TimeSlotPicker value={team.training.startTime} placeholder={t('form.from')}
                              lockedValue={team.training.endTime} onChange={v => updTr({ startTime: v })} />
                            <Label className="text-xs text-muted-foreground whitespace-nowrap">{t('form.to')}</Label>
                            <TimeSlotPicker value={team.training.endTime} placeholder={t('form.to')}
                              lockedValue={team.training.startTime} onChange={v => updTr({ endTime: v })} />
                          </div>
                          {timeErr && <p className="text-[11px] text-destructive">{t('form.timeError')}</p>}

                          {/* Field selector — GET /api/fields */}
                          <div>
                            <Label className="text-xs mb-1 block">{t('form.field')} <span className="text-destructive">*</span></Label>
                            {fields.length === 0 ? (
                              <p className="text-xs text-amber-600 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-md px-3 py-2">
                                {t('form.noFields')}
                              </p>
                            ) : (
                              <Select
                                value={team.training.fieldId || "none"}
                                onValueChange={val => {
                                  console.log('[SportsPage][fieldSelect] field:', val, 'team:', team.nameAr || team.nameEn);
                                  updTr({ fieldId: val === "none" ? "" : val });
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('form.fieldPlaceholder')} /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none" className="text-xs text-muted-foreground">{t('form.fieldPlaceholder')}</SelectItem>
                                  {fields.map(f => (
                                    <SelectItem key={f.id} value={f.id} className="text-xs">
                                      {isRTL ? f.name_ar : (f.name_en || f.name_ar)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>

                          {/* Training fee */}
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap shrink-0">{t('form.trainingFee')} <span className="text-destructive">*</span></Label>
                            <input type="number" min={0} value={team.training.trainingFee}
                              onChange={e => updTr({ trainingFee: e.target.value })}
                              placeholder="200"
                              className="w-24 h-8 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                </div>
              </section>

              {/* ─── Booking Toggle ─── */}
              <section className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-semibold text-foreground">{t('form.bookingSection')}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('form.requiresBookingHint')}</p>
                </div>
                <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="requires-booking" className="cursor-pointer font-medium text-sm">
                    {t('form.requiresBooking')}
                  </Label>
                  <Switch
                    dir="ltr"
                    id="requires-booking"
                    checked={requiresBooking}
                    onCheckedChange={setRequiresBooking}
                    className="shrink-0"
                  />
                </div>

                {requiresBooking && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed font-medium">
                      {t('form.bookingWarning')}
                    </p>
                  </div>
                )}
                </div>
              </section>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditSport(null);
                  setImagePreview(null);
                }}
                disabled={saveLoading}
              >
                {t('form.cancel')}
              </Button>
              <Button size="sm" onClick={() => void handleSave()} disabled={saveLoading} className="gap-2 min-w-[7rem]">
                {saveLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('form.saving')}
                  </>
                ) : (
                  t('form.save')
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div className="space-y-1 text-start">
                <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
                <DialogDescription>{t('deleteDialog.description')}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)} disabled={deleteLoading}>
              {t('deleteDialog.cancel')}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => void handleDelete()} disabled={deleteLoading} className="gap-2 min-w-[6rem]">
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('deleteDialog.deleting')}
                </>
              ) : (
                t('deleteDialog.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sport Members Dialog */}
      <Dialog open={membersSport !== null} onOpenChange={() => { setMembersSport(null); setDialogMembers([]); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>          <DialogHeader>
          {/* Sport hero banner */}
          {membersSport && (
            <div className="relative mb-3 -mt-1">
              <SportImage
                src={membersSport.imageUrl}
                nameEn={membersSport.nameEn}
                alt={sportDisplayName(membersSport)}
                size="banner"
                containerClassName="rounded-xl"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-xl bg-gradient-to-t from-black/60 to-transparent" />
              <h2 className="absolute bottom-3 end-4 text-xl font-bold text-white drop-shadow">
                {sportDisplayName(membersSport)}
              </h2>
            </div>
          )}
          <DialogTitle className={membersSport ? "sr-only" : ""}>
            {membersSport ? t('membersDialog.title', { name: sportDisplayName(membersSport) }) : ""}
            {!membersLoading && (
              <span className="me-2 text-sm font-normal text-muted-foreground">{t('membersDialog.count', { n: dialogMembers.length })}</span>
            )}
          </DialogTitle>
          {!membersSport && (
            <DialogDescription>{t('membersDialog.description')}</DialogDescription>
          )}
        </DialogHeader>

          {membersSport && !membersLoading && (
            <p className="text-sm text-muted-foreground -mt-1 mb-1">
              {t('membersDialog.countSubtitle', { n: dialogMembers.length })}
            </p>
          )}

          {membersLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">{t('membersDialog.loading')}</span>
            </div>
          ) : (
            <Table>
              <TableHeader className={adminTableStyles.header}>
                <TableRow>
                  <TableHead className={adminHeadClass()}>{t('membersTable.name')}</TableHead>
                  <TableHead className={adminHeadClass()}>{t('membersTable.nationalId')}</TableHead>
                  <TableHead className={adminHeadClass()}>{t('membersTable.phone')}</TableHead>
                  <TableHead className={adminHeadClass()}>{t('membersTable.status')}</TableHead>
                  <TableHead className={adminHeadClass()}>{t('membersTable.registrationDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={adminTableStyles.body}>
                {dialogMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {t('membersDialog.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  dialogMembers.map((m) => {
                    return (
                      <TableRow key={m.id} className={adminTableStyles.row}>
                        <TableCell className={adminCellClass()}>
                          <PersonNameDisplay
                            id={m.id}
                            names={{
                              firstNameAr: m.first_name_ar,
                              lastNameAr: m.last_name_ar,
                              firstNameEn: m.first_name_en,
                              lastNameEn: m.last_name_en,
                            }}
                            language={language}
                            showAvatar={false}
                          />
                        </TableCell>
                        <TableCell className={adminCellClass({ size: 'nationalId' })} dir="ltr">{m.national_id}</TableCell>
                        <TableCell className={adminCellClass({ size: 'phone' })} dir="ltr">{m.phone ?? "—"}</TableCell>
                        <TableCell className={adminCellClass()}>
                          <AdminMemberStatusBadge
                            status={m.status === "approved" ? "approved" : m.status}
                            compact
                          />
                        </TableCell>
                        <TableCell className={adminCellClass({ size: "muted", className: "tabular-nums" })} dir="ltr">{fmtDate(m.created_at)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setMembersSport(null); setDialogMembers([]); }}>{t('membersDialog.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
