import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
/**
 * BranchSportController - Manages branch-sport relationships
 *
 * This controller handles the many-to-many relationship between branches and sports.
 * It allows filtering sports by branch and branches by sport.
 *
 * All endpoints are protected by privilege-based authorization.
 */
export declare class BranchSportController {
    private static branchSportRepo;
    private static logAction;
    /**
     * GET /api/branches/:branchId/sports
     * Get all sports available in a specific branch
     * @param {number} branchId - Branch ID
     * @returns Array of sports in the branch
     */
    static getSportsByBranch(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/sports/:sportId/branches
     * Get all branches where a specific sport is available
     * @param {number} sportId - Sport ID
     * @returns Array of branches with the sport
     */
    static getBranchesBySport(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/branch-sports
     * Associate a sport with a branch
     * @body {number} branch_id - Branch ID
     * @body {number} sport_id - Sport ID
     * @returns Created branch-sport association
     */
    static createBranchSport(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/branch-sports/:id
     * Remove a sport from a branch
     * @param {number} id - Branch-Sport association ID
     * @returns Success message
     */
    static deleteBranchSport(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/branch-sports/:id
     * Update branch-sport association status
     * @param {number} id - Branch-Sport association ID
     * @body {string} status - New status ('active' or 'inactive')
     * @returns Updated association
     */
    static updateBranchSport(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default BranchSportController;
//# sourceMappingURL=BranchSportController.d.ts.map