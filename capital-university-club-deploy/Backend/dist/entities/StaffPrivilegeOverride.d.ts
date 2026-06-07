import { Staff } from './Staff';
import { Privilege } from './Privilege';
/**
 * StaffPrivilegeOverride Entity
 *
 * Tracks individual privilege modifications for staff members.
 * Used for two scenarios:
 *
 * 1. Granting additional privileges (is_granted = true)
 *    - Privileges not part of any assigned package
 *    - Extra privileges added to a package assignment
 *
 * 2. Revoking privileges (is_granted = false)
 *    - Removing specific privileges from an assigned package
 *    - Temporarily disabling a privilege
 *
 * If a staff member is assigned a complete package without modifications,
 * no records are created here. Instead, the assignment is tracked in staff_packages table.
 */
export declare class StaffPrivilegeOverride {
    staff_id: number;
    staff: Staff;
    privilege_id: number;
    privilege: Privilege;
    is_granted: boolean;
    assigned_at: Date;
    assigned_by: number | null;
}
//# sourceMappingURL=StaffPrivilegeOverride.d.ts.map