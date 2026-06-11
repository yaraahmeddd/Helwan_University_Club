/**
 * PDF Export — html2pdf.js
 * Layout uses HTML tables (NOT flexbox/RTL) so html2canvas captures
 * content from x=0 correctly. Arabic is handled via text-align:right only.
 */

import html2pdf from 'html2pdf.js';
import type { ReportConfig } from './types';
import { ROLE_LABELS } from '../../types/auth';
import type { Role } from '../../types/auth';

// ─── Logo cache ───────────────────────────────────────────────────────────────
let cachedLogoDataUrl: string | null = null;

async function getLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  try {
    const res = await fetch('/assets/HUC logo.jpeg');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => { cachedLogoDataUrl = reader.result as string; resolve(cachedLogoDataUrl); };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

// ─── Palette ─────────────────────────────────────────────────────────────────
const CLR_NAV      = '#1e3a5f';
const CLR_NAV_TXT  = '#ffffff';
const CLR_TH_BG    = '#2c4f7c';
const CLR_ROW_ODD  = '#ffffff';
const CLR_ROW_EVEN = '#f4f7fb';
const CLR_BORDER   = '#d1dae8';
const CLR_BODY_TXT = '#1e293b';
const CLR_MUTED    = '#64748b';
const CLR_META_BG  = '#f8fafc';

const ROWS_FIRST = 20;
const ROWS_REST  = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatExportDate(language: 'en' | 'ar'): string {
  return new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
function getRoleLabel(roleKey: string, language: 'en' | 'ar'): string {
  const ar = ROLE_LABELS[roleKey as Role];
  if (language === 'ar' && ar) return ar;
  return roleKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// ─── Build data table (no direction on wrapper) ───────────────────────────────
function makeTable<T>(rows: T[], startIdx: number, config: ReportConfig<T>, ta: string, font: string): string {
  const isAr = config.language === 'ar';

  const renderColumns = isAr ? [...config.columns].reverse() : config.columns;

  const thCells = renderColumns.map((col) =>
    `<td style="background:${CLR_TH_BG};color:${CLR_NAV_TXT};padding:9px 10px;font-size:9px;font-weight:700;text-align:${ta};border-right:1px solid rgba(255,255,255,0.1);font-family:${font};">${isAr ? col.headerAr : col.headerEn}</td>`
  ).join('');

  const dataRows = rows.map((row, i) => {
    const idx = startIdx + i;
    const bg  = idx % 2 === 0 ? CLR_ROW_ODD : CLR_ROW_EVEN;
    const cells = renderColumns.map((col) => {
      const val = col.accessor(row, idx);
      const txt = val !== null && val !== undefined ? String(val) : '—';
      return `<td style="padding:6px 10px;border-bottom:1px solid ${CLR_BORDER};font-size:9px;color:${CLR_BODY_TXT};text-align:${ta};vertical-align:middle;font-family:${font};">${txt}</td>`;
    }).join('');
    return `<tr style="background:${bg};">${cells}</tr>`;
  }).join('');

  return `
<table style="width:100%;border-collapse:collapse;table-layout:fixed;">
  <thead><tr>${thCells}</tr></thead>
  <tbody>${dataRows}</tbody>
</table>`;
}

// ─── Build full HTML (table-based layout only, no flexbox) ────────────────────
function buildHtml<T>(config: ReportConfig<T>, logoDataUrl: string | null): string {
  const isAr = config.language === 'ar';
  const ta   = isAr ? 'right' : 'left';
  const font = isAr
    ? "'Cairo','Arabic Typesetting','Traditional Arabic',Tahoma,Arial,sans-serif"
    : "'Segoe UI','Inter',Arial,sans-serif";

  const clubPrimary    = isAr ? 'نادي جامعة حلوان' : 'Helwan University Club';
  const clubSecondary  = isAr ? 'Helwan University Club' : 'نادي جامعة حلوان';
  const titlePrimary   = isAr ? config.titleAr : config.titleEn;
  const titleSecondary = isAr ? config.titleEn : config.titleAr;
  const systemLabel    = isAr ? 'نظام إدارة النادي' : 'Club Management System';
  const totalLabel     = isAr ? 'إجمالي السجلات' : 'Total Records';
  const byLabel        = isAr ? 'بواسطة' : 'By';
  const roleLabel      = isAr ? 'الدور' : 'Role';
  const dateLabel      = isAr ? 'التاريخ' : 'Date';

  const exporterName = isAr
    ? (config.exporter.nameAr || config.exporter.name)
    : (config.exporter.nameEn || config.exporter.name);
  const exporterRole = getRoleLabel(config.exporter.roleLabel, config.language);
  const exportDate   = formatExportDate(config.language);

  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="Logo" style="height:48px;width:auto;object-fit:contain;border-radius:6px;" />`
    : '';

  // Header uses HTML table — always LTR flow so canvas renders from x=0
  // Logo: right col for EN, left col for AR
  const headerRow = isAr
    ? `<tr>
        <td style="background:${CLR_NAV};width:64px;text-align:center;vertical-align:middle;padding:10px;">${logoHtml}</td>
        <td style="background:${CLR_NAV};text-align:right;vertical-align:middle;padding:16px 20px;">
          <div style="font-size:7.5px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">${systemLabel}</div>
          <div style="font-size:16px;font-weight:800;color:${CLR_NAV_TXT};">${clubPrimary}</div>
          <div style="font-size:8px;color:rgba(255,255,255,0.45);margin-top:2px;">${clubSecondary}</div>
          <div style="margin-top:9px;padding-top:9px;border-top:1px solid rgba(255,255,255,0.15);">
            <div style="font-size:13px;font-weight:700;color:${CLR_NAV_TXT};">${titlePrimary}</div>
            <div style="font-size:8px;color:rgba(255,255,255,0.45);margin-top:2px;">${titleSecondary}</div>
          </div>
        </td>
      </tr>`
    : `<tr>
        <td style="background:${CLR_NAV};text-align:left;vertical-align:middle;padding:16px 20px;">
          <div style="font-size:7.5px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">${systemLabel}</div>
          <div style="font-size:16px;font-weight:800;color:${CLR_NAV_TXT};">${clubPrimary}</div>
          <div style="font-size:8px;color:rgba(255,255,255,0.45);margin-top:2px;">${clubSecondary}</div>
          <div style="margin-top:9px;padding-top:9px;border-top:1px solid rgba(255,255,255,0.15);">
            <div style="font-size:13px;font-weight:700;color:${CLR_NAV_TXT};">${titlePrimary}</div>
            <div style="font-size:8px;color:rgba(255,255,255,0.45);margin-top:2px;">${titleSecondary}</div>
          </div>
        </td>
        <td style="background:${CLR_NAV};width:64px;text-align:center;vertical-align:middle;padding:10px;">${logoHtml}</td>
      </tr>`;

  const header = `<table style="width:100%;border-collapse:collapse;">${headerRow}</table>`;

  // Meta bar also uses a table
  const metaLeft  = `${byLabel}: ${exporterName} &nbsp;|&nbsp; ${roleLabel}: ${exporterRole} &nbsp;|&nbsp; ${dateLabel}: ${exportDate}`;
  const metaRight = `${totalLabel}: ${config.rows.length}`;
  const metaBar = `
<table style="width:100%;border-collapse:collapse;background:${CLR_META_BG};border-bottom:2px solid ${CLR_TH_BG};">
  <tr>
    <td style="padding:7px 20px;text-align:${ta};font-size:8px;color:${CLR_MUTED};">${isAr ? metaRight : metaLeft}</td>
    <td style="padding:7px 20px;text-align:${isAr ? 'left' : 'right'};font-size:8px;font-weight:700;color:${CLR_TH_BG};">${isAr ? metaLeft : metaRight}</td>
  </tr>
</table>`;

  // Compact header for subsequent pages
  const compactHeader = isAr
    ? `<table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="background:${CLR_NAV};width:50px;text-align:center;vertical-align:middle;padding:6px;">${logoHtml ? `<img src="${logoDataUrl}" alt="Logo" style="height:28px;width:auto;" />` : ''}</td>
          <td style="background:${CLR_NAV};text-align:right;vertical-align:middle;padding:7px 14px;">
            <span style="font-size:11px;font-weight:700;color:${CLR_NAV_TXT};">${clubPrimary}</span>
            <span style="font-size:8px;color:rgba(255,255,255,0.5);margin-right:6px;margin-left:6px;">—</span>
            <span style="font-size:9.5px;color:rgba(255,255,255,0.75);">${titlePrimary}</span>
          </td>
        </tr>
      </table>`
    : `<table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="background:${CLR_NAV};text-align:left;vertical-align:middle;padding:7px 14px;">
            <span style="font-size:11px;font-weight:700;color:${CLR_NAV_TXT};">${clubPrimary}</span>
            <span style="font-size:8px;color:rgba(255,255,255,0.5);margin:0 6px;">—</span>
            <span style="font-size:9.5px;color:rgba(255,255,255,0.75);">${titlePrimary}</span>
          </td>
          <td style="background:${CLR_NAV};width:50px;text-align:center;vertical-align:middle;padding:6px;">${logoHtml ? `<img src="${logoDataUrl}" alt="Logo" style="height:28px;width:auto;" />` : ''}</td>
        </tr>
      </table>`;

  // Split rows into page chunks
  const all    = config.rows;
  const chunks: { rows: typeof all; start: number }[] = [];
  if (all.length > 0) {
    chunks.push({ rows: all.slice(0, ROWS_FIRST), start: 0 });
    let off = ROWS_FIRST;
    while (off < all.length) {
      chunks.push({ rows: all.slice(off, off + ROWS_REST), start: off });
      off += ROWS_REST;
    }
  }

  const page1 = `
<div style="background:#ffffff;">
  ${header}
  ${metaBar}
  ${chunks.length > 0 ? makeTable(chunks[0].rows, 0, config, ta, font) : ''}
</div>`;

  const otherPages = chunks.slice(1).map((chunk) => `
<div style="page-break-before:always;background:#ffffff;">
  ${compactHeader}
  ${makeTable(chunk.rows, chunk.start, config, ta, font)}
</div>`).join('');

  const isLandscape = config.columns.length > 6;
  const pageW = isLandscape ? '297mm' : '210mm';

  return `<div style="font-family:${font};background:#ffffff;margin:0;padding:0;width:${pageW};">
${page1}
${otherPages}
</div>`;
}

// ─── Export ───────────────────────────────────────────────────────────────────
export async function exportToPdf<T>(config: ReportConfig<T>): Promise<void> {
  const logoDataUrl = await getLogoDataUrl();
  const html        = buildHtml(config, logoDataUrl);
  const fileName    = `${config.reportId}-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  const isLandscape = config.columns.length > 6;
  const pxW         = isLandscape ? 1123 : 794;

  // Let html2pdf handle the DOM insertion internally. 
  // Passing the HTML string directly creates an off-screen iframe 
  // automatically, preventing opacity/visibility issues with html2canvas.
  await html2pdf()
    .set({
      margin: 0,
      filename: fileName,
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: pxW,
        foreignObjectRendering: false,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: isLandscape ? 'landscape' : 'portrait',
      },
      pagebreak: { mode: 'css', before: '[style*="page-break-before:always"]' },
    })
    .from(html)
    .save();
}
