import { useTranslation } from 'react-i18next';
import {
    CARD_FRONT_ASSET,
    CARD_PRINT_LABELS_AR,
    type MemberCardPrintData,
} from '@/utils/memberCardPrint';

type MemberCardPrintPreviewProps = {
    data: MemberCardPrintData;
    photoUrl?: string | null;
    includeFooter: boolean;
    scale?: number;
};

const CARD_W_MM = 85.6;
const CARD_H_MM = 54;

function mm(v: number, scale: number) {
    return `${(v * scale).toFixed(2)}px`;
}

function buildDetailTexts(data: MemberCardPrintData): string[] {
    const L = CARD_PRINT_LABELS_AR;
    const lines = [`${L.name} : ${data.nameAr}`];

    if (data.cardType === 'member') {
        lines.push(
            `${L.membership} : ${data.membershipAr}`,
            `${L.validFrom} : ${data.validFrom}`,
            `${L.validUntil} : ${data.validUntil}`,
        );
    } else if (data.cardType === 'team_member') {
        lines.push(L.teamPlayer);
        const sports = data.sportsAr.length > 0
            ? data.sportsAr.slice(0, 4).join(' — ')
            : '—';
        lines.push(`${L.sports} : ${sports}`);
    } else {
        lines.push(`${L.jobTitle} : ${data.jobTitleAr}`);
    }

    lines.push(data.seasonYear);
    return lines;
}

function CardBackPreview({ scale }: { scale: number }) {
    const w = (CARD_W_MM / 25.4) * 96 * scale;
    const h = (CARD_H_MM / 25.4) * 96 * scale;

    return (
        <div
            className="relative overflow-hidden bg-white shadow-md border border-border shrink-0"
            style={{ width: w, height: h }}
        >
            <svg
                className="absolute top-0 left-0"
                style={{ width: mm(22, scale), height: mm(13.5, scale) }}
                viewBox="0 0 220 135"
                aria-hidden
            >
                <path d="M0,0 H220 V48 C150,48 95,78 0,135 Z" fill="#0b2d5b" />
                <path d="M0,0 H220 V34 C145,34 88,62 0,108 Z" fill="#1496d4" opacity="0.95" />
            </svg>

            <div
                className="absolute font-bold text-[#0b2d5b] text-right leading-tight"
                style={{
                    top: mm(2.8, scale),
                    right: mm(3.5, scale),
                    maxWidth: mm(48, scale),
                    fontSize: mm(2.2, scale),
                }}
                dir="rtl"
            >
                #بالعلم_والعمل_نبني_جيل
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 gap-0.5">
                <div className="flex items-center" style={{ gap: mm(1.8, scale) }}>
                    <svg
                        viewBox="0 0 100 100"
                        aria-hidden
                        style={{ width: mm(10.5, scale), height: mm(10.5, scale) }}
                    >
                        <circle cx="72" cy="28" r="11" fill="#f97316" />
                        <path
                            d="M18 78 C18 45 34 22 52 22 C58 22 62 26 62 32 C62 40 54 44 46 48 C36 53 28 60 28 72"
                            fill="none"
                            stroke="#0b2d5b"
                            strokeWidth="9"
                            strokeLinecap="round"
                        />
                        <path d="M28 72 L18 88 L38 82 Z" fill="#0b2d5b" />
                    </svg>
                    <span
                        className="font-black text-[#0b2d5b] leading-none"
                        style={{ fontSize: mm(8, scale) }}
                    >
                        HUC
                    </span>
                </div>
                <span
                    className="font-extrabold text-[#0b2d5b]"
                    style={{ fontSize: mm(3.2, scale) }}
                >
                    نادي جامعة حلوان
                </span>
                <span
                    className="font-bold text-[#0b2d5b]"
                    style={{ fontSize: mm(2.5, scale) }}
                >
                    Helwan Univ. Club
                </span>
            </div>

            <div
                className="absolute left-0 bottom-0 flex flex-col text-[#0b2d5b] font-bold"
                style={{
                    left: mm(3.8, scale),
                    bottom: mm(4.2, scale),
                    gap: mm(0.6, scale),
                    fontSize: mm(2, scale),
                }}
            >
                <span>Helwan university club</span>
                <span>@Helwan.university.club</span>
                <span>@Helwan.university.club</span>
            </div>

            <svg
                className="absolute right-0 bottom-0"
                style={{ width: mm(15.5, scale), height: mm(10.5, scale) }}
                viewBox="0 0 155 105"
                aria-hidden
            >
                <path d="M155,105 H55 C95,70 120,35 155,0 Z" fill="#0b2d5b" />
                <path d="M155,105 H72 C108,72 128,42 155,12 Z" fill="#f97316" />
            </svg>
        </div>
    );
}

export function MemberCardPrintPreview({
    data,
    photoUrl,
    includeFooter,
    scale = 1.35,
}: MemberCardPrintPreviewProps) {
    const { t } = useTranslation('common');
    const pxPerMm = (96 / 25.4) * scale;
    const w = CARD_W_MM * pxPerMm;
    const h = CARD_H_MM * pxPerMm;
    const lines = buildDetailTexts(data);
    const L = CARD_PRINT_LABELS_AR;

    return (
        <div className="flex flex-wrap gap-8 justify-center">
            <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">{t('memberCardPrint.preview.front')}</p>
                <div
                    className="relative overflow-hidden bg-white shadow-md border border-border mx-auto shrink-0"
                    style={{ width: w, height: h, fontFamily: '"Cairo", sans-serif' }}
                >
                    <img
                        src={CARD_FRONT_ASSET}
                        alt=""
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
                    />

                    <div
                        className="absolute overflow-hidden rounded-[5px] bg-white/90 border border-slate-200/80"
                        style={{
                            left: mm(3.8, scale),
                            top: mm(12.8, scale),
                            width: mm(25.2, scale),
                            height: mm(31.2, scale),
                        }}
                    >
                        {photoUrl ? (
                            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-center px-1"
                                style={{ fontSize: mm(2, scale) }}
                            >
                                {L.noCardPresent}
                            </div>
                        )}
                    </div>

                    <div
                        className="absolute flex flex-col justify-center text-right text-[#0a1628] font-bold"
                        style={{
                            left: mm(30.2, scale),
                            top: mm(10.5, scale),
                            width: mm(52.5, scale),
                            height: mm(35.5, scale),
                            gap: mm(0.4, scale),
                            paddingInline: mm(1.2, scale),
                        }}
                        dir="rtl"
                    >
                        {lines.map((line, i) => (
                            <div
                                key={i}
                                className="leading-tight overflow-hidden"
                                style={{
                                    fontSize: i === lines.length - 1
                                        ? mm(3.2, scale)
                                        : i === lines.length - 2 && data.cardType === 'team_member'
                                            ? mm(2.2, scale)
                                            : mm(2.8, scale),
                                    fontWeight: i === lines.length - 1 ? 900 : 700,
                                    display: i === lines.length - 2 && data.cardType === 'team_member' ? '-webkit-box' : undefined,
                                    WebkitLineClamp: i === lines.length - 2 && data.cardType === 'team_member' ? 2 : undefined,
                                    WebkitBoxOrient: i === lines.length - 2 && data.cardType === 'team_member' ? 'vertical' : undefined,
                                }}
                            >
                                {line}
                            </div>
                        ))}
                    </div>

                    {includeFooter && (
                        <div
                            className="absolute text-center text-[#0a1628] font-black leading-tight"
                            style={{
                                right: mm(3.2, scale),
                                bottom: mm(1.8, scale),
                                minWidth: mm(22, scale),
                            }}
                            dir="rtl"
                        >
                            <div style={{ fontSize: mm(2, scale) }}>{L.execDirector}</div>
                            <div style={{ fontSize: mm(2.6, scale) }}>{L.execDirectorName}</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">{t('memberCardPrint.preview.back')}</p>
                <CardBackPreview scale={scale} />
            </div>
        </div>
    );
}
