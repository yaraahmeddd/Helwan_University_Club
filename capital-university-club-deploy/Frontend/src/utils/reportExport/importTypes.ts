/**
 * Report Import System — shared types for bulk Excel import templates.
 */

export interface ImportFieldDefinition {
  /** Column key used in template header row and parsed row object */
  key: string;
  labelEn: string;
  labelAr: string;
  required?: boolean;
  /** Shown in Instructions sheet and optional example row */
  example?: string;
  hintEn?: string;
  hintAr?: string;
}

export interface ImportTemplateConfig {
  templateId: string;
  titleEn: string;
  titleAr: string;
  fields: ImportFieldDefinition[];
  language: 'en' | 'ar';
}

export interface ParsedImportRow {
  rowNumber: number;
  values: Record<string, string>;
}

export interface ImportRowError {
  rowNumber: number;
  message: string;
}

export interface ImportBatchResult {
  total: number;
  success: number;
  failed: ImportRowError[];
}
