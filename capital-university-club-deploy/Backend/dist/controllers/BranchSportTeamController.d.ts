import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        staff_id?: number;
        id?: number;
        email?: string;
        [key: string]: unknown;
    };
}
/**
 * BranchSportTeamController
 *
 * Handles admin operations for managing teams:
 * - Create, read, update, delete teams
 * - Filter teams by branch and sport
 * - Approve/decline teams
 * - Manage team availability
 */
export declare class BranchSportTeamController {
    private teamService;
    constructor();
    /**
     * CREATE - Add a new team
     * POST /api/teams
     * Admin only
     */
    createTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * READ - Get a team by ID
     * GET /api/teams/:teamId
     */
    getTeamById: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get all teams with optional filters
     * GET /api/teams?branch_id=1&sport_id=2&status=active
     */
    getAllTeams: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get teams for a branch and sport
     * GET /api/teams/branch/:branchId/sport/:sportId
     */
    getTeamsByBranchAndSport: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get available teams for a branch
     * GET /api/teams/available/branch/:branchId?sport_id=2
     */
    getAvailableTeams: (req: Request, res: Response) => Promise<void>;
    /**
     * UPDATE - Update a team
     * PUT /api/teams/:teamId
     * Admin only
     */
    updateTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * ACTION - Approve a team (change status to active)
     * PATCH /api/teams/:teamId/approve
     * Admin only
     */
    approveTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * ACTION - Decline a team (change status to inactive)
     * PATCH /api/teams/:teamId/decline
     * Admin only
     */
    declineTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * ACTION - Archive a team (change status to archived)
     * PATCH /api/teams/:teamId/archive
     * Admin only
     */
    archiveTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * DELETE - Delete a team
     * DELETE /api/teams/:teamId
     * Admin only
     */
    deleteTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}
export {};
//# sourceMappingURL=BranchSportTeamController.d.ts.map