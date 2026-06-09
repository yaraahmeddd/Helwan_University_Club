/**
 * Staff-side registration for SPORTS PLAYERS (team members).
 * Flow: Category → Basic → Details → Documents
 */
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { type RegisterFormValues } from '../features/register/schemas/validation';
import { useRegisterSchema } from '../hooks/useValidation';
import { type FileUploadMap } from '../features/register/utils/submissionFactory';
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
    return {
        role: 'team_member' as const,
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
        membership_type_code: 'VISITOR',
    };
};

const SuccessScreen = ({
    name, memberId, onAddAnother,
}: { name: string; memberId: number; onAddAnother: () => void }) => {
    const { t } = useTranslation('StaffAddTeamMemberPage');
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border shadow-lg p-10 text-center flex flex-col items-center gap-6 max-w-lg mx-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-2">{t('success.title')}</h2>
                <p className="text-muted-foreground text-sm">
                    {t('success.description', { name })}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-full text-sm font-semibold border border-primary/30">
                    <Trophy size={14} />
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
                    onClick={() => navigate('/staff/dashboard/members/sports')}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors shadow"
                >
                    {t('success.managePlayers')} <ArrowRight size={15} className={isRTL ? 'rotate-180' : ''} />
                </button>
            </div>
        </motion.div>
    );
};

const StaffAddTeamMemberPage = () => {
    const { t } = useTranslation('StaffAddTeamMemberPage');
    const { t: tReg } = useTranslation('register');
    const { language, isRTL } = useLanguage();
    const [step, setStep] = useState(0);
    const [files, setFiles] = useState<FileUploadMap>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<{ name: string; id: number } | null>(null);
    const { toast } = useToast();

    const registerSchema = useRegisterSchema();

    const methods = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema) as never,
        mode: 'onBlur',
        defaultValues: {
            memberRole: 'sports_player',
            selectedSports: [],
            category: 'visitor',
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

    const activateTeamMember = async (teamMemberId: number) => {
        try {
            await api.post(`/team-members/${teamMemberId}/approve`);
        } catch (err) {
            console.warn('Could not auto-activate team member; staff can activate manually.', err);
        }
    };

    const onSubmit = async (data: RegisterFormValues): Promise<void> => {
        setIsSubmitting(true);
        try {
            const essentialFiles = ['photo', 'id_front', 'id_back', 'medical', 'proof'] as const;
            const missingFiles = essentialFiles.filter(k => !files[k]);
            if (missingFiles.length > 0) {
                const names = missingFiles.map(f => tReg(`files.${f}`, { defaultValue: f }));
                throw new Error(tReg('errors.missingFiles', { list: names.join(', ') }));
            }

            const basicData = mapToBasicDTO(data);
            const basicRes = await AuthService.registerBasic(basicData);
            if (!basicRes.success || !basicRes.data) throw new Error(basicRes.message || t('errors.basicFailed'));

            const memberId = basicRes.data.team_member_id || basicRes.data.member_id;
            const accountId: number = basicRes.data.account_id;
            if (!memberId) throw new Error(t('errors.noMemberId'));

            try {
                const determinationData = {
                    member_id: memberId,
                    is_student: data.category === 'student',
                    is_working: data.category === 'staff',
                    is_foreign: data.category === 'foreigner',
                    is_graduated: false,
                    has_relation: false,
                    is_retired: data.category === 'retired',
                    is_sports_player: true,
                    selected_sports: [],
                };
                const determineRes = await AuthService.determineMembership(determinationData);

                const teamFormData = new FormData();
                teamFormData.append('member_id', String(memberId));
                if (data.address) teamFormData.append('address', data.address);

                if (files.photo) teamFormData.append('personal_photo', files.photo);
                if (files.id_front) teamFormData.append('national_id_front', files.id_front);
                if (files.id_back) teamFormData.append('national_id_back', files.id_back);
                if (files.medical) teamFormData.append('medical_report', files.medical);
                if (files.proof) teamFormData.append('proof', files.proof);

                if (!files.id_front && files.national_id_front) teamFormData.append('national_id_front', files.national_id_front);
                if (!files.id_back && files.national_id_back) teamFormData.append('national_id_back', files.national_id_back);

                await AuthService.submitTeamMemberDetails(teamFormData);

                await AuthService.completeRegistration({
                    member_id: memberId,
                    membership_plan_code: determineRes.data?.next_step || 'FULL_ACCESS',
                });

                await activateTeamMember(memberId);

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
                    <Trophy className="w-6 h-6 text-primary shrink-0" />
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

            <div className="flex-1 overflow-y-auto p-6 pb-10">
                <div className="max-w-6xl mx-auto staff-register-wizard">
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
                {isSubmitting && <StaffSubmittingOverlay namespace="StaffAddTeamMemberPage" />}
            </AnimatePresence>
        </div>
    );
};

export default StaffAddTeamMemberPage;
