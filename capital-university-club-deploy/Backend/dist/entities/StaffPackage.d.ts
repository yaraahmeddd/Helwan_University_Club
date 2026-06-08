import { Staff } from './Staff';
import { PrivilegePackage } from './PrivilegePackage';
/**
 * StaffPackage Entity
 *
 * Tracks complete privilege package assignments to staff members.
 *
 * Used ONLY when assigning a complete package without modifications.
 * If any modifications are needed (adding extra privileges or removing specific ones),
 * use StaffPrivilegeOverride instead.
 *
 * Relationship:
 * - Staff --(one-to-many)--> StaffPackage --(many-to-one)--> PrivilegePackage
 * - Through PrivilegePackage -> Privilege (via privilege_package_members)
 */
export declare class StaffPackage {
    staff_id: number;
    staff: Staff;
    package_id: number;
    package: PrivilegePackage;
    assigned_at: Date;
    assigned_by: number | null;
}
//# sourceMappingURL=StaffPackage.d.ts.map