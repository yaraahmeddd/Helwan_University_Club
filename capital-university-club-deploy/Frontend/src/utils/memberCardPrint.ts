export type MemberCardPrintData = {
    nameAr: string;
    nameEn: string;
    memberId: string;
    sportAr: string;
    sportEn: string;
    endDate: string;
    hasCard: boolean;
    cardFrontUrl?: string | null;
};

export type MemberCardPrintLabels = {
    documentTitle: string;
    name: string;
    memberId: string;
    sport: string;
    validUntil: string;
    execDirector: string;
    execDirectorName: string;
    noCardPresent: string;
};

type MemberCardPrintContent = {
    name: string;
    sport: string;
    memberId: string;
    endDate: string;
};

const escapeHtml = (s: string) =>
    String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

export function formatMemberCardId(id: string | number): string {
    const raw = String(id).trim();
    if (!raw) return "—";
    if (/^(MEM-|CARD-)/i.test(raw)) return raw.toUpperCase();
    const numeric = raw.replace(/\D/g, "");
    if (numeric) return `MEM-${numeric.padStart(3, "0")}`;
    return raw;
}

export function buildMemberCardPrintData(input: {
    firstNameAr?: string;
    lastNameAr?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    id: string | number;
    sportAr?: string;
    sportEn?: string;
    endDate?: string | null;
    hasCard?: boolean;
    cardFrontUrl?: string | null;
}): MemberCardPrintData {
    const nameAr = `${input.firstNameAr ?? ""} ${input.lastNameAr ?? ""}`.trim() || "—";
    const nameEn = `${input.firstNameEn ?? ""} ${input.lastNameEn ?? ""}`.trim() || nameAr;
    return {
        nameAr,
        nameEn,
        memberId: formatMemberCardId(input.id),
        sportAr: input.sportAr?.trim() || "—",
        sportEn: input.sportEn?.trim() || input.sportAr?.trim() || "—",
        endDate: input.endDate?.trim() || "—",
        hasCard: input.hasCard ?? false,
        cardFrontUrl: input.cardFrontUrl ?? null,
    };
}

function getCardHTML(
    content: MemberCardPrintContent,
    frontImgDataUrl: string | null,
    labels: MemberCardPrintLabels,
    language: "ar" | "en",
): string {
    const textDir = language === "ar" ? "rtl" : "ltr";
    const fontFamily = language === "ar"
        ? '"Cairo", "IBM Plex Sans Arabic", Arial, sans-serif'
        : '"Inter", "Plus Jakarta Sans", Arial, sans-serif';

    const cardVisualHtml = frontImgDataUrl
        ? `<img src="${frontImgDataUrl}" alt="card front" />`
        : `<p class="no-card">${escapeHtml(labels.noCardPresent)}</p>`;

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
      max-width: 320px;
      height: auto;
      object-fit: contain;
      display: block;
      border-radius: 12px;
    }
    .no-card {
      width: 100%;
      max-width: 420px;
      padding: 24px 16px;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      text-align: center;
      font-size: 12pt;
      font-weight: 700;
      color: #64748b;
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
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="card-visual">
      ${cardVisualHtml}
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

async function loadImageDataUrl(url: string): Promise<string> {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to load card image');
    const blob = await resp.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read card image'));
        reader.readAsDataURL(blob);
    });
}

export async function printMemberCard(
    member: MemberCardPrintData,
    labels: MemberCardPrintLabels,
    language: "ar" | "en",
): Promise<void> {
    let frontImgDataUrl: string | null = null;
    if (member.hasCard && member.cardFrontUrl) {
        try {
            frontImgDataUrl = await loadImageDataUrl(member.cardFrontUrl);
        } catch {
            frontImgDataUrl = null;
        }
    }

    const content: MemberCardPrintContent = {
        name: language === "ar" ? member.nameAr : member.nameEn,
        sport: language === "ar" ? member.sportAr : member.sportEn,
        memberId: member.memberId,
        endDate: member.endDate,
    };

    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
        position: "fixed",
        right: "0",
        bottom: "0",
        width: "0",
        height: "0",
        border: "0",
    });
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow!.document;
    doc.open();
    doc.write(getCardHTML(content, frontImgDataUrl, labels, language));
    doc.close();

    await new Promise<void>((resolve) => {
        if (doc.readyState === "complete") {
            resolve();
            return;
        }
        iframe.contentWindow!.addEventListener("load", () => resolve(), { once: true });
    });

    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();

    iframe.contentWindow!.onafterprint = () => {
        setTimeout(() => {
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 50);
    };
    setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
    }, 5000);
}

export const MEMBER_CARD_BACK = "/assets/card-back.png";
