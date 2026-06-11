/**
 * CardPrintPage — Member card printing
 *
 * Left : member list (mock data, replace with real API later)
 * Right: card front/back preview + member info summary + print button
 *
 * Print: injects card HTML into a hidden iframe → iframe.contentWindow.print()
 */

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Printer,
    CreditCard,
    Search,
    User,
    Trophy,
    Hash,
    Calendar,
    IdCard,
} from "lucide-react";
import { Button } from '@/components/StaffPagesComponents/ui/button';
import { Input } from '@/components/StaffPagesComponents/ui/input';
import { AdminPageHeader } from '@/components/StaffPagesComponents/shared/AdminPageHeader';
import { adminPageStyles } from '@/components/StaffPagesComponents/shared/adminTableStyles';
import {
    RecordViewSection,
    RecordViewField,
} from '@/components/StaffPagesComponents/shared/RecordViewPrimitives';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const cardFront = "/assets/card-front.png";
const cardBack = "/assets/card-back.png";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
// TODO: Replace with real API call when endpoint is ready

const MOCK_MEMBERS = [
    { id: 1, nameAr: "أحمد محمد علي", nameEn: "Ahmed Mohamed Ali", memberId: "MEM-001", sport: "كرة القدم", sportEn: "Football", endDate: "31/12/2025" },
    { id: 2, nameAr: "محمد علي حسن", nameEn: "Mohamed Ali Hassan", memberId: "MEM-002", sport: "سباحة", sportEn: "Swimming", endDate: "31/12/2025" },
    { id: 3, nameAr: "كريم أحمد سعيد", nameEn: "Karim Ahmed Saeed", memberId: "MEM-003", sport: "تنس", sportEn: "Tennis", endDate: "30/06/2025" },
];

type Member = typeof MOCK_MEMBERS[number];

type PrintLabels = {
    documentTitle: string;
    name: string;
    memberId: string;
    sport: string;
    validUntil: string;
    execDirector: string;
    execDirectorName: string;
};

type PrintContent = {
    name: string;
    sport: string;
    memberId: string;
    endDate: string;
};

// ─── Print logic ──────────────────────────────────────────────────────────────

const escapeHtml = (s: string) =>
    String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

function getCardHTML(
    content: PrintContent,
    frontImgDataUrl: string,
    labels: PrintLabels,
    language: "ar" | "en",
): string {
    const textDir = language === "ar" ? "rtl" : "ltr";
    const fontFamily = language === "ar"
        ? '"Cairo", "IBM Plex Sans Arabic", Arial, sans-serif'
        : '"Inter", "Plus Jakarta Sans", Arial, sans-serif';

    return `<!DOCTYPE html>
<html lang="${language}" dir="${textDir}">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(labels.documentTitle)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&family=Inter:wght@400;700;800&display=swap');
    @page { size: portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      font-family: ${fontFamily};
      color: #111;
      background: #fff;
      overflow: hidden;
    }

    .page {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin: 0;
      padding: 0;
    }

    .card-visual {
      width: 100%;
      max-width: 420px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .card-visual img {
      width: 100%;
      height: auto;
      object-fit: contain;
      display: block;
    }

    .details {
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }

    .field-value {
      font-size: 11pt;
      font-weight: 700;
      line-height: 1.45;
      width: 100%;
    }

    .signature {
      width: 100%;
      max-width: 420px;
      margin-top: 4px;
      text-align: center;
      font-size: 10pt;
      font-weight: 800;
      line-height: 1.4;
      color: #333;
    }

    @media print {
      html, body {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .page {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="card-visual">
      <img src="${frontImgDataUrl}" alt="card front" />
    </div>
    <div class="details" dir="${textDir}">
      <div class="field-value">${escapeHtml(labels.name)} : ${escapeHtml(content.name)}</div>
      <div class="field-value">${escapeHtml(labels.memberId)} : ${escapeHtml(content.memberId)}</div>
      <div class="field-value">${escapeHtml(labels.sport)} : ${escapeHtml(content.sport)}</div>
      <div class="field-value">${escapeHtml(labels.validUntil)} : ${escapeHtml(content.endDate)}</div>
    </div>
    <div class="signature" dir="${textDir}">
      <div>${escapeHtml(labels.execDirector)}</div>
      <div>${escapeHtml(labels.execDirectorName)}</div>
    </div>
  </div>
</body>
</html>`;
}

async function printCard(
    member: Member,
    labels: PrintLabels,
    language: "ar" | "en",
) {
    const resp = await fetch(cardFront);
    const blob = await resp.blob();
    const dataUrl = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(blob);
    });

    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow!.document;
    doc.open();
    const content: PrintContent = {
        name: language === "ar" ? member.nameAr : member.nameEn,
        sport: language === "ar" ? member.sport : member.sportEn,
        memberId: member.memberId,
        endDate: member.endDate,
    };

    doc.write(getCardHTML(content, dataUrl, labels, language));
    doc.close();

    await new Promise<void>((resolve) => {
        if (doc.readyState === "complete") { resolve(); return; }
        iframe.contentWindow!.addEventListener("load", () => resolve(), { once: true });
    });

    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();

    iframe.contentWindow!.onafterprint = () => setTimeout(() => document.body.removeChild(iframe), 50);
    setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 5000);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardPrintPage() {
    const { t } = useTranslation("CardPrintPage");
    const { language, isRTL } = useLanguage();
    const [selected, setSelected] = useState<Member>(MOCK_MEMBERS[0]);
    const [printing, setPrinting] = useState(false);
    const [search, setSearch] = useState("");

    const filteredMembers = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return MOCK_MEMBERS;
        return MOCK_MEMBERS.filter((m) =>
            m.nameAr.includes(q) ||
            m.nameEn.toLowerCase().includes(q) ||
            m.memberId.toLowerCase().includes(q) ||
            m.sport.includes(q) ||
            m.sportEn.toLowerCase().includes(q),
        );
    }, [search]);

    const displayName = (m: Member) => (language === "ar" ? m.nameAr : m.nameEn);
    const displaySport = (m: Member) => (language === "ar" ? m.sport : m.sportEn);

    const handlePrint = async () => {
        setPrinting(true);
        try {
            const labels: PrintLabels = {
                documentTitle: t("print.documentTitle"),
                name: t("fields.name"),
                memberId: t("fields.memberId"),
                sport: t("fields.sport"),
                validUntil: t("print.validUntil"),
                execDirector: t("print.execDirector"),
                execDirectorName: t("print.execDirectorName"),
            };
            await printCard(selected, labels, language === "ar" ? "ar" : "en");
        } finally {
            setPrinting(false);
        }
    };

    return (
        <div
            className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden admin-module"
            dir={isRTL ? "rtl" : "ltr"}
        >
            <AdminPageHeader
                icon={CreditCard}
                title={t("header.title")}
                subtitle={t("header.subtitle", { count: filteredMembers.length })}
                actions={
                    <Button
                        onClick={() => void handlePrint()}
                        disabled={printing}
                        className="gap-2"
                        size="sm"
                    >
                        <Printer className="h-4 w-4" />
                        {printing ? t("header.printing") : t("header.print")}
                    </Button>
                }
            />

            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Member list panel */}
                <aside className="w-72 shrink-0 border-e border-border bg-background flex flex-col min-h-0">
                    <div className={cn(adminPageStyles.toolbar, "flex-col items-stretch gap-2 shrink-0")}>
                        <div>
                            <p className="font-semibold text-foreground">{t("sidebar.title")}</p>
                            <p className="text-muted-foreground mt-0.5">{t("sidebar.hint")}</p>
                        </div>
                        <div className="relative w-full">
                            <Search className={adminPageStyles.toolbarSearchIcon} />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("sidebar.searchPlaceholder")}
                                className={adminPageStyles.toolbarSearch}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-muted/10">
                        {filteredMembers.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8 px-2">
                                {t("sidebar.empty")}
                            </p>
                        ) : (
                            filteredMembers.map((m) => {
                                const isActive = selected.id === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setSelected(m)}
                                        className={cn(
                                            "w-full rounded-lg border px-3 py-2.5 transition-all duration-150 text-start",
                                            isActive
                                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                : "border-border bg-card hover:bg-muted/50",
                                        )}
                                    >
                                        <p className="font-semibold leading-tight truncate">
                                            {displayName(m)}
                                        </p>
                                        <p
                                            className={cn(
                                                "mt-0.5 truncate",
                                                isActive ? "text-primary-foreground/75" : "text-muted-foreground",
                                            )}
                                        >
                                            {displaySport(m)} · {m.memberId}
                                        </p>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* Preview panel */}
                <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 bg-muted/5">
                    <RecordViewSection icon={IdCard} title={t("preview.templateTitle")}>
                        <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                            <div className="space-y-2 text-center">
                                <p className="text-muted-foreground">{t("preview.front")}</p>
                                <img
                                    src={cardFront}
                                    alt={t("preview.front")}
                                    className="max-w-[320px] w-full rounded-xl shadow-md border border-border"
                                />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-muted-foreground">{t("preview.back")}</p>
                                <img
                                    src={cardBack}
                                    alt={t("preview.back")}
                                    className="max-w-[320px] w-full rounded-xl shadow-md border border-border"
                                />
                            </div>
                        </div>
                    </RecordViewSection>

                    <RecordViewSection icon={User} title={t("preview.memberTitle")}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <RecordViewField icon={User} label={t("fields.name")} value={displayName(selected)} />
                            <RecordViewField icon={Trophy} label={t("fields.sport")} value={displaySport(selected)} />
                            <RecordViewField icon={Hash} label={t("fields.memberId")} value={selected.memberId} ltr alignEnd={isRTL} />
                            <RecordViewField icon={Calendar} label={t("fields.endDate")} value={selected.endDate} ltr alignEnd={isRTL} />
                        </div>
                    </RecordViewSection>

                    <p className="text-muted-foreground max-w-xl">{t("printHint")}</p>
                </div>
            </div>
        </div>
    );
}
