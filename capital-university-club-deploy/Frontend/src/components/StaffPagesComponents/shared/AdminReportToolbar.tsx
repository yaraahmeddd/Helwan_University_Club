/**
 * AdminReportToolbar — Export + optional Import buttons for admin table pages.
 */

import { ExportReportButton } from './ExportReportButton';
import { ImportReportButton } from './ImportReportButton';
import { RoleGuard } from '../RoleGuard';
import type { UseTableExportReturn } from '../../../utils/reportExport/useTableExport';
import type { UseTableImportReturn } from '../../../utils/reportExport/useTableImport';

interface AdminReportToolbarProps {
  export: UseTableExportReturn;
  import?: UseTableImportReturn;
  /** When set, import is shown only to users with this privilege. */
  importPrivilege?: string;
  rowCount?: number;
}

export function AdminReportToolbar({
  export: exportHandle,
  import: importHandle,
  importPrivilege,
  rowCount,
}: AdminReportToolbarProps) {
  const importButton = importHandle ? <ImportReportButton {...importHandle} /> : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ExportReportButton {...exportHandle} rowCount={rowCount} />
      {importButton && importPrivilege ? (
        <RoleGuard privilege={importPrivilege}>{importButton}</RoleGuard>
      ) : (
        importButton
      )}
    </div>
  );
}
