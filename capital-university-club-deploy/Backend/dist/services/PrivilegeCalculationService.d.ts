export declare class PrivilegeCalculationService {
    /**
     * Calculate final privilege codes for a staff member
     * Combines privileges from packages and individual grants/revokes
     * Now includes source tracking and can_revoke flag
     */
    static calculateFinalPrivileges(staffId: number): Promise<Record<string, unknown>[]>;
    /**
     * Get final computed privilege codes for a staff member (optimized)
     */
    static calculateFinalPrivilegeCodes(staffId: number): Promise<Set<string>>;
    /**
     * Check if staff member has a specific privilege
     */
    static hasPrivilege(staffId: number, privilegeCode: string): Promise<boolean>;
    /**
     * Check if staff member has ANY of the specified privileges
     */
    static hasAnyPrivilege(staffId: number, privilegeCodes: string[]): Promise<string[]>;
    /**
     * Check if staff member has ALL of the specified privileges
     */
    static hasAllPrivileges(staffId: number, privilegeCodes: string[]): Promise<boolean>;
    /**
     * Get privilege statistics for a staff member
     */
    static getPrivilegeStats(staffId: number): Promise<{
        total_privileges: number;
        privileges_from_packages: number;
        individually_granted: number;
        individually_revoked: number;
        modules: string[];
    }>;
}
export default PrivilegeCalculationService;
//# sourceMappingURL=PrivilegeCalculationService.d.ts.map