import { Staff } from './Staff';
/**
 * StaffActivityLog Entity
 *
 * Tracks all significant actions performed on staff accounts:
 * - Account creation
 * - Privilege assignments/changes
 * - Account deactivation
 * - Password changes
 * - Status changes
 *
 * Used for audit trails and activity monitoring.
 */
export declare class StaffActivityLog {
    id: number;
    staff_id: number;
    staff: Staff;
    action_type: string;
    description: string;
    performed_by: number | null;
    created_at: Date;
}
//# sourceMappingURL=StaffActivityLog.d.ts.map