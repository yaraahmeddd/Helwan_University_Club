import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Eye,
  X,
  Filter,
  RotateCcw,
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import type { AuditLog } from '@/services/auditLogApi';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/StaffPagesComponents/ui/table';
import { adminTableStyles, adminHeadClass, adminCellClass } from '@/components/StaffPagesComponents/shared/adminTableStyles';
import { AdminPageHeader } from '@/components/StaffPagesComponents/shared/AdminPageHeader';
import { ExportReportButton } from '@/components/StaffPagesComponents/shared/ExportReportButton';
import { useTableExport } from '@/utils/reportExport/useTableExport';
import { Button } from '@/components/StaffPagesComponents/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdminFormatters } from '@/components/StaffPagesComponents/shared/adminFormatters';
import {
  getAuditLogs,
  getAuditLogFilters,
  getAuditStats
} from '@/services/auditLogApi';

type AuditStatus = "نجح" | "فشل";

interface Filters {
  logId: string;
  userName: string;
  role: string;
  action: string;
  module: string;
  dateFrom: string;
  dateTo: string;
  status: "" | AuditStatus;
}

const colors = {
  primaryDark: "#1F3A5F",
  primaryBlue: "#244A73",
  accentBlue: "#2EA7C9",
  accentOrange: "#F4A623",
  background: "#F4F6F9",
  white: "#FFFFFF",
  border: "#E5E7EB",
  success: "#28A745",
  warning: "#FFC107",
  danger: "#DC3545",
  info: "#17A2B8",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    600: "#4B5563",
    700: "#374151",
    900: "#111827",
  },
} as const;

const AuditLogPage: React.FC = () => {
  const { t } = useTranslation("AuditLogPage");
  const { language, isRTL } = useLanguage();
  const { fmtDateTime } = useAdminFormatters();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<Filters>({
    logId: "",
    userName: "",
    role: "",
    action: "",
    module: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    today: 0
  });

  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const [moduleOptions, setModuleOptions] = useState<string[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);

  // Fetch Stats and Options on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, filterData] = await Promise.all([
          getAuditStats(),
          getAuditLogFilters()
        ]);
        setStats(statsData);
        setActionOptions(filterData.actions);
        setModuleOptions(filterData.modules);
        setRoleOptions(filterData.roles);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchData();
  }, []);

  // Fetch Logs when Filters or Page Changes
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await getAuditLogs({
          ...filters,
          page: currentPage,
          limit: itemsPerPage
        });
        setLogs(response.logs);
        setTotalLogs(response.total);
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce basic text inputs slightly if needed, but for now direct call
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalLogs / itemsPerPage));

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      logId: "",
      userName: "",
      role: "",
      action: "",
      module: "",
      dateFrom: "",
      dateTo: "",
      status: "",
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const isSuccess = status === "نجح";
    const translatedStatus = isSuccess ? t("table.status.success") : t("table.status.failed");
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: isSuccess ? `${colors.success}15` : `${colors.danger}15`,
          color: isSuccess ? colors.success : colors.danger,
        }}
      >
        {translatedStatus}
      </span>
    );
  };

  const exportHandle = useTableExport({
    reportId: "audit-log",
    titleEn: "Audit Log Report",
    titleAr: "تقرير سجل التدقيق",
    columns: [
      {
        headerEn: "Log ID",
        headerAr: "رقم السجل",
        accessor: (log: AuditLog) => log.id,
        width: 12,
      },
      {
        headerEn: "User Name",
        headerAr: "اسم المستخدم",
        accessor: (log: AuditLog) => log.userName,
        width: 18,
      },
      {
        headerEn: "Role",
        headerAr: "الدور",
        accessor: (log: AuditLog) => log.role,
        width: 14,
      },
      {
        headerEn: "Action",
        headerAr: "الإجراء",
        accessor: (log: AuditLog) => log.action,
        width: 14,
      },
      {
        headerEn: "Module",
        headerAr: "الوحدة",
        accessor: (log: AuditLog) => log.module,
        width: 14,
      },
      {
        headerEn: "Description",
        headerAr: "الوصف",
        accessor: (log: AuditLog) => log.description,
        width: 28,
      },
      {
        headerEn: "Status",
        headerAr: "الحالة",
        accessor: (log: AuditLog) =>
          log.status === "نجح" ? t("table.status.success") : t("table.status.failed"),
        width: 12,
      },
      {
        headerEn: "Date & Time",
        headerAr: "التاريخ والوقت",
        accessor: (log: AuditLog) => fmtDateTime(log.dateTime),
        width: 18,
      },
    ],
    rows: logs,
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <AdminPageHeader
        icon={FileText}
        title={t("header.title")}
        subtitle={t("header.subtitle")}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              {t("actions.clearFilters")}
            </Button>
            <ExportReportButton {...exportHandle} rowCount={logs.length} />
          </>
        }
      />
      <div className="flex-1 overflow-y-auto min-h-0 p-6">
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {([
              { label: t("stats.totalLogs"), value: stats.total, icon: FileText, color: colors.accentBlue },
              { label: t("stats.successful"), value: stats.successful, icon: CheckCircle, color: colors.success },
              { label: t("stats.failed"), value: stats.failed, icon: XCircle, color: colors.danger },
              { label: t("stats.today"), value: stats.today, icon: Calendar, color: colors.info },
            ] as const).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor: `${stat.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: stat.color,
                        marginBottom: "4px",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: colors.gray[600],
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              backgroundColor: colors.white,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Filter size={20} color={colors.primaryDark} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: colors.primaryDark, margin: 0 }}>{t("filters.title")}</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: colors.gray[700], marginBottom: "8px" }}>{t("filters.logId.label")}</label>
                <input
                  type="text"
                  value={filters.logId}
                  onChange={(e) => handleFilterChange("logId", e.target.value)}
                  placeholder={t("filters.logId.placeholder")}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "'Cairo', sans-serif",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: colors.gray[700], marginBottom: "8px" }}>{t("filters.userName.label")}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={filters.userName}
                    onChange={(e) => handleFilterChange("userName", e.target.value)}
                    placeholder={t("filters.userName.placeholder")}
                    style={{
                      width: "100%",
                      padding: isRTL ? "10px 14px 10px 38px" : "10px 38px 10px 14px",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "'Cairo', sans-serif",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                  />
                  <span style={{ position: "absolute", [isRTL ? 'left' : 'right']: 12, top: 10, color: colors.gray[600] }}>
                    <Search size={16} />
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: colors.gray[700], marginBottom: "8px" }}>{t("filters.role.label")}</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "'Cairo', sans-serif",
                    outline: "none",
                    backgroundColor: colors.white,
                    cursor: "pointer",
                  }}
                >
                  <option value="">{t("filters.role.allRoles")}</option>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: colors.gray[700], marginBottom: "8px" }}>{t("filters.action.label")}</label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange("action", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "'Cairo', sans-serif",
                    outline: "none",
                    backgroundColor: colors.white,
                    cursor: "pointer",
                  }}
                >
                  <option value="">{t("filters.action.allActions")}</option>
                  {actionOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: colors.gray[700], marginBottom: "8px" }}>{t("filters.module.label")}</label>
                <select
                  value={filters.module}
                  onChange={(e) => handleFilterChange("module", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "'Cairo', sans-serif",
                    outline: "none",
                    backgroundColor: colors.white,
                    cursor: "pointer",
                  }}
                >
                  <option value="">{t("filters.module.allModules")}</option>
                  {moduleOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: colors.white, borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <Table>
                <TableHeader className={adminTableStyles.header}>
                  <TableRow>
                    <TableHead className={adminHeadClass()}>{t("table.headers.logId")}</TableHead>
                    <TableHead className={adminHeadClass()}>{t("table.headers.userName")}</TableHead>
                    <TableHead className={adminHeadClass()}>{t("table.headers.role")}</TableHead>
                    <TableHead className={adminHeadClass()}>{t("table.headers.action")}</TableHead>
                    <TableHead className={adminHeadClass()}>{t("table.headers.module")}</TableHead>
                    <TableHead className={adminHeadClass({ className: "min-w-[200px]" })}>{t("table.headers.description")}</TableHead>
                    <TableHead className={adminHeadClass()}>{t("table.headers.status")}</TableHead>
                    <TableHead className={adminHeadClass()}>{t("table.headers.dateTime")}</TableHead>
                    <TableHead className={adminHeadClass({ center: true })}>{t("table.headers.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={adminTableStyles.body}>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} style={{ padding: "24px", textAlign: "center", color: colors.gray[600] }}>
                        {t("table.states.loading")}
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} style={{ padding: "24px", textAlign: "center", color: colors.gray[600] }}>
                        {t("table.states.noLogs")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id} className={adminTableStyles.row}>
                        <TableCell className={adminCellClass({ className: "font-semibold text-sm" })}>{log.id}</TableCell>
                        <TableCell className={adminCellClass({ className: "text-sm" })}>{log.userName}</TableCell>
                        <TableCell className={adminCellClass({ size: "muted" })}>{log.role}</TableCell>
                        <TableCell className={adminCellClass({ className: "font-medium text-sm" })}>{log.action}</TableCell>
                        <TableCell className={adminCellClass({ size: "muted" })}>{log.module}</TableCell>
                        <TableCell className={adminCellClass({ size: "muted", className: "max-w-[250px]" })}>{log.description}</TableCell>
                        <TableCell className={adminCellClass()}>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className={adminCellClass({ size: "muted", className: "tabular-nums" })} dir="ltr">{fmtDateTime(log.dateTime)}</TableCell>
                        <TableCell className={adminCellClass({ center: true })}>
                          <button
                            onClick={() => handleViewDetails(log)}
                            style={{
                              padding: "8px",
                              backgroundColor: `${colors.accentBlue}15`,
                              color: colors.accentBlue,
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.accentBlue;
                              e.currentTarget.style.color = colors.white;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = `${colors.accentBlue}15`;
                              e.currentTarget.style.color = colors.accentBlue;
                            }}
                          >
                            <Eye size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: "14px", color: colors.gray[600] }}>
                {logs.length === 0
                  ? t("table.states.noMatchingLogs")
                  : t("pagination.info", { start: (currentPage - 1) * itemsPerPage + 1, end: Math.min(currentPage * itemsPerPage, totalLogs), total: totalLogs })}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "8px 12px",
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.white,
                    borderRadius: "6px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ChevronRight size={16} style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  // Simple pagination logic to show first 5 or current page context
                  // For now, I'll just show up to 5 for simplicity or standard pagination
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      style={{
                        padding: "8px 12px",
                        border: `1px solid ${currentPage === p ? colors.accentBlue : colors.border}`,
                        backgroundColor: currentPage === p ? colors.accentBlue : colors.white,
                        color: currentPage === p ? colors.white : colors.gray[700],
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: currentPage === p ? 600 : 400,
                        fontSize: "14px",
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    >
                      {p}
                    </button>
                  );
                })}


                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: "8px 12px",
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.white,
                    borderRadius: "6px",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ChevronLeft size={16} style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedLog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "min(900px, 100%)",
              maxHeight: "85vh",
              overflow: "auto",
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, color: colors.primaryDark, fontSize: 18, fontWeight: 700 }}>{t("modal.title")}</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ border: "none", background: "transparent", cursor: "pointer", padding: 6 }}
                aria-label="close"
              >
                <X size={18} />
              </button>
            </div>
            <pre style={{ margin: 0, direction: "ltr", textAlign: "left", background: colors.gray[50], padding: 16, borderRadius: 8, border: `1px solid ${colors.border}` }}>
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
