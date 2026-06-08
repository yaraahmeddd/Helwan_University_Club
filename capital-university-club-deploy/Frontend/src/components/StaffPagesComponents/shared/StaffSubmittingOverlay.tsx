import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocalizedTranslation } from '../../../hooks/useLocalizedTranslation';

type StaffSubmittingOverlayProps = {
    namespace: 'StaffAddMemberPage' | 'StaffAddTeamMemberPage';
};

/**
 * Full-screen submitting overlay — text follows the active dashboard language.
 */
export function StaffSubmittingOverlay({ namespace }: StaffSubmittingOverlayProps) {
    const { t, language, isRTL } = useLocalizedTranslation(namespace);

    const title = t('overlay.title');
    const subtitle = t('overlay.subtitle');

    return (
        <motion.div
            key={language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
            dir={isRTL ? 'rtl' : 'ltr'}
            lang={language}
        >
            <div className="bg-card rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 border border-border">
                <Loader2 className="w-12 h-12 text-primary animate-spin" aria-hidden />
                <div className="text-center" role="status" aria-live="polite">
                    <p className="font-bold text-lg">{title}</p>
                    <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
                </div>
            </div>
        </motion.div>
    );
}
