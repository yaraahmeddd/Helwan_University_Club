import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    CR80_HEIGHT_PX,
    CR80_WIDTH_PX,
    getCardPreviewHtml,
    type MemberCardPrintData,
} from '@/utils/memberCardPrint';

type MemberCardPrintPreviewProps = {
    data: MemberCardPrintData;
    photoUrl?: string | null;
    includeFooter: boolean;
};

export function MemberCardPrintPreview({
    data,
    photoUrl,
    includeFooter,
}: MemberCardPrintPreviewProps) {
    const { t } = useTranslation('common');

    const srcDocFront = useMemo(
        () => getCardPreviewHtml(data, photoUrl ?? null, includeFooter, 'front'),
        [data, photoUrl, includeFooter],
    );


    return (
        <div className="flex flex-col gap-4 items-center justify-center">
            <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">{t('memberCardPrint.preview.front')}</p>
                <iframe
                    title={t('memberCardPrint.preview.front')}
                    srcDoc={srcDocFront}
                    className="mx-auto block shrink-0 overflow-hidden rounded-sm border border-border bg-white shadow-md"
                    style={{
                        width: CR80_WIDTH_PX,
                        height: CR80_HEIGHT_PX,
                        border: 0,
                    }}
                    sandbox="allow-same-origin"
                />
            </div>

        </div>
    );
}
