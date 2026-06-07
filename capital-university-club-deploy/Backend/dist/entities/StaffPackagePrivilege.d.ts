import { PrivilegePackage } from './PrivilegePackage';
import { Privilege } from './Privilege';
/**
 * StaffPackagePrivilege Entity
 *
 * Junction table that maps privileges to privilege packages.
 * Allows defining which privileges belong to which package.
 *
 * Example: The "MEDIA_CENTER_MANAGER" package contains:
 *   - MEDIA_CENTER_APPROVE
 *   - MEDIA_CENTER_PUBLISH
 *   - MEDIA_CENTER_EDIT
 *   - MEDIA_CENTER_MANAGE_CATEGORIES
 */
export declare class StaffPackagePrivilege {
    package_id: number;
    package: PrivilegePackage;
    privilege_id: number;
    privilege: Privilege;
    added_at: Date;
    added_by: number | null;
}
//# sourceMappingURL=StaffPackagePrivilege.d.ts.map