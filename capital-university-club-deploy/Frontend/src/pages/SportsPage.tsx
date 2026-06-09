import { useCallback, useEffect, useRef, useState } from "react";
import { generateId } from "../utils/id";
import { motion, AnimatePresence } from "framer-motion";
import { mockSports } from "../data/mockData";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import { useLanguage } from "../hooks/useLanguage";
import { adminTableStyles, adminHeadClass, adminCellClass } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { BilingualText } from "../components/StaffPagesComponents/shared/BilingualText";
import { PersonNameDisplay } from "../components/StaffPagesComponents/shared/PersonNameDisplay";
import { getLocalizedText } from "../lib/localizedDisplay";
import { PATTERNS } from "../lib/validation";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Label } from "../components/StaffPagesComponents/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/StaffPagesComponents/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/StaffPagesComponents/ui/select";
import { Switch } from "../components/StaffPagesComponents/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "../components/StaffPagesComponents/ui/popover";
import { Pencil, Trash2, Eye, Plus, Loader2, UploadCloud, ImageOff, X, Clock, AlertCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../services/axios";
import { useTranslation } from "react-i18next";


// ─── Types ────────────────────────────────────────────────────────────────────

interface Sport {
  id: number;
  nameAr: string;
  nameEn: string;
  membersCount: number;
  price: number;
  imageUrl?: string | null;
  is_active?: boolean;
  branch_id?: number | null;
  requires_booking?: boolean;
  schedules?: ApiSchedule[];
  hasTeams?: boolean;          // true when at least one team exists for this sport
}

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
  imageUrl: null,
}));

// ─── Sport Image component ────────────────────────────────────────────────────

const SportImage = ({
  src,
  alt,
  className = "",
  fallbackClassName = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) => {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${fallbackClassName}`}>
        <ImageOff className="w-5 h-5 text-muted-foreground opacity-50" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      className={`object-cover rounded-lg ${className}`}
    />
  );
};

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
    className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group
      ${preview ? "border-primary" : "border-border hover:border-primary/60"}`}
    style={{ minHeight: 160 }}
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
      <img src={preview} alt="Preview" className="w-full h-full object-cover" style={{ minHeight: 160 }} />
    ) : (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground group-hover:text-primary transition-colors">
        <UploadCloud className="w-10 h-10" />
        <p className="text-sm font-medium">{t('form.uploadClick')}</p>
        <p className="text-xs opacity-60">PNG, JPG, WEBP</p>
      </div>
    )}
    {preview && (
      <div className="absolute inset-0 bg-black/40  transition-opacity flex items-center justify-center">
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

const getSportStatus = (sport: Sport, t: any) => {
  // A sport is considered "ready" if it has at least one team OR at least one direct schedule
  const hasSchedules = (sport.schedules && sport.schedules.length > 0) || sport.hasTeams === true;

  if (sport.is_active === false) {
    return { label: t('status.inactive'), className: "bg-red-100 text-red-700 border-red-200", isDraft: false };
  }
  if (!hasSchedules) {
    return { label: t('status.draft'), className: "bg-gray-100 text-gray-600 border-gray-200", isDraft: true };
  }
  return { label: t('status.active'), className: "bg-emerald-100 text-emerald-700 border-emerald-200", isDraft: false };
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SportsPage() {
  const { t } = useTranslation('SportsPage');
  const { language, isRTL } = useLanguage();

  const [sports, setSports] = useState<Sport[]>([]);
  const [editSport, setEditSport] = useState<Sport | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ nameAr: "", nameEn: "", isActive: true, branchId: "" });
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
  const imageInputRef = useRef<HTMLInputElement>(null);

  const sportDisplayName = useCallback((s: Pick<Sport, "nameAr" | "nameEn">) => {
    return getLocalizedText(s.nameAr, s.nameEn, language);
  }, [language]);

  const mapApiSport = useCallback((item: SportApiItem): Sport => {
    const nameAr = item.name_ar || (item.name && !item.name_en ? item.name : "") || "";
    const nameEn = item.name_en || (item.name && !item.name_ar ? item.name : "") || "";
    const membersCount = item.membersCount ?? item.members_count ?? 0;
    const priceNum = typeof item.price === "string" ? Number(item.price) : item.price;
    // training_schedules can appear directly on the sport (legacy) OR inside teams (new)
    const directSchedules = Array.isArray(item.training_schedules) ? item.training_schedules : [];
    const hasTeams = Array.isArray(item.teams) ? item.teams.length > 0 : directSchedules.length > 0;
    return {
      id: item.id,
      nameAr,
      nameEn,
      membersCount,
      price: typeof priceNum === "number" && !Number.isNaN(priceNum) ? priceNum : 0,
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
    const action = editSport ? 'EDIT' : 'CREATE';
    console.log(`[SportsPage][handleSave] بدء عملية ${action}`, { form, teams, requiresBooking });

    // ─── Mandatory field validation ───
    if (!form.nameAr.trim()) {
      toast({ title: t('toast.requiredFieldTitle'), description: t('toast.requiredNameAr'), variant: 'destructive' });
      return;
    }
    if (!form.nameEn.trim()) {
      toast({ title: t('toast.requiredFieldTitle'), description: t('toast.requiredNameEn'), variant: 'destructive' });
      return;
    }
    if (!imagePreview) {
      toast({ title: t('toast.requiredFieldTitle'), description: t('toast.requiredPhoto'), variant: 'destructive' });
      return;
    }
    if (!form.branchId) {
      toast({ title: t('toast.requiredFieldTitle'), description: t('toast.requiredBranch'), variant: 'destructive' });
      return;
    }

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
      setForm({ nameAr: "", nameEn: "", isActive: true, branchId: "" });
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
    });
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
    setForm({ nameAr: "", nameEn: "", isActive: true, branchId: "" });
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
    } else {
      toast({
        title: t('toast.arOnlyTitle'),
        description: t('toast.arOnlyDesc'),
        variant: "destructive",
      });
    }
  };

  const isEnglishOnly = (text: string): boolean => PATTERNS.ENGLISH_TEXT.test(text);

  const handleNameEnChange = (value: string) => {
    if (value === "" || isEnglishOnly(value)) {
      setForm({ ...form, nameEn: value });
    } else {
      toast({
        title: t('toast.enOnlyTitle'),
        description: t('toast.enOnlyDesc'),
        variant: "destructive",
      });
    }
  };

  const filteredSports = sports.filter(sport => {
    if (filterTab === "all") return true;
    const hasSchedules = sport.schedules && sport.schedules.length > 0;
    if (filterTab === "inactive") return sport.is_active === false;
    if (filterTab === "draft") return sport.is_active !== false && !hasSchedules;
    if (filterTab === "active") return sport.is_active !== false && hasSchedules;
    return true;
  });

  return (
    <div className="min-h-screen p-6 pb-8 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('header.title')}</h1>
        <RoleGuard privilege="CREATE_SPORT">
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('header.addButton')}
          </Button>
        </RoleGuard>
      </div>

      {/* NOTE FOR BACKEND:
          GET /api/sports (public endpoint used by members) should filter out
          sports where schedules array is empty OR is_active is false.
          The admin endpoint should return ALL sports regardless. 
      */}
      <div className="flex items-center gap-2 mb-4 bg-muted/30 p-1 rounded-lg w-fit border border-border">
        {(["all", "active", "draft", "inactive"] as const).map(tab => {
          let label = t('filter.all');
          if (tab === "active") label = t('filter.active');
          if (tab === "draft") label = t('filter.draft');
          if (tab === "inactive") label = t('filter.inactive');
          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${filterTab === tab ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`shadow-sm ${adminTableStyles.container}`}>
        <Table>
          <TableHeader className={adminTableStyles.header}>
            <TableRow>
              <TableHead className={adminHeadClass({ className: "w-14" })}></TableHead>
              <TableHead className={adminHeadClass()}>{t('table.name')}</TableHead>
              <TableHead className={adminHeadClass({ className: "whitespace-nowrap" })}>{t('table.status')}</TableHead>
              <TableHead className={adminHeadClass()}>{t('table.membersCount')}</TableHead>
              <TableHead className={adminHeadClass()}>{t('table.price')}</TableHead>
              <TableHead className={adminHeadClass({ center: true, className: "w-[260px]" })}>{t('table.actions')}</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 opacity-30" />
                      <span>{t('empty')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSports.map((sport) => {
                  const status = getSportStatus(sport, t);
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
                          alt={sportDisplayName(sport)}
                          className="w-10 h-10"
                          fallbackClassName="w-10 h-10"
                        />
                      </TableCell>
                      <TableCell className={adminCellClass()}>
                        <BilingualText ar={sport.nameAr} en={sport.nameEn} language={language} primaryClassName="font-medium" />
                      </TableCell>
                      <TableCell className={adminCellClass({ className: "whitespace-nowrap" })}>
                        <span
                          title={status.isDraft ? t('status.draftTooltip') : undefined}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className={adminCellClass({ className: "font-poppins" })}>{sport.membersCount}</TableCell>
                      <TableCell className={adminCellClass({ className: "font-poppins" })}>{sport.price}</TableCell>
                      <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                        <div className={adminTableStyles.actions}>
                          <RoleGuard privilege="UPDATE_SPORT">
                            <Button size="sm" variant="outline" onClick={() => void openEdit(sport)} className="gap-1 text-accent border-accent hover:bg-accent hover:text-accent-foreground">
                              <Pencil className="h-3 w-3" /> {t('actions.edit')}
                            </Button>
                          </RoleGuard>
                          <RoleGuard privilege="DELETE_SPORT">
                            <Button size="sm" variant="outline" onClick={() => setDeleteId(sport.id)} className="gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="h-3 w-3" /> {t('actions.delete')}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setImagePreview(null); } }}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] p-0 flex flex-col overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex min-h-0 flex-1 flex-col p-6 overflow-hidden">            <DialogHeader className="shrink-0">
            <DialogTitle>{editSport ? t('dialog.editTitle') : t('dialog.addTitle')}</DialogTitle>
            <DialogDescription>{editSport ? t('dialog.editDesc') : t('dialog.addDesc')}</DialogDescription>
          </DialogHeader>
            <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pe-1">
              {/* Photo upload */}
              <div>
                <Label className="mb-2 block">{t('form.photoLabel')}</Label>
                <ImageUploadBox
                  preview={imagePreview}
                  onSelect={setImagePreview}
                  inputRef={imageInputRef}
                />
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); if (imageInputRef.current) imageInputRef.current.value = ""; }}
                    className="mt-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    {t('form.removePhoto')}
                  </button>
                )}
              </div>

              {/* Status + Branch row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block">{t('form.status')}</Label>
                  <Select
                    value={form.isActive ? "active" : "inactive"}
                    onValueChange={v => setForm(f => ({ ...f, isActive: v === "active" }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('form.active')}</SelectItem>
                      <SelectItem value="inactive">{t('form.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1 block">{t('form.branch')}</Label>
                  <Select
                    value={form.branchId || "none"}
                    onValueChange={v => setForm(f => ({ ...f, branchId: v === "none" ? "" : v }))}
                  >
                    <SelectTrigger><SelectValue placeholder={t('form.branchPlaceholder')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-muted-foreground">{t('form.noBranch')}</SelectItem>
                      {branches.map(b => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.name_ar}{b.name_en ? ` (${b.name_en})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t('form.nameArLabel')}</Label>
                <Input
                  value={form.nameAr}
                  onChange={(e) => handleNameArChange(e.target.value)}
                  placeholder={t('form.nameArPlaceholder')}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>{t('form.nameEnLabel')}</Label>
                <Input
                  value={form.nameEn}
                  onChange={(e) => handleNameEnChange(e.target.value)}
                  dir="ltr"
                  className="text-start"
                  placeholder={t('form.nameEnPlaceholder')}
                  maxLength={100}
                />
              </div>


              {/* ─── Teams Section ─── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">{t('form.teamsLabel')}</Label>
                  <Button
                    type="button" size="sm" variant="outline" className="gap-1.5 text-xs"
                    onClick={() => {
                      const tNew = emptyTeam();
                      console.log('[SportsPage][addTeam] new team:', tNew.id);
                      setTeams(prev => [...prev, tNew]);
                      setTeamsError("");
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('form.addTeam')}
                  </Button>
                </div>

                {teamsError && <p className="text-xs font-medium text-destructive">{teamsError}</p>}

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
                        className="rounded-lg border border-border bg-muted/20 p-3 space-y-3"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-primary">{t('form.teamTitle', { n: teamIdx + 1 })}</span>
                          {teams.length > 1 && (
                            <button type="button"
                              onClick={() => { console.log('[SportsPage][removeTeam]', team.id); setTeams(prev => prev.filter(t => t.id !== team.id)); }}
                              className="rounded-md p-1 text-destructive hover:bg-destructive/10 transition-colors" aria-label="حذف الفريق">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Bilingual names */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs mb-1 block">{t('form.teamNameArLabel')} <span className="text-destructive">*</span></Label>
                            <input type="text" value={team.nameAr}
                              onChange={e => { upd({ nameAr: e.target.value }); if (teamsError) setTeamsError(""); }}
                              placeholder={t('form.teamNameArPlaceholder')}
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

              {/* ─── Booking Toggle ─── */}
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="requires-booking" className="cursor-pointer font-medium text-sm">
                      {t('form.requiresBooking')}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {t('form.requiresBookingHint')}
                    </span>
                  </div>
                  <Switch
                    dir="ltr"
                    id="requires-booking"
                    checked={requiresBooking}
                    onCheckedChange={setRequiresBooking}
                    className="shrink-0"
                  />
                </div>

                {/* Booking Warning Banner */}
                {requiresBooking && (
                  <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 p-2.5 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed font-medium">
                      {t('form.bookingWarning')}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="mt-4 border-t pt-4">
              <Button variant="outline" onClick={() => { setIsAddOpen(false); setImagePreview(null); }}>{t('form.cancel')}</Button>
              <Button onClick={() => void handleSave()} disabled={saveLoading} className={requiresBooking ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}>
                {saveLoading ? <Loader2 className="w-4 h-4 animate-spin ms-1" /> : requiresBooking && <AlertCircle className="w-4 h-4 ms-1.5 opacity-80" />}
                {saveLoading ? t('form.saving') : t('form.save')}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
            <DialogDescription>{t('deleteDialog.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>{t('deleteDialog.cancel')}</Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteLoading}>
              {deleteLoading ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sport Members Dialog */}
      <Dialog open={membersSport !== null} onOpenChange={() => { setMembersSport(null); setDialogMembers([]); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>          <DialogHeader>
          {/* Sport hero banner */}
          {membersSport?.imageUrl && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 -mt-1">
              <img
                src={membersSport.imageUrl}
                alt={membersSport ? sportDisplayName(membersSport) : ""}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h2 className="absolute bottom-3 end-4 text-white text-xl font-bold drop-shadow">
                {membersSport ? sportDisplayName(membersSport) : ""}
              </h2>
            </div>
          )}
          <DialogTitle className={membersSport?.imageUrl ? "sr-only" : ""}>
            {membersSport ? t('membersDialog.title', { name: sportDisplayName(membersSport) }) : ""}
            {!membersLoading && (
              <span className="me-2 text-sm font-normal text-muted-foreground">{t('membersDialog.count', { n: dialogMembers.length })}</span>
            )}
          </DialogTitle>
          {!membersSport?.imageUrl && (
            <DialogDescription>{t('membersDialog.description')}</DialogDescription>
          )}
        </DialogHeader>

          {membersSport?.imageUrl && !membersLoading && (
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
                    const statusCls =
                      m.status === "active" || m.status === "approved"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : m.status === "pending"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-rose-200 bg-rose-50 text-rose-700";
                    const statusLabel =
                      m.status === "active" || m.status === "approved" ? t('memberStatus.active')
                        : m.status === "pending" ? t('memberStatus.pending')
                          : m.status === "suspended" ? t('memberStatus.suspended') : t('memberStatus.inactive');
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
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusCls}`}>
                            {statusLabel}
                          </span>
                        </TableCell>
                        <TableCell className={adminCellClass({ size: "muted" })} dir="ltr">{m.created_at ? new Date(m.created_at).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") : "—"}</TableCell>
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
  );
}
