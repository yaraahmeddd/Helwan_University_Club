import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Loader2,
    XCircle,
    AlertCircle,
    Users,
    CheckCircle2,
    Home,
    Globe,
} from "lucide-react";
import api from '@/services/axios';
import { useTranslation } from "react-i18next";
import {
    formatValidationError,
    validateEgyptianPhone,
    validateInviteNationalId,
    validateEmail,
    validateRequired,
} from '@/lib/validation';
const HUCLogo = "/assets/HUC logo.jpeg";

// ─── Language Content ─────────────────────────────────────────────────────────
type Lang = "ar" | "en";

const CONTENT = {
    ar: {
        dir: "rtl" as const,
        home: "الرئيسية",
        clubName: "نادي جامعة العاصمة",
        copyright: "نادي جامعة العاصمة — جميع الحقوق محفوظة",
        inviteTitle: "دعوة للمشاركة",
        inviteSubtitle: "انضم إلى المباراة الآن",
        invitedBy: "بدعوة من:",
        participants: "المشاركون",
        of: "من",
        participant: "مشارك",
        spotsLeft: (n: number) => n === 1 ? "مكان شاغر" : "أماكن شاغرة",
        duration: (m: number) => `${m} دقيقة`,
        status: {
            confirmed: "مؤكد",
            pending_payment: "قيد الدفع",
            completed: "منتهي",
            cancelled: "ملغي",
        },
        notFoundTitle: "رابط الدعوة غير صالح",
        notFoundDesc: "هذا الرابط غير موجود أو منتهي الصلاحية",
        fullTitle: "اكتملت المباراة",
        fullDesc: "لا توجد أماكن متاحة حالياً",
        unavailableTitle: "هذه الدعوة لم تعد متاحة",
        cancelledDesc: "تم إلغاء هذه المباراة",
        completedDesc: "هذه المباراة منتهية",
        successTitle: "تم تسجيل مشاركتك بنجاح! 🎉",
        successSubtitle: "سيتواصل معك منظم المباراة قريباً",
        registeredLabel: "تم تسجيل",
        spotsRemaining: (s: number, t: number) => `${s} مكان متبقٍ من أصل ${t}`,
        formTitle: "سجّل مشاركتك",
        formSubtitle: "أدخل بياناتك للانضمام إلى المباراة",
        fullName: "الاسم الكامل",
        fullNamePlaceholder: "محمد أحمد",
        phone: "رقم الهاتف",
        phonePlaceholder: "01xxxxxxxxx",
        nationalId: "الرقم القومي",
        nationalIdPlaceholder: "14 رقم",
        email: "البريد الإلكتروني",
        emailPlaceholder: "example@email.com",
        joinBtn: "انضم الآن",
        joiningBtn: "جاري التسجيل...",
        termsNote: "بالضغط على الزر، أنت توافق على شروط نادي جامعة العاصمة",
        genericError: "حدث خطأ، يرجى المحاولة مرة أخرى",
        switchLang: "English",
        inputDir: "rtl" as const,
    },
    en: {
        dir: "ltr" as const,
        home: "Home",
        clubName: "Capital University Club",
        copyright: "Capital University Club — All rights reserved",
        inviteTitle: "You're Invited!",
        inviteSubtitle: "Join the match now",
        invitedBy: "Invited by:",
        participants: "Participants",
        of: "of",
        participant: "player(s)",
        spotsLeft: (n: number) => n === 1 ? "spot remaining" : "spots remaining",
        duration: (m: number) => `${m} min`,
        status: {
            confirmed: "Confirmed",
            pending_payment: "Pending Payment",
            completed: "Completed",
            cancelled: "Cancelled",
        },
        notFoundTitle: "Invalid Invitation Link",
        notFoundDesc: "This link doesn't exist or has expired",
        fullTitle: "Match is Full",
        fullDesc: "No spots available at the moment",
        unavailableTitle: "This invitation is no longer available",
        cancelledDesc: "This match has been cancelled",
        completedDesc: "This match has already ended",
        successTitle: "You've successfully joined! 🎉",
        successSubtitle: "The match organiser will contact you soon",
        registeredLabel: "Registered",
        spotsRemaining: (s: number, t: number) => `${s} spot(s) remaining out of ${t}`,
        formTitle: "Register Your Spot",
        formSubtitle: "Enter your details to join the match",
        fullName: "Full Name",
        fullNamePlaceholder: "John Smith",
        phone: "Phone Number",
        phonePlaceholder: "01xxxxxxxxx",
        nationalId: "National ID",
        nationalIdPlaceholder: "14 digits",
        email: "Email Address",
        emailPlaceholder: "example@email.com",
        joinBtn: "Join Now",
        joiningBtn: "Registering...",
        termsNote: "By clicking, you agree to Capital University Club's terms",
        genericError: "An error occurred, please try again",
        switchLang: "العربية",
        inputDir: "ltr" as const,
    },
};

// ─── Types ────────────────────────────────────────────────────────────────────
type InviteDetails = {
    id: string;
    sport_name_ar: string;
    sport_name_en: string;
    field_name_ar: string;
    field_name_en: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    status: "pending_payment" | "confirmed" | "completed" | "cancelled";
    expected_participants: number;
    participants: { full_name: string; is_creator: boolean }[];
    spots_remaining: number;
};

type FormState = {
    full_name: string;
    phone_number: string;
    national_id: string;
    email: string;
};

type FormErrors = Partial<Record<keyof FormState | "contact", string>>;

type PageState =
    | "loading"
    | "not_found"
    | "active"
    | "full"
    | "unavailable"
    | "success";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(iso: string, lang: Lang): string {
    return new Date(iso).toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function formatDate(iso: string, lang: Lang): string {
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// ─── Field Input ─────────────────────────────────────────────────────────────
function FieldInput({
    label,
    id,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    required,
    maxLength,
    inputMode,
    dir,
}: {
    label: string;
    id: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    required?: boolean;
    maxLength?: number;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    dir?: "rtl" | "ltr";
}) {
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 mx-0.5">*</span>}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                inputMode={inputMode}
                dir={dir}
                autoComplete="off"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 ${
                    error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
            />
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({
    status,
    lang,
}: {
    status: InviteDetails["status"];
    lang: Lang;
}) {
    const c = CONTENT[lang];
    const styles: Record<InviteDetails["status"], string> = {
        confirmed: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        pending_payment: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        completed: "bg-gray-500/20 text-gray-300 border border-gray-500/30",
        cancelled: "bg-red-500/20 text-red-300 border border-red-500/30",
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
            {c.status[status]}
        </span>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
    return (
        <div className="flex flex-col md:flex-row h-screen w-full animate-pulse">
            <div className="w-full md:w-2/5 p-8 flex flex-col gap-6" style={{ background: "#214474" }}>
                <div className="h-5 w-32 bg-white/10 rounded" />
                <div className="h-8 w-48 bg-white/10 rounded" />
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="h-px bg-white/10 w-full my-2" />
                <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white/10" />
                    ))}
                </div>
            </div>
            <div className="w-full md:w-3/5 bg-gray-50 p-8 flex flex-col gap-4">
                <div className="h-7 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-64 bg-gray-200 rounded" />
                {[...Array(4)].map((_, i) => <div key={i} className="h-12 w-full bg-gray-200 rounded-xl" />)}
                <div className="h-12 w-full bg-gray-300 rounded-xl mt-2" />
            </div>
        </div>
    );
}

// ─── Left Details Panel ───────────────────────────────────────────────────────
function DetailsPanel({
    details,
    lang,
    onToggleLang,
}: {
    details: InviteDetails;
    lang: Lang;
    onToggleLang: () => void;
}) {
    const navigate = useNavigate();
    const c = CONTENT[lang];
    const creator = details.participants.find((p) => p.is_creator);
    const nonCreatorCount = details.participants.filter((p) => !p.is_creator).length;
    const spotsLeft = Math.max(0, details.expected_participants - nonCreatorCount);
    const sportName = lang === "ar" ? details.sport_name_ar : (details.sport_name_en || details.sport_name_ar);
    const fieldName = lang === "ar" ? details.field_name_ar : (details.field_name_en || details.field_name_ar);

    return (
        <div
            className="w-full md:w-2/5 text-white flex flex-col overflow-y-auto px-8 py-10 gap-6 relative"
            style={{ background: "#214474" }}
            dir={c.dir}
        >
            {/* Header: logo + home + lang toggle */}
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                    <img src={HUCLogo} alt={c.clubName} className="w-full h-full object-contain" />
                </div>
                <div className="flex items-center gap-2">
                    {/* Language Toggle */}
                    <button
                        onClick={onToggleLang}
                        className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10 border border-white/20"
                    >
                        <Globe className="w-4 h-4" />
                        {c.switchLang}
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
                    >
                        <Home className="w-4 h-4" />
                        {c.home}
                    </button>
                </div>
            </div>

            {/* Status + sport badge */}
            <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={details.status} lang={lang} />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-gray-200 text-xs font-semibold border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#f8941c] inline-block" />
                    {sportName}
                </span>
            </div>

            {/* Main heading */}
            <div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
                    {c.inviteTitle}
                </h1>
                <p className="text-gray-300 mt-1 text-sm">{c.inviteSubtitle}</p>
            </div>

            <div className="h-px bg-white/10 w-full" />

            {/* Field + date/time info */}
            <div className="space-y-3">
                <p className="text-xl font-bold text-white">{fieldName}</p>
                <div className="flex flex-col gap-1.5 text-gray-300 text-sm">
                    <span className="flex items-center gap-2">
                        <span className="text-[#f8941c]">📅</span>
                        {formatDate(details.start_time, lang)}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="text-[#f8941c]">🕐</span>
                        {formatTime(details.start_time, lang)} — {formatTime(details.end_time, lang)}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="text-[#f8941c]">⏱</span>
                        {c.duration(details.duration_minutes)}
                    </span>
                </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            {/* Host */}
            {creator && (
                <p className="text-sm text-gray-300">
                    {c.invitedBy}{" "}
                    <span className="text-white font-semibold">{creator.full_name}</span>
                </p>
            )}

            {/* Players */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <Users className="w-4 h-4 text-[#2596be]" />
                    {c.participants}
                </div>

                <div className="flex gap-1.5 flex-wrap">
                    {[...Array(details.expected_participants)].map((_, i) => (
                        <span
                            key={i}
                            className={`text-lg leading-none transition-all duration-300 ${
                                i < details.participants.length ? "text-[#2596be]" : "text-white/20"
                            }`}
                        >
                            {i < details.participants.length ? "●" : "○"}
                        </span>
                    ))}
                </div>

                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-white">{details.participants.length}</span>
                    <span className="text-gray-400 text-sm">{c.of}</span>
                    <span className="text-xl font-bold text-white/60">{details.expected_participants}</span>
                    <span className="text-gray-400 text-sm">{c.participant}</span>
                </div>

                {spotsLeft > 0 && (
                    <p className="text-sm text-emerald-300 font-medium">
                        {spotsLeft} {c.spotsLeft(spotsLeft)}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6">
                <p className="text-xs text-white/20 text-center">
                    © {new Date().getFullYear()} {c.clubName}
                </p>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function InvitationPage() {
    const { token } = useParams<{ token: string }>();
    const { t: tVal } = useTranslation("validation");

    const [lang, setLang] = useState<Lang>("ar");
    const [pageState, setPageState] = useState<PageState>("loading");
    const [details, setDetails] = useState<InviteDetails | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedName, setSubmittedName] = useState("");
    const [form, setForm] = useState<FormState>({
        full_name: "",
        phone_number: "",
        national_id: "",
        email: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [fadeIn, setFadeIn] = useState(false);

    const c = CONTENT[lang];
    const toggleLang = () => setLang((l) => (l === "ar" ? "en" : "ar"));

    // ── Fetch on mount ──
    const fetchDetails = async () => {
        if (!token) return setPageState("not_found");
        try {
            const res = await api.get(`/bookings/share/${token}/details`);
            const raw = res.data?.data ?? res.data;
            const nonCreatorCount = (raw.participants ?? []).filter(
                (p: { is_creator: boolean }) => !p.is_creator
            ).length;
            const data: InviteDetails = {
                ...raw,
                spots_remaining: Math.max(
                    0,
                    (raw.expected_participants ?? 1) - nonCreatorCount
                ),
            };
            setDetails(data);

            if (data.status === "cancelled" || data.status === "completed") {
                setPageState("unavailable");
            } else if (data.spots_remaining <= 0) {
                setPageState("full");
            } else {
                setPageState("active");
            }
        } catch {
            setPageState("not_found");
        } finally {
            setTimeout(() => setFadeIn(true), 50);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [token]);

    // ── Validation ──
    const validate = (): boolean => {
        const errs: FormErrors = {};

        const fullNameError = formatValidationError(validateRequired(form.full_name, "fullName.required"), tVal);
        if (fullNameError) errs.full_name = fullNameError;

        if (form.phone_number.trim()) {
            const phoneError = formatValidationError(validateEgyptianPhone(form.phone_number), tVal);
            if (phoneError) errs.phone_number = phoneError;
        }

        if (form.national_id.trim()) {
            const nidError = formatValidationError(validateInviteNationalId(form.national_id), tVal);
            if (nidError) errs.national_id = nidError;
        }

        if (form.email.trim()) {
            const emailError = formatValidationError(validateEmail(form.email), tVal);
            if (emailError) errs.email = emailError;
        }

        if (!form.phone_number.trim() && !form.national_id.trim() && !form.email.trim()) {
            errs.contact = tVal("contact.required");
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Submit ──
    const handleJoin = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await api.post(`/bookings/share/${token}/register`, {
                full_name: form.full_name.trim(),
                phone_number: form.phone_number.trim() || undefined,
                national_id: form.national_id.trim() || undefined,
                email: form.email.trim() || undefined,
            });
            setSubmittedName(form.full_name.trim());
            setPageState("success");
            fetchDetails();
        } catch (err: unknown) {
            const e = err as { message?: string };
            setErrors({ contact: e?.message || c.genericError });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: undefined, contact: undefined }));
    };

    // ─── RIGHT PANEL ─────────────────────────────────────────────────────────
    const renderRightPanel = () => {
        if (pageState === "not_found") {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4" dir={c.dir}>
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{c.notFoundTitle}</h2>
                    <p className="text-gray-500 max-w-xs">{c.notFoundDesc}</p>
                    {/* Lang toggle for not-found state too */}
                    <button
                        onClick={toggleLang}
                        className="mt-2 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 border border-gray-200"
                    >
                        <Globe className="w-4 h-4" />
                        {c.switchLang}
                    </button>
                </div>
            );
        }

        if (pageState === "full") {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4" dir={c.dir}>
                    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{c.fullTitle}</h2>
                    <p className="text-gray-500">{c.fullDesc}</p>
                </div>
            );
        }

        if (pageState === "unavailable") {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4" dir={c.dir}>
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{c.unavailableTitle}</h2>
                    <p className="text-gray-500">
                        {details?.status === "cancelled" ? c.cancelledDesc : c.completedDesc}
                    </p>
                </div>
            );
        }

        if (pageState === "success") {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-5" dir={c.dir}>
                    <div
                        className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center"
                        style={{ animation: "checkScale 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
                    >
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">{c.successTitle}</h2>
                        <p className="text-gray-500 mt-1 text-sm">{c.successSubtitle}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 w-full max-w-xs">
                        <p className="text-sm text-gray-500">{c.registeredLabel}</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{submittedName}</p>
                    </div>
                    {details && (
                        <p className="text-xs text-gray-400">
                            {c.spotsRemaining(details.spots_remaining, details.expected_participants)}
                        </p>
                    )}
                </div>
            );
        }

        // Active form
        return (
            <div className="flex flex-col justify-center h-full px-8 py-10 max-w-md mx-auto w-full" dir={c.dir}>
                <div className="mb-6">
                    <h2 className="text-2xl font-extrabold text-gray-900">{c.formTitle}</h2>
                    <p className="text-gray-500 text-sm mt-1">{c.formSubtitle}</p>
                </div>

                <div className="space-y-4">
                    <FieldInput
                        label={c.fullName}
                        id="full_name"
                        placeholder={c.fullNamePlaceholder}
                        value={form.full_name}
                        onChange={(v) => handleChange("full_name", v)}
                        error={errors.full_name}
                        dir={c.inputDir}
                        required
                    />

                    <FieldInput
                        label={c.phone}
                        id="phone_number"
                        type="tel"
                        placeholder={c.phonePlaceholder}
                        value={form.phone_number}
                        onChange={(v) => handleChange("phone_number", v)}
                        error={errors.phone_number}
                        maxLength={11}
                        inputMode="numeric"
                        dir="ltr"
                    />

                    <FieldInput
                        label={c.nationalId}
                        id="national_id"
                        placeholder={c.nationalIdPlaceholder}
                        value={form.national_id}
                        onChange={(v) => handleChange("national_id", v)}
                        error={errors.national_id}
                        maxLength={14}
                        inputMode="numeric"
                        dir="ltr"
                    />

                    <FieldInput
                        label={c.email}
                        id="email"
                        type="email"
                        placeholder={c.emailPlaceholder}
                        value={form.email}
                        onChange={(v) => handleChange("email", v)}
                        error={errors.email}
                        dir="ltr"
                    />

                    {errors.contact && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-600">{errors.contact}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleJoin}
                    disabled={isSubmitting || (details?.spots_remaining ?? 1) <= 0}
                    className="mt-6 w-full bg-[#f8941c] hover:bg-[#e07d10] text-white py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {c.joiningBtn}
                        </>
                    ) : (
                        c.joinBtn
                    )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-3">{c.termsNote}</p>
            </div>
        );
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    if (pageState === "loading") return <Skeleton />;

    return (
        <>
            <style>{`
                @keyframes checkScale {
                    from { opacity: 0; transform: scale(0.4); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <div
                className="flex flex-col md:flex-row md:h-screen w-full"
                style={{
                    opacity: fadeIn ? 1 : 0,
                    transition: "opacity 0.35s ease",
                }}
            >
                {/* ── LEFT: Details dark panel ── */}
                {details && pageState !== "not_found" ? (
                    <DetailsPanel details={details} lang={lang} onToggleLang={toggleLang} />
                ) : (
                    <div
                        className="hidden md:flex w-2/5 items-center justify-center"
                        style={{ background: "#214474" }}
                    >
                        <div className="flex flex-col items-center gap-3 opacity-30">
                            <img src={HUCLogo} alt="" className="w-12 h-12 rounded-xl object-contain" />
                            <p className="text-white text-sm">{c.clubName}</p>
                        </div>
                    </div>
                )}

                {/* ── RIGHT: Form / State panel ── */}
                <div className="w-full md:w-3/5 bg-white overflow-y-auto flex flex-col">
                    <div className="flex-1">{renderRightPanel()}</div>
                    <footer className="text-center py-4 text-gray-400 text-xs border-t border-gray-100" dir={c.dir}>
                        © {new Date().getFullYear()} {c.copyright}
                    </footer>
                </div>
            </div>
        </>
    );
}
