import { Sport } from './Sport';
import { Branch } from './Branch';
import { Staff } from './Staff';
/**
 * SportBranch Entity
 *
 * Represents the many-to-many relationship between Sports and Branches.
 * A sport can exist in multiple branches, and a branch can have multiple sports.
 * This allows configuration of which sports are available in which branches.
 */
export declare class SportBranch {
    id: number;
    sport_id: number;
    branch_id: number;
    created_by_staff_id: number;
    status: string;
    status_reason: string | null;
    is_enrollment_open: boolean;
    enrollment_start_date: Date | null;
    enrollment_end_date: Date | null;
    notes: string | null;
    created_at: Date;
    sport: Sport;
    branch: Branch;
    created_by: Staff;
}
//# sourceMappingURL=SportBranch.d.ts.map