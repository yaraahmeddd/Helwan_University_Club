/**
 * Excel Export — ExcelJS
 * Matches the PDF report design:
 * - Deep navy header (club name + system label + report title)
 * - Metadata bar (by, role, date, total)
 * - Navy column headers, alternating white / light-blue rows
 * - Logo top-right (EN) or top-left (AR)
 * - Freeze pane below header rows
 */

import ExcelJS from 'exceljs';
import type { ReportConfig } from './types';
import { ROLE_LABELS } from '../../types/auth';
import type { Role } from '../../types/auth';

// ─── Palette (matching PDF) ───────────────────────────────────────────────────
const CLR_NAVY_DARK  = 'FF1E3A5F';   // #1e3a5f  — page header bg
const CLR_NAVY       = 'FF2C4F7C';   // #2c4f7c  — table header bg
const CLR_WHITE      = 'FFFFFFFF';
const CLR_META_BG    = 'FFF8FAFC';   // #f8fafc  — metadata bar bg
const CLR_META_TXT   = 'FF64748B';   // #64748b  — muted label
const CLR_BODY_TXT   = 'FF1E293B';   // #1e293b  — body text
const CLR_ROW_EVEN   = 'FFF4F7FB';   // #f4f7fb  — alternating row
const CLR_BORDER     = 'FFD1DAE8';   // #d1dae8  — cell border

// ─── Logo cache ───────────────────────────────────────────────────────────────
let cachedLogoBuffer: ArrayBuffer | null = null;

async function getLogoBuffer(): Promise<ArrayBuffer | null> {
  if (cachedLogoBuffer) return cachedLogoBuffer;
  try {
    const res = await fetch('/assets/HUC logo.jpeg');
    if (!res.ok) return null;
    cachedLogoBuffer = await res.arrayBuffer();
    return cachedLogoBuffer;
  } catch { return null; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatExportDateTime(language: 'en' | 'ar'): string {
  return new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getRoleLabel(roleKey: string, language: 'en' | 'ar'): string {
  const ar = ROLE_LABELS[roleKey as Role];
  if (language === 'ar' && ar) return ar;
  return roleKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// ─── Cell styling helper ──────────────────────────────────────────────────────
function styleCell(
  cell: ExcelJS.Cell,
  opts: {
    value?: string | number | null;
    bold?: boolean;
    italic?: boolean;
    fontSize?: number;
    fontColor?: string;
    bgColor?: string;
    hAlign?: ExcelJS.Alignment['horizontal'];
    vAlign?: ExcelJS.Alignment['vertical'];
    wrapText?: boolean;
    border?: boolean;
  }
) {
  if (opts.value !== undefined) cell.value = opts.value ?? '';

  cell.font = {
    name: 'Calibri',
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    size: opts.fontSize ?? 10,
    color: { argb: opts.fontColor ?? CLR_BODY_TXT },
  };

  if (opts.bgColor) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.bgColor } };
  }

  cell.alignment = {
    horizontal: opts.hAlign ?? 'left',
    vertical: opts.vAlign ?? 'middle',
    wrapText: opts.wrapText ?? false,
  };

  if (opts.border) {
    const b: ExcelJS.Border = { style: 'thin', color: { argb: CLR_BORDER } };
    cell.border = { top: b, bottom: b, left: b, right: b };
  }
}

// ─── Main export function ──────────────────────────────────────────────────────
export async function exportToExcel<T>(config: ReportConfig<T>): Promise<void> {
  const isAr     = config.language === 'ar';
  const colCount = config.columns.length;
  const hAlign   = isAr ? 'right' : 'left';

  // Labels
  const clubPrimary   = isAr ? 'نادي جامعة حلوان' : 'Helwan University Club';
  const clubSecondary = isAr ? 'Helwan University Club' : 'نادي جامعة حلوان';
  const titlePrimary  = isAr ? config.titleAr : config.titleEn;
  const titleSecondary= isAr ? config.titleEn : config.titleAr;
  const systemLabel   = isAr ? 'نظام إدارة النادي' : 'Club Management System';
  const totalLabel    = isAr ? 'إجمالي السجلات' : 'Total Records';
  const byLabel       = isAr ? 'بواسطة' : 'By';
  const roleLabel     = isAr ? 'الدور' : 'Role';
  const dateLabel     = isAr ? 'التاريخ' : 'Date';

  const exporterName  = isAr
    ? (config.exporter.nameAr || config.exporter.name)
    : (config.exporter.nameEn || config.exporter.name);
  const exporterRole  = getRoleLabel(config.exporter.roleLabel, config.language);
  const exportDate    = formatExportDateTime(config.language);

  // Workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Helwan University Club — Club Management System';
  workbook.created = new Date();

  const sheetName = (isAr ? config.titleAr : `${config.titleEn} Report`).slice(0, 31);
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ rightToLeft: isAr }],
    pageSetup: {
      paperSize: 9,
      orientation: colCount > 6 ? 'landscape' : 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.25, right: 0.25, top: 0.25, bottom: 0.25, header: 0, footer: 0.2 },
    },
    headerFooter: {
      oddFooter: isAr
        ? `&C${config.titleAr} — نادي جامعة حلوان&Rصفحة &P من &N`
        : `&C${config.titleEn} — Helwan University Club&RPage &P of &N`,
    },
  });

  // Column widths
  sheet.columns = config.columns.map((col) => ({ width: col.width ?? 22 }));

  // ── ROW 1: System label + Club name (primary) ─────────────────────────────
  sheet.addRow([]);
  sheet.mergeCells(1, 1, 1, colCount);
  styleCell(sheet.getCell(1, 1), {
    value: `${systemLabel.toUpperCase()}  •  ${clubPrimary}`,
    bold: true,
    fontSize: 13,
    bgColor: CLR_NAVY_DARK,
    fontColor: CLR_WHITE,
    hAlign: isAr ? 'right' : 'left',
  });
  sheet.getRow(1).height = 28;

  // ── ROW 2: Club secondary name ────────────────────────────────────────────
  sheet.addRow([]);
  sheet.mergeCells(2, 1, 2, colCount);
  styleCell(sheet.getCell(2, 1), {
    value: clubSecondary,
    italic: true,
    fontSize: 9,
    bgColor: CLR_NAVY_DARK,
    fontColor: 'FFa8bcd8',
    hAlign: isAr ? 'right' : 'left',
  });
  sheet.getRow(2).height = 16;

  // ── ROW 3: Report title (primary) ─────────────────────────────────────────
  sheet.addRow([]);
  sheet.mergeCells(3, 1, 3, colCount);
  styleCell(sheet.getCell(3, 1), {
    value: titlePrimary,
    bold: true,
    fontSize: 12,
    bgColor: CLR_NAVY,
    fontColor: CLR_WHITE,
    hAlign: isAr ? 'right' : 'left',
  });
  sheet.getRow(3).height = 26;

  // ── ROW 4: Report title (secondary) ──────────────────────────────────────
  sheet.addRow([]);
  sheet.mergeCells(4, 1, 4, colCount);
  styleCell(sheet.getCell(4, 1), {
    value: titleSecondary,
    italic: true,
    fontSize: 9,
    bgColor: CLR_NAVY,
    fontColor: 'FFa8bcd8',
    hAlign: isAr ? 'right' : 'left',
  });
  sheet.getRow(4).height = 16;

  // ── ROW 5: Metadata bar ───────────────────────────────────────────────────
  sheet.addRow([]);
  sheet.mergeCells(5, 1, 5, colCount);
  styleCell(sheet.getCell(5, 1), {
    value: `${byLabel}: ${exporterName}   |   ${roleLabel}: ${exporterRole}   |   ${dateLabel}: ${exportDate}   |   ${totalLabel}: ${config.rows.length}`,
    fontSize: 8,
    italic: true,
    bgColor: CLR_META_BG,
    fontColor: CLR_META_TXT,
    hAlign: 'center',
  });
  sheet.getRow(5).height = 18;
  // Top accent border on meta row
  sheet.getCell(5, 1).border = {
    top: { style: 'medium', color: { argb: CLR_NAVY } },
    bottom: { style: 'thin', color: { argb: CLR_BORDER } },
  };

  // ── ROW 6: Column headers ─────────────────────────────────────────────────
  const headerVals = config.columns.map((col) => (isAr ? col.headerAr : col.headerEn));
  const headerRow  = sheet.addRow(headerVals);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    styleCell(cell, {
      bold: true,
      fontSize: 9,
      bgColor: CLR_NAVY,
      fontColor: CLR_WHITE,
      hAlign: hAlign,
      border: true,
    });
    // Override border color to navy for the header
    cell.border = {
      top: { style: 'thin', color: { argb: CLR_NAVY_DARK } },
      bottom: { style: 'thin', color: { argb: CLR_NAVY_DARK } },
      left: { style: 'thin', color: { argb: CLR_NAVY_DARK } },
      right: { style: 'thin', color: { argb: CLR_NAVY_DARK } },
    };
  });

  // Auto-filter on header row
  sheet.autoFilter = { from: { row: 6, column: 1 }, to: { row: 6, column: colCount } };

  // ── Data rows (starting row 7) ────────────────────────────────────────────
  config.rows.forEach((row, idx) => {
    const values  = config.columns.map((col) => {
      const val = col.accessor(row, idx);
      return val !== null && val !== undefined ? val : '—';
    });
    const dataRow = sheet.addRow(values);
    dataRow.height = 16;
    const isEvenRow = idx % 2 === 0;
    dataRow.eachCell((cell) => {
      styleCell(cell, {
        fontSize: 9,
        bgColor: isEvenRow ? CLR_WHITE : CLR_ROW_EVEN,
        fontColor: CLR_BODY_TXT,
        hAlign: hAlign,
        border: true,
      });
    });
  });

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoBuffer = await getLogoBuffer();
  if (logoBuffer && colCount >= 2) {
    try {
      const imageId = workbook.addImage({ buffer: logoBuffer as Buffer, extension: 'jpeg' });
      // Always place logo at top-right corner (last column), rows 1-2 only
      // This avoids overlapping with the merged text in col A
      sheet.addImage(imageId, {
        tl: { col: colCount - 1, row: 0 },
        br: { col: colCount,     row: 2 },
        editAs: 'oneCell',
      });
    } catch { /* non-critical */ }
  }

  // ── Freeze panes ──────────────────────────────────────────────────────────
  sheet.views = [{ state: 'frozen', ySplit: 6, rightToLeft: isAr }];

  // ── Print repeating rows ──────────────────────────────────────────────────
  sheet.pageSetup.printTitlesRow = '1:6';

  // ── Download ──────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const fileName = `${config.reportId}-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
