import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Camera,
    CreditCard,
    Edit3,
    Mail,
    MapPin,
    Phone,
    Save,
    Shield,
    User,
    X,
} from "lucide-react";
import { Button } from '@/components/StaffPagesComponents/ui/button';
import { Badge } from '@/components/StaffPagesComponents/ui/badge';
import api from '@/services/axios';
import { useAuth } from '@/context/AuthContext';
import { resolveFileUrl } from '@/utils/fileUrl';
import { useTranslation } from "react-i18next";
import {
    formatValidationError,
    validateArabicName,
    validateEnglishName,
    validateEgyptianPhone,
} from '@/lib/validation';
import i18n from '@/i18n';
import { buildPersonName, getNameInitials, resolveDisplayLanguage } from '@/lib/localizedDisplay';

interface MemberProfile {
    id: number;
    firstNameAr: string;
    lastNameAr: string;
    firstNameEn: string;
    lastNameEn: string;
    email: string;
    phone: string;
    birthdate: string;
    address: string;
    nationalId: string;
    joinDate: string;
    status: string;
    memberType: string;
    photo?: string;
    medicalReport?: string;
    nationalIdFront?: string;
    nationalIdBack?: string;
}

type ValidationErrors = Partial<Record<keyof MemberProfile, string>>;

const tVal = (key: string, params?: Record<string, string | number>) =>
    i18n.t(`validation:${key}`, params);

const statusStyle = (status: string) => {
    const s = (status ?? "").toLowerCase();
    if (s === "active") return "bg-green-100 text-green-700";
    if (s === "pending") return "bg-amber-100 text-amber-700";
    if (s === "suspended" || s === "rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
};

interface FieldRowProps {
    label: string;
    value: string;
    icon: React.ElementType;
    editing: boolean;
    name: keyof MemberProfile;
    type?: string;
    readOnly?: boolean;
    locale?: string;
    onChange: (name: keyof MemberProfile, value: string) => void;
    error?: string;
}

function FieldRow({ label, value, icon: Icon, editing, name, type = "text", readOnly = false, locale = "ar-EG", onChange, error }: FieldRowProps) {
    const displayValue = type === "date" && !editing
        ? (value ? new Date(value).toLocaleDateString(locale) : "—")
        : (value || "—");

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </label>
            {editing && !readOnly ? (
                <>
                    <input
                        type={type}
                        value={value || ""}
                        onChange={(e) => onChange(name, e.target.value)}
                        dir="rtl"
                        className={`w-full rounded-lg border ${error ? "border-red-400" : "border-[#2EA7C9]"} bg-white px-4 py-2 text-sm text-foreground outline-none ring-[#2EA7C9]/20 focus:ring-2 transition-all`}
                    />
                    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
                </>
            ) : (
                <p className={`rounded-lg px-4 py-2 text-sm ${readOnly ? "bg-muted/60 text-muted-foreground" : "bg-muted/30 text-foreground"} border border-border`}>
                    {displayValue}
                </p>
            )}
        </div>
    );
}

/** Fetch member profile data exclusively from /auth/me — no admin-only endpoints */
async function fetchMemberProfile(): Promise<{ profile: MemberProfile }> {
    const meRes = await api.get("/auth/me");
    const meData = meRes.data?.data?.user ?? meRes.data?.user ?? meRes.data;

    const memberId: number = meData.member_id;
    if (!memberId) throw new Error("NO_MEMBER_ID");

    const nameArParts = (meData.name_ar ?? "").split(/\s+/).filter(Boolean);
    const nameEnParts = (meData.name_en ?? "").split(/\s+/).filter(Boolean);

    return {
        profile: {
            id: memberId,
            firstNameAr: meData.first_name_ar ?? nameArParts[0] ?? "",
            lastNameAr: meData.last_name_ar ?? nameArParts.slice(1).join(" ") ?? "",
            firstNameEn: meData.first_name_en ?? nameEnParts[0] ?? "",
            lastNameEn: meData.last_name_en ?? nameEnParts.slice(1).join(" ") ?? "",
            email: meData.email ?? "",
            phone: meData.phone ?? "",
            birthdate: meData.birthdate ? new Date(meData.birthdate).toISOString().split("T")[0] : "",
            address: meData.address ?? "",
            nationalId: meData.national_id ?? "",
            joinDate: meData.join_date ?? "",
            status: meData.status ?? "",
            memberType: meData.member_type ?? "",
            photo: meData.photo ?? "",
            medicalReport: meData.medical_report ?? "",
            nationalIdFront: meData.national_id_front ?? "",
            nationalIdBack: meData.national_id_back ?? "",
        },
    };
}

function validateForm(form: MemberProfile): ValidationErrors {
    const errors: ValidationErrors = {};

    const firstNameArError = formatValidationError(validateArabicName(form.firstNameAr), tVal);
    if (firstNameArError) errors.firstNameAr = firstNameArError;

    const lastNameArError = formatValidationError(validateArabicName(form.lastNameAr), tVal);
    if (lastNameArError) errors.lastNameAr = lastNameArError;

    const firstNameEnError = formatValidationError(validateEnglishName(form.firstNameEn), tVal);
    if (firstNameEnError) errors.firstNameEn = firstNameEnError;

    const lastNameEnError = formatValidationError(validateEnglishName(form.lastNameEn), tVal);
    if (lastNameEnError) errors.lastNameEn = lastNameEnError;

    if (form.phone.trim()) {
        const phoneError = formatValidationError(validateEgyptianPhone(form.phone), tVal);
        if (phoneError) errors.phone = phoneError;
    }

    return errors;
}

export default function MemberProfilePage() {
    const { t, i18n } = useTranslation("member");
    const tm = (key: string, fallback?: string) => t(`member:${key}`, fallback ?? key);
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState<MemberProfile | null>(null);
    const [form, setForm] = useState<MemberProfile | null>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [documentPreviews, setDocumentPreviews] = useState<Record<string, string>>({});
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { profile: p } = await fetchMemberProfile();
            setProfile(p);
            setForm(p);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "";
            if (msg === "NO_MEMBER_ID") {
                setError("لم يتم العثور على بيانات العضو. تأكد من تسجيل الدخول بحساب عضو.");
            } else {
                setError("فشل في تحميل بيانات الملف الشخصي");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void loadProfile(); }, [loadProfile]);

    const handleChange = (name: keyof MemberProfile, value: string) => {
        setForm((prev) => prev ? { ...prev, [name]: value } : prev);
        if (validationErrors[name]) {
            setValidationErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size (max 10MB raw file)
        if (file.size > 10 * 1024 * 1024) {
            setError("حجم الصورة يجب أن يكون أقل من 10 ميجابايت");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                // Compress using canvas — max 400×400, 70% JPEG quality
                const MAX = 400;
                let { width, height } = img;
                if (width > MAX || height > MAX) {
                    if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
                    else { width = Math.round(width * MAX / height); height = MAX; }
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.drawImage(img, 0, 0, width, height);
                const compressed = canvas.toDataURL("image/jpeg", 0.7);
                setPhotoPreview(compressed);
                setForm((prev) => prev ? { ...prev, photo: compressed } : prev);
                setError(null);
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleDocumentChange = (field: keyof MemberProfile, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFileErrors((prev) => ({ ...prev, [field]: "الرجاء اختيار صورة (JPG, PNG)" }));
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            setFileErrors((prev) => ({ ...prev, [field]: "حجم الصورة يجب أن يكون أقل من 8 ميجابايت" }));
            return;
        }

        setFileErrors((prev) => ({ ...prev, [field]: "" }));

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const MAX = 1200;
                let { width, height } = img;
                if (width > MAX || height > MAX) {
                    if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
                    else { width = Math.round(width * MAX / height); height = MAX; }
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.drawImage(img, 0, 0, width, height);
                const compressed = canvas.toDataURL("image/jpeg", 0.75);
                setDocumentPreviews((prev) => ({ ...prev, [field]: compressed }));
                setForm((prev) => prev ? { ...prev, [field]: compressed } : prev);
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!form) return;

        const errors = validateForm(form);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        setValidationErrors({});

        setSaving(true);
        setError(null);
        try {
            await api.put(`/auth/me/profile`, {
                first_name_ar: form.firstNameAr,
                last_name_ar: form.lastNameAr,
                first_name_en: form.firstNameEn,
                last_name_en: form.lastNameEn,
                phone: form.phone,
                address: form.address,
                birthdate: form.birthdate || null,
                photo: form.photo || null,
                national_id_front: form.nationalIdFront || null,
                national_id_back: form.nationalIdBack || null,
                medical_report: form.medicalReport || null,
            });
            setProfile(form);
            setPhotoPreview(null);
            setDocumentPreviews({});
            setEditing(false);
            setSuccessMsg("تم حفظ التعديلات بنجاح");
            setTimeout(() => setSuccessMsg(null), 3500);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string, error?: string } }; message?: string };
            const serverMsg = axiosErr?.response?.data?.error || axiosErr?.response?.data?.message || axiosErr?.message || "";
            console.error("Profile save error:", err);
            setError(`فشل في حفظ التعديلات. ${serverMsg ? `(${serverMsg})` : "يرجى المحاولة مرة أخرى."}`);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setForm(profile);
        setPhotoPreview(null);
        setDocumentPreviews({});
        setEditing(false);
        setError(null);
        setValidationErrors({});
        setFileErrors({});
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const isEnglish = i18n.language?.startsWith("en");
    const displayLanguage = resolveDisplayLanguage(i18n.language);
    const locale = isEnglish ? "en-US" : "ar-EG";

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2EA7C9] border-t-transparent" />
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex items-start gap-3 text-sm text-red-700 dir-rtl" dir="rtl">
                <span>{error}</span>
                {error.includes("تسجيل الدخول") && (
                    <button onClick={() => logout()} className="mr-auto text-[#2EA7C9] underline whitespace-nowrap">تسجيل الخروج</button>
                )}
            </div>
        );
    }

    if (!profile || !form) return null;

    const tStatus = (status: string) => {
        const s = (status ?? "").toLowerCase();
        if (s === "active") return tm("status.active", "Active");
        if (s === "pending") return tm("status.pending", "Pending review");
        if (s === "suspended") return tm("status.suspended", "Suspended");
        if (s === "rejected") return tm("status.rejected", "Rejected");
        return status || tm("common.na", "—");
    };

    const rawPhoto = photoPreview || form.photo || profile.photo;
    const currentPhoto = resolveFileUrl(rawPhoto);
    const { primary: displayPrimaryName } = buildPersonName(profile, displayLanguage);
    const initials = getNameInitials(
        `${profile.firstNameAr} ${profile.lastNameAr}`.trim(),
        `${profile.firstNameEn} ${profile.lastNameEn}`.trim(),
        displayLanguage,
    );
    const documentsConfig = [
        { key: "photo", label: "الصورة الشخصية" },
        { key: "nationalIdFront", label: "صورة البطاقة (أمام)" },
        { key: "nationalIdBack", label: "صورة البطاقة (خلف)" },
        { key: "medicalReport", label: "تقرير طبي" },
    ];

    return (
        <div className="space-y-4" dir={isEnglish ? "ltr" : "rtl"}>
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
                <div
                    className="relative w-full flex flex-col sm:flex-row items-center px-4 py-6 sm:px-6 sm:py-4 gap-4 sm:gap-0"
                    style={{ background: "linear-gradient(135deg, #F8F9FB 0%, #EEF1F6 100%)", borderBottom: "1px solid #E5E7EB" }}
                >
                    <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 min-w-0 w-full">
                        {/* Avatar with photo upload */}
                        <div className="relative shrink-0">
                            <div
                                className={`w-16 h-16 rounded-2xl border-2 border-[#2EA7C9]/30 flex items-center justify-center text-[#1F3A5F] text-2xl font-bold shadow-sm overflow-hidden ${editing ? "cursor-pointer" : ""}`}
                                style={{ backgroundColor: "rgba(46,167,201,0.10)" }}
                                onClick={() => editing && fileInputRef.current?.click()}
                                title={editing ? "اضغط لتغيير الصورة" : undefined}
                            >
                                {currentPhoto ? (
                                    <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    initials || <User className="h-7 w-7 text-[#2EA7C9]" />
                                )}

                                {/* Camera overlay when editing */}
                                {editing && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                                        <Camera className="h-5 w-5 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />

                            {/* Small camera badge when editing */}
                            {editing && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-[#2EA7C9] flex items-center justify-center shadow"
                                    title="تغيير الصورة"
                                >
                                    <Camera className="h-3 w-3 text-white" />
                                </button>
                            )}
                        </div>

                        <div className="min-w-0 flex flex-col items-center sm:items-start text-center sm:text-right w-full sm:w-auto">
                            <h1 className="text-xl font-bold text-[#1F3A5F] leading-tight truncate w-full">
                                {displayPrimaryName || "—"}
                            </h1>
                            <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                <Badge className={statusStyle(profile.status)}>
                                    {tStatus(profile.status)}
                                </Badge>
                                {profile.memberType && (
                                    <span className="text-xs text-[#2EA7C9] bg-[#2EA7C9]/10 border border-[#2EA7C9]/20 rounded-full px-2.5 py-0.5 font-medium">
                                        {profile.memberType}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 sm:mr-2 w-full sm:w-auto flex justify-center sm:justify-end mt-2 sm:mt-0">
                        {editing ? (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1.5 border-[#1F3A5F]/30 text-[#1F3A5F] hover:bg-[#1F3A5F]/5">
                                    <X className="h-4 w-4" />
                                    {tm("profilePage.cancel", "Cancel")}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="gap-1.5 bg-[#1F3A5F] text-white hover:bg-[#162d4a]"
                                >
                                    <Save className="h-4 w-4" />
                                    {saving ? tm("profilePage.saving", "Saving...") : tm("profilePage.save", "Save changes")}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => setEditing(true)}
                                className="gap-1.5 bg-white border border-[#1F3A5F]/25 text-[#1F3A5F] hover:bg-[#F0F4FA] shadow-sm"
                            >
                                <Edit3 className="h-4 w-4" />
                                {tm("profilePage.edit", "Edit profile")}
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>

            {successMsg && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
                    {successMsg}
                </div>
            )}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                    {error}
                </div>
            )}
            {Object.keys(validationErrors).length > 0 && editing && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                    يرجى تصحيح الأخطاء الموضحة في الحقول قبل الحفظ
                </div>
            )}

            {/* Editable Personal Fields */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
                <h2 className="text-base font-semibold text-[#214474] mb-4">{tm("profilePage.personalInfo", "Personal Information")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow
                        label={tm("profilePage.firstNameAr", "First Name (Arabic)")}
                        value={form.firstNameAr}
                        icon={User}
                        editing={editing}
                        name="firstNameAr"
                        onChange={handleChange}
                        error={validationErrors.firstNameAr}
                    />
                    <FieldRow
                        label={tm("profilePage.lastNameAr", "Last Name (Arabic)")}
                        value={form.lastNameAr}
                        icon={User}
                        editing={editing}
                        name="lastNameAr"
                        onChange={handleChange}
                        error={validationErrors.lastNameAr}
                    />
                    <FieldRow
                        label={tm("profilePage.firstNameEn", "First Name (English)")}
                        value={form.firstNameEn}
                        icon={User}
                        editing={editing}
                        name="firstNameEn"
                        onChange={handleChange}
                        error={validationErrors.firstNameEn}
                    />
                    <FieldRow
                        label={tm("profilePage.lastNameEn", "Last Name (English)")}
                        value={form.lastNameEn}
                        icon={User}
                        editing={editing}
                        name="lastNameEn"
                        onChange={handleChange}
                        error={validationErrors.lastNameEn}
                    />
                    <FieldRow
                        label={tm("profilePage.email", "Email")}
                        value={form.email}
                        icon={Mail}
                        editing={false}
                        readOnly
                        name="email"
                        onChange={handleChange}
                    />
                    <FieldRow
                        label={tm("profilePage.phone", "Phone Number")}
                        value={form.phone}
                        icon={Phone}
                        editing={editing}
                        name="phone"
                        onChange={handleChange}
                        error={validationErrors.phone}
                    />
                    <FieldRow
                        label={tm("profilePage.birthdate", "Birth Date")}
                        value={form.birthdate}
                        icon={Calendar}
                        type="date"
                        locale={locale}
                        editing={editing}
                        name="birthdate"
                        onChange={handleChange}
                    />
                    <FieldRow
                        label={tm("profilePage.address", "Address")}
                        value={form.address}
                        icon={MapPin}
                        editing={editing}
                        name="address"
                        onChange={handleChange}
                    />
                </div>
            </motion.div>

            {/* Read-only Membership Info */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
                <h2 className="text-base font-semibold text-[#214474] mb-4">{tm("profilePage.membershipInfo", "Membership Information")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow
                        label={tm("profilePage.nationalId", "National ID")}
                        value={profile.nationalId || "—"}
                        icon={CreditCard}
                        editing={false}
                        readOnly
                        name="nationalId"
                        onChange={handleChange}
                    />
                    <FieldRow
                        label={tm("profilePage.memberId", "Member ID")}
                        value={String(profile.id || "—")}
                        icon={Shield}
                        editing={false}
                        readOnly
                        name="id"
                        onChange={handleChange}
                    />
                    <FieldRow
                        label={tm("profilePage.joinDate", "Join Date")}
                        value={profile.joinDate}
                        icon={Calendar}
                        type="date"
                        locale={locale}
                        editing={false}
                        readOnly
                        name="joinDate"
                        onChange={handleChange}
                    />
                    <FieldRow
                        label={tm("profilePage.state", "Status")}
                        value={tStatus(profile.status)}
                        icon={Shield}
                        editing={false}
                        readOnly
                        name="status"
                        onChange={handleChange}
                    />
                    <FieldRow
                        label={tm("profilePage.memberType", "Member Type")}
                        value={profile.memberType || "—"}
                        icon={CreditCard}
                        editing={false}
                        readOnly
                        name="memberType"
                        onChange={handleChange}
                    />
                </div>
            </motion.div>

            {/* Documents Section */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
                <h2 className="text-base font-semibold text-[#214474] mb-4">{tm("profilePage.documents", "Documents")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {documentsConfig.map((doc) => {
                        const currentVal = form[doc.key as keyof MemberProfile] as string | undefined | null;
                        const preview = doc.key === "photo" ? photoPreview : documentPreviews[doc.key];
                        const displayUrl = resolveFileUrl(preview || currentVal);

                        return (
                            <div key={doc.key} className="flex flex-col gap-3">
                                <label className="text-xs font-semibold text-muted-foreground">{doc.label}</label>
                                <div className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group transition-all hover:border-[#2EA7C9]">
                                    {displayUrl ? (
                                        <img src={displayUrl} alt={doc.label} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Camera className="h-6 w-6 mb-1 opacity-50" />
                                            <span className="text-[10px]">لا توجد صورة</span>
                                        </div>
                                    )}

                                    {editing && (
                                        <div className="absolute inset-0 bg-black/40  transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1.5 hover:bg-gray-100">
                                                <Edit3 size={12} />
                                                تغيير
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (doc.key === "photo") {
                                                            handlePhotoChange(e);
                                                        } else {
                                                            handleDocumentChange(doc.key as keyof MemberProfile, e);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                                {fileErrors[doc.key] && (
                                    <p className="text-[11px] text-red-500">{fileErrors[doc.key]}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {user && <span className="hidden">{JSON.stringify({ uid: user.member_id, role: user.role })}</span>}
        </div>
    );
}
