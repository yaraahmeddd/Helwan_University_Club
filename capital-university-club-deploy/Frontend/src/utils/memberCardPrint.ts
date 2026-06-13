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
    execDirectorName: 'ا.د / احمد فاروق',
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

const CARD_PRINT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;600;800&display=swap');

@page {
    size: landscape;
    margin: 0;
}

* {
    box-sizing: border-box;
}

html,
body {
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
    background: #fff;
    border: 1px solid #d9dee3;
    box-shadow: 0 6px 24px rgba(2, 8, 20, 0.08);
    overflow: hidden;
    direction: ltr;
    display: grid;
    grid-template-columns: 3.2cm 1fr;
}

.left {
    color: #fff;
    display: grid;
    grid-template-rows: auto 1fr auto;
}

.photo {
    width: 26mm;
    height: 32mm;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, .65);
    background: #fff;
    position: relative;
    left: -30px;
    top: 26px;
}

.photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.executive-director-signature {
    text-align: center;
    color: black;
    font-weight: 800;
    font-size: 8pt;
    line-height: 1.3;
    padding: 4px 8px;
    position: absolute;
    bottom: 8px;
    right: 12px;
    width: auto;
}

.executive-director-title {
    font-weight: 900;
    font-size: 7pt;
    margin-bottom: 2px;
}

.executive-director-name {
    font-weight: 900;
    font-size: 9.5pt;
}

.right {  
    padding: 10px 12px;
    background: #ffffff;
    position: relative;
}

.info {
    display: grid;
    align-content: center;
    row-gap: 22px;
}

.field-value {
    font-weight: 700;
    font-size: 8pt;
    color: black;
    line-height: 1.2;
}

.year {
    position: relative;
    left: -125px;
    bottom: -37px;
}

.member-name {
    position: relative;
    top: 41px;
}

.id-section {
    position: relative;
    top: 31px;
    font-weight: bold;
}

.profession-section {
    position: relative;
    top: 19px;
    font-weight: bold;
}

.membership-section {
    position: relative;
    top: 8px;
    font-weight: bold;
}

.card-staff .member-name { top: 50px; }
.card-staff .profession-section { top: 40px; }

@media print {
    .page {
        background: transparent;
        padding: 0;
    }

    .card {
        box-shadow: none;
        margin: 0 auto;
    }
}
`;

function buildFrontFaceHtml(
    data: MemberCardPrintData,
    photoDataUrl: string | null,
    includeFooter: boolean,
): string {
    const isStaff = data.cardType === 'staff';
    const cardClass = isStaff ? 'card card-staff' : 'card';
    const L = CARD_PRINT_LABELS_AR;
    
    const photoHtml = photoDataUrl 
        ? `<img src="${photoDataUrl}" alt="Member Photo" />`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:8pt;font-weight:700;">${escapeHtml(L.noCardPresent)}</div>`;

    let infoHtml = `
          <div class="member-name">
            <div class="field-value">${L.name} : ${escapeHtml(data.nameAr)}</div>
          </div>
    `;

    if (!isStaff) {
        infoHtml += `
          <div class="id-section field-value">
            <div>رقم العضوية : ${escapeHtml(String(data.memberId ?? '—'))}</div>
          </div>  
        `;
    }

    if (isStaff) {
        infoHtml += `
          <div class="profession-section field-value">
            <div>${L.jobTitle} : ${escapeHtml(data.jobTitleAr ?? '—')}</div>
          </div>  
        `;
    }

    if (!isStaff) {
        let memberType = '—';
        if (data.cardType === 'member') memberType = data.membershipAr;
        else if (data.cardType === 'team_member') {
            memberType = data.sportsAr.length > 0 ? data.sportsAr.join(' - ') : L.teamPlayer;
        }
        infoHtml += `
          <div class="membership-section field-value">
            <div>${L.membership} : ${escapeHtml(memberType)}</div>
          </div>
        `;
    }

    const yearHtml = !isStaff ? `<div class="field-value year">${escapeHtml(data.seasonYear)}</div>` : '';

    const footerHtml = includeFooter ? `
        <div class="executive-director-signature" dir="rtl">
          <div class="executive-director-title">${escapeHtml(L.execDirector)}</div>
          <div class="executive-director-name">${escapeHtml(L.execDirectorName)}</div>
        </div>
    ` : '';

    return `
    <div class="${cardClass}">   
       <aside class="left">
        <figure class="photo" aria-label="صورة العضو">
          ${photoHtml}
        </figure>
      </aside>

      <section class="right">
        <div class="info" dir="rtl">
          ${infoHtml}
        </div>
        ${yearHtml}
        ${footerHtml}
      </section>
    </div>
    `;
}

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
    <style>${CARD_PRINT_STYLES}</style>
  </head>
  <body class="page">
    ${buildFrontFaceHtml(data, photoDataUrl, includeFooter)}
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
