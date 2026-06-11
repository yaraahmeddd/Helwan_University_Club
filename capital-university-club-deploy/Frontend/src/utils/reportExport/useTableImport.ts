/**
 * useTableImport — download template + bulk import from Excel.
 */

import { useState, useCallback, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { downloadImportTemplate } from './importTemplate';
import { parseImportExcelFile, validateImportRows } from './parseImportFile';
import type { ImportFieldDefinition, ImportBatchResult } from './importTypes';

export interface UseTableImportOptions {
  templateId: string;
  titleEn: string;
  titleAr: string;
  fields: ImportFieldDefinition[];
  /** Create one record from a parsed row. Throw on failure. */
  importRow: (row: Record<string, string>, rowIndex: number) => Promise<void>;
  onComplete?: () => void | Promise<void>;
}

export interface UseTableImportReturn {
  isImporting: boolean;
  isDownloadingTemplate: boolean;
  downloadTemplate: () => Promise<void>;
  triggerImport: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<ImportBatchResult | null>;
}

export function useTableImport(options: UseTableImportOptions): UseTableImportReturn {
  const { language } = useLanguage();
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const downloadTemplate = useCallback(async () => {
    if (isDownloadingTemplate) return;
    setIsDownloadingTemplate(true);
    try {
      await downloadImportTemplate({
        templateId: options.templateId,
        titleEn: options.titleEn,
        titleAr: options.titleAr,
        fields: options.fields,
        language: language as 'en' | 'ar',
      });
    } catch (err) {
      console.error('[useTableImport] Template download failed:', err);
      throw err;
    } finally {
      setIsDownloadingTemplate(false);
    }
  }, [isDownloadingTemplate, language, options.fields, options.templateId, options.titleAr, options.titleEn]);

  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>): Promise<ImportBatchResult | null> => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file || isImporting) return null;

      setIsImporting(true);
      const result: ImportBatchResult = { total: 0, success: 0, failed: [] };

      try {
        const rows = await parseImportExcelFile(file, options.fields);
        result.total = rows.length;

        if (rows.length === 0) {
          result.failed.push({ rowNumber: 0, message: 'NO_DATA_ROWS' });
          return result;
        }

        const validationErrors = validateImportRows(rows, options.fields);
        if (validationErrors.length > 0) {
          result.failed = validationErrors;
          return result;
        }

        for (let i = 0; i < rows.length; i++) {
          const { rowNumber, values } = rows[i];
          try {
            await options.importRow(values, i);
            result.success += 1;
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : typeof err === 'object' && err !== null && 'responseData' in err
                  ? String((err as { responseData?: { message?: string; error?: string } }).responseData?.error
                      ?? (err as { responseData?: { message?: string } }).responseData?.message
                      ?? 'Import failed')
                  : 'Import failed';
            result.failed.push({ rowNumber, message });
          }
        }

        if (result.success > 0) {
          await options.onComplete?.();
        }
      } catch (err) {
        console.error('[useTableImport] Import failed:', err);
        result.failed.push({
          rowNumber: 0,
          message: err instanceof Error ? err.message : 'IMPORT_PARSE_FAILED',
        });
      } finally {
        setIsImporting(false);
      }

      return result;
    },
    [isImporting, options],
  );

  return {
    isImporting,
    isDownloadingTemplate,
    downloadTemplate,
    triggerImport,
    fileInputRef,
    handleFileChange,
  };
}
