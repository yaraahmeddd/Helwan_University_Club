import { AuditLog } from '../entities/AuditLog';
export declare class AuditLogService {
    private auditLogRepository;
    createLog(data: Partial<AuditLog>, manager?: any): Promise<AuditLog>;
    getLogs(filters: {
        logId?: string;
        userName?: string;
        role?: string;
        action?: string;
        module?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
    getFilterOptions(): Promise<{
        actions: any[];
        modules: any[];
        roles: any[];
    }>;
    getStats(): Promise<{
        total: number;
        successful: number;
        failed: number;
        today: number;
    }>;
}
//# sourceMappingURL=AuditLogService.d.ts.map