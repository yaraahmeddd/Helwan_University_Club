"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityLogger = void 0;
const data_source_1 = require("../database/data-source");
const ActivityLog_1 = require("../entities/ActivityLog");
const getMemberIdFromRequest = (req) => {
    const bodyMemberId = req.body?.member_id;
    const paramMemberId = req.params?.member_id;
    const queryMemberId = req.query?.member_id;
    const rawValue = bodyMemberId ?? paramMemberId ?? queryMemberId;
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        return null;
    }
    const parsed = parseInt(rawValue);
    return Number.isNaN(parsed) ? null : parsed;
};
const activityLogger = async (req, res, next) => {
    const start = Date.now();
    res.on('finish', async () => {
        try {
            const activityLogRepository = data_source_1.AppDataSource.getRepository(ActivityLog_1.ActivityLog);
            const memberId = getMemberIdFromRequest(req);
            const statusCode = res.statusCode;
            const durationMs = Date.now() - start;
            const outcome = statusCode >= 400 ? 'failed' : 'success';
            await activityLogRepository.insert({
                member_id: memberId || undefined,
                action: 'api_request',
                description: `${req.method} ${req.originalUrl} ${statusCode} ${outcome} (${durationMs}ms)`,
                action_date: new Date(),
            });
        }
        catch (error) {
            console.error('Activity log insert failed:', error);
        }
    });
    next();
};
exports.activityLogger = activityLogger;
//# sourceMappingURL=activityLogger.js.map