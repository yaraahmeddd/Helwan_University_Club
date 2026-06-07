export type AuditStatus = 'نجح' | 'فشل';
export declare class AuditLog {
    id: string;
    userName: string;
    role: string;
    action: string;
    module: string;
    description: string;
    status: string;
    ipAddress: string;
    oldValue: any;
    newValue: any;
    dateTime: Date;
}
//# sourceMappingURL=AuditLog.d.ts.map