export type CardPrintKind = 'member' | 'team_member' | 'staff';

type BaseCardPrintData = {
    cardType: CardPrintKind;
    nameAr: string;
    seasonYear: string;
    hasCard: boolean;
    cardFrontUrl?: string | null;
    memberId?: string | number;
    jobTitleAr?: string;
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
    validUntil: 'ساري حتى',
    teamPlayer: 'عضو فريق',
    sports: 'النشاط',
    jobTitle: 'الوظيفة',
    execDirector: 'المدير التنفيذي',
    execDirectorName: 'ا.د / احمد فاروق',
    noCardPresent: 'لا توجد صورة',
} as const;

/** CR80 physical dimensions */
export const CR80_WIDTH_CM = 8.56;
export const CR80_HEIGHT_CM = 5.4;
/** Pixel size at 96 DPI (true card size on screen) */
export const CR80_WIDTH_PX = Math.round((CR80_WIDTH_CM / 2.54) * 96);
export const CR80_HEIGHT_PX = Math.round((CR80_HEIGHT_CM / 2.54) * 96);

/** Default when no saved preference exists. */
export const DEFAULT_INCLUDE_FOOTER = true;
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
    return `${year} - ${year + 1}`;
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

function documentTitleFor(data: MemberCardPrintData): string {
    if (data.cardType === 'staff') return CARD_PRINT_LABELS_AR.documentTitleStaff;
    if (data.cardType === 'team_member') return CARD_PRINT_LABELS_AR.documentTitleTeamMember;
    return CARD_PRINT_LABELS_AR.documentTitleMember;
}

// ─────────────────────────────────────────────
//  Shared CSS (taken verbatim from card/CardPrint.jsx.txt + PrintStuff.jsx.txt)
// ─────────────────────────────────────────────
const SHARED_CSS = `

@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;600;800&display=swap');

@page {
    size: landscape;
    margin: 0;
}

* { box-sizing: border-box; }

html, body {
    height: 100%;
    color: black;
}

body {
    margin: 0;
    font-family: "Cairo", system-ui, Segoe UI, Roboto, Arial, sans-serif;
}

.page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
}

.card {
    width: 8.56cm;
    height: 5.4cm;
    background: #fff url('/assets/card-back.png') center/cover no-repeat;
    border: 1px solid #d9dee3;
    box-shadow: 0 6px 24px rgba(2, 8, 20, 0.08);
    overflow: hidden;
    direction: ltr;
    display: grid;
    grid-template-columns: 3.2cm 1fr;
    position: relative;
}

.left {
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-left: 0;
    padding-top: 15px;
    position: relative;
    left: -15px; /* Shift the entire left column content left to match original layout */
}


.photo {
    width: 26mm;
    height: 32mm;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, .65);
    background: #fff;
    position: relative;
    top: 5px; /* Dropped down 5px as requested */
}

.photo img {
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
    color: #64748b;
    font-size: 7pt;
    font-weight: 700;
    text-align: center;
    padding: 4px;
}

.right {
    padding: 10px 12px;
    background: transparent;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.right.topPadding {
    padding-top: 25px;
}

.info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
}

.field-value {
    font-weight: 700;
    font-size: 8pt;
    color: black;
    line-height: 1.2;
}

/* Specific spacing tweaks for fields */
.member-name { font-weight: bold; }
.id-section { font-weight: bold; }
.profession-section { font-weight: bold; }
.membership-section { font-weight: bold; }

.executive-director-signature {
    position: absolute;
    bottom: 6px;
    right: 10px;
    text-align: right;
    color: black;
    font-weight: 800;
    font-size: 8pt;
    line-height: 1.25;
    padding: 0;
}

.executive-director-title {
    text-align: center;
    font-weight: 900;
    font-size: 7pt;
    margin-bottom: 2px;
}

.executive-director-name {
    font-weight: 900;
    font-size: 9.5pt;
}

@media print {
    .page { background: transparent; padding: 0; }
    .card { box-shadow: none; margin: 0 auto; background: transparent !important; }
}

.card-back {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
}
.card-back img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

`;

// ─────────────────────────────────────────────
//  Front-face builders — one per card type
// ─────────────────────────────────────────────

function buildPhotoHtml(photoDataUrl: string | null): string {
    if (photoDataUrl) {
        return `<img src="${photoDataUrl}" alt="Member Photo" />`;
    }
    return `<div class="photo-empty">${escapeHtml(CARD_PRINT_LABELS_AR.noCardPresent)}</div>`;
}

function buildSignatureHtml(includeFooter: boolean): string {
    if (!includeFooter) return '';
    const L = CARD_PRINT_LABELS_AR;
    return `
        <div class="executive-director-signature" dir="rtl">
          <div class="executive-director-title">${escapeHtml(L.execDirector)}</div>
          <div class="executive-director-name">${escapeHtml(L.execDirectorName)}</div>
        </div>`;
}

/** Member card — mirrors CardPrint.jsx.txt */
function buildMemberFrontHtml(
    data: MemberClubCardPrintData,
    photoDataUrl: string | null,
    includeFooter: boolean,
): string {
    const L = CARD_PRINT_LABELS_AR;
    return `
    <div class="card">
      <aside class="left">
        <figure class="photo" aria-label="صورة العضو">
          ${buildPhotoHtml(photoDataUrl)}
        </figure>
      </aside>
      <section class="right">
        <div class="info" dir="rtl">
          <div class="member-name field-value">
            <div>${L.name} : ${escapeHtml(data.nameAr)}</div>
          </div>
          <div class="id-section field-value">
            <div>رقم العضوية : ${escapeHtml(String(data.memberId ?? '—'))}</div>
          </div>
          <div class="profession-section field-value">
            <div>${L.membership} : ${escapeHtml(data.membershipAr)}</div>
          </div>
          <div class="membership-section field-value">
            <div>${L.validUntil} ${escapeHtml(data.validUntil)}</div>
          </div>
        </div>
        ${buildSignatureHtml(includeFooter)}
      </section>
    </div>`;
}

/** Team-member card — mirrors printMemberTeamCard.jsx.txt */
function buildTeamMemberFrontHtml(
    data: TeamMemberCardPrintData,
    photoDataUrl: string | null,
    includeFooter: boolean,
): string {
    const L = CARD_PRINT_LABELS_AR;
    const sport = data.sportsAr.length > 0 ? data.sportsAr.join(' - ') : L.teamPlayer;
    return `
    <div class="card">
      <aside class="left">
        <figure class="photo" aria-label="صورة العضو">
          ${buildPhotoHtml(photoDataUrl)}
        </figure>
      </aside>
      <section class="right topPadding">
        <div class="info" dir="rtl">
          <div class="member-name field-value">
            <div>${L.name} : ${escapeHtml(data.nameAr)}</div>
          </div>
          <div class="id-section field-value">
            <div>${L.sports} : ${escapeHtml(sport)}</div>
          </div>
          <div class="profession-section field-value">
            <div>${L.validUntil} ${escapeHtml(data.seasonYear)}</div>
          </div>
        </div>
        ${buildSignatureHtml(includeFooter)}
      </section>
    </div>`;
}

/** Staff card — mirrors PrintStuff.jsx.txt */
function buildStaffFrontHtml(
    data: StaffCardPrintData,
    photoDataUrl: string | null,
    includeFooter: boolean,
): string {
    const L = CARD_PRINT_LABELS_AR;
    return `
    <div class="card staff">
      <aside class="left">
        <figure class="photo" aria-label="صورة العضو">
          ${buildPhotoHtml(photoDataUrl)}
        </figure>
      </aside>
      <section class="right">
        <div class="info" dir="rtl">
          <div class="member-name field-value">
            <div>${L.name} : ${escapeHtml(data.nameAr)}</div>
          </div>
          <div class="profession-section field-value">
            <div>${L.jobTitle} : ${escapeHtml(data.jobTitleAr ?? '—')}</div>
          </div>
        </div>
        ${buildSignatureHtml(includeFooter)}
      </section>
    </div>`;
}

function buildFrontHtml(
    data: MemberCardPrintData,
    photoDataUrl: string | null,
    includeFooter: boolean,
): string {
    if (data.cardType === 'staff') return buildStaffFrontHtml(data, photoDataUrl, includeFooter);
    if (data.cardType === 'team_member') return buildTeamMemberFrontHtml(data, photoDataUrl, includeFooter);
    return buildMemberFrontHtml(data, photoDataUrl, includeFooter);
}

// ─────────────────────────────────────────────
//  Complete HTML document for the iframe
// ─────────────────────────────────────────────

function getCardHTML(
    data: MemberCardPrintData,
    photoDataUrl: string | null,
    includeFooter: boolean,
): string {
    return `<!DOCTYPE html>
<html lang="ar">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(documentTitleFor(data))}</title>
    <style>${SHARED_CSS}</style>
  </head>
  <body class="page">
    ${buildFrontHtml(data, photoDataUrl, includeFooter)}
  </body>
</html>`;
}

/** Preview document — same layout/CSS as print, true CR80 size (no page chrome). */
export function getCardPreviewHtml(
    data: MemberCardPrintData,
    photoUrl: string | null,
    includeFooter: boolean,
    side: 'front' | 'back' = 'front',
): string {
    if (side === 'back') {
        return `<!DOCTYPE html>
<html lang="ar">
  <head>
    <meta charset="UTF-8" />
    <style>
      body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
      ${SHARED_CSS}
    </style>
  </head>
  <body>
    <div class="card card-back">
        <img src="/assets/card-front.png" alt="Back face" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>
  </body>
</html>`;
    }

    return `<!DOCTYPE html>
<html lang="ar">
  <head>
    <meta charset="UTF-8" />
    <style>
      body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
      ${SHARED_CSS}
    </style>
  </head>
  <body>
    ${buildFrontHtml(data, photoUrl, includeFooter)}
  </body>
</html>`;
}

// ─────────────────────────────────────────────
//  Image loader & print helpers
// ─────────────────────────────────────────────

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
                if (img.decode) return img.decode().catch(() => undefined);
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
        try { await doc.fonts.ready; } catch { /* ignore */ }
    }

    await new Promise((r) => setTimeout(r, 50));
}

// ─────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────

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
    doc.write(getCardHTML(data, photoDataUrl, includeFooter));
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
