/**
 * ExportReportButton
 * A polished dropdown button used in every admin page header to trigger Excel / PDF exports.
 * Accepts the return value of useTableExport() as props.
 */

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';
import type { UseTableExportReturn } from '../../../utils/reportExport/useTableExport';

interface ExportReportButtonProps extends UseTableExportReturn {
  /** Displayed total rows count in the button tooltip */
  rowCount?: number;
  /** Button size variant */
  size?: 'sm' | 'default';
}

export function ExportReportButton({
  isExporting,
  exportFormat,
  exportExcel,
  exportPdf,
  rowCount,
  size = 'sm',
}: ExportReportButtonProps) {
  const { t } = useTranslation('common');
  const { isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleExcel = async () => {
    setOpen(false);
    await exportExcel();
  };

  const handlePdf = async () => {
    setOpen(false);
    await exportPdf();
  };

  const isSmall = size === 'sm';

  return (
    <div ref={ref} className="relative inline-flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isExporting}
        title={
          rowCount !== undefined
            ? t('export.tooltip', { count: rowCount })
            : t('export.tooltipGeneric')
        }
        className={`
          inline-flex items-center gap-1.5 rounded-lg border border-border
          bg-background hover:bg-muted transition-all duration-150
          text-muted-foreground hover:text-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm hover:shadow
          ${isSmall ? 'h-9 px-3 text-sm' : 'h-10 px-4 text-sm'}
        `}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          <Download className="w-4 h-4 shrink-0" />
        )}
        <span className="font-medium">
          {isExporting
            ? (exportFormat === 'excel'
                ? (t('export.generatingExcel', { defaultValue: 'Generating Excel…' }))
                : (t('export.generatingPdf', { defaultValue: 'Generating PDF…' })))
            : t('export.exportReport', { defaultValue: 'Export' })}
        </span>
        {!isExporting && (
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Dropdown menu */}
      {open && !isExporting && (
        <div
          className={`
            absolute z-50 min-w-[180px] mt-1 rounded-xl border border-border bg-popover
            shadow-lg ring-1 ring-black/5 overflow-hidden
            animate-in fade-in-0 zoom-in-95 duration-100
            ${isRTL ? 'left-0' : 'right-0'}
            top-full
          `}
        >
          {/* Excel option */}
          <button
            type="button"
            onClick={handleExcel}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-start hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors shrink-0">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0 text-start">
              <p className="font-semibold">
                {t('export.excel', { defaultValue: 'Export as Excel' })}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('export.excelDesc', { defaultValue: '.xlsx — Spreadsheet format' })}
              </p>
            </div>
          </button>

          <div className="border-t border-border/60 mx-3" />

          {/* PDF option */}
          <button
            type="button"
            onClick={handlePdf}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-start hover:bg-rose-50 hover:text-rose-700 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center transition-colors shrink-0">
              <FileText className="w-4 h-4 text-rose-600" />
            </div>
            <div className="min-w-0 text-start">
              <p className="font-semibold">
                {t('export.pdf', { defaultValue: 'Export as PDF' })}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('export.pdfDesc', { defaultValue: '.pdf — Printable format' })}
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
