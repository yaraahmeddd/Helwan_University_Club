/**
 * PrivilegePackage Entity
 *
 * Groups of related privileges that can be assigned together to staff members.
 * Examples: ADMIN_FULL, FINANCE_MANAGER, EVENTS_MANAGER
 *
 * Relationship to privileges:
 * - PrivilegePackage --(many-to-many)--> Privilege via privileges_packages table
 * - This allows grouping multiple privileges into a single package
 */
export declare class PrivilegePackage {
    id: number;
    code: string;
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=PrivilegePackage.d.ts.map