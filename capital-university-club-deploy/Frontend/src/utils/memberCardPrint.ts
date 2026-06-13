export type CardPrintKind = 'member' | 'team_member' | 'staff';

type BaseCardPrintData = {
    cardType: CardPrintKind;
    nameAr: string;
    seasonYear: string;
    hasCard: boolean;
    cardFrontUrl?: string | null;
};

export type MemberClubCardPrintData = BaseCardPrintData & {
    cardType: 'member';
    membershipAr: string;
    validFrom: string;
    validUntil: string;
};

export type TeamMemberCardPrintData = BaseCardPrintData & {
    cardType: 'team_member';
    sportsAr: string[];
};

export type StaffCardPrintData = BaseCardPrintData & {
    cardType: 'staff';
    jobTitleAr: string;
};

export type MemberCardPrintData =
    | MemberClubCardPrintData
    | TeamMemberCardPrintData
    | StaffCardPrintData;

/** Printed card labels — always Arabic regardless of UI language. */
export const CARD_PRINT_LABELS_AR = {
    documentTitleMember: 'نادي جامعة حلوان — بطاقة عضو',
    documentTitleTeamMember: 'نادي جامعة حلوان — بطاقة عضو فريق',
    documentTitleStaff: 'نادي جامعة حلوان — بطاقة موظف',
    name: 'الاسم',
    membership: 'العضوية',
    validFrom: 'ساري من',
    validUntil: 'حتى نهاية',
    teamPlayer: 'عضو فريق',
    sports: 'الرياضات',
    jobTitle: 'الوظيفة',
    execDirector: 'المدير التنفيذي',
    execDirectorName: 'أ.د أحمد فاروق',
    noCardPresent: 'لا توجد صورة',
} as const;

export const CARD_FRONT_ASSET = '/assets/card-front.png';

/** @deprecated Back is rendered in HTML; kept for legacy imports. */
export const MEMBER_CARD_BACK = '/assets/card-back.png';

/** Default when no saved preference exists. */
export const DEFAULT_INCLUDE_FOOTER = true;

/**
 * To permanently hide the executive-director footer on every printed card:
 * 1. Set DEFAULT_INCLUDE_FOOTER to false above.
 * 2. Remove the footer toggle UI from MemberCardPrintDialog (footer section + save button).
 * 3. Pass includeFooter: false (or omit and rely on the default) in printMemberCard().
 */
export const MEMBER_CARD_FOOTER_PREF_KEY = 'huc.memberCardPrint.includeFooter';

export function getMemberCardFooterPreference(): boolean {
    try {
        const stored = localStorage.getItem(MEMBER_CARD_FOOTER_PREF_KEY);
        if (stored === null) return DEFAULT_INCLUDE_FOOTER;
        return stored === 'true';
    } catch {
        return DEFAULT_INCLUDE_FOOTER;
    }
}

export function setMemberCardFooterPreference(include: boolean): void {
    try {
        localStorage.setItem(MEMBER_CARD_FOOTER_PREF_KEY, String(include));
    } catch {
        /* ignore */
    }
}

export function getSeasonYearRange(date = new Date()): string {
    const year = date.getFullYear();
    return `${year}/${year + 1}`;
}

const escapeHtml = (s: string) =>
    String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

function formatDateAr(value?: string | Date | null): string {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export { formatDateAr as formatMemberCardDate };

type DetailLine = { text: string; compact?: boolean; isYear?: boolean };

function buildDetailLines(data: MemberCardPrintData): DetailLine[] {
    const L = CARD_PRINT_LABELS_AR;
    const lines: DetailLine[] = [
        { text: `${L.name} : ${data.nameAr}` },
    ];

    if (data.cardType === 'member') {
        lines.push(
            { text: `${L.membership} : ${data.membershipAr}` },
            { text: `${L.validFrom} : ${data.validFrom}` },
            { text: `${L.validUntil} : ${data.validUntil}` },
        );
    } else if (data.cardType === 'team_member') {
        lines.push({ text: L.teamPlayer });
        const sportsText = data.sportsAr.length > 0
            ? data.sportsAr.slice(0, 4).join(' — ')
            : '—';
        lines.push({ text: `${L.sports} : ${sportsText}`, compact: true });
    } else {
        lines.push({ text: `${L.jobTitle} : ${data.jobTitleAr}` });
    }

    lines.push({ text: data.seasonYear, isYear: true });
    return lines;
}

function documentTitleFor(data: MemberCardPrintData): string {
    if (data.cardType === 'staff') return CARD_PRINT_LABELS_AR.documentTitleStaff;
    if (data.cardType === 'team_member') return CARD_PRINT_LABELS_AR.documentTitleTeamMember;
    return CARD_PRINT_LABELS_AR.documentTitleMember;
}

const CARD_PRINT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

@page {
  size: landscape;
  margin: 0;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 100%;
  height: 100%;
  font-family: "Cairo", "IBM Plex Sans Arabic", Arial, sans-serif;
  color: #0a1628;
  background: #fff;
}

.print-sheet {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 100vh;
  padding: 12px;
}

.card-face {
  width: 8.56cm;
  height: 5.4cm;
  position: relative;
  overflow: hidden;
  background: #fff;
  flex-shrink: 0;
}

.card-face.front {
  page-break-after: always;
}

.card-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
}

.photo-slot {
  position: absolute;
  left: 0.38cm;
  top: 1.28cm;
  width: 2.52cm;
  height: 3.12cm;
  overflow: hidden;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.photo-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  text-align: center;
  font-size: 6pt;
  font-weight: 700;
  color: #64748b;
  line-height: 1.3;
}

.details-slot {
  position: absolute;
  left: 3.02cm;
  top: 1.05cm;
  width: 5.25cm;
  height: 3.55cm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  padding-inline: 0.12cm;
  text-align: right;
}

.detail-line {
  font-size: 7pt;
  font-weight: 700;
  line-height: 1.32;
  color: #0a1628;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-line.compact {
  font-size: 6pt;
  line-height: 1.25;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-line.year {
  font-size: 8.5pt;
  font-weight: 900;
  margin-top: 2px;
  letter-spacing: 0.02em;
}

.footer-slot {
  position: absolute;
  right: 0.32cm;
  bottom: 0.18cm;
  min-width: 2.2cm;
  text-align: center;
  color: #0a1628;
  line-height: 1.15;
}

.footer-title {
  font-size: 6pt;
  font-weight: 900;
}

.footer-name {
  font-size: 7.5pt;
  font-weight: 900;
}

/* ── Back face (matches physical HUC card back) ── */
.card-face.back {
  background: #fff;
}

.back-top-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 2.2cm;
  height: 1.35cm;
}

.back-top-right-tag {
  position: absolute;
  top: 0.28cm;
  right: 0.35cm;
  max-width: 4.8cm;
  text-align: right;
  font-size: 6.2pt;
  font-weight: 800;
  color: #0b2d5b;
  line-height: 1.25;
}

.back-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 0.15cm;
  gap: 0.08cm;
}

.back-logo-row {
  display: flex;
  align-items: center;
  gap: 0.18cm;
}

.back-logo-icon {
  width: 1.05cm;
  height: 1.05cm;
}

.back-logo-text {
  font-size: 22pt;
  font-weight: 900;
  color: #0b2d5b;
  line-height: 1;
  letter-spacing: 0.02em;
}

.back-club-ar {
  font-size: 9pt;
  font-weight: 800;
  color: #0b2d5b;
}

.back-club-en {
  font-size: 7pt;
  font-weight: 700;
  color: #0b2d5b;
}

.back-social {
  position: absolute;
  left: 0.38cm;
  bottom: 0.42cm;
  display: flex;
  flex-direction: column;
  gap: 0.06cm;
  font-size: 5.6pt;
  font-weight: 700;
  color: #0b2d5b;
  line-height: 1.2;
}

.back-social-row {
  display: flex;
  align-items: center;
  gap: 0.12cm;
}

.back-social-icon {
  width: 0.34cm;
  height: 0.34cm;
  flex-shrink: 0;
}

.back-bottom-right {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 1.55cm;
  height: 1.05cm;
}

@media print {
  .print-sheet {
    gap: 0;
    padding: 0;
    min-height: auto;
  }

  .card-face {
    box-shadow: none;
    margin: 0 auto;
  }

  .card-face.front {
    page-break-after: always;
  }

  .card-face.back {
    page-break-before: always;
  }
}
`;

function buildPhotoSlotHtml(photoDataUrl: string | null): string {
    if (photoDataUrl) {
        return `<div class="photo-slot"><img src="${photoDataUrl}" alt="" /></div>`;
    }
    return `<div class="photo-slot"><div class="photo-empty">${escapeHtml(CARD_PRINT_LABELS_AR.noCardPresent)}</div></div>`;
}

function buildDetailsHtml(lines: DetailLine[]): string {
    return lines.map((line) => {
        const classes = ['detail-line'];
        if (line.compact) classes.push('compact');
        if (line.isYear) classes.push('year');
        return `<div class="${classes.join(' ')}">${escapeHtml(line.text)}</div>`;
    }).join('\n          ');
}

function buildFooterHtml(includeFooter: boolean): string {
    if (!includeFooter) return '';
    const L = CARD_PRINT_LABELS_AR;
    return `<div class="footer-slot" dir="rtl">
          <div class="footer-title">${escapeHtml(L.execDirector)}</div>
          <div class="footer-name">${escapeHtml(L.execDirectorName)}</div>
        </div>`;
}

function buildBackFaceHtml(): string {
    return `<div class="card-face back">
      <svg class="back-top-left" viewBox="0 0 220 135" aria-hidden="true">
        <path d="M0,0 H220 V48 C150,48 95,78 0,135 Z" fill="#0b2d5b"/>
        <path d="M0,0 H220 V34 C145,34 88,62 0,108 Z" fill="#1496d4" opacity="0.95"/>
      </svg>
      <div class="back-top-right-tag" dir="rtl">#بالعلم_والعمل_نبني_جيل</div>
      <div class="back-center">
        <div class="back-logo-row">
          <svg class="back-logo-icon" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="72" cy="28" r="11" fill="#f97316"/>
            <path d="M18 78 C18 45 34 22 52 22 C58 22 62 26 62 32 C62 40 54 44 46 48 C36 53 28 60 28 72" fill="none" stroke="#0b2d5b" stroke-width="9" stroke-linecap="round"/>
            <path d="M28 72 L18 88 L38 82 Z" fill="#0b2d5b"/>
          </svg>
          <div class="back-logo-text">HUC</div>
        </div>
        <div class="back-club-ar">نادي جامعة حلوان</div>
        <div class="back-club-en">Helwan Univ. Club</div>
      </div>
      <div class="back-social">
        <div class="back-social-row">
          <svg class="back-social-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#0b2d5b"/><path fill="#fff" d="M13.2 7.5h2.1l-1.4 1.6 1.6 2.1h-1.9l-1-1.3-1.1 1.3H9.8l1.5-1.8L9.8 7.5h2l1 1.3z"/></svg>
          <span>Helwan university club</span>
        </div>
        <div class="back-social-row">
          <svg class="back-social-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#0b2d5b"/><rect x="7" y="7" width="10" height="10" rx="2.5" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="12" r="2.3" fill="#fff"/><circle cx="15.2" cy="8.8" r="0.8" fill="#fff"/></svg>
          <span>@Helwan.university.club</span>
        </div>
        <div class="back-social-row">
          <svg class="back-social-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#0b2d5b"/><path fill="#fff" d="M9.5 8.5h1.2l.3 3.4.9-3.4h1.1l-.8 4.8c-.2 1.2-.9 1.8-2 1.8H8.3v-1h1.1c.5 0 .7-.2 .8-.7l.3-1.8H8.8z"/></svg>
          <span>@Helwan.university.club</span>
        </div>
      </div>
      <svg class="back-bottom-right" viewBox="0 0 155 105" aria-hidden="true">
        <path d="M155,105 H55 C95,70 120,35 155,0 Z" fill="#0b2d5b"/>
        <path d="M155,105 H72 C108,72 128,42 155,12 Z" fill="#f97316"/>
      </svg>
    </div>`;
}

function buildFrontFaceHtml(
    data: MemberCardPrintData,
    photoDataUrl: string | null,
    frontTemplateDataUrl: string,
    includeFooter: boolean,
): string {
    const lines = buildDetailLines(data);
    return `<div class="card-face front">
      <img class="card-bg" src="${frontTemplateDataUrl}" alt="" />
      ${buildPhotoSlotHtml(photoDataUrl)}
      <div class="details-slot" dir="rtl">
        ${buildDetailsHtml(lines)}
      </div>
      ${buildFooterHtml(includeFooter)}
    </div>`;
}

function getCardHTML(
    data: MemberCardPrintData,
    photoDataUrl: string | null,
    frontTemplateDataUrl: string,
    includeFooter: boolean,
): string {
    return `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(documentTitleFor(data))}</title>
  <style>${CARD_PRINT_STYLES}</style>
</head>
<body>
  <div class="print-sheet">
    ${buildFrontFaceHtml(data, photoDataUrl, frontTemplateDataUrl, includeFooter)}
    ${buildBackFaceHtml()}
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

async function resolveAssetDataUrl(assetPath: string): Promise<string> {
    const absolute = assetPath.startsWith('http')
        ? assetPath
        : `${window.location.origin}${assetPath.startsWith('/') ? '' : '/'}${assetPath}`;
    try {
        return await loadImageDataUrl(absolute);
    } catch {
        return absolute;
    }
}

async function waitForPrintReady(win: Window): Promise<void> {
    const doc = win.document;

    if (doc.readyState === 'loading') {
        await new Promise<void>((res) => {
            doc.addEventListener('DOMContentLoaded', () => res(), { once: true });
        });
    }

    const images = Array.from(doc.images || []);
    await Promise.all(
        images.map((img) => {
            if (img.complete && img.naturalWidth !== 0) {
                if (img.decode) {
                    return img.decode().catch(() => undefined);
                }
                return Promise.resolve();
            }
            return new Promise<void>((resolve) => {
                const done = () => {
                    if (img.decode) {
                        img.decode().then(resolve).catch(resolve);
                    } else {
                        resolve();
                    }
                };
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
            });
        }),
    );

    if (doc.fonts?.ready?.then) {
        try {
            await doc.fonts.ready;
        } catch {
            /* ignore */
        }
    }

    await new Promise((r) => setTimeout(r, 50));
}

export async function printMemberCard(
    data: MemberCardPrintData,
    options?: { includeFooter?: boolean },
): Promise<void> {
    const includeFooter = options?.includeFooter ?? getMemberCardFooterPreference();

    let photoDataUrl: string | null = null;
    if (data.hasCard && data.cardFrontUrl) {
        try {
            photoDataUrl = await loadImageDataUrl(data.cardFrontUrl);
        } catch {
            photoDataUrl = null;
        }
    }

    const frontTemplateDataUrl = await resolveAssetDataUrl(CARD_FRONT_ASSET);

    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
        position: 'fixed',
        right: '0',
        bottom: '0',
        width: '0',
        height: '0',
        border: '0',
    });
    document.body.appendChild(iframe);

    const win = iframe.contentWindow!;
    const doc = win.document;
    doc.open();
    doc.write(getCardHTML(data, photoDataUrl, frontTemplateDataUrl, includeFooter));
    doc.close();

    await waitForPrintReady(win);

    win.focus();
    win.print();

    win.onafterprint = () => {
        setTimeout(() => {
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 50);
    };
    setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
    }, 5000);
}
