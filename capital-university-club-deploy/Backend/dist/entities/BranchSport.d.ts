import { Branch } from './Branch';
import { Sport } from './Sport';
/**
 * BranchSport Entity
 *
 * Represents a many-to-many relationship between Branches and Sports.
 * This allows filtering:
 * 1. By branch to see available sports
 * 2. By sport to see available branches
 *
 * Each branch can have multiple sports.
 * Each sport can be available in multiple branches.
 */
export declare class BranchSport {
    id: number;
    branch_id: number;
    sport_id: number;
    branch: Branch;
    sport: Sport;
    status: string;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=BranchSport.d.ts.map