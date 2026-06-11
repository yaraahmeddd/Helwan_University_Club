/**
 * ImportReportButton — download Excel template + upload filled file for bulk import.
 */

import { useState, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, Loader2, ChevronDown, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';
import { useToast } from '../../../hooks/use-toast';
import type { UseTableImportReturn } from '../../../utils/reportExport/useTableImport';
import type { ImportBatchResult } from '../../../utils/reportExport/importTypes';

interface ImportReportButtonProps extends UseTableImportReturn {
  size?: 'sm' | 'default';
}

export function ImportReportButton({
  isImporting,
  isDownloadingTemplate,
  downloadTemplate,
  triggerImport,
  fileInputRef,
  handleFileChange,
  size = 'sm',
}: ImportReportButtonProps) {
  const { t } = useTranslation('common');
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const busy = isImporting || isDownloadingTemplate;
  const isSmall = size === 'sm';

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const showImportResult = (result: ImportBatchResult | null) => {
    if (!result) return;

    if (result.failed.some((f) => f.message === 'NO_DATA_ROWS')) {
      toast({
        title: t('import.noDataTitle'),
        description: t('import.noDataDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (result.failed.length > 0 && result.success === 0) {
      const first = result.failed[0];
      toast({
        title: t('import.failedTitle'),
        description: first.rowNumber
          ? t('import.rowError', { row: first.rowNumber, message: first.message })
          : first.message,
        variant: 'destructive',
      });
      return;
    }

    if (result.failed.length > 0) {
      toast({
        title: t('import.partialTitle'),
        description: t('import.partialDesc', { success: result.success, failed: result.failed.length }),
        variant: 'default',
      });
      return;
    }

    toast({
      title: t('import.successTitle'),
      description: t('import.successDesc', { count: result.success }),
    });
  };

  const onDownloadTemplate = async () => {
    setOpen(false);
    try {
      await downloadTemplate();
      toast({
        title: t('import.templateDownloadedTitle'),
        description: t('import.templateDownloadedDesc'),
      });
    } catch {
      toast({
        title: t('import.failedTitle'),
        description: t('import.templateDownloadFailed'),
        variant: 'destructive',
      });
    }
  };

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpen(false);
    const result = await handleFileChange(event);
    showImportResult(result);
  };

  return (
    <div ref={ref} className="relative inline-flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => void onFileSelected(e)}
      />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        title={t('import.tooltip')}
        className={`
          inline-flex items-center gap-1.5 rounded-lg border border-border
          bg-background hover:bg-muted transition-all duration-150
          text-muted-foreground hover:text-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm hover:shadow
          ${isSmall ? 'h-9 px-3 text-sm' : 'h-10 px-4 text-sm'}
        `}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          <Upload className="w-4 h-4 shrink-0" />
        )}
        <span className="font-medium">
          {busy ? t('import.processing') : t('import.importLabel')}
        </span>
        {!busy && (
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && !busy && (
        <div
          className={`
            absolute z-50 min-w-[200px] mt-1 rounded-xl border border-border bg-popover
            shadow-lg ring-1 ring-black/5 overflow-hidden
            animate-in fade-in-0 zoom-in-95 duration-100
            ${isRTL ? 'left-0' : 'right-0'}
            top-full
          `}
        >
          <button
            type="button"
            onClick={() => void onDownloadTemplate()}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-start hover:bg-blue-50 hover:text-blue-700 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0 text-start">
              <p className="font-semibold">{t('import.downloadTemplate')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('import.downloadTemplateDesc')}</p>
            </div>
          </button>

          <div className="border-t border-border/60 mx-3" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              triggerImport();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-start hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0 text-start">
              <p className="font-semibold">{t('import.uploadFile')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('import.uploadFileDesc')}</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
