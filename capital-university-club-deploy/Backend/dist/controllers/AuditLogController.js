"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditStats = exports.getFilterOptions = exports.getAuditLogs = void 0;
const AuditLogService_1 = require("../services/AuditLogService");
const auditLogService = new AuditLogService_1.AuditLogService();
const getAuditLogs = async (req, res) => {
    try {
        const filters = {
            logId: req.query.logId,
            userName: req.query.userName,
            role: req.query.role,
            action: req.query.action,
            module: req.query.module,
            status: req.query.status,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
        };
        const { logs, total } = await auditLogService.getLogs(filters);
        res.json({
            logs,
            total,
            currentPage: filters.page,
            totalPages: Math.ceil(total / filters.limit),
        });
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAuditLogs = getAuditLogs;
const getFilterOptions = async (req, res) => {
    try {
        const options = await auditLogService.getFilterOptions();
        res.json(options);
    }
    catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getFilterOptions = getFilterOptions;
const getAuditStats = async (req, res) => {
    try {
        const stats = await auditLogService.getStats();
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAuditStats = getAuditStats;
//# sourceMappingURL=AuditLogController.js.map