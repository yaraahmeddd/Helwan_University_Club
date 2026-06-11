/**
 * Excel import template generator — staff download, fill, re-upload.
 */

import ExcelJS from 'exceljs';
import type { ImportTemplateConfig } from './importTypes';

const CLR_HEADER = 'FF2C4F7C';
const CLR_WHITE = 'FFFFFFFF';
const CLR_HINT = 'FF64748B';

function sanitizeFileName(id: string): string {
  return id.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

export async function downloadImportTemplate(config: ImportTemplateConfig): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Helwan University Club';
  wb.created = new Date();

  const dataSheet = wb.addWorksheet('Import Data', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const isAr = config.language === 'ar';

  config.fields.forEach((field, idx) => {
    const col = idx + 1;
    const headerCell = dataSheet.getCell(1, col);
    headerCell.value = field.key;
    headerCell.font = { bold: true, color: { argb: CLR_WHITE }, name: 'Calibri', size: 11 };
    headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CLR_HEADER } };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerCell.border = {
      top: { style: 'thin', color: { argb: CLR_HEADER } },
      bottom: { style: 'thin', color: { argb: CLR_HEADER } },
      left: { style: 'thin', color: { argb: CLR_HEADER } },
      right: { style: 'thin', color: { argb: CLR_HEADER } },
    };

    dataSheet.getColumn(col).width = Math.max(14, field.key.length + 4);
  });

  dataSheet.getRow(1).height = 22;

  const instructions = wb.addWorksheet('Instructions', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const instrHeaders = isAr
    ? ['الحقل', 'الاسم (عربي)', 'الاسم (إنجليزي)', 'مطلوب', 'مثال', 'ملاحظات']
    : ['Field Key', 'English Label', 'Arabic Label', 'Required', 'Example', 'Notes'];

  instrHeaders.forEach((h, i) => {
    const cell = instructions.getCell(1, i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: CLR_WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CLR_HEADER } };
    cell.alignment = { horizontal: 'center' };
    instructions.getColumn(i + 1).width = i === 5 ? 40 : 18;
  });

  config.fields.forEach((field, rowIdx) => {
    const r = rowIdx + 2;
    instructions.getCell(r, 1).value = field.key;
    instructions.getCell(r, 2).value = field.labelEn;
    instructions.getCell(r, 3).value = field.labelAr;
    instructions.getCell(r, 4).value = field.required ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No');
    instructions.getCell(r, 5).value = field.example ?? '';
    instructions.getCell(r, 6).value = isAr ? (field.hintAr ?? field.hintEn ?? '') : (field.hintEn ?? field.hintAr ?? '');
  });

  const titleRow = isAr
    ? `املأ البيانات بدءاً من الصف 2 في ورقة "Import Data" (أسفل صف المفاتيح). لا تغيّر الصف 1.`
    : `Enter your data from row 2 on the "Import Data" sheet (below the field keys in row 1). Do not change row 1.`;

  const noteSheet = wb.addWorksheet('Read Me');
  noteSheet.getCell(1, 1).value = isAr ? config.titleAr : config.titleEn;
  noteSheet.getCell(1, 1).font = { bold: true, size: 14, color: { argb: CLR_HEADER } };
  noteSheet.getCell(3, 1).value = titleRow;
  noteSheet.getColumn(1).width = 90;

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFileName(config.templateId)}-import-template.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
