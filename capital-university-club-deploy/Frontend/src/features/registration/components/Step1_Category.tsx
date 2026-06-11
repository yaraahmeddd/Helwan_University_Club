import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    Briefcase,
    GraduationCap,
    UserCheck,
    Plane,
    Users,
    HeartHandshake,
} from 'lucide-react';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import type { RegisterFormValues } from '../schemas/validation';

interface Step1CategoryProps {
    onNext: () => void;
}

const CATEGORY_IDS = ['staff', 'student', 'retired', 'dependent', 'foreigner', 'visitor'] as const;

const CATEGORY_ICONS = {
    staff: Briefcase,
    student: GraduationCap,
    retired: UserCheck,
    dependent: HeartHandshake,
    foreigner: Plane,
    visitor: Users,
} as const;

const CATEGORY_ICON_BG: Record<(typeof CATEGORY_IDS)[number], string> = {
    staff: 'bg-blue-50',
    student: 'bg-emerald-50',
    retired: 'bg-purple-50',
    dependent: 'bg-pink-50',
    foreigner: 'bg-orange-50',
    visitor: 'bg-gray-50',
};

const CATEGORY_ICON_COLOR: Record<(typeof CATEGORY_IDS)[number], string> = {
    staff: 'text-blue-600',
    student: 'text-emerald-600',
    retired: 'text-purple-600',
    dependent: 'text-pink-600',
    foreigner: 'text-orange-600',
    visitor: 'text-gray-600',
};

export const Step1Category = ({ onNext }: Step1CategoryProps) => {
    const { t } = useLocalizedTranslation('register');
    const { isRTL } = useLanguage();
    const { watch, setValue } = useFormContext<RegisterFormValues>();
    const category = watch('category');

    const handleCategorySelect = (selectedCategory: RegisterFormValues['category']) => {
        setValue('category', selectedCategory);
        onNext();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {CATEGORY_IDS.map((id) => {
                const Icon = CATEGORY_ICONS[id];
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => handleCategorySelect(id)}
                        className={`group relative flex flex-col items-center p-6 rounded-3xl transition-all duration-300 border-2
            bg-white hover:shadow-xl hover:-translate-y-1
            ${category === id ? 'border-[#2596be] ring-2 ring-[#2596be]/10 shadow-lg' : 'border-transparent shadow-sm hover:border-[#2596be]/40'}`}
                    >
                        <div className={`w-20 h-20 mb-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${CATEGORY_ICON_BG[id]}`}>
                            <Icon className={`w-10 h-10 ${CATEGORY_ICON_COLOR[id]}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {t(`step1.categories.${id}.title`)}
                        </h3>
                        <p className="text-gray-500 text-sm text-center leading-relaxed">
                            {t(`step1.categories.${id}.desc`)}
                        </p>
                    </button>
                );
            })}
        </motion.div>
    );
};
