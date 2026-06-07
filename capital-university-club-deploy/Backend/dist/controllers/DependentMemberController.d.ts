import { Request, Response } from 'express';
export declare class DependentMemberController {
    /**
     * GET /register/dependent/subtypes
     * Return dependent member subtypes (DEPENDENT_ACTIVE, DEPENDENT_VISITOR)
     */
    static getDependentSubtypes(req: Request, res: Response): Promise<void>;
    /**
     * GET /register/dependent/relationship-types
     * Return list of relationship types
     */
    static getRelationshipTypes(req: Request, res: Response): Promise<void>;
    /**
     * GET /register/dependent/active-working-members
     * Return list of active working members for dependent selection
     */
    static getActiveWorkingMembers(req: Request, res: Response): Promise<void>;
    /**
     * GET /register/dependent/active-visitor-members
     * Return list of active visitor members for dependent selection
     */
    static getActiveVisitorMembers(req: Request, res: Response): Promise<void>;
    /**
     * GET /register/dependent/active-members
     * Return combined list of active members (both working and visitor)
     */
    static getActiveMembers(req: Request, res: Response): Promise<void>;
    /**
     * POST /register/calculate-dependent-membership-price
     * Calculate dependent membership price (40% discount)
     */
    static calculateMembershipPrice(req: Request, res: Response): Promise<void>;
    /**
     * POST /register/dependent-membership
     * Create dependent membership subscription with relationship
     */
    static createDependentMembership(req: Request, res: Response): Promise<void>;
    /**
     * GET /register/dependent-status/:member_id
     * Get complete status and details of dependent member
     */
    static getDependentMemberStatus(req: Request, res: Response): Promise<void>;
    /**
     * POST /register/details/dependent
     * Submit dependent member details (photos and documents)
     */
    static submitDependentDetails(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=DependentMemberController.d.ts.map