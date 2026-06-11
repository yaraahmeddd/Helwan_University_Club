/**
 * Parse uploaded Excel import files into row objects.
 */

import ExcelJS from 'exceljs';
import type { ImportFieldDefinition, ParsedImportRow, ImportRowError } from './importTypes';

function cellToString(value: ExcelJS.CellValue): string {
  if (value == null || value === '') return '';

  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (value instanceof Date) {
    return value.toLocaleDateString('en-GB');
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    // Formula cell — use computed result
    if ('result' in obj && obj.result != null && obj.result !== '') {
      return cellToString(obj.result as ExcelJS.CellValue);
    }

    // Hyperlink cell
    if (typeof obj.text === 'string') return obj.text.trim();

    // Rich text cell
    if (Array.isArray(obj.richText)) {
      return (obj.richText as Array<{ text?: string }>)
        .map((part) => part.text ?? '')
        .join('')
        .trim();
    }
  }

  const asString = String(value).trim();
  return asString === '[object Object]' ? '' : asString;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function resolveColumnMap(
  headerRow: ExcelJS.Row,
  fields: ImportFieldDefinition[],
): Map<number, string> {
  const map = new Map<number, string>();
  const fieldByKey = new Map(fields.map((f) => [normalizeHeader(f.key), f.key]));
  const fieldByEn = new Map(fields.map((f) => [normalizeHeader(f.labelEn), f.key]));
  const fieldByAr = new Map(fields.map((f) => [normalizeHeader(f.labelAr), f.key]));

  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const raw = cellToString(cell.value);
    if (!raw) return;
    const norm = normalizeHeader(raw);
    const key =
      fieldByKey.get(norm) ??
      fieldByEn.get(norm) ??
      fieldByAr.get(norm);
    if (key) map.set(colNumber, key);
  });

  return map;
}

function isEmptyRow(values: Record<string, string>): boolean {
  return Object.values(values).every((v) => !v.trim());
}

/** Skip legacy template label row (row 2) and example row (row 3). */
function isTemplateMetaRow(
  values: Record<string, string>,
  fields: ImportFieldDefinition[],
  rowNumber: number,
): boolean {
  if (rowNumber === 2) {
    const withLabels = fields.filter((f) => {
      const v = values[f.key]?.trim();
      return v === f.labelEn.trim() || v === f.labelAr.trim();
    });
    if (withLabels.length >= Math.max(1, Math.ceil(fields.length * 0.5))) return true;
  }

  if (rowNumber === 3) {
    const withExamples = fields.filter((f) => {
      if (!f.example) return false;
      const v = values[f.key]?.trim().toLowerCase();
      return v === f.example.trim().toLowerCase();
    });
    const exampleFields = fields.filter((f) => f.example);
    if (exampleFields.length > 0 && withExamples.length >= Math.max(1, Math.ceil(exampleFields.length * 0.5))) {
      return true;
    }
  }

  return false;
}

function getSheetMaxRow(sheet: ExcelJS.Worksheet, columnMap: Map<number, string>): number {
  let lastDataRow = 1;
  let emptyStreak = 0;

  for (let r = 2; r <= 500; r++) {
    const row = sheet.getRow(r);
    let hasValue = false;
    columnMap.forEach((_key, colNumber) => {
      if (cellToString(row.getCell(colNumber).value)) hasValue = true;
    });

    if (hasValue) {
      lastDataRow = r;
      emptyStreak = 0;
    } else {
      emptyStreak += 1;
      if (emptyStreak >= 20 && r > lastDataRow + 20) break;
    }
  }

  return Math.max(sheet.rowCount, sheet.actualRowCount ?? 0, lastDataRow);
}

export async function parseImportExcelFile(
  file: File,
  fields: ImportFieldDefinition[],
): Promise<ParsedImportRow[]> {
  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const sheet =
    wb.getWorksheet('Import Data') ??
    wb.worksheets.find((ws) => ws.name.toLowerCase().includes('import')) ??
    wb.worksheets[0];

  if (!sheet) return [];

  const columnMap = resolveColumnMap(sheet.getRow(1), fields);
  if (columnMap.size === 0) {
    throw new Error('INVALID_TEMPLATE_HEADERS');
  }

  const rows: ParsedImportRow[] = [];
  const maxRow = getSheetMaxRow(sheet, columnMap);

  // Data starts at row 2 (first row below field keys). Legacy templates with
  // label/example rows on 2–3 are skipped automatically.
  for (let rowNumber = 2; rowNumber <= maxRow; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const values: Record<string, string> = {};

    columnMap.forEach((key, colNumber) => {
      values[key] = cellToString(row.getCell(colNumber).value);
    });

    if (isEmptyRow(values)) continue;
    if (isTemplateMetaRow(values, fields, rowNumber)) continue;

    rows.push({ rowNumber, values });
  }

  return rows;
}

export function validateImportRows(
  rows: ParsedImportRow[],
  fields: ImportFieldDefinition[],
): ImportRowError[] {
  const errors: ImportRowError[] = [];
  const required = fields.filter((f) => f.required);

  rows.forEach(({ rowNumber, values }) => {
    required.forEach((field) => {
      if (!values[field.key]?.trim()) {
        errors.push({
          rowNumber,
          message: `Missing required field: ${field.key}`,
        });
      }
    });
  });

  return errors;
}
