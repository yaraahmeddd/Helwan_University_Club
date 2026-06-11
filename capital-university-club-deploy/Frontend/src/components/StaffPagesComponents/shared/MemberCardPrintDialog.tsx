import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Printer, User, Trophy, Hash, Calendar, IdCard, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/StaffPagesComponents/ui/dialog';
import { Button } from '@/components/StaffPagesComponents/ui/button';
import { adminDialogStyles } from './adminTableStyles';
import {
    RecordViewSection,
    RecordViewField,
} from './RecordViewPrimitives';
import { useLanguage } from '@/hooks/useLanguage';
import {
    MEMBER_CARD_BACK,
    printMemberCard,
    type MemberCardPrintData,
    type MemberCardPrintLabels,
} from '@/utils/memberCardPrint';
import {
    fetchMemberCardPrintData,
    type MemberCardPrintInput,
} from '@/services/memberCardPrintService';

type MemberCardPrintDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    input: MemberCardPrintInput | null;
};

export function MemberCardPrintDialog({
    open,
    onOpenChange,
    input,
}: MemberCardPrintDialogProps) {
    const { t } = useTranslation("common");
    const { language, isRTL } = useLanguage();
    const [printing, setPrinting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [member, setMember] = useState<MemberCardPrintData | null>(null);

    useEffect(() => {
        if (!open || !input) {
            setMember(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        void fetchMemberCardPrintData(input)
            .then((data) => {
                if (!cancelled) setMember(data);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, input]);

    if (!input) return null;

    const displayName = member
        ? (language === "ar" ? member.nameAr : member.nameEn)
        : (language === "ar"
            ? `${input.firstNameAr ?? ""} ${input.lastNameAr ?? ""}`.trim()
            : `${input.firstNameEn ?? ""} ${input.lastNameEn ?? ""}`.trim());
    const displaySport = member
        ? (language === "ar" ? member.sportAr : member.sportEn)
        : (language === "ar" ? input.sportAr : input.sportEn);
    const printLanguage = language === "ar" ? "ar" : "en";

    const labels: MemberCardPrintLabels = {
        documentTitle: t("memberCardPrint.documentTitle"),
        name: t("memberCardPrint.fields.name"),
        memberId: t("memberCardPrint.fields.memberId"),
        sport: t("memberCardPrint.fields.sport"),
        validUntil: t("memberCardPrint.validUntil"),
        execDirector: t("memberCardPrint.execDirector"),
        execDirectorName: t("memberCardPrint.execDirectorName"),
        noCardPresent: t("memberCardPrint.noCardPresent"),
    };

    const handlePrint = async () => {
        if (!member) return;
        setPrinting(true);
        try {
            await printMemberCard(member, labels, printLanguage);
        } finally {
            setPrinting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={adminDialogStyles.content}
                dir={isRTL ? "rtl" : "ltr"}
                lang={language}
            >
                <div className={adminDialogStyles.panel}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
                        <DialogTitle>{t("memberCardPrint.dialogTitle")}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                        {loading ? (
                            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p>{t("memberCardPrint.loading")}</p>
                            </div>
                        ) : (
                            <>
                                <RecordViewSection icon={IdCard} title={t("memberCardPrint.preview.templateTitle")}>
                                    {member?.hasCard && member.cardFrontUrl ? (
                                        <div className="flex flex-wrap gap-6 justify-center">
                                            <div className="space-y-2 text-center">
                                                <p className="text-muted-foreground">{t("memberCardPrint.preview.front")}</p>
                                                <img
                                                    src={member.cardFrontUrl}
                                                    alt={t("memberCardPrint.preview.front")}
                                                    className="max-w-[320px] w-full rounded-xl shadow-md border border-border object-cover"
                                                />
                                            </div>
                                            <div className="space-y-2 text-center">
                                                <p className="text-muted-foreground">{t("memberCardPrint.preview.back")}</p>
                                                <img
                                                    src={MEMBER_CARD_BACK}
                                                    alt={t("memberCardPrint.preview.back")}
                                                    className="max-w-[320px] w-full rounded-xl shadow-md border border-border"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 px-6 py-10 text-center text-muted-foreground">
                                            <IdCard className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                            <p className="font-semibold">{t("memberCardPrint.noCardPresent")}</p>
                                            <p className="text-sm mt-2">{t("memberCardPrint.detailsOnlyHint")}</p>
                                        </div>
                                    )}
                                </RecordViewSection>

                                <RecordViewSection icon={User} title={t("memberCardPrint.preview.memberTitle")}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <RecordViewField icon={User} label={t("memberCardPrint.fields.name")} value={displayName} />
                                        <RecordViewField icon={Trophy} label={t("memberCardPrint.fields.sport")} value={displaySport} />
                                        <RecordViewField
                                            icon={Hash}
                                            label={t("memberCardPrint.fields.memberId")}
                                            value={member?.memberId}
                                            ltr
                                            alignEnd={isRTL}
                                        />
                                        <RecordViewField
                                            icon={Calendar}
                                            label={t("memberCardPrint.fields.endDate")}
                                            value={member?.endDate}
                                            ltr
                                            alignEnd={isRTL}
                                        />
                                    </div>
                                </RecordViewSection>

                                <p className="text-muted-foreground">{t("memberCardPrint.printHint")}</p>
                            </>
                        )}
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border shrink-0 gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={() => void handlePrint()}
                            disabled={printing || loading || !member}
                            className="gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            {printing ? t("memberCardPrint.printing") : t("memberCardPrint.printButton")}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
