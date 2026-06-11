import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';
import { useLanguage } from '@/hooks/useLanguage';

const STAFF_STEP_KEYS = ['category', 'basicInfo', 'details', 'documents'] as const;

interface RegisterStepIndicatorProps {
    currentStep: number;
}

/** Four-step progress stepper for staff add-member flows (localized). */
export function RegisterStepIndicator({ currentStep }: RegisterStepIndicatorProps) {
    const { t } = useLocalizedTranslation('register');
    const { isRTL } = useLanguage();

    const totalSteps = STAFF_STEP_KEYS.length;

    return (
        <div className="w-full max-w-3xl mx-auto mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="relative flex justify-between items-center z-0">
                <div className="absolute top-5 start-0 end-0 h-1.5 bg-gray-200 -z-10 rounded-full" />
                <motion.div
                    className="absolute top-5 start-0 h-1.5 bg-[#2596be] -z-10 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0}%` }}
                    transition={{ duration: 0.5, ease: 'circOut' }}
                />
                {STAFF_STEP_KEYS.map((key, index) => (
                    <div key={key} className="flex flex-col items-center gap-2 bg-transparent">
                        <motion.div
                            animate={{ scale: currentStep === index ? 1.15 : 1 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 bg-white transition-colors ${
                                currentStep >= index
                                    ? 'border-[#2596be] text-[#2596be]'
                                    : 'border-gray-300 text-gray-300'
                            }`}
                        >
                            {currentStep > index ? <Check size={18} strokeWidth={3} /> : index + 1}
                        </motion.div>
                        <span
                            className={`text-xs font-bold whitespace-nowrap max-w-[5.5rem] text-center leading-tight ${
                                currentStep >= index ? 'text-[#1a5f7a]' : 'text-gray-400'
                            }`}
                        >
                            {t(`steps.${key}`)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
