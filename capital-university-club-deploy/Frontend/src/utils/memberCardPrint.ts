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
    documentTitleMember: 'نادي جامعة العاصمة — بطاقة عضو',
    documentTitleTeamMember: 'نادي جامعة العاصمة — بطاقة عضو فريق',
    documentTitleStaff: 'نادي جامعة العاصمة — بطاقة موظف',
    name: 'الاسم',
    membership: 'العضوية',
    validFrom: 'ساري من',
    validUntil: 'حتى نهاية',
    teamPlayer: 'عضو فريق',
    sports: 'الرياضات',
    jobTitle: 'الوظيفة',
    execDirector: 'المدير التنفيذي',
    execDirectorName: 'أ.د أحمد فاروق',
    noCardPresent: 'لا توجد بطاقة',
} as const;

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
        /* ignore quota / private mode */
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

/** CR80 landscape card styles — adapted from capital-university-club-deploy/card/ templates. */
const CR80_CARD_STYLES = `
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
  background: #fff;
  border: 1px solid #d9dee3;
  box-shadow: 0 6px 24px rgba(2, 8, 20, 0.08);
  overflow: hidden;
  position: relative;
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
  border: 2px solid rgba(0, 0, 0, 0.12);
  background: #f1f5f9;
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

.photo-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 7pt;
  font-weight: 700;
  text-align: center;
  padding: 4px;
}

.right {
  padding: 10px 12px;
  background: #ffffff;
  position: relative;
}

.info {
  display: grid;
  align-content: center;
  row-gap: 10px;
}

.field-value {
  font-weight: 700;
  font-size: 8pt;
  color: black;
  line-height: 1.25;
}

.field-value.compact {
  font-size: 7pt;
  line-height: 1.2;
}

.member-name {
  position: relative;
  top: 38px;
}

.row-section-a {
  position: relative;
  top: 28px;
  font-weight: bold;
}

.row-section-b {
  position: relative;
  top: 18px;
  font-weight: bold;
}

.row-section-c {
  position: relative;
  top: 8px;
  font-weight: bold;
}

.row-section-d {
  position: relative;
  top: -2px;
  font-weight: bold;
}

.year {
  position: relative;
  left: -125px;
  bottom: -28px;
  font-weight: 800;
  font-size: 9pt;
}

.staff-right .member-name { top: 50px; }
.staff-right .row-section-a { top: 40px; }

.team-right { padding-top: 25px; }
.team-right .member-name { top: 28px; }
.team-right .row-section-a { top: 18px; }
.team-right .row-section-b { top: 8px; }

.executive-director-signature {
  position: absolute;
  bottom: 6px;
  right: 10px;
  text-align: right;
  color: black;
  font-weight: 800;
  font-size: 8pt;
  line-height: 1.25;
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

function buildFooterHtml(includeFooter: boolean): string {
    if (!includeFooter) return '';
    const L = CARD_PRINT_LABELS_AR;
    return `<div class="executive-director-signature" dir="rtl">
          <div class="executive-director-title">${escapeHtml(L.execDirector)}</div>
          <div class="executive-director-name">${escapeHtml(L.execDirectorName)}</div>
        </div>`;
}

function buildPhotoHtml(photoDataUrl: string | null): string {
    if (photoDataUrl) {
        return `<figure class="photo" aria-label="صورة العضو">
          <img src="${photoDataUrl}" alt="Member Photo" />
        </figure>`;
    }
    return `<figure class="photo photo-empty" aria-label="صورة العضو">${escapeHtml(CARD_PRINT_LABELS_AR.noCardPresent)}</figure>`;
}

function buildMemberCardHtml(
    data: MemberClubCardPrintData,
    photoDataUrl: string | null,
    includeFooter: boolean,
): string {
    const L = CARD_PRINT_LABELS_AR;
    return `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(CARD_PRINT_LABELS_AR.documentTitleMember)}</title>
  <style>${CR80_CARD_STYLES}</style>
</head>
<body class="page">
  <div class="card">
    <aside class="left">
      ${buildPhotoHtml(photoDataUrl)}
    </aside>
    <section class="right">
      <div class="info" dir="rtl">
        <div class="member-name">
          <div class="field-value">${escapeHtml(L.name)} : ${escapeHtml(data.nameAr)}</div>
        </div>
        <div class="row-section-a field-value">
          <div>${escapeHtml(L.membership)} : ${escapeHtml(data.membershipAr)}</div>
        </div>
        <div class="row-section-b field-value">
          <div>${escapeHtml(L.validFrom)} : ${escapeHtml(data.validFrom)}</div>
        </div>
        <div class="row-section-c field-value">
          <div>${escapeHtml(L.validUntil)} : ${escapeHtml(data.validUntil)}</div>
        </div>
        <div class="field-value year">${escapeHtml(data.seasonYear)}</div>
      </div>
      ${buildFooterHtml(includeFooter)}
    </section>
  </div>
</body>
</html>`;
}

function buildTeamMemberCardHtml(
    data: TeamMemberCardPrintData,
    photoDataUrl: string | null,
    includeFooter: boolean,
): string {
    const L = CARD_PRINT_LABELS_AR;
    const sportsText = data.sportsAr.length > 0
        ? data.sportsAr.slice(0, 4).join(' — ')
        : '—';

    return `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(CARD_PRINT_LABELS_AR.documentTitleTeamMember)}</title>
  <style>${CR80_CARD_STYLES}</style>
</head>
<body class="page">
  <div class="card">
    <aside class="left">
      ${buildPhotoHtml(photoDataUrl)}
    </aside>
    <section class="right team-right">
      <div class="info" dir="rtl">
        <div class="member-name">
          <div class="field-value">${escapeHtml(L.name)} : ${escapeHtml(data.nameAr)}</div>
        </div>
        <div class="row-section-a field-value">
          <div>${escapeHtml(L.teamPlayer)}</div>
        </div>
        <div class="row-section-b field-value compact">
          <div>${escapeHtml(L.sports)} : ${escapeHtml(sportsText)}</div>
        </div>
        <div class="field-value year">${escapeHtml(data.seasonYear)}</div>
      </div>
      ${buildFooterHtml(includeFooter)}
    </section>
  </div>
</body>
</html>`;
}

function buildStaffCardHtml(
    data: StaffCardPrintData,
    photoDataUrl: string | null,
    includeFooter: boolean,
): string {
    const L = CARD_PRINT_LABELS_AR;
    return `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(CARD_PRINT_LABELS_AR.documentTitleStaff)}</title>
  <style>${CR80_CARD_STYLES}</style>
</head>
<body class="page">
  <div class="card">
    <aside class="left">
      ${buildPhotoHtml(photoDataUrl)}
    </aside>
    <section class="right staff-right">
      <div class="info" dir="rtl">
        <div class="member-name">
          <div class="field-value">${escapeHtml(L.name)} : ${escapeHtml(data.nameAr)}</div>
        </div>
        <div class="row-section-a field-value">
          <div>${escapeHtml(L.jobTitle)} : ${escapeHtml(data.jobTitleAr)}</div>
        </div>
        <div class="field-value year">${escapeHtml(data.seasonYear)}</div>
      </div>
      ${buildFooterHtml(includeFooter)}
    </section>
  </div>
</body>
</html>`;
}

function getCardHTML(
    data: MemberCardPrintData,
    photoDataUrl: string | null,
    includeFooter: boolean,
): string {
    if (data.cardType === 'staff') {
        return buildStaffCardHtml(data, photoDataUrl, includeFooter);
    }
    if (data.cardType === 'team_member') {
        return buildTeamMemberCardHtml(data, photoDataUrl, includeFooter);
    }
    return buildMemberCardHtml(data, photoDataUrl, includeFooter);
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

export const MEMBER_CARD_BACK = '/assets/card-back.png';
