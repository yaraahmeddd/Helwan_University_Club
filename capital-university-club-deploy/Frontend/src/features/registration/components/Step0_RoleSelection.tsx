import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, AlertCircle } from 'lucide-react';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import type { RegisterFormValues, MemberRole } from '../schemas/validation';

const ROLE_IDS: MemberRole[] = ['social_member', 'sports_player'];

const ROLE_ICONS = {
    social_member: Users,
    sports_player: Trophy,
} as const;

interface Step0RoleSelectionProps {
    /** When set (staff flows), only this role is shown and pre-selected */
    fixedRole?: MemberRole;
}

/**
 * Step 1: Membership type — club member vs team player (localized).
 */
type RoleFieldProps = {
    field: { value: MemberRole; onChange: (v: MemberRole) => void };
    fixedRole?: MemberRole;
    errorMessage?: string;
};

const RoleSelectionContent = ({ field, fixedRole, errorMessage }: RoleFieldProps) => {
    const { t } = useLocalizedTranslation('register');
    const { isRTL } = useLanguage();
    const visibleRoles = fixedRole ? [fixedRole] : ROLE_IDS;

    useEffect(() => {
        if (fixedRole && field.value !== fixedRole) {
            field.onChange(fixedRole);
        }
    }, [fixedRole, field]);

    return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <div className="text-center mb-5">
                            <h2 className="text-xl md:text-2xl font-bold text-[#1a5f7a] mb-1">
                                {t('step0.title')}
                            </h2>
                            <p className="text-gray-500 text-xs md:text-sm">
                                {t('step0.subtitle')}
                            </p>
                        </div>

                        <div className={`grid gap-4 ${visibleRoles.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                            {visibleRoles.map((roleId) => {
                                const isSelected = field.value === roleId;
                                const Icon = ROLE_ICONS[roleId];

                                return (
                                    <motion.button
                                        key={roleId}
                                        type="button"
                                        onClick={() => field.onChange(roleId)}
                                        whileHover={{ scale: fixedRole ? 1 : 1.02 }}
                                        whileTap={{ scale: fixedRole ? 1 : 0.98 }}
                                        className={`
                                            relative p-4 md:p-5 rounded-3xl border-4 transition-all duration-300
                                            text-start cursor-pointer
                                            ${isSelected
                                                ? 'border-[#2596be] bg-[#e8f4f8] shadow-2xl ring-4 ring-[#2596be]/20'
                                                : 'border-gray-200 bg-white hover:border-gray-300 shadow-xl'
                                            }
                                        `}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-4 end-4 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                                            >
                                                <span className="text-white font-bold">✓</span>
                                            </motion.div>
                                        )}

                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                                            isSelected ? 'bg-[#e8f4f8] text-[#2596be]' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            <Icon size={28} />
                                        </div>

                                        <h3 className={`text-lg md:text-xl font-bold mb-1 ${isSelected ? 'text-[#1a5f7a]' : 'text-gray-800'}`}>
                                            {t(`step0.roles.${roleId}.title`)}
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-3">{t(`step0.roles.${roleId}.subtitle`)}</p>
                                        <p className="text-sm text-gray-600 mb-3">{t(`step0.roles.${roleId}.description`)}</p>

                                        <div className="flex flex-wrap gap-2">
                                            {(t(`step0.roles.${roleId}.features`, { returnObjects: true }) as string[]).map((feature) => (
                                                <span
                                                    key={feature}
                                                    className={`text-xs px-2.5 py-1 rounded-full ${
                                                        isSelected ? 'bg-[#e8f4f8] text-[#2596be]' : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <AnimatePresence>
                            {errorMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center gap-2 text-red-500 text-sm"
                                >
                                    <AlertCircle size={16} />
                                    <span>{errorMessage}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {field.value === 'sports_player' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-[#2596be]/10 border border-[#2596be]/20 rounded-2xl p-3 text-[#1a5f7a] text-sm text-center"
                                >
                                    🏆 {t('step0.playerNote')}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
    );
};

const Step0_RoleSelection = ({ fixedRole }: Step0RoleSelectionProps) => {
    const { control, formState: { errors } } = useFormContext<RegisterFormValues>();

    return (
        <Controller
            name="memberRole"
            control={control}
            render={({ field }) => (
                <RoleSelectionContent
                    field={field}
                    fixedRole={fixedRole}
                    errorMessage={errors.memberRole?.message}
                />
            )}
        />
    );
};

export default Step0_RoleSelection;
