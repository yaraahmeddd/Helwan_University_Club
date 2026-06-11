/**
 * Report Export System — Shared Types
 * Every admin table page uses these to define what gets exported.
 */

export type ReportLanguage = 'en' | 'ar';

/** A single column definition for the report table */
export interface ReportColumn<T> {
  /** Column header in English */
  headerEn: string;
  /** Column header in Arabic */
  headerAr: string;
  /** Extracts the cell value from a data row */
  accessor: (row: T, index: number) => string | number | null | undefined;
  /** Preferred Excel column width (characters). Defaults to 20. */
  width?: number;
}

/** Metadata about who triggered the export */
export interface ExporterInfo {
  /** Display name in the current UI language */
  name: string;
  /** Arabic name (for bilingual report header) */
  nameAr?: string;
  /** English name (for bilingual report header) */
  nameEn?: string;
  /** Job role label (localized) */
  roleLabel: string;
}

/** Everything the export utilities need */
export interface ReportConfig<T> {
  /** Short ID used for the file name, e.g. "staff", "members" */
  reportId: string;
  /** Report title in English */
  titleEn: string;
  /** Report title in Arabic */
  titleAr: string;
  /** Column definitions */
  columns: ReportColumn<T>[];
  /** All rows to export (already filtered, NOT paginated) */
  rows: T[];
  /** Active UI language — controls template direction, header language, logo placement */
  language: ReportLanguage;
  /** Who is doing the export */
  exporter: ExporterInfo;
}

/** One worksheet inside a multi-sheet Excel workbook */
export interface ReportSheet<T> {
  /** Tab name in English (max 31 chars after sanitization) */
  sheetNameEn: string;
  /** Tab name in Arabic */
  sheetNameAr: string;
  /** Optional per-sheet title override (English) */
  titleEn?: string;
  /** Optional per-sheet title override (Arabic) */
  titleAr?: string;
  rows: T[];
}
