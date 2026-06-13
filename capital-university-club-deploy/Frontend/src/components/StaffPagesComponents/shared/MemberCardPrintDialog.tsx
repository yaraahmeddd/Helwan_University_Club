import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Printer,
    User,
    Trophy,
    Calendar,
    IdCard,
    Loader2,
    Briefcase,
    Save,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/StaffPagesComponents/ui/dialog';
import { Button } from '@/components/StaffPagesComponents/ui/button';
import { Switch } from '@/components/StaffPagesComponents/ui/switch';
import { Label } from '@/components/StaffPagesComponents/ui/label';
import { adminDialogStyles } from './adminTableStyles';
import {
    RecordViewSection,
    RecordViewField,
} from './RecordViewPrimitives';
import { useLanguage } from '@/hooks/useLanguage';
import {
    CARD_PRINT_LABELS_AR,
    getMemberCardFooterPreference,
    printMemberCard,
    setMemberCardFooterPreference,
    type MemberCardPrintData,
} from '@/utils/memberCardPrint';
import { MemberCardPrintPreview } from './MemberCardPrintPreview';
import {
    fetchMemberCardPrintData,
    type MemberCardPrintInput,
} from '@/services/memberCardPrintService';

type MemberCardPrintDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    input: MemberCardPrintInput | null;
};

function cardTypeTitleKey(cardType: MemberCardPrintData['cardType'] | undefined): string {
    if (cardType === 'staff') return 'memberCardPrint.dialogTitleStaff';
    if (cardType === 'team_member') return 'memberCardPrint.dialogTitleTeam';
    return 'memberCardPrint.dialogTitle';
}

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
    const [includeFooter, setIncludeFooter] = useState(getMemberCardFooterPreference);
    const [footerSaved, setFooterSaved] = useState(false);

    useEffect(() => {
        if (open) {
            setIncludeFooter(getMemberCardFooterPreference());
            setFooterSaved(false);
        }
    }, [open]);

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

    const cardType = member?.cardType ?? input.cardType ?? (input.isTeamPlayer ? 'team_member' : 'member');

    const handleSaveFooterPref = () => {
        setMemberCardFooterPreference(includeFooter);
        setFooterSaved(true);
    };

    const handlePrint = async () => {
        if (!member) return;
        setPrinting(true);
        try {
            await printMemberCard(member, { includeFooter });
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
                        <DialogTitle>{t(cardTypeTitleKey(member?.cardType))}</DialogTitle>
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
                                    {member ? (
                                        <MemberCardPrintPreview
                                            data={member}
                                            photoUrl={member.hasCard ? member.cardFrontUrl : null}
                                            includeFooter={includeFooter}
                                        />
                                    ) : null}
                                </RecordViewSection>

                                <RecordViewSection
                                    icon={User}
                                    title={t("memberCardPrint.preview.cardDetailsTitle")}
                                >
                                    <p className="text-xs text-muted-foreground mb-3">
                                        {t("memberCardPrint.preview.arabicOnlyHint")}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" dir="rtl">
                                        <RecordViewField
                                            icon={User}
                                            label={CARD_PRINT_LABELS_AR.name}
                                            value={member?.nameAr}
                                        />
                                        <RecordViewField
                                            icon={Calendar}
                                            label={t("memberCardPrint.fields.seasonYear")}
                                            value={member?.seasonYear}
                                        />

                                        {cardType === 'member' && member?.cardType === 'member' && (
                                            <>
                                                <RecordViewField
                                                    icon={IdCard}
                                                    label={CARD_PRINT_LABELS_AR.membership}
                                                    value={member.membershipAr}
                                                />
                                                <RecordViewField
                                                    icon={Calendar}
                                                    label={CARD_PRINT_LABELS_AR.validFrom}
                                                    value={member.validFrom}
                                                />
                                                <RecordViewField
                                                    icon={Calendar}
                                                    label={CARD_PRINT_LABELS_AR.validUntil}
                                                    value={member.validUntil}
                                                />
                                            </>
                                        )}

                                        {cardType === 'team_member' && member?.cardType === 'team_member' && (
                                            <>
                                                <RecordViewField
                                                    icon={Trophy}
                                                    label={CARD_PRINT_LABELS_AR.teamPlayer}
                                                    value={CARD_PRINT_LABELS_AR.teamPlayer}
                                                />
                                                <RecordViewField
                                                    icon={Trophy}
                                                    label={CARD_PRINT_LABELS_AR.sports}
                                                    value={
                                                        member.sportsAr.length > 0
                                                            ? member.sportsAr.slice(0, 4).join(' — ')
                                                            : '—'
                                                    }
                                                />
                                                <RecordViewField
                                                    icon={Calendar}
                                                    label={CARD_PRINT_LABELS_AR.validFrom}
                                                    value={member.validFrom}
                                                />
                                                <RecordViewField
                                                    icon={Calendar}
                                                    label={CARD_PRINT_LABELS_AR.validUntil}
                                                    value={member.validUntil}
                                                />
                                            </>
                                        )}

                                        {cardType === 'staff' && member?.cardType === 'staff' && (
                                            <RecordViewField
                                                icon={Briefcase}
                                                label={CARD_PRINT_LABELS_AR.jobTitle}
                                                value={member.jobTitleAr}
                                            />
                                        )}
                                    </div>
                                </RecordViewSection>

                                <RecordViewSection icon={User} title={t("memberCardPrint.footerSettings.title")}>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                id="include-footer"
                                                checked={includeFooter}
                                                onCheckedChange={(checked) => {
                                                    setIncludeFooter(checked);
                                                    setFooterSaved(false);
                                                }}
                                            />
                                            <Label htmlFor="include-footer" className="cursor-pointer">
                                                {t("memberCardPrint.footerSettings.includeFooter")}
                                            </Label>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 shrink-0"
                                            onClick={handleSaveFooterPref}
                                        >
                                            <Save className="h-4 w-4" />
                                            {footerSaved
                                                ? t("memberCardPrint.footerSettings.saved")
                                                : t("memberCardPrint.footerSettings.save")}
                                        </Button>
                                    </div>
                                    {includeFooter && (
                                        <div className="mt-4 rounded-lg border border-border bg-muted/20 px-4 py-3 text-center" dir="rtl">
                                            <p className="font-semibold">{CARD_PRINT_LABELS_AR.execDirector}</p>
                                            <p className="text-muted-foreground">{CARD_PRINT_LABELS_AR.execDirectorName}</p>
                                        </div>
                                    )}
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
