import { Request, Response } from 'express';
export declare class RetiredMemberController {
    /**
     * GET /register/retired/professions
     * Return list of retired profession options
     */
    static getProfessions(req: Request, res: Response): Promise<void>;
    /**
     * GET /register/retired/relationship-types
     * Return list of relationship types for dependents
     */
    static getRelationshipTypes(req: Request, res: Response): Promise<void>;
    /**
     * GET /register/retired/active-working-members
     * Return list of active working members for dependent relationship selection
     */
    static getActiveWorkingMembers(req: Request, res: Response): Promise<void>;
    /**
     * POST /register/calculate-retired-membership-price
     * Calculate membership price based on profession and salary
     */
    static calculateMembershipPrice(req: Request, res: Response): Promise<void>;
    /**
     * POST /register/details/retired-member
     * Submit retired member details (profession, department, retirement date, salary slip)
     */
    static submitRetiredMemberDetails(req: Request, res: Response): Promise<void>;
    /**
     * POST /register/retired-membership
     * Create membership subscription for retired member
     */
    static createRetiredMembership(req: Request, res: Response): Promise<void>;
    /**
     * POST /register/retired-relationship
     * Create relationship between retired member and active member
     * Also uploads proof document (birth certificate, marriage certificate, etc.)
     */
    static createRetiredRelationship(req: Request, res: Response): Promise<void>;
    /**
     * GET /register/retired-status/:member_id
     * Get complete status and details of retired member
     */
    static getRetiredMemberStatus(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=RetiredMemberController.d.ts.map