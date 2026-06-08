/**
 * Staff-side registration for SOCIAL MEMBERS.
 * Flow: Category → Basic → Details → Documents
 */
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { registerSchema, type RegisterFormValues } from '../features/register/schemas/validation';
import { prepareSubmissionData, debugFormData, type FileUploadMap } from '../features/register/utils/submissionFactory';
import { AuthService } from '../services/authService';
import { RegisterStepIndicator } from '../features/register/components/RegisterStepIndicator';
import { StaffRegisterWizardSteps } from '../features/register/components/StaffRegisterWizardSteps';
import {
    STAFF_WIZARD_STEP_FIELDS,
    getNextStaffWizardStep,
    getPrevStaffWizardStep,
} from '../features/register/registerWizardConfig';
import api from '../services/axios';
import { useToast } from '../components/StaffPagesComponents/ui/use-toast';
import { useLanguage } from '../hooks/useLanguage';
import { buildPersonName } from '../lib/localizedDisplay';
import { StaffSubmittingOverlay } from '../components/StaffPagesComponents/shared/StaffSubmittingOverlay';

const mapToBasicDTO = (data: RegisterFormValues) => {
    const idNumber = data.nationalId?.trim() || data.passportNumber?.trim() || '';
    const membershipTypeMap: Record<string, string> = {
        regular: 'VISITOR',
        visitor: 'VISITOR',
        staff: 'WORKING',
        student: 'STUDENT',
        dependent: 'DEPENDENT',
        foreigner: 'FOREIGNER',
        retired: 'WORKING',
    };
    const membership_type_code = membershipTypeMap[data.category as string] || 'VISITOR';
    return {
        role: 'member',
        email: data.email.trim(),
        first_name_en: data.first_name_en.trim(),
        first_name_ar: data.first_name_ar.trim(),
        last_name_en: data.last_name_en.trim(),
        last_name_ar: data.last_name_ar.trim(),
        phone: data.phone.trim(),
        national_id: idNumber,
        gender: data.gender,
        nationality: data.nationality || 'Egyptian',
        birthdate: data.dob,
        password: data.password,
        membership_type_code,
    };
};

const SuccessScreen = ({
    name, memberId, onAddAnother,
}: { name: string; memberId: number; onAddAnother: () => void }) => {
    const { t } = useTranslation('StaffAddMemberPage');
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border shadow-lg p-10 text-center flex flex-col items-center gap-6 max-w-lg mx-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-2">{t('success.title')}</h2>
                <p className="text-muted-foreground text-sm">
                    {t('success.description', { name })}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
                    <CheckCircle2 size={14} />
                    {t('success.activeBadge', { id: memberId })}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button
                    onClick={onAddAnother}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-background hover:bg-muted font-semibold text-sm transition-colors"
                >
                    <RotateCcw size={15} /> {t('success.addAnother')}
                </button>
                <button
                    onClick={() => navigate('/staff/dashboard/members/manage')}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors shadow"
                >
                    {t('success.manageMembers')} <ArrowRight size={15} className={isRTL ? 'rotate-180' : ''} />
                </button>
            </div>
        </motion.div>
    );
};

const StaffAddMemberPage = () => {
    const { t } = useTranslation('StaffAddMemberPage');
    const { t: tReg } = useTranslation('register');
    const { language, isRTL } = useLanguage();
    const [step, setStep] = useState(0);
    const [files, setFiles] = useState<FileUploadMap>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<{ name: string; id: number } | null>(null);
    const { toast } = useToast();

    const methods = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema) as never,
        mode: 'onBlur',
        defaultValues: {
            memberRole: 'social_member',
            selectedSports: [],
            category: 'student',
            citizenship_type: 'egyptian',
            first_name_ar: '', last_name_ar: '', first_name_en: '', last_name_en: '',
            fullName: '', dob: '', gender: 'male', phone: '', email: '',
            password: '', confirmPassword: '', address: '',
            nationality: 'Egyptian', nationalId: '', passportNumber: '',
            universityId: '', facultyId: '', graduationYear: '',
            professionId: '', department: '', salary: '',
            professionCode: 'RETIRED_PROF', retirementDate: '',
            seasonalDuration: '1', visaStatus: 'valid', paymentType: 'full',
            relatedMemberId: '', relationshipType: 'spouse', visitor_type: 'VISITOR',
        },
    });

    const { handleSubmit, trigger, reset } = methods;

    const nextStep = async () => {
        const fields = STAFF_WIZARD_STEP_FIELDS[step] ?? [];
        if (fields.length === 0) {
            setStep(getNextStaffWizardStep);
            return;
        }
        const ok = await trigger(fields);
        if (ok) setStep(getNextStaffWizardStep);
    };

    const prevStep = () => setStep(getPrevStaffWizardStep);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof FileUploadMap) => {
        if (e.target.files?.[0]) setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    };

    const handleAddAnother = () => {
        reset();
        setFiles({});
        setStep(0);
        setSuccessData(null);
    };

    const activateMember = async (memberId: number) => {
        try {
            await api.patch(`/members/${memberId}/status`, { status: 'active' });
        } catch (err) {
            console.warn('Could not auto-activate; staff can activate manually.', err);
        }
    };

    const onSubmit = async (data: RegisterFormValues): Promise<void> => {
        setIsSubmitting(true);
        try {
            let essentialFiles: readonly string[] = ['photo', 'id_front', 'id_back', 'medical'];
            if (data.category === 'foreigner') essentialFiles = ['photo', 'passport', 'medical'];
            const missingFiles = essentialFiles.filter(k => !files[k as keyof typeof files]);
            if (missingFiles.length > 0) {
                const names = missingFiles.map(f => tReg(`files.${f}`, { defaultValue: f }));
                throw new Error(tReg('errors.missingFiles', { list: names.join(', ') }));
            }

            const basicData = mapToBasicDTO(data);
            const basicRes = await AuthService.registerBasic(basicData);
            if (!basicRes.success || !basicRes.data) throw new Error(basicRes.message || t('errors.basicFailed'));

            const memberId = basicRes.data.member_id || basicRes.data.team_member_id;
            const accountId: number = basicRes.data.account_id;
            if (!memberId) throw new Error(t('errors.noMemberId'));

            try {
                const determinationData = {
                    member_id: memberId,
                    is_student: data.category === 'student',
                    is_working: data.category === 'staff',
                    is_foreign: data.category === 'foreigner',
                    is_graduated: false,
                    has_relation: data.category === 'dependent',
                    is_retired: data.category === 'retired',
                    is_sports_player: false,
                    selected_sports: [],
                    relation_member_id: data.category === 'dependent' ? Number(data.relatedMemberId) : undefined,
                };
                const determineRes = await AuthService.determineMembership(determinationData);

                const { endpoint, formData } = prepareSubmissionData(data, memberId, files);
                debugFormData(formData);
                await AuthService.submitDetailedInfo(endpoint, formData);

                await AuthService.completeRegistration({
                    member_id: memberId,
                    membership_plan_code: determineRes.data?.next_step || 'FULL_ACCESS',
                });

                await activateMember(memberId);

                const { primary: displayName } = buildPersonName({
                    firstNameAr: data.first_name_ar,
                    lastNameAr: data.last_name_ar,
                    firstNameEn: data.first_name_en,
                    lastNameEn: data.last_name_en,
                }, language);

                setSuccessData({ name: displayName, id: memberId });
                toast({ title: t('toast.added'), description: t('toast.addedDesc', { name: displayName }) });

            } catch (postBasicError: unknown) {
                console.error('Post-basic step failed — rolling back account:', accountId, postBasicError);
                await AuthService.rollbackRegistration(accountId);
                throw postBasicError;
            }

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : t('errors.generic');
            toast({ title: t('toast.error'), description: msg, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successData) {
        return (
            <div className="h-full overflow-y-auto p-6 pb-8 bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
                <SuccessScreen name={successData.name} memberId={successData.id} onAddAnother={handleAddAnother} />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto flex flex-col bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="px-6 py-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary shrink-0" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('header.title')}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">{t('header.subtitle')}</p>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm w-fit">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{t('badge.staffRegistration')}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-8">
                <div className="max-w-5xl mx-auto">
                    <FormProvider {...methods}>
                        <RegisterStepIndicator currentStep={step} />
                        <form onSubmit={handleSubmit((d: RegisterFormValues) => onSubmit(d))}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <StaffRegisterWizardSteps
                                        step={step}
                                        files={files}
                                        onFileChange={handleFileChange}
                                        onNext={nextStep}
                                        onPrev={prevStep}
                                        onSubmit={handleSubmit((d: RegisterFormValues) => onSubmit(d)) as unknown as () => void}
                                        isSubmitting={isSubmitting}
                                        categoryHint={tReg('step1.hint')}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </form>
                    </FormProvider>
                </div>
            </div>

            <AnimatePresence>
                {isSubmitting && <StaffSubmittingOverlay namespace="StaffAddMemberPage" />}
            </AnimatePresence>
        </div>
    );
};

export default StaffAddMemberPage;
