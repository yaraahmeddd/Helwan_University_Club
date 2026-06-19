import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from '@/services/axios';
import { useTranslation } from "react-i18next";
import { CopyrightFooter } from '@/components/CopyrightFooter';
import {
  firstError,
  formatValidationError,
  validateEmail,
  validateEgyptianPhone,
  validateMemberNationalId,
  validateRequired,
} from '@/lib/validation';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Loader2,
  CheckCircle,
  X as LucideX,
  Users,
  Image as ImageIcon,
  Upload,
  Globe,
} from "lucide-react";
const hucLogo = "/assets/HUC_logo.jpeg";
const capuniLogo = "/assets/capuni.png";

// ─── Language Content ─────────────────────────────────────────────────────────
type Lang = "ar" | "en";

const CONTENT = {
  ar: {
    dir: "rtl" as const,
    loading: "جاري تحميل تفاصيل الحجز...",
    pageTitle: "دعوة للانضمام لحجز",
    successTitle: "تم التسجيل بنجاح!",
    successDesc: "لقد تم تسجيلك بنجاح كمشارك في هذا الحجز. نتمنى لك وقتاً ممتعاً!",
    backHome: "العودة للرئيسية",
    errorTitle: "خطأ في الرابط",
    bookingDetails: "تفاصيل الحجز",
    field: "الملعب",
    fieldFallback: "ملعب رياضي",
    date: "التاريخ",
    time: "الوقت",
    participants: "المشاركون",
    of: "من",
    participant: "مشارك",
    slotsLeft: (n: number) => `${n} أماكن شاغرة`,
    formTitle: "بيانات الانضمام",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "أدخل اسمك بالكامل",
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني",
    nationalId: "الرقم القومي",
    nationalIdPlaceholder: "أدخل الـ 14 رقم",
    idFront: "صورة الرقم القومي (وجه)",
    idFrontUpload: "ارفع وجه البطاقة",
    idBack: "صورة الرقم القومي (ظهر)",
    idBackUpload: "ارفع ظهر البطاقة",
    hint: "يجب إدخال وسيلة تواصل واحدة على الأقل. يفضل إرفاق صور البطاقة لتوثيق الهوية.",
    submitBtn: "تأكيد الانضمام للحجز",
    submittingBtn: "جاري التسجيل...",
    invalidLink: "رابط الدعوة غير صالح.",
    invalidLinkExpired: "رابط الدعوة غير صالح أو منتهي الصلاحية.",
    joinFailed: "فشل التسجيل في الحجز. يرجى المحاولة مرة أخرى.",
    switchLang: "English",
    inputDir: "rtl" as const,
    iconSide: "right" as const,
    iconClass: "right-4",
    inputPadding: "pr-10 pl-4",
  },
  en: {
    dir: "ltr" as const,
    loading: "Loading booking details...",
    pageTitle: "Invitation to Join a Booking",
    successTitle: "Registration Successful!",
    successDesc: "You've been successfully registered as a participant in this booking. Enjoy your game!",
    backHome: "Back to Home",
    errorTitle: "Invalid Link",
    bookingDetails: "Booking Details",
    field: "Court",
    fieldFallback: "Sports Court",
    date: "Date",
    time: "Time",
    participants: "Participants",
    of: "of",
    participant: "player(s)",
    slotsLeft: (n: number) => `${n} spot(s) available`,
    formTitle: "Join Details",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    phone: "Phone Number",
    email: "Email Address",
    nationalId: "National ID",
    nationalIdPlaceholder: "Enter 14 digits",
    idFront: "National ID Photo (Front)",
    idFrontUpload: "Upload front side",
    idBack: "National ID Photo (Back)",
    idBackUpload: "Upload back side",
    hint: "At least one contact method is required. Attaching ID photos is recommended for identity verification.",
    submitBtn: "Confirm & Join Booking",
    submittingBtn: "Registering...",
    invalidLink: "Invalid invitation link.",
    invalidLinkExpired: "Invalid or expired invitation link.",
    joinFailed: "Failed to register for the booking. Please try again.",
    switchLang: "العربية",
    inputDir: "ltr" as const,
    iconSide: "left" as const,
    iconClass: "left-4",
    inputPadding: "pl-10 pr-4",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface PublicBookingDetails {
  booking_id: string;
  sport_name_ar: string;
  sport_name_en: string;
  field_name: string;
  field_name_ar?: string;
  field_name_en?: string;
  start_time: string;
  end_time: string;
  expected_participants: number;
  registered_participants: number;
  available_slots: number;
  is_full: boolean;
  status: string;
  notes?: string | null;
}

interface JoinFormState {
  full_name: string;
  phone_number: string;
  national_id: string;
  email: string;
  national_id_front: File | null;
  national_id_back: File | null;
}

const initialForm: JoinFormState = {
  full_name: "",
  phone_number: "",
  national_id: "",
  email: "",
  national_id_front: null,
  national_id_back: null,
};

function formatDateTime(dateStr: string, type: "date" | "time", lang: Lang) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    const locale = lang === "ar" ? "ar-EG" : "en-GB";
    if (type === "date") return d.toLocaleDateString(locale);
    return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "-";
  }
}

// ─── Language Toggle Button ───────────────────────────────────────────────────
function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  const c = CONTENT[lang];
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-bold transition-colors px-3 py-1.5 rounded-lg hover:bg-white/15 border border-white/20 backdrop-blur-sm"
    >
      <Globe className="w-3.5 h-3.5" />
      {c.switchLang}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const JoinBookingPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { t: tVal } = useTranslation("validation");

  const [lang, setLang] = useState<Lang>("ar");
  const [booking, setBooking] = useState<PublicBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<JoinFormState>(initialForm);

  const c = CONTENT[lang];
  const toggleLang = () => setLang((l) => (l === "ar" ? "en" : "ar"));

  const fetchBooking = useCallback(async () => {
    if (!shareToken) {
      setError(c.invalidLink);
      setLoading(false);
      return;
    }
    try {
      const response = await api.get(`/bookings/join/${shareToken}`);
      const details = response.data?.data as PublicBookingDetails;
      setBooking({
        booking_id: details.booking_id,
        sport_name_ar: details.sport_name_ar,
        sport_name_en: details.sport_name_en,
        field_name: details.field_name,
        field_name_ar: details.field_name_ar,
        field_name_en: details.field_name_en,
        start_time: details.start_time,
        end_time: details.end_time,
        expected_participants: details.expected_participants,
        registered_participants: details.registered_participants,
        available_slots: details.available_slots,
        is_full: details.is_full,
        status: details.status,
        notes: details.notes,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.message ||
        c.invalidLinkExpired
      );
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    void fetchBooking();
  }, [fetchBooking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareToken) return;

    const fullNameTrimmed = form.full_name.trim();
    const nameRequired = formatValidationError(validateRequired(fullNameTrimmed, "fullName.required"), tVal);
    if (nameRequired) { setError(nameRequired); return; }

    const nameParts = fullNameTrimmed.split(/\s+/);
    if (nameParts.length < 2) { setError(tVal("fullName.parts")); return; }

    const contactChecks = [];
    if (form.phone_number.trim()) contactChecks.push(validateEgyptianPhone(form.phone_number));
    if (form.email.trim()) contactChecks.push(validateEmail(form.email));
    if (form.national_id.trim()) contactChecks.push(validateMemberNationalId(form.national_id));

    const fieldError = firstError(contactChecks, tVal);
    if (fieldError) { setError(fieldError); return; }

    if (!form.phone_number.trim() && !form.national_id.trim() && !form.email.trim()) {
      setError(tVal("contact.required"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("full_name", form.full_name.trim());
      if (form.phone_number) formData.append("phone_number", form.phone_number.trim());
      if (form.national_id) formData.append("national_id", form.national_id.trim());
      if (form.email) formData.append("email", form.email.trim());
      if (form.national_id_front) formData.append("national_id_front", form.national_id_front);
      if (form.national_id_back) formData.append("national_id_back", form.national_id_back);

      await api.post(`/bookings/join/${shareToken}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.message ||
        c.joinFailed
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center" dir={c.dir}>
          <Loader2 className="w-12 h-12 text-ds-primary animate-spin mx-auto mb-4" />
          <p className="text-ds-text-secondary font-bold">{c.loading}</p>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div dir={c.dir} className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-ds-text-primary mb-2">{c.successTitle}</h2>
          <p className="text-ds-text-secondary mb-8">{c.successDesc}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full h-12 bg-ds-primary text-white font-bold rounded-xl hover:bg-ds-primary-dark transition-colors"
          >
            {c.backHome}
          </button>
        </div>
      </div>
    );
  }

  // ── Error (no booking loaded) ──
  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div dir={c.dir} className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LucideX className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-ds-text-primary mb-2">{c.errorTitle}</h2>
          <p className="text-ds-text-secondary mb-8">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full h-12 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            {c.backHome}
          </button>
        </div>
      </div>
    );
  }

  // ── Main Page ──
  return (
    <div className="min-h-screen bg-gray-50 py-2 px-4" dir={c.dir}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[24px] shadow-xl overflow-hidden border border-gray-100">

          {/* ── Header Banner ── */}
          <div className="h-32 bg-[#1e40af] flex items-center justify-between px-6 relative overflow-hidden">
            <div className="flex-shrink-0 bg-white/15 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
              <img src={hucLogo} alt="HUC Logo" className="h-16 w-auto object-contain" />
            </div>

            <div className="flex flex-col items-center flex-1 mx-4 gap-2">
              <h1 className="text-xl font-black text-white text-center drop-shadow-md leading-tight">
                {c.pageTitle}
              </h1>
              <LangToggle lang={lang} onToggle={toggleLang} />
            </div>

            <div className="flex-shrink-0 bg-white/15 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
              <img src={capuniLogo} alt="Capuni Logo" className="h-16 w-auto object-contain" />
            </div>
          </div>

          <div className="p-4">
            {/* ── Booking Details Card ── */}
            {booking && (
              <div className="bg-blue-50/50 rounded-xl p-3 mb-3 border border-blue-100/50">
                <h2 className="text-sm font-black text-ds-text-primary mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-ds-primary rounded-full" />
                  {c.bookingDetails}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Field */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                      <MapPin className="w-4 h-4 text-ds-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-ds-text-muted font-bold leading-none">{c.field}</p>
                      <p className="text-xs font-black text-ds-text-primary">
                        {lang === "ar" 
                          ? (booking.field_name_ar || booking.field_name || c.fieldFallback)
                          : (booking.field_name_en || booking.field_name || c.fieldFallback)}
                      </p>
                    </div>
                  </div>

                  {/* Date + Time */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                        <Calendar className="w-4 h-4 text-ds-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-ds-text-muted font-bold leading-none">{c.date}</p>
                        <p className="text-xs font-black text-ds-text-primary" dir="ltr">
                          {formatDateTime(booking.start_time, "date", lang)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                        <Clock className="w-4 h-4 text-ds-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-ds-text-muted font-bold leading-none">{c.time}</p>
                        <p className="text-xs font-black text-ds-text-primary" dir="ltr">
                          {formatDateTime(booking.start_time, "time", lang)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className={`mt-3 pt-3 border-t border-blue-100/50 flex flex-col ${lang === "ar" ? "items-end text-right" : "items-start text-left"}`}>
                  <div className={`flex items-center gap-2 mb-1 text-[#1e40af] ${lang === "en" ? "flex-row-reverse" : ""}`}>
                    <span className="font-black text-sm">{c.participants}</span>
                    <Users className="w-3.5 h-3.5" />
                  </div>

                  <div className={`flex flex-wrap gap-1.5 mb-3 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                    {Array.from({ length: booking.expected_participants }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full border-2 ${i < booking.registered_participants
                          ? "bg-ds-primary border-ds-primary"
                          : "bg-transparent border-gray-300"
                          }`}
                      />
                    ))}
                  </div>

                  <div className="space-y-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-ds-text-primary leading-none">
                        {booking.registered_participants}
                      </span>
                      <span className="text-sm font-bold text-ds-text-secondary">
                        {c.of} {booking.expected_participants} {c.participant}
                      </span>
                    </div>
                    <div className="text-emerald-600 font-bold text-sm">
                      {c.slotsLeft(booking.available_slots)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Registration Form ── */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <h2 className="text-sm font-black text-ds-text-primary mb-1 flex items-center gap-2">
                <span className="w-1 h-4 bg-ds-orange rounded-full" />
                {c.formTitle}
              </h2>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-ds-text-secondary mb-2">
                    {c.fullName} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className={`absolute ${c.iconClass} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                    <input
                      type="text"
                      required
                      dir={c.inputDir}
                      value={form.full_name}
                      onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                      className={`w-full h-12 ${c.inputPadding} bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ds-primary focus:border-transparent outline-none transition-all font-bold`}
                      placeholder={c.fullNamePlaceholder}
                    />
                  </div>
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-ds-text-secondary mb-2">{c.phone}</label>
                    <div className="relative">
                      <Phone className={`absolute ${c.iconClass} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                      <input
                        type="tel"
                        dir="ltr"
                        value={form.phone_number}
                        onChange={(e) => setForm((prev) => ({ ...prev, phone_number: e.target.value }))}
                        className={`w-full h-12 ${c.inputPadding} bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ds-primary focus:border-transparent outline-none transition-all font-bold`}
                        placeholder="01xxxxxxxxx"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ds-text-secondary mb-2">{c.email}</label>
                    <div className="relative">
                      <Mail className={`absolute ${c.iconClass} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                      <input
                        type="email"
                        dir="ltr"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        className={`w-full h-12 ${c.inputPadding} bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ds-primary focus:border-transparent outline-none transition-all font-bold`}
                        placeholder="example@mail.com"
                      />
                    </div>
                  </div>
                </div>

                {/* National ID */}
                <div>
                  <label className="block text-sm font-bold text-ds-text-secondary mb-2">{c.nationalId}</label>
                  <div className="relative">
                    <CreditCard className={`absolute ${c.iconClass} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                    <input
                      type="text"
                      dir="ltr"
                      value={form.national_id}
                      onChange={(e) => setForm((prev) => ({ ...prev, national_id: e.target.value }))}
                      className={`w-full h-12 ${c.inputPadding} bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ds-primary focus:border-transparent outline-none transition-all font-bold`}
                      placeholder={c.nationalIdPlaceholder}
                      maxLength={14}
                    />
                  </div>
                </div>

                {/* ID Photo Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Front */}
                  <div>
                    <label className="block text-sm font-bold text-ds-text-secondary mb-2">{c.idFront}</label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setForm((prev) => ({ ...prev, national_id_front: file }));
                        }}
                        className="hidden"
                        id="front-id-upload"
                      />
                      <label
                        htmlFor="front-id-upload"
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${form.national_id_front
                          ? "border-ds-primary bg-blue-50/50"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                          }`}
                      >
                        {form.national_id_front ? (
                          <div className="flex flex-col items-center text-ds-primary">
                            <CheckCircle className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold truncate max-w-[120px]">
                              {form.national_id_front.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold">{c.idFrontUpload}</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Back */}
                  <div>
                    <label className="block text-sm font-bold text-ds-text-secondary mb-1.5">{c.idBack}</label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setForm((prev) => ({ ...prev, national_id_back: file }));
                        }}
                        className="hidden"
                        id="back-id-upload"
                      />
                      <label
                        htmlFor="back-id-upload"
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${form.national_id_back
                          ? "border-ds-primary bg-blue-50/50"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                          }`}
                      >
                        {form.national_id_back ? (
                          <div className="flex flex-col items-center text-ds-primary">
                            <CheckCircle className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold truncate max-w-[120px]">
                              {form.national_id_back.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold">{c.idBackUpload}</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hint */}
              <p className="text-[10px] text-ds-text-muted font-medium bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-ds-primary shrink-0" />
                <span>{c.hint}</span>
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-ds-primary text-white font-black text-base rounded-xl hover:bg-ds-primary-dark shadow-lg shadow-ds-primary/20 disabled:opacity-60 transition-all active:scale-95"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{c.submittingBtn}</span>
                  </span>
                ) : (
                  c.submitBtn
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <CopyrightFooter />
    </div>
  );
};

export default JoinBookingPage;
