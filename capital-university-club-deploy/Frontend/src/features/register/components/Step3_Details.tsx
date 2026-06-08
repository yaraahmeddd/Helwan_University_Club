import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, AlertCircle, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';
import { getLocalizedText } from '../../../lib/localizedDisplay';
import type { RegisterFormValues } from '../schemas/validation';
import { AuthService } from '../../../services/authService';

interface Step3DetailsProps {
    onNext: () => void;
    onPrev: () => void;
    embedded?: boolean;
}

interface Faculty {
    id: number;
    code: string;
    name_en: string;
    name_ar: string;
    created_at?: string;
    updated_at?: string;
}

interface Profession {
    id: number;
    code: string;
    name: string;
}

interface InputGroupProps {
    label: string;
    error?: FieldError;
    children: ReactNode;
    className?: string;
}

/**
 * Input Group Component
 */
const InputGroup = ({ label, error, children, className = '' }: InputGroupProps) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {children}
        <AnimatePresence>
            {error && (
                <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-xs flex items-center gap-1 font-medium"
                >
                    <AlertCircle size={12} /> {error.message}
                </motion.span>
            )}
        </AnimatePresence>
    </div>
);

/**
 * Navigation Buttons Component
 */
const NavigationButtons = ({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) => {
    const { t } = useTranslation('register');
    const { isRTL } = useLanguage();
    const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
    const NextIcon = isRTL ? ChevronLeft : ChevronRight;

    return (
        <div className="flex justify-between mt-12 pt-6 border-t border-gray-100">
            <button
                onClick={onPrev}
                type="button"
                className="px-8 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors flex items-center gap-2"
            >
                <PrevIcon size={20} /> {t('nav.prev')}
            </button>
            <button
                onClick={onNext}
                type="button"
                className="px-8 py-3 rounded-xl bg-[#2596be] hover:bg-[#1a7a9a] text-white font-bold shadow-lg shadow-[#2596be]/20 transition-all flex items-center gap-2"
            >
                {t('nav.next')} <NextIcon size={20} />
            </button>
        </div>
    );
};

/**
 * Step 3: Detailed Information (Dynamic)
 * 
 * Renders category-specific fields based on the selected membership type.
 * Fetches dynamic data (faculties, universities, professions) from the backend.
 */
export const Step3Details = ({ onNext, onPrev, embedded = false }: Step3DetailsProps) => {
    const { t } = useTranslation('register');
    const { language } = useLanguage();
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<RegisterFormValues>();

    const category = watch('category');
    const categoryLabel = t(`step3.categories.${category ?? 'default'}`, { defaultValue: t('step3.categories.default') });
    const selectedDuration = watch('seasonalDuration');

    // Dynamic Data State
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [professions, setProfessions] = useState<Profession[]>([]);

    const inputClasses = `
    w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
    focus:bg-white focus:border-[#2596be] focus:ring-4 focus:ring-[#2596be]/10 
    transition-all duration-200 outline-none placeholder:text-gray-400 text-gray-800
  `;

    // Fetch Dynamic Data on Mount
    useEffect(() => {
        // Initialize Mock Professions
        setProfessions([
            { id: 1, code: 'PROF', name: t('step3.professions.PROF') },
            { id: 2, code: 'TA', name: t('step3.professions.TA') },
            { id: 3, code: 'STAFF', name: t('step3.professions.STAFF') },
        ]);

        // Fetch Faculties from Backend
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            const response = await AuthService.getFaculties();
            if (response.success && response.data) {
                setFaculties(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch faculties:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
        >
            <h3 className="text-2xl font-bold text-[#1a5f7a] mb-8 flex items-center gap-3">
                <div className="p-2 bg-[#e8f4f8] rounded-lg">
                    <Building2 className="text-[#2596be]" />
                </div>
                {t('step3.title')}{' '}
                <span className="text-gray-400 text-lg font-normal">({categoryLabel})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <InputGroup label={t('step3.address')} error={errors.address}>
                        <input {...register('address')} className={inputClasses} />
                    </InputGroup>
                </div>

                {/* ====================================================================== */}
                {/* STUDENT Fields */}
                {/* ====================================================================== */}
                {category === 'student' && (
                    <>
                        <InputGroup label={t('step3.faculty')} error={errors.facultyId}>
                            <select {...register('facultyId')} className={inputClasses}>
                                <option value="">{t('step3.selectFaculty')}</option>
                                {faculties.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {getLocalizedText(f.name_ar, f.name_en, language)}
                                    </option>
                                ))}
                            </select>
                        </InputGroup>

                        <InputGroup label={t('step3.graduationYear')} error={errors.graduationYear}>
                            <input
                                type="number"
                                {...register('graduationYear')}
                                className={inputClasses}
                                placeholder="YYYY"
                            />
                            <p className="text-xs text-gray-400 mt-1">{t('step3.graduationHint')}</p>
                        </InputGroup>
                    </>
                )}

                {/* ====================================================================== */}
                {/* STAFF Fields */}
                {/* ====================================================================== */}
                {category === 'staff' && (
                    <>
                        <InputGroup label={t('step3.profession')} error={errors.professionId}>
                            <select {...register('professionId')} className={inputClasses}>
                                <option value="">{t('step3.selectProfession')}</option>
                                {professions.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </InputGroup>

                        <InputGroup label={t('step3.department')} error={errors.department}>
                            <input {...register('department')} className={inputClasses} />
                        </InputGroup>

                        <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <InputGroup label={t('step3.salary')} error={errors.salary}>
                                <div className="relative">
                                    <input
                                        type="number"
                                        {...register('salary')}
                                        className={`${inputClasses} bg-white`}
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-4 top-3 text-gray-400 text-sm font-bold">EGP</span>
                                </div>
                            </InputGroup>
                            <p className="text-sm text-blue-600 mt-3 flex items-center gap-2">
                                <AlertCircle size={16} /> {t('step3.salaryTierHint')}
                            </p>
                        </div>
                    </>
                )}

                {/* ====================================================================== */}
                {/* RETIRED Fields */}
                {/* ====================================================================== */}
                {category === 'retired' && (
                    <>
                        <InputGroup label={t('step3.departmentRetired')} error={errors.department}>
                            <input type="text" placeholder={t('step3.departmentPlaceholder')} {...register('department')} className={inputClasses} />
                        </InputGroup>

                        <InputGroup label={t('step3.retirementDate')} error={errors.retirementDate}>
                            <input type="date" {...register('retirementDate')} className={inputClasses} />
                        </InputGroup>

                        <InputGroup label={t('step3.lastSalary')} error={errors.salary}>
                            <input type="number" {...register('salary')} className={inputClasses} />
                        </InputGroup>

                        <InputGroup label={t('step3.professionBefore')} error={errors.professionCode}>
                            <select {...register('professionCode')} className={inputClasses}>
                                <option value="">{t('step3.selectProfession')}</option>
                                <option value="RETIRED_PROF">{t('step3.retiredProf')}</option>
                                <option value="RETIRED_STAFF">{t('step3.retiredStaff')}</option>
                            </select>
                        </InputGroup>
                    </>
                )}

                {/* ====================================================================== */}
                {/* FOREIGNER Fields */}
                {/* ====================================================================== */}
                {category === 'foreigner' && (
                    <>
                        <InputGroup label={t('step3.seasonalDuration')} error={errors.seasonalDuration}>
                            <select {...register('seasonalDuration')} className={inputClasses}>
                                <option value="1">{t('step3.duration1Month')}</option>
                                <option value="6">{t('step3.duration6Months')}</option>
                                <option value="12">{t('step3.duration12Months')}</option>
                            </select>
                        </InputGroup>

                        <InputGroup label={t('step3.visaStatus')} error={errors.visaStatus}>
                            <select {...register('visaStatus')} className={inputClasses}>
                                <option value="valid">{t('step3.visaValid')}</option>
                                <option value="pending">{t('step3.visaPending')}</option>
                            </select>
                        </InputGroup>

                        {selectedDuration === '12' && (
                            <div className="md:col-span-2 text-sm text-green-700 bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-2">
                                <Check size={18} className="text-green-600" />
                                {t('step3.installmentHint')}
                            </div>
                        )}
                    </>
                )}

                {/* ====================================================================== */}
                {/* DEPENDENT Fields */}
                {/* ====================================================================== */}
                {category === 'dependent' && (
                    <>
                        <InputGroup
                            label={t('step3.relatedMemberId')}
                            className="md:col-span-2"
                            error={errors.relatedMemberId}
                        >
                            <input
                                {...register('relatedMemberId')}
                                className={inputClasses}
                                placeholder={t('step3.relatedMemberPlaceholder')}
                            />
                        </InputGroup>

                        <InputGroup label={t('step3.relationshipType')} error={errors.relationshipType}>
                            <select {...register('relationshipType')} className={inputClasses}>
                                <option value="spouse">{t('step3.relationshipSpouse')}</option>
                                <option value="child">{t('step3.relationshipChild')}</option>
                                <option value="parent">{t('step3.relationshipParent')}</option>
                            </select>
                        </InputGroup>

                        <div className="md:col-span-2 text-sm text-[#2596be] bg-[#e8f4f8] p-4 rounded-xl border border-[#2596be]/20 flex items-center gap-2">
                            <Check size={18} /> {t('step3.dependentDiscountHint')}
                        </div>
                    </>
                )}

                {/* ====================================================================== */}
                {/* VISITOR Fields (Minimal - just address required) */}
                {/* ====================================================================== */}
                {category === 'visitor' && (
                    <div className="md:col-span-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-2">
                        <Check size={18} className="text-gray-500" />
                        {t('step3.visitorFeeHint')}
                    </div>
                )}
            </div>

            {!embedded && <NavigationButtons onPrev={onPrev} onNext={onNext} />}
        </motion.div>
    );
};
