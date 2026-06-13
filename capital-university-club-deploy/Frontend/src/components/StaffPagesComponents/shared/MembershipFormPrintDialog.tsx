import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Printer } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/StaffPagesComponents/ui/dialog';
import { Button } from '@/components/StaffPagesComponents/ui/button';
import { adminDialogStyles } from './adminTableStyles';
import { useLanguage } from '@/hooks/useLanguage';
import { MembershipFormView } from './MembershipFormView';
import {
    fetchMembershipFormData,
    membershipFormFromRegistration,
    type MembershipFormPrintInput,
} from '@/services/membershipFormPrintService';
import { printMembershipForm, type MembershipFormData } from '@/utils/membershipFormPrint';

export type MembershipFormPrintDialogInput =
    | ({ mode: 'fetch' } & MembershipFormPrintInput)
    | {
        mode: 'inline';
        data: MembershipFormData;
    };

type MembershipFormPrintDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    input: MembershipFormPrintDialogInput | null;
};

export function MembershipFormPrintDialog({
    open,
    onOpenChange,
    input,
}: MembershipFormPrintDialogProps) {
    const { t } = useTranslation('common');
    const { language, isRTL } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [formData, setFormData] = useState<MembershipFormData | null>(null);

    useEffect(() => {
        if (!open || !input) {
            setFormData(null);
            return;
        }

        if (input.mode === 'inline') {
            setFormData(input.data);
            return;
        }

        let cancelled = false;
        setLoading(true);
        void fetchMembershipFormData(input)
            .then((data) => {
                if (!cancelled) setFormData(data);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, input]);

    const handlePrint = async () => {
        if (!formData) return;
        setPrinting(true);
        try {
            await printMembershipForm(formData);
        } finally {
            setPrinting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`${adminDialogStyles.content} max-w-4xl`}
                dir={isRTL ? 'rtl' : 'ltr'}
                lang={language}
            >
                <div className={adminDialogStyles.panel}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
                        <DialogTitle>{t('membershipFormPrint.dialogTitle')}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0 bg-muted/20">
                        {loading ? (
                            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p>{t('membershipFormPrint.loading')}</p>
                            </div>
                        ) : formData ? (
                            <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
                                <MembershipFormView data={formData} />
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border shrink-0 gap-2">
                        <p className="text-xs text-muted-foreground me-auto hidden sm:block">
                            {t('membershipFormPrint.printHint')}
                        </p>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            {t('cancel')}
                        </Button>
                        <Button
                            onClick={() => void handlePrint()}
                            disabled={printing || loading || !formData}
                            className="gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            {printing ? t('membershipFormPrint.printing') : t('membershipFormPrint.printButton')}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { membershipFormFromRegistration };
