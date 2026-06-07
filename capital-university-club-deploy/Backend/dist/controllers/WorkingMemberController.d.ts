import { Request, Response } from 'express';
export declare class WorkingMemberController {
    /**
     * GET /register/professions
     * Returns list of professions for working members
     */
    static getProfessions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/relationship-types
     * Returns list of relationship types for dependents
     */
    static getRelationshipTypes(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/active-working-members
     * Returns list of active working members for dependent selection
     */
    static getActiveWorkingMembers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /register/calculate-working-membership-price
     * Calculate membership price based on profession and salary
     */
    static calculateMembershipPrice(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /register/details/working-member
     * Submit detailed information for working member
     */
    static submitWorkingMemberDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /register/working-membership
     * Create membership subscription for working member
     */
    static createWorkingMembership(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/working-status/:member_id
     * Get working member registration status
     */
    static getWorkingMemberStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default WorkingMemberController;
//# sourceMappingURL=WorkingMemberController.d.ts.map