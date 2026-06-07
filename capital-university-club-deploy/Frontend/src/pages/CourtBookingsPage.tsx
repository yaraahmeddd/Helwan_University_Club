import { useState, useCallback, useEffect } from "react";
import { generateId } from "../utils/id";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
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
import {
    ChevronLeft,
    ChevronRight,
    X,
    Phone,
    User,
    CalendarCheck,
    Lock,
    Plus,
    Clock,
    Pencil,
    Loader2,
    RefreshCw,
    Link2,
    Check,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import type { Booking, BookingStatus } from "../data/bookingsData";
import api from "../services/axios";

// ─── API Types ────────────────────────────────────────────────────────────────

interface ApiField {
    id: string;
    name?: string;
    name_ar?: string;
    name_en?: string;
    sport?: { name_ar?: string; name_en?: string };
    sport_id?: number;
    status?: string;
    is_active?: boolean;
}

interface ApiBookableSport {
    sport_id: number;
    sport_name_ar?: string;
    sport_name_en?: string;
    fields: ApiField[];
}

interface ApiCalendarSlot {
    start_time: string; // "HH:mm:ss"
    end_time: string;
    // slot-level status
    status: "available" | "booked" | "training" | "blocked";
    // flat fields returned by the backend calendar API
    booking_id?: string;
    booking_status?: string;        // e.g. "confirmed", "cancelled", "pending_payment"
    member_id?: number | null;
    team_member_id?: number | null;
    training_id?: string;
    // actual booking times (not slot times)
    actual_booking_start?: string;  // "HH:mm:ss" - actual booking start time
    actual_booking_end?: string;    // "HH:mm:ss" - actual booking end time
    // nested booking object (alternative / older API format)
    booking?: {
        id: string;
        status?: string;
        member?: {
            id?: number;
            name_ar?: string;
            full_name?: string;
            member_id?: string;
            phone?: string;
            national_id?: string;
            user_type?: string;
        };
        notes?: string;
    };
}

interface ApiCalendarDay {
    date: string;
    slots: ApiCalendarSlot[];
}

type Language = "ar" | "en";

const getLanguage = (language?: string): Language => (language ?? "ar").startsWith("en") ? "en" : "ar";
const getLocale = (language: Language) => language === "en" ? "en-US" : "ar-EG";

function getFieldName(field: ApiField | undefined, language: Language): string {
    if (!field) return "";
    return language === "en"
        ? (field.name_en ?? field.name_ar ?? field.name ?? field.id)
        : (field.name_ar ?? field.name_en ?? field.name ?? field.id);
}

function getSportName(field: ApiField | undefined, language: Language, fallback: string): string {
    if (!field?.sport) return fallback;
    return language === "en"
        ? (field.sport.name_en ?? field.sport.name_ar ?? fallback)
        : (field.sport.name_ar ?? field.sport.name_en ?? fallback);
}

function formatClockTime(value: string, language: Language): string {
    const [hours, minutes] = value.split(":").map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return new Intl.DateTimeFormat(getLocale(language), {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

function formatDisplayDate(date: Date, language: Language): string {
    return new Intl.DateTimeFormat(getLocale(language), {
        day: "numeric",
        month: "long",
    }).format(date);
}

function formatFullDate(date: Date, language: Language): string {
    return new Intl.DateTimeFormat(getLocale(language), {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function dayOfWeekLabel(date: Date, language: Language): string {
    return new Intl.DateTimeFormat(getLocale(language), { weekday: "long" }).format(date);
}

function normalizeDigits(value: string): string {
    const arabicDigits = "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669";
    return value.replace(/[\u0660-\u0669]/g, (d) => String(arabicDigits.indexOf(d)));
}

function slotToBooking(
    slot: ApiCalendarSlot,
    day: ApiCalendarDay,
    field: ApiField,
    language: Language,
    labels: { training: string; blocked: string; member: string }
): Booking | null {
    if (slot.status === "available") return null;

    // Use actual booking times if available, otherwise fall back to slot times
    const from = slot.actual_booking_start ? slot.actual_booking_start.slice(0, 5) : slot.start_time.slice(0, 5);
    const to = slot.actual_booking_end ? slot.actual_booking_end.slice(0, 5) : slot.end_time.slice(0, 5);
    const courtName = getFieldName(field, language);

    const dateKey = day.date.split("T")[0];

    if (slot.status === "training") {
        return {
            id: slot.training_id ?? `trn-${dateKey}-${from}`,
            courtId: field.id,
            courtName,
            date: dateKey,
            from,
            to,
            status: "blocked",
            isManual: false,
            blockedReason: labels.training,
        };
    }

    if (slot.status === "blocked") {
        return {
            id: slot.booking_id ?? `blk-${dateKey}-${from}`,
            courtId: field.id,
            courtName,
            date: dateKey,
            from,
            to,
            status: "blocked",
            isManual: true,
            blockedReason: labels.blocked,
        };
    }

    // status === "booked"
    // The API returns flat fields (booking_status, member_id) OR a nested booking object
    const bookingStatus = slot.booking_status ?? slot.booking?.status;
    const b = slot.booking;
    const memberData = b?.member;
    const raw = memberData as Record<string, unknown> | undefined;

    const nameAr =
        (raw?.name_ar as string) ||
        (raw?.full_name as string) ||
        [
            language === "en" ? (raw?.first_name_en ?? raw?.first_name_ar ?? "") : (raw?.first_name_ar ?? raw?.first_name_en ?? ""),
            language === "en" ? (raw?.last_name_en ?? raw?.last_name_ar ?? "") : (raw?.last_name_ar ?? raw?.last_name_en ?? ""),
        ].filter(Boolean).join(" ").trim() ||
        labels.member;

    const memberId =
        (raw?.member_id as string) ??
        (raw?.memberid as string) ??
        String(memberData?.id ?? slot.member_id ?? "");

    const phone = (raw?.phone as string) || (raw?.phone_number as string) || "";
    const nationalId = (raw?.national_id as string) || (raw?.nationalid as string) || "";
    const memberType = slot.team_member_id
        ? "team_member"
        : (raw?.user_type === "team_member" ? "team_member" : "member");

    return {
        id: slot.booking_id ?? b?.id ?? `bk-${dateKey}-${from}`,
        courtId: field.id,
        courtName,
        date: dateKey,
        from,
        to,
        status: (bookingStatus === "cancelled" ? "cancelled" : "confirmed") as BookingStatus,
        isManual: false,
        member: (memberData || slot.member_id) ? {
            id: (raw?.id as number) ?? memberData?.id ?? slot.member_id ?? 0,
            nameAr,
            memberId,
            phone,
            nationalId,
            memberType: memberType as "member" | "team_member",
        } : undefined,
    };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HOUR_SLOTS: string[] = Array.from({ length: 17 }, (_, i) => {
    const h = 6 + i;
    return `${String(h).padStart(2, "0")}:00`;
});

const TIME_OPTIONS: { value: string; label: string }[] = Array.from({ length: 36 }, (_, i) => {
    const totalMins = 360 + i * 30;
    const h24 = Math.floor(totalMins / 60);
    const min = totalMins % 60;
    const value = `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const period = h24 < 12 ? "AM" : "PM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const label = `${h12}:${String(min).padStart(2, "0")} ${period}`;
    return { value, label };
});

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day - 6 + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ─── Conflict Detection ───────────────────────────────────────────────────────

const hasConflict = (
    bookings: Booking[],
    courtId: string,
    date: string,
    from: string,
    to: string,
    excludeId?: string
): boolean => {
    return bookings.some(
        (b) =>
            b.id !== excludeId &&
            b.courtId === courtId &&
            b.date === date &&
            b.status !== "cancelled" &&
            b.from < to &&
            b.to > from
    );
};

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookingStatus }) {
    const { t } = useTranslation("CourtBookingsPage");
    if (status === "confirmed")
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">{t("status.confirmed")}</Badge>;
    if (status === "blocked")
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100">{t("status.blocked")}</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">{t("status.cancelled")}</Badge>;
}

// ─── Mini TimeSlotPicker ─────────────────────────────────────────────────────

function TimeSlotPicker({
    value,
    onChange,
    placeholder,
    minValue,
    allowedOptions,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    minValue?: string;
    allowedOptions?: { value: string; label: string }[];
}) {
    const [open, setOpen] = useState(false);
    const { t, i18n } = useTranslation("CourtBookingsPage");
    const language = getLanguage(i18n.resolvedLanguage ?? i18n.language);
    const baseOptions = allowedOptions ?? TIME_OPTIONS;
    const selected = baseOptions.find((t) => t.value === value) ?? TIME_OPTIONS.find((t) => t.value === value);
    const filteredOptions = minValue
        ? baseOptions.filter((t) => t.value > minValue)
        : baseOptions;

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all shadow-sm w-full
                        ${selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-primary/30 bg-background text-primary hover:bg-primary/10"
                        }`}
                >
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {selected ? formatClockTime(selected.value, language) : <span className="opacity-60">{placeholder}</span>}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[17rem] p-4 rounded-2xl" align="start" side="bottom" dir="ltr">
                <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto">
                    {filteredOptions.map((slot) => (
                        <button
                            key={slot.value}
                            type="button"
                            onClick={() => { onChange(slot.value); setOpen(false); }}
                            className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all
                                ${slot.value === value
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-primary/30 bg-background text-primary hover:bg-primary hover:text-primary-foreground"
                                }`}
                        >
                            {formatClockTime(slot.value, language)}
                        </button>
                    ))}
                    {filteredOptions.length === 0 && (
                        <p className="col-span-3 text-center text-xs text-muted-foreground py-4">{t("timePicker.noTimes")}</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ─── InfoRow ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="text-sm font-medium text-left">{value}</span>
        </div>
    );
}

// ─── Booking Detail Panel ────────────────────────────────────────────────────

function BookingDetailPanel({
    booking,
    onClose,
    onCancel,
    onUnblock,
    onEdit,
}: {
    booking: Booking;
    onClose: () => void;
    onCancel: (id: string) => void;
    onUnblock: (id: string) => void;
    onEdit: (booking: Booking) => void;
}) {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("CourtBookingsPage");
    const language = getLanguage(i18n.resolvedLanguage ?? i18n.language);
    const isRTL = language === "ar";

    const copyPhone = () => {
        if (booking.member?.phone) {
            void navigator.clipboard.writeText(booking.member.phone);
            toast({ title: t("toast.copiedTitle"), description: t("toast.phoneCopied") });
        }
    };

    const dateObj = new Date(booking.date);
    const displayDate = formatFullDate(dateObj, language);

    return (
        <motion.div
            initial={{ x: isRTL ? 400 : -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRTL ? 400 : -400, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className={`fixed top-16 bottom-0 ${isRTL ? "left-0 border-r" : "right-0 border-l"} z-40 w-[360px] bg-background border-border shadow-2xl flex flex-col overflow-hidden`}
            dir={isRTL ? "rtl" : "ltr"}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{t("detail.title")}</span>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t("detail.closeAria")}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Booking Info */}
                <div className="px-5 py-4 space-y-3 border-b border-border">
                    <InfoRow label={t("detail.fields.court")} value={booking.courtName} />
                    <InfoRow label={t("detail.fields.date")} value={displayDate} />
                    <InfoRow label={t("detail.fields.time")} value={`${formatClockTime(booking.from, language)} - ${formatClockTime(booking.to, language)}`} />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t("detail.fields.status")}</span>
                        <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t("detail.fields.type")}</span>
                        <Badge variant="outline" className="text-xs">
                            {booking.isManual ? t("bookingType.manual") : t("bookingType.automatic")}
                        </Badge>
                    </div>
                </div>

                {/* Blocked reason */}
                {booking.status === "blocked" && booking.blockedReason && (
                    <div className="px-5 py-4 bg-rose-50 border-b border-rose-200">
                        <p className="text-xs font-semibold text-rose-700 mb-1">{t("detail.blockReason")}</p>
                        <p className="text-sm text-rose-800">{booking.blockedReason}</p>
                    </div>
                )}

                {/* Member Info */}
                {booking.member ? (
                    <div className="px-5 py-4 space-y-3 border-b border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("detail.memberSection")}</p>
                        <InfoRow label={t("detail.fields.name")} value={booking.member.nameAr} />
                        <InfoRow label={t("detail.fields.memberId")} value={booking.member.memberId} />
                        <InfoRow label={t("detail.fields.phone")} value={booking.member.phone} />
                        <InfoRow label={t("detail.fields.nationalId")} value={`${booking.member.nationalId.slice(0, 6)}...`} />
                        <InfoRow
                            label={t("detail.fields.memberType")}
                            value={booking.member.memberType === "member" ? t("memberTypes.member") : t("memberTypes.teamMember")}
                        />
                    </div>
                ) : (
                    <div className="px-5 py-4 border-b border-border">
                        <p className="text-sm text-muted-foreground">{t("detail.noMember")}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-border space-y-2 shrink-0">
                {booking.member && (
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={copyPhone}>
                            <Phone className="h-3.5 w-3.5" />
                            {t("detail.actions.contact")}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1.5"
                            onClick={() => {
                                // TODO: Navigate to /staff/dashboard/members/manage?id=:memberId
                                navigate("/staff/dashboard/members/manage");
                            }}
                        >
                            <User className="h-3.5 w-3.5" />
                            {t("detail.actions.viewProfile")}
                        </Button>
                    </div>
                )}

                {(booking.status === "confirmed" || booking.status === "blocked") && (
                    <RoleGuard privilege="SCHEDULE_MATCH">
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-1.5"
                            onClick={() => onEdit(booking)}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            {t("detail.actions.edit")}
                        </Button>
                    </RoleGuard>
                )}

                {booking.status === "confirmed" && (
                    <RoleGuard privilege="SCHEDULE_MATCH">
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-1.5 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => onCancel(booking.id)}
                        >
                            <X className="h-3.5 w-3.5" />
                            {t("detail.actions.cancelBooking")}
                        </Button>
                    </RoleGuard>
                )}

                {booking.status === "blocked" && (
                    <RoleGuard privilege="SCHEDULE_MATCH">
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-1.5 text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white"
                            onClick={() => onUnblock(booking.id)}
                        >
                            <Lock className="h-3.5 w-3.5" />
                            {t("detail.actions.unblock")}
                        </Button>
                    </RoleGuard>
                )}
            </div>
        </motion.div>
    );
}

// ─── Booking Form Dialog (Add & Edit) ────────────────────────────────────────

type BookingForm = {
    courtId: string;
    date: string;
    from: string;
    to: string;
    memberId: string;
    memberName: string;
    phone: string;
    nationalId: string;
    memberType: "member" | "team_member";
};

const emptyBookingForm = (courtId = "", date = "", from = ""): BookingForm => ({
    courtId,
    date,
    from,
    to: "",
    memberId: "",
    memberName: "",
    phone: "",
    nationalId: "",
    memberType: "member",
});

function BookingFormDialog({
    open,
    onOpenChange,
    editBooking,
    defaultCourtId,
    defaultDate,
    defaultFrom,
    bookings,
    courts,
    onSave,
    isSubmitting,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    editBooking: Booking | null;
    defaultCourtId: string;
    defaultDate: string;
    defaultFrom: string;
    bookings: Booking[];
    courts: ApiField[];
    onSave: (form: BookingForm) => void;
    isSubmitting?: boolean;
}) {
    const isEdit = editBooking !== null;
    const { t, i18n } = useTranslation("CourtBookingsPage");
    const language = getLanguage(i18n.resolvedLanguage ?? i18n.language);
    const isRTL = language === "ar";

    // ── Hooks first (Rules of Hooks: useState before any derived values) ──────
    const [form, setForm] = useState<BookingForm>(() =>
        isEdit && editBooking
            ? {
                courtId: editBooking.courtId,
                date: editBooking.date,
                from: editBooking.from,
                to: editBooking.to,
                memberId: editBooking.member?.memberId ?? "",
                memberName: editBooking.member?.nameAr ?? "",
                phone: editBooking.member?.phone ?? "",
                nationalId: editBooking.member?.nationalId ?? "",
                memberType: editBooking.member?.memberType ?? "member",
            }
            : emptyBookingForm(defaultCourtId, defaultDate, defaultFrom)
    );
    const { toast } = useToast();
    const [lookupState, setLookupState] = useState<"idle" | "loading" | "found" | "notfound">("idle");

    // ── Derived values (form is safe to use now) ──────────────────────────────
    // Today's date string (YYYY-MM-DD) — used as the min date
    const todayStr = new Date().toISOString().split('T')[0];
    // Current time string (HH:MM) — used to block past slots when today is selected
    const now = new Date();
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Bookings that block slots on the selected court + date (exclude self when editing)
    const relevantBookings = form.courtId && form.date
        ? bookings.filter(
            b => b.courtId === form.courtId &&
                b.date === form.date &&
                b.status !== 'cancelled' &&
                (!editBooking || b.id !== editBooking.id)
        )
        : [];

    // Compute available FROM times:
    // • If today: hide slots at or before current time
    // • Hide slots whose start falls inside an existing booking/training window
    const availableFromTimes = TIME_OPTIONS.filter(t => {
        if (form.date === todayStr && t.value <= nowTimeStr) return false;
        return !relevantBookings.some(b => t.value >= b.from && t.value < b.to);
    });

    // Compute available TO times:
    // • Must be after form.from
    // • Must not go past the start of the next blocking booking
    const nextBlockStart = form.from
        ? relevantBookings
            .filter(b => b.from >= form.from)
            .sort((a, b) => a.from.localeCompare(b.from))[0]?.from
        : undefined;

    const availableToTimes = TIME_OPTIONS.filter(t => {
        if (t.value <= (form.from || '')) return false;
        if (nextBlockStart && t.value > nextBlockStart) return false;
        return true;
    });

    useEffect(() => {
        const numericId = form.memberId.trim().replace(/\D/g, "");
        if (!numericId) { setLookupState("idle"); return; }
        setLookupState("loading");
        const timer = setTimeout(async () => {
            try {
                const endpoint = form.memberType === "team_member"
                    ? `/team-members/${numericId}`
                    : `/members/${numericId}`;
                const res = await api.get<{ success: boolean; data: { first_name_ar?: string; last_name_ar?: string; first_name_en?: string; last_name_en?: string; phone?: string; phone_number?: string; national_id?: string; name_ar?: string; full_name?: string } }>(endpoint);
                const m = res?.data?.data;
                if (m) {
                    const localizedName =
                        language === "en"
                            ? `${m.first_name_en ?? m.first_name_ar ?? ""} ${m.last_name_en ?? m.last_name_ar ?? ""}`.trim()
                            : `${m.first_name_ar ?? m.first_name_en ?? ""} ${m.last_name_ar ?? m.last_name_en ?? ""}`.trim();
                    const fullName =
                        localizedName ||
                        m.name_ar ||
                        m.full_name ||
                        "";
                    setForm(prev => ({
                        ...prev,
                        memberName: fullName || prev.memberName,
                        phone: m.phone ?? m.phone_number ?? prev.phone,
                        nationalId: m.national_id ?? prev.nationalId,
                    }));
                    setLookupState(fullName ? "found" : "notfound");
                } else {
                    setLookupState("notfound");
                }
            } catch {
                setLookupState("notfound");
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [form.memberId, form.memberType, language]);

    useEffect(() => {
        if (!open) return;
        setForm(
            isEdit && editBooking
                ? {
                    courtId: editBooking.courtId,
                    date: editBooking.date,
                    from: editBooking.from,
                    to: editBooking.to,
                    memberId: editBooking.member?.memberId ?? "",
                    memberName: editBooking.member?.nameAr ?? "",
                    phone: editBooking.member?.phone ?? "",
                    nationalId: editBooking.member?.nationalId ?? "",
                    memberType: editBooking.member?.memberType ?? "member",
                }
                : emptyBookingForm(defaultCourtId, defaultDate, defaultFrom)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSave = () => {
        if (!form.courtId || !form.date || !form.from || !form.to || !form.memberId || !form.memberName) {
            toast({ title: t("toast.validationTitle"), description: t("validation.bookingRequired"), variant: "destructive" });
            return;
        }
        if (form.date < todayStr) {
            toast({ title: t("validation.invalidDateTitle"), description: t("validation.pastDate"), variant: "destructive" });
            return;
        }
        if (form.date === todayStr && form.from <= nowTimeStr) {
            toast({ title: t("validation.pastTimeTitle"), description: t("validation.pastTime"), variant: "destructive" });
            return;
        }
        if (form.from >= form.to) {
            toast({ title: t("validation.invalidTimeTitle"), description: t("validation.endAfterStart"), variant: "destructive" });
            return;
        }
        if (hasConflict(bookings, form.courtId, form.date, form.from, form.to, editBooking?.id)) {
            toast({ title: t("validation.conflictTitle"), description: t("validation.timeConflict"), variant: "destructive" });
            return;
        }
        onSave(form);
    };

    const memberIdEntered = form.memberId.trim().length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0" dir={isRTL ? "rtl" : "ltr"}>
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
                    <DialogTitle>{isEdit ? t("bookingDialog.editTitle") : t("bookingDialog.addTitle")}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t("bookingDialog.editDescription") : t("bookingDialog.addDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            {t("bookingDialog.sections.booking")}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label>{t("bookingDialog.fields.court")} <span className="text-destructive">*</span></Label>
                                <Select value={form.courtId} onValueChange={(v) => setForm({ ...form, courtId: v })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t("bookingDialog.placeholders.court")} />
                                    </SelectTrigger>
                                    <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                        {courts.filter(c => c.status === "active" || c.is_active !== false).map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{getFieldName(c, language)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="booking-date">{t("bookingDialog.fields.date")} <span className="text-destructive">*</span></Label>
                                <Input
                                    id="booking-date"
                                    type="date"
                                    dir="ltr"
                                    className="text-left"
                                    min={todayStr}
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value, from: "", to: "" })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>{t("bookingDialog.fields.from")} <span className="text-destructive">*</span></Label>
                                <TimeSlotPicker
                                    value={form.from}
                                    onChange={(v) => setForm({ ...form, from: v, to: form.to && form.to <= v ? "" : form.to })}
                                    placeholder={t("bookingDialog.placeholders.from")}
                                    allowedOptions={availableFromTimes}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>{t("bookingDialog.fields.to")} <span className="text-destructive">*</span></Label>
                                <TimeSlotPicker
                                    value={form.to}
                                    onChange={(v) => setForm({ ...form, to: v })}
                                    placeholder={t("bookingDialog.placeholders.to")}
                                    allowedOptions={availableToTimes}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border" />

                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            {t("bookingDialog.sections.member")}
                        </p>

                        <div className="space-y-1.5 mb-4">
                            <Label htmlFor="booking-member-id">
                                {t("bookingDialog.fields.memberId")} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="booking-member-id"
                                    dir="ltr"
                                    className="text-left font-mono pr-8"
                                    placeholder="123"
                                    value={form.memberId}
                                    onChange={(e) => {
                                        setLookupState("idle");
                                        setForm({ ...form, memberId: e.target.value, memberName: "", phone: "", nationalId: "" });
                                    }}
                                />
                                {lookupState === "loading" && (
                                    <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                )}
                                {lookupState === "found" && (
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-600 text-[10px] font-bold">✓</span>
                                )}
                            </div>
                            {lookupState === "notfound" && (
                                <p className="text-[11px] text-destructive">{t("bookingDialog.lookup.notFound")}</p>
                            )}
                            {lookupState === "idle" && !form.memberId.trim() && (
                                <p className="text-[11px] text-muted-foreground">{t("bookingDialog.lookup.hint")}</p>
                            )}
                            {lookupState === "found" && (
                                <p className="text-[11px] text-emerald-600">{t("bookingDialog.lookup.found")}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="booking-member-name">
                                    {t("bookingDialog.fields.memberName")} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="booking-member-name"
                                    placeholder={memberIdEntered ? t("bookingDialog.placeholders.memberName") : t("common.notAvailable")}
                                    disabled={!memberIdEntered}
                                    value={form.memberName}
                                    onChange={(e) => setForm({ ...form, memberName: e.target.value })}
                                    className={!memberIdEntered ? "bg-muted/50 cursor-not-allowed" : ""}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="booking-phone">{t("bookingDialog.fields.phone")}</Label>
                                <Input
                                    id="booking-phone"
                                    dir="ltr"
                                    className={`text-left ${!memberIdEntered ? "bg-muted/50 cursor-not-allowed" : ""}`}
                                    placeholder={memberIdEntered ? "01012345678" : t("common.notAvailable")}
                                    disabled={!memberIdEntered}
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="booking-nid">{t("bookingDialog.fields.nationalId")}</Label>
                                <Input
                                    id="booking-nid"
                                    dir="ltr"
                                    className={`text-left ${!memberIdEntered ? "bg-muted/50 cursor-not-allowed" : ""}`}
                                    placeholder={memberIdEntered ? "30012345678901" : t("common.notAvailable")}
                                    maxLength={14}
                                    disabled={!memberIdEntered}
                                    value={form.nationalId}
                                    onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label>{t("bookingDialog.fields.memberType")} <span className="text-destructive">*</span></Label>
                                <Select
                                    value={form.memberType}
                                    onValueChange={(v) => {
                                        setForm({ ...form, memberType: v as "member" | "team_member", memberName: "", phone: "", nationalId: "" });
                                        setLookupState("idle");
                                    }}
                                    disabled={!memberIdEntered}
                                >
                                    <SelectTrigger className={`w-full ${!memberIdEntered ? "bg-muted/50 opacity-60" : ""}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                        <SelectItem value="member">{t("memberTypes.member")}</SelectItem>
                                        <SelectItem value="team_member">{t("memberTypes.teamMember")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className={`px-6 py-4 border-t border-border shrink-0 gap-2 ${isRTL ? "flex-row-reverse sm:justify-start" : "sm:justify-end"}`}>
                    <Button type="button" onClick={handleSave} className="gap-1.5" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />{isEdit ? t("bookingDialog.buttons.saving") : t("bookingDialog.buttons.adding")}</>
                        ) : (
                            isEdit ? t("bookingDialog.buttons.saveChanges") : t("bookingDialog.buttons.addBooking")
                        )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>{t("common.cancel")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Block Slot Dialog ───────────────────────────────────────────────────────

type BlockForm = {
    courtId: string;
    date: string;
    from: string;
    to: string;
    reason: string;
};

function BlockSlotDialog({
    open,
    onOpenChange,
    defaultCourtId,
    defaultDate,
    defaultFrom,
    bookings,
    courts,
    onSave,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    defaultCourtId: string;
    defaultDate: string;
    defaultFrom: string;
    bookings: Booking[];
    courts: ApiField[];
    onSave: (form: BlockForm) => void;
}) {
    const [form, setForm] = useState<BlockForm>({
        courtId: defaultCourtId,
        date: defaultDate,
        from: defaultFrom,
        to: "",
        reason: "",
    });
    const { toast } = useToast();
    const { t, i18n } = useTranslation("CourtBookingsPage");
    const language = getLanguage(i18n.resolvedLanguage ?? i18n.language);
    const isRTL = language === "ar";

    useEffect(() => {
        if (!open) return;
        setForm({ courtId: defaultCourtId, date: defaultDate, from: defaultFrom, to: "", reason: "" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSave = () => {
        if (!form.courtId || !form.date || !form.from || !form.to) {
            toast({ title: t("toast.validationTitle"), description: t("validation.blockRequired"), variant: "destructive" });
            return;
        }
        if (form.from >= form.to) {
            toast({ title: t("validation.invalidTimeTitle"), description: t("validation.endAfterStart"), variant: "destructive" });
            return;
        }
        if (hasConflict(bookings, form.courtId, form.date, form.from, form.to)) {
            toast({ title: t("validation.conflictTitle"), description: t("validation.timeConflict"), variant: "destructive" });
            return;
        }
        onSave(form);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-md" dir={isRTL ? "rtl" : "ltr"}>
                <DialogHeader>
                    <DialogTitle>{t("blockDialog.title")}</DialogTitle>
                    <DialogDescription>{t("blockDialog.description")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label>{t("bookingDialog.fields.court")}</Label>
                        <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted/30 text-sm">
                            {getFieldName(courts.find((c) => c.id === form.courtId), language) || t("common.notAvailable")}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("bookingDialog.fields.date")}</Label>
                        <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted/30 text-sm" dir="ltr">
                            {form.date}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("bookingDialog.fields.fromShort")}</Label>
                        <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted/30 text-sm" dir="ltr">
                            {form.from}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("bookingDialog.fields.toShort")} <span className="text-destructive">*</span></Label>
                        <TimeSlotPicker value={form.to} onChange={(v) => setForm({ ...form, to: v })} placeholder={t("bookingDialog.placeholders.toTime")} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="block-reason">{t("blockDialog.reason")}</Label>
                        <Input
                            id="block-reason"
                            placeholder={t("blockDialog.reasonPlaceholder")}
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter className={`gap-2 ${isRTL ? "flex-row-reverse sm:justify-start" : "sm:justify-end"}`}>
                    <Button onClick={handleSave} className="gap-1">
                        <Lock className="h-3.5 w-3.5" /> {t("blockDialog.buttons.block")}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Share Booking Dialog ───────────────────────────────────────────────────

function ShareBookingDialog({
    open,
    onOpenChange,
    shareUrl,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    shareUrl: string;
}) {
    const [copied, setCopied] = useState(false);
    const { t, i18n } = useTranslation("CourtBookingsPage");
    const language = getLanguage(i18n.resolvedLanguage ?? i18n.language);
    const isRTL = language === "ar";

    const copyToClipboard = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(shareUrl);
            } else {
                // Fallback for non-https environment or unsupported clipboard API
                const textArea = document.createElement("textarea");
                textArea.value = shareUrl;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand("copy");
                } catch (err) {
                    console.error("Fallback copy failed", err);
                }
                textArea.remove();
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Copy failed", error);
        }
    };

    const shortUrl = shareUrl ? shareUrl.replace(window.location.origin, '') : '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[400px] max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
                <DialogHeader className="text-center items-center pb-1 shrink-0">
                    <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-6 w-6 text-emerald-600" />
                    </div>
                    <DialogTitle className="text-base">{t("shareDialog.title")}</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {t("shareDialog.description")}
                    </DialogDescription>
                </DialogHeader>

                {/* Link box */}
                {shareUrl && (
                    <div className="flex flex-col gap-3 py-4">
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                            <p className="flex-1 truncate text-sm text-foreground font-mono font-medium text-left" title={shareUrl} dir="ltr">
                                {shortUrl.length > 25 ? `...${shortUrl.slice(-25)}` : shortUrl}
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={copyToClipboard}
                            className={`w-full rounded-xl py-6 text-base font-bold transition-all gap-2 ${copied
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : ""
                                }`}
                        >
                            {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
                            {copied ? t("shareDialog.copied") : t("shareDialog.copy")}
                        </Button>
                    </div>
                )}

                <DialogFooter className="pt-1 shrink-0">
                    <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                        {t("common.close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourtBookingsPage() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [courts, setCourts] = useState<ApiField[]>([]);
    const [courtsLoading, setCourtsLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);

    const [selectedCourtId, setSelectedCourtId] = useState<string>("");
    const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(today));
    const [bookings, setBookings] = useState<Booking[]>([]);

    const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editBooking, setEditBooking] = useState<Booking | null>(null);
    const [isAddingBooking, setIsAddingBooking] = useState(false);

    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [blockDefaults, setBlockDefaults] = useState({ courtId: "", date: "", from: "" });

    const [cellPopover, setCellPopover] = useState<{ date: string; slot: string } | null>(null);

    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [pendingShareUrl, setPendingShareUrl] = useState<string | null>(null);

    const { toast } = useToast();
    const { t, i18n } = useTranslation("CourtBookingsPage");
    const language = getLanguage(i18n.resolvedLanguage ?? i18n.language);
    const isRTL = language === "ar";

    // ── Fetch courts ──────────────────────────────────────────────────────────

    const fetchCourts = useCallback(async () => {
        setCourtsLoading(true);
        try {
            const res = await api.get<{ success: boolean; data: ApiBookableSport[] }>("/members/bookings/sports");
            const sports = Array.isArray(res?.data?.data) ? res.data.data : [];
            const allFields = sports.flatMap((sport) =>
                Array.isArray(sport.fields)
                    ? sport.fields.map(f => ({
                        ...f,
                        sport_id: sport.sport_id,
                        sport: f.sport ?? { name_ar: sport.sport_name_ar, name_en: sport.sport_name_en },
                    }))
                    : []
            );
            const uniqueFields = Array.from(
                new Map(allFields.filter((field) => field?.id).map((field) => [field.id, field])).values()
            );
            setCourts(uniqueFields);
            setSelectedCourtId((prev) => {
                const newId = prev && uniqueFields.some((field) => field.id === prev) ? prev : (uniqueFields[0]?.id ?? "");
                return newId;
            });
            if (uniqueFields.length === 0) {
                setBookings([]);
            }
        } catch {
            toast({ title: t("toast.loadCourtsFailed"), variant: "destructive" });
        } finally {
            setCourtsLoading(false);
        }
    }, [toast, t]);

    useEffect(() => { void fetchCourts(); }, [fetchCourts]);

    // ── Fetch calendar ────────────────────────────────────────────────────────

    const fetchCalendar = useCallback(async () => {
        if (!selectedCourtId) return;
        setCalendarLoading(true);
        const weekDaysLocal = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
        const start = toISODate(weekDaysLocal[0]);
        const end = toISODate(weekDaysLocal[6]);
        const field = courts.find(c => c.id === selectedCourtId);
        try {
            const res = await api.get<{ success: boolean; data: { days: ApiCalendarDay[] } }>(
                `/members/bookings/fields/${selectedCourtId}/calendar`,
                { params: { start_date: start, end_date: end } }
            );
            const days: ApiCalendarDay[] = res?.data?.data?.days ?? [];
            const raw: Booking[] = [];
            for (const day of days) {
                for (const slot of day.slots) {
                    const b = field ? slotToBooking(slot, day, field, language, {
                        training: t("blockedReasons.training"),
                        blocked: t("blockedReasons.blocked"),
                        member: t("common.member"),
                    }) : null;
                    if (b) raw.push(b);
                }
            }

            // Merge consecutive slots with the same id into one block
            // BUT: If actual_booking_start/end are provided, use those (don't merge)
            const mergeMap = new Map<string, Booking>();
            for (const b of raw) {
                const existing = mergeMap.get(b.id);
                if (!existing) {
                    mergeMap.set(b.id, { ...b });
                }
            }
            const finalBookings = Array.from(mergeMap.values());
            setBookings(finalBookings);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '';
            if (!msg.toLowerCase().includes('not available')) {
                console.warn('[CourtBookings] calendar fetch failed:', msg);
            }
            setBookings([]);
        } finally {
            setCalendarLoading(false);
        }
    }, [selectedCourtId, weekStart, courts, language, t]);


    useEffect(() => { void fetchCalendar(); }, [fetchCalendar]);

    // ─── Derived ──────────────────────────────────────────────────────────────

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const selectedCourt = courts.find((c) => c.id === selectedCourtId);
    const selectedCourtName = getFieldName(selectedCourt, language);
    const weekLabel = weekDays.length > 0
        ? `${formatDisplayDate(weekDays[0], language)} - ${formatDisplayDate(weekDays[6], language)} ${weekDays[6].getFullYear()}`
        : "";

    const filteredBookings = bookings.filter((b) => {
        // Compare date strings directly to avoid timezone issues
        const bookingDate = b.date; // Already in "YYYY-MM-DD" format
        const weekStartDate = toISODate(weekStart);
        const weekEndDate = toISODate(weekDays[6]);
        return b.courtId === selectedCourtId && bookingDate >= weekStartDate && bookingDate <= weekEndDate;
    });


    const courtsBySport: Record<string, ApiField[]> = {};
    for (const c of courts) {
        const sportLabel = getSportName(c, language, t("common.other"));
        if (!courtsBySport[sportLabel]) courtsBySport[sportLabel] = [];
        courtsBySport[sportLabel].push(c);
    }

    // ─── Actions ──────────────────────────────────────────────────────────────

    /** Cancel confirmed booking → DELETE /api/bookings/:bookingId */
    const handleCancelBooking = async (id: string) => {
        const booking = bookings.find(b => b.id === id);
        if (booking?.status === "cancelled") {
            toast({ title: t("toast.alreadyCancelled"), variant: "destructive" });
            setActiveBooking(null);
            return;
        }
        // Optimistic update first
        setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b));
        setActiveBooking(null);
        try {
            await api.delete(`/bookings/${id}`, { data: { reason: t("apiReasons.cancelByStaff") } });
            toast({ title: t("toast.cancelSuccessTitle"), description: t("toast.cancelSuccessDescription") });
            void fetchCalendar();
        } catch (err: unknown) {
            const e = err as { status?: number; message?: string; responseData?: { error?: string; message?: string } };
            const serverMsg = e?.responseData?.error || e?.responseData?.message || e?.message || "";

            // If backend says already cancelled/completed or booking doesn't exist → UI was stale. Sync silently.
            const alreadyDone =
                serverMsg.toLowerCase().includes("cannot cancel") ||
                serverMsg.toLowerCase().includes("cancelled") ||
                serverMsg.toLowerCase().includes("not found") ||
                e?.status === 404 ||
                e?.status === 409;

            if (alreadyDone) {
                void fetchCalendar(); // refresh to show real DB state
                return;
            }

            // Real failure — show error and refresh
            void fetchCalendar();
            toast({ title: t("toast.cancelFailedTitle"), description: serverMsg || t("toast.unexpectedError"), variant: "destructive" });
        }
    };

    /** Unblock slot → DELETE /api/bookings/:bookingId */
    const handleUnblock = async (id: string) => {
        // Optimistic removal first
        setBookings((prev) => prev.filter((b) => b.id !== id));
        setActiveBooking(null);
        try {
            await api.delete(`/bookings/${id}`, { data: { reason: t("apiReasons.unblockByStaff") } });
            toast({ title: t("toast.unblockSuccessTitle"), description: t("toast.unblockSuccessDescription") });
            void fetchCalendar();
        } catch (err: unknown) {
            const e = err as { status?: number; message?: string; responseData?: { error?: string; message?: string } };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t("toast.unblockFailedTitle");
            toast({ title: t("toast.unblockFailedTitle"), description: msg, variant: "destructive" });
        }
    };

    /** Add new manual booking → POST /api/bookings → auto-confirm → register participant */
    const handleAddBooking = async (form: BookingForm) => {
        setIsAddingBooking(true);
        const courtObj = courts.find((c) => c.id === form.courtId);
        const normalizedMemberId = normalizeDigits(form.memberId).replace(/\D/g, "");
        const memberIdNum = Number(normalizedMemberId);

        if (!Number.isFinite(memberIdNum) || memberIdNum <= 0) {
            toast({ title: t("validation.invalidMemberTitle"), description: t("validation.invalidMemberId"), variant: "destructive" });
            return;
        }
        if (!courtObj?.sport_id) {
            toast({ title: t("validation.incompleteDataTitle"), description: t("validation.missingCourtSport"), variant: "destructive" });
            return;
        }

        const payload = {
            userType: form.memberType,
            userId: memberIdNum,
            sport_id: courtObj.sport_id,
            field_id: form.courtId,
            start_time: `${form.date}T${form.from}:00`,
            end_time: `${form.date}T${form.to}:00`,
            notes: t("apiReasons.manualBookingByStaff"),
        };

        try {
            // Step 1: Create the booking
            const res = await api.post<{ success: boolean; data: { id?: string; share_token?: string; share_url?: string } }>("/bookings", payload);
            const bookingId = res?.data?.data?.id;
            const shareToken = res?.data?.data?.share_token;

            // Step 2: Auto-confirm so it shows on calendar (bypass payment for staff)
            if (bookingId) {
                try {
                    await api.post(`/bookings/${bookingId}/confirm-payment`, { paymentReference: "STAFF_MANUAL" });
                } catch (confirmErr) {
                    console.error("Failed to confirm booking:", confirmErr);
                }
            }

            // NOTE: No need to register the creator manually.
            // The backend already auto-adds them as is_creator=true in createBooking().
            // The share link is for OTHER people to join, not for re-registering the booker.

            // Navigate the calendar to show the newly created booking
            if (form.courtId !== selectedCourtId) {
                setSelectedCourtId(form.courtId);
            }
            const bookedDate = new Date(form.date);
            bookedDate.setHours(0, 0, 0, 0);
            setWeekStart(getWeekStart(bookedDate));

            void fetchCalendar();
            setAddDialogOpen(false);
            setEditBooking(null);
            // Build the correct invite URL pointing to InvitationPage (/invite/:token)
            const shareUrl = shareToken ? `${window.location.origin}/bookings/share/${shareToken}` : null; if (shareUrl) {
                setPendingShareUrl(shareUrl);
                setShareDialogOpen(true);
            } else {
                toast({ title: t("toast.addSuccessTitle"), description: t("toast.addSuccessDescription", { name: form.memberName }) });
            }
        } catch (err: unknown) {
            const e = err as { status?: number; message?: string; responseData?: { error?: string; message?: string } };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t("toast.createFailedTitle");
            toast({ title: t("toast.createFailedTitle"), description: msg, variant: "destructive" });
        } finally {
            setIsAddingBooking(false);
        }
    };


    /** Edit booking → cancel original + POST new → auto-confirm → register participant */
    const handleEditBooking = async (form: BookingForm) => {
        if (!editBooking) return;
        const courtObj = courts.find((c) => c.id === form.courtId);
        if (!courtObj?.sport_id) {
            toast({ title: t("validation.incompleteDataTitle"), description: t("validation.missingCourtSport"), variant: "destructive" });
            return;
        }
        const normalizedMemberId = normalizeDigits(form.memberId).replace(/\D/g, "");
        const memberIdNum = Number(normalizedMemberId);
        if (!Number.isFinite(memberIdNum) || memberIdNum <= 0) {
            toast({ title: t("validation.invalidMemberTitle"), description: t("validation.invalidMemberId"), variant: "destructive" });
            return;
        }
        try {
            // Cancel old booking
            if (editBooking.status !== "cancelled") {
                await api.delete(`/bookings/${editBooking.id}`, { data: { reason: t("apiReasons.editBookingByStaff") } });
            }
            // Create replacement booking
            const res = await api.post<{ success: boolean; data: { id?: string; share_token?: string } }>("/bookings", {
                userType: form.memberType,
                userId: memberIdNum,
                sport_id: courtObj.sport_id,
                field_id: form.courtId,
                start_time: `${form.date}T${form.from}:00`,
                end_time: `${form.date}T${form.to}:00`,
                notes: t("apiReasons.manualEditByStaff"),
            });
            const newBookingId = res?.data?.data?.id;
            const shareToken = res?.data?.data?.share_token;

            // Auto-confirm the replacement booking
            if (newBookingId) {
                try {
                    await api.post(`/bookings/${newBookingId}/confirm-payment`, { paymentReference: "STAFF_MANUAL" });
                } catch {
                    console.warn("[CourtBookings] Could not auto-confirm edited booking", newBookingId);
                }
            }

            // Register updated member info
            if (shareToken && form.memberName) {
                try {
                    await api.post(`/bookings/share/${shareToken}/register`, {
                        full_name: form.memberName,
                        phone_number: form.phone || undefined,
                        national_id: form.nationalId || undefined,
                    });
                } catch {
                    console.warn("[CourtBookings] Could not register participant info for edited booking");
                }
            }

            toast({ title: t("toast.updateSuccessTitle"), description: t("toast.updateSuccessDescription") });
            void fetchCalendar();
            setActiveBooking(null);
            setEditBooking(null);
            setAddDialogOpen(false);
        } catch (err: unknown) {
            const e = err as { status?: number; message?: string; responseData?: { error?: string; message?: string } };
            const msg = e?.responseData?.error || e?.responseData?.message || e?.message || t("toast.updateFailedTitle");
            toast({ title: t("toast.updateFailedTitle"), description: msg, variant: "destructive" });
        }
    };

    /** Block slot → POST /api/bookings (workaround until dedicated endpoint) */
    const handleBlockSlot = async (form: BlockForm) => {
        // TODO: Replace with dedicated admin block endpoint when available
        const courtObj = courts.find((c) => c.id === form.courtId);
        if (!courtObj?.sport_id) {
            toast({ title: t("validation.incompleteDataTitle"), description: t("validation.missingCourtSport"), variant: "destructive" });
            return;
        }
        const courtName = getFieldName(courtObj, language);
        // Optimistic local add as fallback
        const tempId = generateId();
        const newBlock: Booking = {
            id: tempId,
            courtId: form.courtId,
            courtName,
            date: form.date,
            from: form.from,
            to: form.to,
            status: "blocked",
            isManual: true,
            blockedReason: form.reason || undefined,
        };
        setBookings((prev) => [...prev, newBlock]);
        setBlockDialogOpen(false);
        try {
            await api.post("/bookings", {
                userType: "member",
                userId: 1, // sentinel admin userId — replace with actual staff ID when available
                sport_id: courtObj.sport_id,
                field_id: form.courtId,
                start_time: `${form.date}T${form.from}:00`,
                end_time: `${form.date}T${form.to}:00`,
                notes: form.reason || t("apiReasons.adminBlock"),
            });
            toast({ title: t("toast.blockSuccessTitle"), description: t("toast.blockSuccessDescription") });
            void fetchCalendar();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t("toast.blockFailedTitle");
            toast({ title: t("toast.blockFailedTitle"), description: msg, variant: "destructive" });
            // Keep optimistic block in local state as fallback
        }
    };

    const openEditFromPanel = (booking: Booking) => {
        setActiveBooking(null);
        setEditBooking(booking);
        setAddDialogOpen(true);
    };

    const goWeekBack = () => setWeekStart((prev) => addDays(prev, -7));
    const goWeekForward = () => setWeekStart((prev) => addDays(prev, 7));
    const goToday = () => setWeekStart(getWeekStart(today));
    const isCurrentWeek = toISODate(weekStart) === toISODate(getWeekStart(today));
    const todayIso = toISODate(today);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="h-full overflow-y-auto p-4 pb-8 space-y-4" dir={isRTL ? "rtl" : "ltr"}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold leading-tight">{t("header.title")}</h1>
                    <p className="text-xs text-muted-foreground mt-1 font-normal flex items-center gap-1.5">
                        {courtsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : selectedCourtName}
                        {!courtsLoading && <span className="mx-1.5 text-border">|</span>}
                        {weekLabel}
                        {calendarLoading && <Loader2 className="h-3 w-3 animate-spin ms-2" />}
                    </p>
                </div>
                <RoleGuard privilege="SCHEDULE_MATCH">
                    <Button
                        type="button"
                        className="gap-2 shrink-0 shadow-sm px-4"
                        onClick={() => { setEditBooking(null); setAddDialogOpen(true); }}
                        aria-label={t("header.addManualAria")}
                    >
                        <Plus className="h-4 w-4" />
                        {t("header.addManual")}
                    </Button>
                </RoleGuard>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <Select value={selectedCourtId} onValueChange={setSelectedCourtId} disabled={courtsLoading}>
                    <SelectTrigger className="w-52" aria-label={t("filters.courtAria")}>
                        <SelectValue placeholder={courtsLoading ? t("common.loading") : t("filters.selectCourt")} />
                    </SelectTrigger>
                    <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                        {Object.entries(courtsBySport).map(([sport, sportCourts]) => (
                            <div key={sport}>
                                <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                    {sport}
                                </p>
                                {sportCourts.map((c) => (
                                    <SelectItem key={c.id} value={c.id} className={isRTL ? "pr-4" : "pl-4"}>
                                        {getFieldName(c, language)}
                                        {c.status === "inactive" && <span className="text-muted-foreground text-[10px] ms-1">({t("status.inactive")})</span>}
                                    </SelectItem>
                                ))}
                            </div>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={() => void fetchCalendar()} disabled={calendarLoading || !selectedCourtId} className="gap-1">
                    <RefreshCw className={`h-3.5 w-3.5 ${calendarLoading ? "animate-spin" : ""}`} />
                    {t("filters.refresh")}
                </Button>

                <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden">
                    <button
                        type="button"
                        onClick={goWeekBack}
                        className="p-2.5 hover:bg-muted transition-colors"
                        aria-label={t("filters.previousWeek")}
                    >
                        {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                    <span className="px-3 text-sm font-medium whitespace-nowrap border-x border-border">{weekLabel}</span>
                    <button
                        type="button"
                        onClick={goWeekForward}
                        className="p-2.5 hover:bg-muted transition-colors"
                        aria-label={t("filters.nextWeek")}
                    >
                        {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                </div>

                {!isCurrentWeek && (
                    <Button type="button" variant="outline" size="sm" onClick={goToday} aria-label={t("filters.currentWeek")}>{t("filters.today")}</Button>
                )}
            </div>

            {/* Legend */}
            <div className="inline-flex items-center gap-5 rounded-md border border-border bg-muted/30 px-3 py-1.5">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-block w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-500" />{t("status.confirmed")}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-block w-3 h-3 rounded-sm bg-rose-400 border border-rose-500" />{t("status.blocked")}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-block w-3 h-3 rounded-sm bg-muted border border-border" />{t("status.available")}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-block w-3 h-3 rounded-sm bg-muted/40 border border-dashed border-border opacity-50" />{t("status.cancelled")}
                </span>
            </div>

            {/* Booking Grid (CSS grid + absolute blocks) */}
            <div className="overflow-x-auto overflow-y-auto max-h-[75vh] rounded-xl border border-border shadow-sm">
                {/* Day header row */}
                <div
                    className="sticky top-0 z-20 grid bg-muted/60 border-b border-border"
                    style={{ gridTemplateColumns: "56px repeat(7, 1fr)", minWidth: 700 }}
                >
                    {/* Corner */}
                    <div className={`sticky ${isRTL ? "right-0 border-l" : "left-0 border-r"} z-30 bg-muted/60 border-border`} />
                    {weekDays.map((day) => {
                        const isToday = toISODate(day) === todayIso;
                        const isPast = day < today;
                        return (
                            <div
                                key={toISODate(day)}
                                className={`py-2 px-1 text-center text-xs font-semibold border-l border-border ${isToday
                                        ? "bg-primary/15 text-primary border-b-primary/40"
                                        : isPast
                                            ? "opacity-40 bg-muted/20 text-foreground"
                                            : "text-foreground"
                                    }`}
                            >
                                <div>{dayOfWeekLabel(day, language)}</div>
                                <div className={`text-[10px] font-normal mt-0.5 ${isToday ? "text-primary font-medium" : "text-muted-foreground"
                                    }`}>
                                    {formatDisplayDate(day, language)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Grid body */}
                <div
                    className="grid"
                    style={{ gridTemplateColumns: "56px repeat(7, 1fr)", minWidth: 700 }}
                >
                    {/* Time label column */}
                    <div className={`sticky ${isRTL ? "right-0 border-l" : "left-0 border-r"} z-10 bg-muted/20 border-border`}>
                        {HOUR_SLOTS.map((slot) => (
                            <div
                                key={slot}
                                className="flex items-start justify-center pt-1 border-b border-border text-[10px] text-muted-foreground font-medium"
                                style={{ height: 64 }}
                            >
                                {formatClockTime(slot, language)}
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map((day) => {
                        const dateStr = toISODate(day);
                        const isToday = dateStr === todayIso;
                        const isPast = day < today;
                        const dayBookings = filteredBookings.filter(b => b.date === dateStr);

                        return (
                            <div
                                key={dateStr}
                                className={`relative border-l border-border ${isPast
                                        ? "bg-muted/30 opacity-60"
                                        : isToday
                                            ? "bg-primary/[0.06]"
                                            : ""
                                    }`}
                                style={{ height: HOUR_SLOTS.length * 64 }}
                            >
                                {/* Hour grid lines */}
                                {HOUR_SLOTS.map((slot, idx) => (
                                    <div
                                        key={slot}
                                        className="absolute w-full border-b border-border"
                                        style={{ top: idx * 64, height: 64 }}
                                    />
                                ))}

                                {/* Empty-cell click targets (behind booking blocks) */}
                                {HOUR_SLOTS.map((slot) => {
                                    const [slotH, slotM] = slot.split(":").map(Number);
                                    const startMins = (slotH * 60 + slotM) - (6 * 60);
                                    const isCellOpen = cellPopover?.date === dateStr && cellPopover?.slot === slot;

                                    if (isPast) {
                                        return (
                                            <div
                                                key={slot}
                                                className="absolute w-full cursor-not-allowed"
                                                style={{ top: (startMins / 60) * 64, height: 64, zIndex: 0 }}
                                            />
                                        );
                                    }

                                    return (
                                        <Popover
                                            key={slot}
                                            open={isCellOpen}
                                            onOpenChange={(v) => setCellPopover(v ? { date: dateStr, slot } : null)}
                                        >
                                            <PopoverTrigger asChild>
                                                <div
                                                    className="absolute w-full group hover:bg-primary/10 transition-colors cursor-pointer flex items-center justify-center"
                                                    style={{ top: (startMins / 60) * 64, height: 64, zIndex: 0 }}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-label={t("grid.availableCellAria", { day: dayOfWeekLabel(day, language), time: formatClockTime(slot, language) })}
                                                >
                                                    <span className="text-[9px] text-primary/60  transition-opacity select-none">
                                                        {t("status.available")}
                                                    </span>
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-44 p-2" dir={isRTL ? "rtl" : "ltr"} side="bottom" align="end">
                                                <div className="flex flex-col gap-1">
                                                    <RoleGuard privilege="SCHEDULE_MATCH">
                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                type="button"
                                                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted ${isRTL ? "text-right" : "text-left"} transition-colors w-full`}
                                                                onClick={() => {
                                                                    setCellPopover(null);
                                                                    setEditBooking(null);
                                                                    setBlockDefaults({ courtId: selectedCourtId, date: dateStr, from: slot });
                                                                    setAddDialogOpen(true);
                                                                }}
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                                {t("grid.addBooking")}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-rose-50 text-rose-700 ${isRTL ? "text-right" : "text-left"} transition-colors w-full`}
                                                                onClick={() => {
                                                                    setCellPopover(null);
                                                                    setBlockDefaults({ courtId: selectedCourtId, date: dateStr, from: slot });
                                                                    setBlockDialogOpen(true);
                                                                }}
                                                            >
                                                                <Lock className="h-3.5 w-3.5" />
                                                                {t("grid.blockTime")}
                                                            </button>
                                                        </div>
                                                    </RoleGuard>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    );
                                })}

                                {/* Booking blocks (above empty cells) */}
                                {dayBookings.map((booking) => {
                                    const [fh, fm] = booking.from.split(":").map(Number);
                                    const [th, tm] = booking.to.split(":").map(Number);
                                    const startMins = (fh * 60 + fm) - (6 * 60);
                                    const endMins = (th * 60 + tm) - (6 * 60);
                                    const top = (startMins / 60) * 64;
                                    const height = Math.max(((endMins - startMins) / 60) * 64, 32);

                                    if (booking.status === "confirmed") {
                                        return (
                                            <button
                                                key={booking.id}
                                                type="button"
                                                onClick={() => setActiveBooking(booking)}
                                                aria-label={t("grid.confirmedBookingAria", { name: booking.member?.nameAr ?? t("status.confirmed") })}
                                                className={`absolute rounded-lg bg-emerald-100 border border-emerald-300 transition-colors p-2 overflow-hidden ${isRTL ? "text-right" : "text-left"} w-[calc(100%-8px)] hover:bg-emerald-200 cursor-pointer`}
                                                style={{ top: top + 2, height: height - 4, left: 4, right: 4, zIndex: 10 }}
                                            >
                                                <p className="text-[11px] font-semibold text-emerald-800 truncate leading-tight">
                                                    {booking.member?.nameAr ?? t("status.confirmed")}
                                                </p>
                                                <p className="text-[10px] text-emerald-600 leading-tight">{booking.from} - {booking.to}</p>
                                                {booking.isManual && (
                                                    <span className="text-[8px] bg-emerald-200 text-emerald-700 rounded px-1">{t("bookingType.manualShort")}</span>
                                                )}
                                            </button>
                                        );
                                    }
                                    if (booking.status === "blocked") {
                                        return (
                                            <button
                                                key={booking.id}
                                                type="button"
                                                onClick={() => setActiveBooking(booking)}
                                                aria-label={t("grid.blockedTimeAria")}
                                                className="absolute rounded-lg bg-rose-100 border border-rose-300 transition-colors flex flex-col items-center justify-center gap-1 w-[calc(100%-8px)] hover:bg-rose-200 cursor-pointer"
                                                style={{ top: top + 2, height: height - 4, left: 4, right: 4, zIndex: 10 }}
                                            >
                                                <Lock className="h-3 w-3 text-rose-600" />
                                                <span className="text-[10px] font-semibold text-rose-700">{t("status.blocked")}</span>
                                            </button>
                                        );
                                    }
                                    // cancelled
                                    return (
                                        <button
                                            key={booking.id}
                                            type="button"
                                            onClick={() => setActiveBooking(booking)}
                                            aria-label={t("grid.cancelledBookingAria")}
                                            className="absolute rounded-lg bg-muted/40 border border-dashed border-border flex items-center justify-center opacity-50 w-[calc(100%-8px)] hover:opacity-70 cursor-pointer"
                                            style={{ top: top + 2, height: height - 4, left: 4, right: 4, zIndex: 10 }}
                                        >
                                            <span className="text-[10px] text-muted-foreground line-through">{t("status.cancelled")}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
                {activeBooking && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
                            onClick={() => setActiveBooking(null)}
                        />
                        <BookingDetailPanel
                            booking={activeBooking}
                            onClose={() => setActiveBooking(null)}
                            onCancel={handleCancelBooking}
                            onUnblock={handleUnblock}
                            onEdit={openEditFromPanel}
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Add / Edit Dialog */}
            <BookingFormDialog
                open={addDialogOpen}
                onOpenChange={(v) => { setAddDialogOpen(v); if (!v) setEditBooking(null); }}
                editBooking={editBooking}
                defaultCourtId={editBooking ? editBooking.courtId : (blockDefaults.courtId || selectedCourtId)}
                defaultDate={editBooking ? editBooking.date : blockDefaults.date}
                defaultFrom={editBooking ? editBooking.from : blockDefaults.from}
                bookings={bookings}
                courts={courts}
                onSave={editBooking ? (form => void handleEditBooking(form)) : (form => void handleAddBooking(form))}
                isSubmitting={isAddingBooking}
            />

            {/* Block Dialog */}
            <BlockSlotDialog
                open={blockDialogOpen}
                onOpenChange={setBlockDialogOpen}
                defaultCourtId={blockDefaults.courtId || selectedCourtId}
                defaultDate={blockDefaults.date}
                defaultFrom={blockDefaults.from}
                bookings={bookings}
                courts={courts}
                onSave={(form) => void handleBlockSlot(form)}
            />

            {/* Share Booking Dialog */}
            <ShareBookingDialog
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
                shareUrl={pendingShareUrl ?? ""}
            />
        </div>
    );
}
