export declare enum TaskStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum TaskType {
    SPORT_CREATION = "SPORT_CREATION",
    FINANCE = "FINANCE",
    MEMBERSHIP_UPDATE = "MEMBERSHIP_UPDATE",
    GENERAL = "GENERAL"
}
export declare class Task {
    id: number;
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    data: Record<string, any>;
    created_by: string;
    assigned_to: string;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=Task.d.ts.map