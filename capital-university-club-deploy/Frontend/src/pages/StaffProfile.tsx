import React, { useState, useEffect } from 'react';
import {
    Camera, Save, X, Lock, Eye, EyeOff,
    AlertCircle, Calendar, Activity,
    UserCheck, Shield, CheckCircle, XCircle
} from 'lucide-react';
import { StaffService, type StaffProfileData } from '../services/staffService';
import { Toaster, toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { resolveFileUrl } from '../utils/fileUrl';
import { useLocalizedTranslation } from '../hooks/useLocalizedTranslation';
import { useLanguage } from '../hooks/useLanguage';
import { buildPersonName, getNameInitials, resolveDisplayLanguage } from '../lib/localizedDisplay';
import { useStaffJobLabels } from '../lib/staffJobLabel';
import { formatValidationError, validatePassword, validatePasswordMatch } from '../lib/validation';
import { useAdminFieldValidation } from '../hooks/useAdminFieldValidation';
import { validateAdminStaffContactForm } from '../lib/validation/adminForms';

// Design System - HUC Branding
const colors = {
    primaryDark: '#1F3A5F',
    primaryBlue: '#244A73',
    accentBlue: '#2EA7C9',
    accentOrange: '#F4A623',
    background: '#F4F6F9',
    white: '#FFFFFF',
    border: '#E5E7EB',
    success: '#28A745',
    warning: '#FFC107',
    danger: '#DC3545',
    info: '#17A2B8',
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        600: '#4B5563',
        700: '#374151',
        900: '#111827'
    }
};

// Types mapped to Frontend UI
interface UserProfile {
    id: number;
    firstNameAr: string;
    lastNameAr: string;
    firstNameEn: string;
    lastNameEn: string;
    email: string;
    phone: string;
    nationalId: string;
    dateOfBirth: string;
    address: string;
    staffTypeId: number;
    staffTypeNameAr?: string;
    staffTypeNameEn?: string;
    staffTypeCode?: string;
    employeeId: string;
    accountStatusKey: 'active' | 'inactive';
    profilePhoto: string;
    lastLogin: string;
    accountCreated: string;
    totalActions: number;
    isAdminProfile?: boolean;
}

interface Privilege {
    module: string;
    view: boolean;
    edit: boolean;
    delete: boolean;
    create: boolean;
}

type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

interface PasswordStrength {
    level: PasswordStrengthLevel;
    color: string;
    width: string;
}

const StaffProfile: React.FC = () => {
    const { t, t: tCommon } = useLocalizedTranslation(['StaffProfile', 'common']);
    const { language, isRTL } = useLanguage();
    const displayLanguage = resolveDisplayLanguage(language);
    const { resolveJobLabel } = useStaffJobLabels(language);
    const { tVal, handlePhoneChange } = useAdminFieldValidation();
    const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string | undefined>>({});
    const dateLocale = language === 'en' ? 'en-US' : 'ar-EG';
    const fmtDate = (value?: string) => {
        if (!value) return t('notAvailable');
        try {
            return new Date(value).toLocaleDateString(dateLocale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return value;
        }
    };
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    // Password state
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false); // Not used in backend flow but kept for UI
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // Fetch Data
    const { user } = useAuth();

    const authNameParts = React.useMemo(() => {
        const arFromParts = `${user?.first_name_ar ?? ''} ${user?.last_name_ar ?? ''}`.trim();
        const enFromParts = `${user?.first_name_en ?? ''} ${user?.last_name_en ?? ''}`.trim();
        const arParts = (user?.name_ar ?? arFromParts).split(/\s+/).filter(Boolean);
        const enParts = (user?.name_en ?? enFromParts).split(/\s+/).filter(Boolean);
        const fullFallback = (user?.fullName ?? '').split(/\s+/).filter(Boolean);

        return {
            firstNameAr: user?.first_name_ar ?? arParts[0] ?? fullFallback[0] ?? '',
            lastNameAr: user?.last_name_ar ?? arParts.slice(1).join(' ') ?? fullFallback.slice(1).join(' ') ?? '',
            firstNameEn: user?.first_name_en ?? enParts[0] ?? fullFallback[0] ?? '',
            lastNameEn: user?.last_name_en ?? enParts.slice(1).join(' ') ?? fullFallback.slice(1).join(' ') ?? '',
        };
    }, [user]);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                // Prefer AuthContext user for reliable staff_id and role
                let staffId: number | undefined = user?.staff_id;

                if (!staffId) {
                    // If Admin has no staff record, show minimal profile instead of error
                    if (user?.role === 'ADMIN') {
                        const mappedUser: UserProfile = {
                            id: 0,
                            firstNameAr: authNameParts.firstNameAr || t('adminDefaults.fullName'),
                            lastNameAr: authNameParts.lastNameAr,
                            firstNameEn: authNameParts.firstNameEn || t('adminDefaults.fullName'),
                            lastNameEn: authNameParts.lastNameEn,
                            email: user.email ?? '',
                            phone: '',
                            nationalId: '',
                            dateOfBirth: '',
                            address: '',
                            staffTypeId: 0,
                            employeeId: 'ADMIN',
                            accountStatusKey: 'active',
                            profilePhoto: resolveFileUrl(user?.photo) || '',
                            lastLogin: new Date().toISOString().split('T')[0],
                            accountCreated: new Date().toISOString().split('T')[0],
                            totalActions: 0,
                            isAdminProfile: true,
                        };
                        setUserData(mappedUser);
                        setIsLoading(false);
                        return;
                    } else {
                        setError(t('errors.noStaffId'));
                        setIsLoading(false);
                        return;
                    }
                }

                // Parallel fetch: Profile + Privileges + Logs (do not fail all if one fails)
                const [profileResult, privilegesResult, logsResult] = await Promise.allSettled([
                    StaffService.getProfile(staffId),
                    StaffService.getPrivileges(staffId),
                    StaffService.getActivityLogs(staffId, 1)
                ]);

                if (profileResult.status !== 'fulfilled') {
                    throw new Error(profileResult.reason?.message || 'Failed to load profile');
                }

                const profile = profileResult.value;
                const staff = profile?.data ?? profile;
                // privileges are not displayed on this page; ignore failure
                // logs are optional for profile page
                const logs = logsResult.status === 'fulfilled' ? logsResult.value : { count: 0 };

                const rawPhoto =
                    (staff as any)?.documents?.personal_photo_url ||
                    (staff as any)?.personal_photo_url ||
                    (staff as any)?.photo ||
                    (staff as any)?.photo_url ||
                    (staff as any)?.profile_photo ||
                    (staff as any)?.profilePhoto ||
                    (staff as any)?.avatar ||
                    null;

                // Map Backend -> Frontend
                const mappedUser: UserProfile = {
                    id: staff.id,
                    firstNameAr: staff.first_name_ar ?? authNameParts.firstNameAr,
                    lastNameAr: staff.last_name_ar ?? authNameParts.lastNameAr,
                    firstNameEn: staff.first_name_en ?? authNameParts.firstNameEn,
                    lastNameEn: staff.last_name_en ?? authNameParts.lastNameEn,
                    email: staff.email,
                    phone: staff.phone,
                    nationalId: staff.national_id,
                    dateOfBirth: '',
                    address: staff.address || '',
                    staffTypeId: Number(staff.staff_type_id) || 0,
                    staffTypeNameAr: staff.staff_type?.name_ar,
                    staffTypeNameEn: staff.staff_type?.name_en,
                    staffTypeCode: staff.staff_type?.code,
                    employeeId: `EMP-${staff.id}`,
                    accountStatusKey: staff.is_active || staff.status === 'active' ? 'active' : 'inactive',
                    profilePhoto: resolveFileUrl(rawPhoto) || '',
                    lastLogin: new Date().toISOString().split('T')[0],
                    accountCreated: staff.created_at ? new Date(staff.created_at).toISOString().split('T')[0] : '',
                    totalActions: logs.count || 0,
                };

                setUserData(mappedUser);
            } catch (err: any) {
                console.error("Error fetching profile:", err);
                if (user?.role === 'ADMIN') {
                    const mappedUser: UserProfile = {
                        id: 0,
                        firstNameAr: authNameParts.firstNameAr || t('adminDefaults.fullName'),
                        lastNameAr: authNameParts.lastNameAr,
                        firstNameEn: authNameParts.firstNameEn || t('adminDefaults.fullName'),
                        lastNameEn: authNameParts.lastNameEn,
                        email: user.email ?? '',
                        phone: '',
                        nationalId: '',
                        dateOfBirth: '',
                        address: '',
                        staffTypeId: 0,
                        employeeId: 'ADMIN',
                        accountStatusKey: 'active',
                        profilePhoto: resolveFileUrl(user?.photo) || '',
                        lastLogin: new Date().toISOString().split('T')[0],
                        accountCreated: new Date().toISOString().split('T')[0],
                        totalActions: 0,
                        isAdminProfile: true,
                    };
                    setUserData(mappedUser);
                    setError(null);
                } else {
                    setError(err.message || t('errors.loadProfile'));
                    toast.error(t('toasts.loadFailed'));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user, t, authNameParts]);

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        if (!userData) return;
        if (field === 'phone') {
            handlePhoneChange(value, (phone) => setUserData((prev) => (prev ? { ...prev, phone } : null)));
            setProfileFieldErrors((prev) => ({ ...prev, phone: undefined }));
            return;
        }
        if (field === 'address') {
            setUserData((prev) => (prev ? { ...prev, address: value } : null));
            setProfileFieldErrors((prev) => ({ ...prev, address: undefined }));
            return;
        }
        setUserData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handlePasswordChange = (field: 'current' | 'new' | 'confirm', value: string) => {
        setPasswords(prev => ({ ...prev, [field]: value }));
    };

    const getPasswordStrength = (password: string): PasswordStrength => {
        if (password.length < 6) {
            return { level: 'weak', color: colors.danger, width: '33%' };
        }
        if (password.length < 10) {
            return { level: 'medium', color: colors.warning, width: '66%' };
        }
        return { level: 'strong', color: colors.success, width: '100%' };
    };

    const passwordStrength = getPasswordStrength(passwords.new);

    const handleSaveProfile = async () => {
        if (!userData) return;

        const errors = validateAdminStaffContactForm({ phone: userData.phone, address: userData.address }, tVal);
        if (Object.keys(errors).length > 0) {
            setProfileFieldErrors(errors);
            toast.error(Object.values(errors)[0] ?? t('toasts.saveFailed'));
            return;
        }
        setProfileFieldErrors({});

        try {
            // Split name back if needed or just update editable fields
            // Backend accepts: first_name_en, last_name_en, phone, address

            // For now, we only support updating phone and address as names are usually locked or require admin
            const updatePayload: Partial<StaffProfileData> = {
                phone: userData.phone,
                address: userData.address
            };

            await StaffService.updateProfile(userData.id, updatePayload);

            setIsEditMode(false);
            toast.success(t('toasts.saveSuccess'));
        } catch (err: any) {
            console.error("Update error:", err);
            toast.error(err.message || t('toasts.saveFailed'));
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        // optimal: re-fetch or revert. Reverting requires keeping initial state.
        // For now just toggle off, assuming user didn't change much or is okay with stale state until refresh
        // Better:
        window.location.reload();
    };

    const handleUpdatePassword = async () => {
        const passwordError = formatValidationError(
            validatePassword(passwords.new, true, { minLength: 8, strong: true }),
            tVal,
        );
        if (passwordError) {
            toast.error(passwordError);
            return;
        }
        const confirmError = formatValidationError(
            validatePasswordMatch(passwords.new, passwords.confirm),
            tVal,
        );
        if (confirmError) {
            toast.error(confirmError);
            return;
        }

        try {
            await StaffService.changeCredentials({
                new_email: userData?.email || '', // Use current email if not changing
                new_password: passwords.new
            });
            toast.success(t('password.success'));
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err: any) {
            toast.error(err.message || t('password.fail'));
        }
    };

    const getStatusBadge = (statusKey: UserProfile['accountStatusKey']) => {
        const isActive = statusKey === 'active';
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: isActive ? `${colors.success}15` : `${colors.danger}15`,
                    color: isActive ? colors.success : colors.danger
                }}
            >
                {isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {t(`status.${statusKey}`)}
            </span>
        );
    };

    const getRoleBadge = (roleLabel: string) => {
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: `${colors.accentOrange}20`,
                    color: colors.accentOrange,
                    border: `1px solid ${colors.accentOrange}40`
                }}
            >
                <Shield size={14} style={{ marginLeft: '6px' }} />
                {roleLabel}
            </span>
        );
    };

    const displayFullName = userData
        ? buildPersonName(userData, displayLanguage).primary || t('notAvailable')
        : '';

    const displayInitial = userData
        ? getNameInitials(
            `${userData.firstNameAr} ${userData.lastNameAr}`.trim(),
            `${userData.firstNameEn} ${userData.lastNameEn}`.trim(),
            displayLanguage,
        )
        : '?';

    const displayJobTitle = userData
        ? (userData.isAdminProfile
            ? t('adminDefaults.jobTitle')
            : resolveJobLabel({
                staffTypeId: userData.staffTypeId,
                staffTypeNameAr: userData.staffTypeNameAr,
                staffTypeNameEn: userData.staffTypeNameEn,
                staffTypeCode: userData.staffTypeCode,
            }))
        : '';

    const displayDepartment = userData?.isAdminProfile ? t('adminDefaults.department') : t('notAvailable');

    const inputFont = isRTL ? "'Cairo', sans-serif" : "'Segoe UI', sans-serif";

    const personalFields: Array<
        | { kind: 'data'; id: string; label: string; field: keyof UserProfile; type: string; readOnly?: boolean }
        | { kind: 'display'; id: string; label: string; value: string; type: string; readOnly: true }
    > = [
        { kind: 'display', id: 'fullName', label: t('personalInfo.fullName'), value: displayFullName, type: 'text', readOnly: true },
        { kind: 'data', id: 'email', label: t('personalInfo.email'), field: 'email', type: 'email', readOnly: true },
        { kind: 'data', id: 'phone', label: t('personalInfo.phone'), field: 'phone', type: 'tel' },
        { kind: 'data', id: 'nationalId', label: t('personalInfo.nationalId'), field: 'nationalId', type: 'text', readOnly: true },
        { kind: 'data', id: 'dateOfBirth', label: t('personalInfo.dateOfBirth'), field: 'dateOfBirth', type: 'date', readOnly: true },
        { kind: 'data', id: 'address', label: t('personalInfo.address'), field: 'address', type: 'text' },
        { kind: 'display', id: 'department', label: t('personalInfo.department'), value: displayDepartment, type: 'text', readOnly: true },
        { kind: 'display', id: 'jobTitle', label: t('personalInfo.jobTitle'), value: displayJobTitle, type: 'text', readOnly: true },
    ];

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>{tCommon('loading')}</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!userData) return null;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: colors.background,
            direction: isRTL ? 'rtl' : 'ltr',
            fontFamily: isRTL ? "'Cairo', sans-serif" : "'Segoe UI', sans-serif"
        }}>
            <Toaster position="top-center" />
            <div style={{ display: 'flex' }}>

                {/* Main Content */}
                <div style={{ flex: 1, padding: '24px' }}>
                    {/* Page Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '24px'
                    }}>
                        <div>
                            <h1 style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: colors.primaryDark,
                                margin: '0 0 8px 0'
                            }}>
                                {t('page.title')}
                            </h1>
                            <p style={{
                                fontSize: '14px',
                                color: colors.gray[600],
                                margin: 0
                            }}>
                                {t('page.subtitle')}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: colors.primaryDark,
                                    color: colors.white,
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: inputFont
                                }}
                            >
                                {isEditMode ? t('page.cancelEdit') : t('page.editProfile')}
                            </button>
                        </div>
                    </div>

                    {/* Profile Overview Card */}
                    <div style={{
                        backgroundColor: colors.white,
                        borderRadius: '12px',
                        padding: '32px',
                        marginBottom: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        display: 'flex',
                        gap: '32px',
                        alignItems: 'center'
                    }}>
                        {/* Profile Photo */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                backgroundColor: colors.accentBlue,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '48px',
                                color: colors.white,
                                fontWeight: '700',
                                border: `4px solid ${colors.border}`,
                                overflow: 'hidden'
                            }}>
                                {userData.profilePhoto ? (
                                    <img
                                        src={userData.profilePhoto}
                                        alt={displayFullName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    displayInitial
                                )}
                            </div>
                            <button style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: colors.accentBlue,
                                border: `2px solid ${colors.white}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: colors.white,
                                transition: 'all 0.2s'
                            }}>
                                <Camera size={18} />
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '12px'
                            }}>
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: colors.primaryDark,
                                    margin: 0
                                }}>
                                    {displayFullName}
                                </h2>
                                {getRoleBadge(displayJobTitle)}
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '12px',
                                marginBottom: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: colors.gray[600] }}>{t('overview.email')}:</span>
                                    <span style={{ fontSize: '14px', color: colors.gray[900], fontWeight: '500' }}>{userData.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: colors.gray[600] }}>{t('overview.phone')}:</span>
                                    <span style={{ fontSize: '14px', color: colors.gray[900], fontWeight: '500', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>{userData.phone}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: colors.gray[600] }}>{t('overview.employeeId')}:</span>
                                    <span style={{ fontSize: '14px', color: colors.gray[900], fontWeight: '500' }}>{userData.employeeId}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: colors.gray[600] }}>{t('overview.accountStatus')}:</span>
                                    {getStatusBadge(userData.accountStatusKey)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Activity Summary */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        {[
                            { label: t('stats.totalActions'), value: userData.totalActions.toString(), icon: Activity, color: colors.accentBlue, isDate: false },
                            { label: t('stats.lastLogin'), value: fmtDate(userData.lastLogin), icon: UserCheck, color: colors.success, isDate: true },
                            { label: t('stats.accountCreated'), value: fmtDate(userData.accountCreated), icon: Calendar, color: colors.info, isDate: true }
                        ].map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    style={{
                                        backgroundColor: colors.white,
                                        borderRadius: '12px',
                                        padding: '20px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        backgroundColor: `${stat.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: stat.color
                                    }}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: index === 0 ? '24px' : '14px',
                                            fontWeight: '700',
                                            color: stat.color,
                                            marginBottom: '4px',
                                            direction: stat.isDate ? 'ltr' : (isRTL ? 'rtl' : 'ltr'),
                                            textAlign: isRTL ? 'right' : 'left'
                                        }}>
                                            {stat.value}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: colors.gray[600]
                                        }}>
                                            {stat.label}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '24px'
                    }}>
                        {/* Personal Information */}
                        <div style={{
                            backgroundColor: colors.white,
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: colors.primaryDark,
                                marginBottom: '20px',
                                margin: '0 0 20px 0'
                            }}>
                                {t('personalInfo.title')}
                            </h3>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                {personalFields.map((input) => (
                                    <div key={input.id}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: colors.gray[700],
                                            marginBottom: '8px'
                                        }}>
                                            {input.label}
                                        </label>
                                        <input
                                            type={input.type}
                                            value={input.kind === 'data' ? (userData[input.field] as string) : input.value}
                                            onChange={input.kind === 'data'
                                                ? (e) => handleInputChange(input.field, e.target.value)
                                                : undefined}
                                            disabled={!isEditMode || input.readOnly}
                                            readOnly={input.kind === 'display'}
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: inputFont,
                                                outline: 'none',
                                                backgroundColor: (isEditMode && !input.readOnly) ? colors.white : colors.gray[50],
                                                color: colors.gray[900],
                                                transition: 'all 0.2s'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {isEditMode && (
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginTop: '20px',
                                    paddingTop: '20px',
                                    borderTop: `1px solid ${colors.border}`
                                }}>
                                    <button
                                        onClick={handleSaveProfile}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            backgroundColor: colors.primaryDark,
                                            color: colors.white,
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            fontFamily: inputFont,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Save size={16} />
                                        {t('actions.save')}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            backgroundColor: colors.gray[200],
                                            color: colors.gray[700],
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            fontFamily: inputFont,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <X size={16} />
                                        {t('actions.cancel')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Change Password */}
                        <div style={{
                            backgroundColor: colors.white,
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '20px'
                            }}>
                                <Lock size={20} color={colors.primaryDark} />
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: colors.primaryDark,
                                    margin: 0
                                }}>
                                    {t('password.title')}
                                </h3>
                            </div>

                            <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
                                {/* New Password */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: colors.gray[700],
                                        marginBottom: '8px'
                                    }}>
                                        {t('password.newPassword')}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwords.new}
                                            onChange={(e) => handlePasswordChange('new', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 40px 10px 14px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: inputFont,
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                position: 'absolute',
                                                [isRTL ? 'left' : 'right']: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: colors.gray[600],
                                                padding: '4px'
                                            }}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwords.new && (
                                        <div style={{ marginTop: '8px' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '4px'
                                            }}>
                                                <div style={{
                                                    flex: 1,
                                                    height: '4px',
                                                    backgroundColor: colors.gray[200],
                                                    borderRadius: '2px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: passwordStrength.width,
                                                        backgroundColor: passwordStrength.color,
                                                        transition: 'all 0.3s'
                                                    }} />
                                                </div>
                                                <span style={{
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: passwordStrength.color
                                                }}>
                                                    {t(`password.strength.${passwordStrength.level}`)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: colors.gray[700],
                                        marginBottom: '8px'
                                    }}>
                                        {t('password.confirmPassword')}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwords.confirm}
                                            onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 40px 10px 14px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: inputFont,
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                position: 'absolute',
                                                [isRTL ? 'left' : 'right']: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: colors.gray[600],
                                                padding: '4px'
                                            }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                padding: '12px',
                                backgroundColor: `${colors.info}10`,
                                borderRadius: '8px',
                                marginBottom: '16px',
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'flex-start'
                            }}>
                                <AlertCircle size={16} color={colors.info} style={{ marginTop: '2px', flexShrink: 0 }} />
                                <p style={{
                                    fontSize: '12px',
                                    color: colors.gray[700],
                                    margin: 0,
                                    lineHeight: '1.5'
                                }}>
                                    {t('password.hint')}
                                </p>
                            </div>

                            <button
                                onClick={handleUpdatePassword}
                                style={{
                                    width: '100%',
                                    padding: '12px 20px',
                                    backgroundColor: colors.accentOrange,
                                    color: colors.white,
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontFamily: inputFont,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Lock size={16} />
                                {t('password.update')}
                            </button>
                        </div>
                    </div>

                    {/* Role & Privileges */}
                    <div style={{
                        backgroundColor: colors.white,
                        borderRadius: '12px',
                        padding: '24px',
                        marginTop: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '20px'
                        }}>
                            <Shield size={20} color={colors.primaryDark} />
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: colors.primaryDark,
                                margin: 0
                            }}>
                                {t('role.title')}
                            </h3>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                fontSize: '14px',
                                color: colors.gray[600],
                                marginBottom: '8px'
                            }}>
                                {t('role.currentRole')}
                            </div>
                            {getRoleBadge(displayJobTitle)}
                        </div>

                        {/* Note: Dynamic privileges list can be added here using `StaffService.getPrivileges` */}
                        {/* Currently just basic layout */}
                        <div style={{
                            padding: '12px',
                            backgroundColor: colors.gray[50],
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: colors.gray[600]
                        }}>
                            {t('role.note')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
