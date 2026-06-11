import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';
import { useLanguage } from '@/hooks/useLanguage';

interface RegisterWizardRoleNavProps {
    onPrev: () => void;
    onNext: () => void;
    disablePrev?: boolean;
}

/** Prev/Next bar shown on the membership-type step (step 1), matching public registration. */
export function RegisterWizardRoleNav({ onPrev, onNext, disablePrev = false }: RegisterWizardRoleNavProps) {
    const { t } = useLocalizedTranslation('register');
    const { isRTL } = useLanguage();
    const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
    const NextIcon = isRTL ? ChevronLeft : ChevronRight;

    return (
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
            <button
                type="button"
                onClick={onPrev}
                disabled={disablePrev}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    disablePrev
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
            >
                <PrevIcon size={18} /> {t('nav.prev')}
            </button>
            <button
                type="button"
                onClick={onNext}
                className="px-6 py-2.5 rounded-xl bg-[#2596be] hover:bg-[#1a7a9a] text-white font-bold shadow-lg shadow-[#2596be]/20 transition-all flex items-center gap-2"
            >
                {t('nav.next')} <NextIcon size={18} />
            </button>
        </div>
    );
}
