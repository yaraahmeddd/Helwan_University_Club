import { Request, Response } from 'express';
export declare class TeamMemberController {
    private service;
    private sportRepo;
    constructor();
    submitDetails: (req: Request, res: Response) => Promise<void>;
    selectTeams: (req: Request, res: Response) => Promise<void>;
    getStatus: (req: Request, res: Response) => Promise<void>;
    getDetails: (req: Request, res: Response) => Promise<void>;
    reviewAllTeamMemberData: (req: Request, res: Response) => Promise<void>;
    updateProfile: (req: Request, res: Response) => Promise<void>;
    /**
     * CREATE - Create a new team member with account and sports
     * POST /api/team-members
     */
    createTeamMember: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get single team member by ID
     * GET /api/team-members/:team_member_id
     */
    getTeamMember: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get all team members
     * GET /api/team-members?status=active&limit=10&page=1
     */
    getAllTeamMembers: (req: Request, res: Response) => Promise<void>;
    /**
     * UPDATE - Update team member with sports
     * PUT /api/team-members/:team_member_id
     */
    updateTeamMember: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE (Soft) - Deactivate team member account
     * PUT /api/team-members/:team_member_id/deactivate
     */
    deactivateTeamMember: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE (Hard) - Permanently delete team member account
     * DELETE /api/team-members/:team_member_id
     */
    deleteTeamMember: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/team-members/pending
     * Returns all team members with status = 'pending'
     */
    getPendingTeamMembers: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/team-members/:team_member_id/approve
     * Approves a pending team member
     */
    approveTeamMember: (req: Request, res: Response) => Promise<void>;
    /**
     * Assign sports to a team member
     * POST /api/team-members/:team_member_id/sports
     * Body: { sportIds: number[] }
     */
    assignSportsToTeamMember: (req: Request, res: Response) => Promise<void>;
    /**
     * Get team member bookings
     * GET /api/team-members/:member_id/bookings
     */
    getTeamMemberBookings: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=TeamMemberController.d.ts.map