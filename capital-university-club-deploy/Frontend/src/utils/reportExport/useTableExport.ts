/**
 * useTableExport hook
 * Wraps exportToPdf / exportToExcel with loading state and auth-user injection.
 * Any admin page: call this hook, pass to <ExportReportButton />.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { buildPersonName } from '../../lib/localizedDisplay';
import { exportToPdf } from './pdfExport';
import { exportToExcel, exportToExcelMultiSheet } from './excelExport';
import type { ReportConfig, ReportColumn, ExporterInfo, ReportSheet } from './types';

export type { ReportColumn, ExporterInfo, ReportSheet } from './types';

export interface UseTableExportOptions<T> {
  reportId: string;
  titleEn: string;
  titleAr: string;
  columns: ReportColumn<T>[];
  /** The full filtered dataset (NOT paginated) — used for PDF export */
  rows: T[];
  /**
   * Optional custom Excel export (e.g. multi-sheet).
   * PDF always uses `rows` (filtered table data).
   */
  buildExcelSheets?: () => Promise<ReportSheet<T>[]>;
}

export interface UseTableExportReturn {
  isExporting: boolean;
  exportFormat: 'excel' | 'pdf' | null;
  exportExcel: () => Promise<void>;
  exportPdf: () => Promise<void>;
}

export function useTableExport<T>(options: UseTableExportOptions<T>): UseTableExportReturn {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | null>(null);

  const buildConfig = useCallback((): ReportConfig<T> => {
    // Build exporter info from AuthContext user
    const nameResult = user
      ? buildPersonName(
          {
            firstNameAr: user.first_name_ar,
            lastNameAr: user.last_name_ar,
            firstNameEn: user.first_name_en,
            lastNameEn: user.last_name_en,
          },
          language,
        )
      : { primary: 'Unknown', secondary: '' };

    const exporter: ExporterInfo = {
      name: user?.fullName || nameResult.primary || 'Unknown',
      nameAr: user?.name_ar || (user?.first_name_ar ? `${user.first_name_ar} ${user.last_name_ar ?? ''}`.trim() : undefined),
      nameEn: user?.name_en || (user?.first_name_en ? `${user.first_name_en} ${user.last_name_en ?? ''}`.trim() : undefined),
      roleLabel: user?.role ?? 'STAFF',
    };

    return {
      reportId: options.reportId,
      titleEn: options.titleEn,
      titleAr: options.titleAr,
      columns: options.columns,
      rows: options.rows,
      language: language as 'en' | 'ar',
      exporter,
    };
  }, [user, language, options]);

  const exportExcel = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportFormat('excel');
    try {
      const config = buildConfig();
      if (options.buildExcelSheets) {
        const sheets = await options.buildExcelSheets();
        await exportToExcelMultiSheet(config, sheets);
      } else {
        await exportToExcel(config);
      }
    } catch (err) {
      console.error('[useTableExport] Excel export failed:', err);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  }, [isExporting, buildConfig, options.buildExcelSheets]);

  const exportPdf = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportFormat('pdf');
    try {
      await exportToPdf(buildConfig());
    } catch (err) {
      console.error('[useTableExport] PDF export failed:', err);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  }, [isExporting, buildConfig]);

  return { isExporting, exportFormat, exportExcel, exportPdf };
}
