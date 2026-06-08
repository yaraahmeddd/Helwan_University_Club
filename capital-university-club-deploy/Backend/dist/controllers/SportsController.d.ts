import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
/**
 * SportsController - Handles sports, teams, events, and pricing management
 *
 * All endpoints are protected by privilege-based authorization.
 *
 * Privileges required:
 * - VIEW_SPORTS (89): View sports list
 * - CREATE_SPORT (90): Create new sport
 * - UPDATE_SPORT (91): Edit sport information
 * - DELETE_SPORT (92): Delete sport
 * - ASSIGN_SPORT_TO_MEMBER (93): Assign sport to regular member
 * - REMOVE_SPORT_FROM_MEMBER (94): Remove sport from regular member
 * - ASSIGN_SPORT_TO_TEAM_MEMBER (95): Assign sport to team member
 * - REMOVE_SPORT_FROM_TEAM_MEMBER (96): Remove sport from team member
 * - CREATE_TEAM (97): Create new team
 * - UPDATE_TEAM (98): Edit team information
 * - DELETE_TEAM (99): Delete team
 * - ASSIGN_MEMBER_TO_TEAM (100): Add member to team
 * - REMOVE_MEMBER_FROM_TEAM (101): Remove member from team
 * - SCHEDULE_MATCH (102): Schedule team matches
 * - VIEW_SPORT_PRICING (103): View pricing information
 * - CREATE_SPORT_PRICING (104): Create pricing tiers
 * - UPDATE_SPORT_PRICING (105): Edit pricing
 * - DELETE_SPORT_PRICING (106): Delete pricing
 */
export declare class SportsController {
    /**
     * VIEW_SPORTS - Get all sports
     * GET /api/sports
     */
    static getAllSports(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * VIEW_SPORTS - Get specific sport
     * GET /api/sports/:id
     */
    static getSportById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CREATE_SPORT - Create new sport
     * POST /api/sports
     */
    static createSport(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * UPDATE_SPORT - Update sport information
     * PUT /api/sports/:id
     */
    static updateSport(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE_SPORT - Delete sport
     * DELETE /api/sports/:id
     */
    static deleteSport(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * ASSIGN_SPORT_TO_MEMBER - Assign sport to regular member
     * POST /api/sports/:sportId/members
     */
    static assignSportToMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * REMOVE_SPORT_FROM_MEMBER - Remove sport from regular member
     * DELETE /api/sports/:sportId/members/:memberId
     */
    static removeSportFromMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * ASSIGN_SPORT_TO_TEAM_MEMBER - Assign sport to team member
     * POST /api/sports/:sportId/team-members
     */
    static assignSportToTeamMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * REMOVE_SPORT_FROM_TEAM_MEMBER - Remove sport from team member
     * DELETE /api/sports/:sportId/team-members/:teamMemberId
     */
    static removeSportFromTeamMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CREATE_TEAM - Create new team
     * POST /api/teams
     */
    static createTeam(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * UPDATE_TEAM - Update team information
     * PUT /api/teams/:id
     */
    static updateTeam(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE_TEAM - Delete team
     * DELETE /api/teams/:id
     */
    static deleteTeam(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * ASSIGN_MEMBER_TO_TEAM - Add member to team
     * POST /api/teams/:teamId/members
     */
    static assignMemberToTeam(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * REMOVE_MEMBER_FROM_TEAM - Remove member from team
     * DELETE /api/teams/:teamId/members/:memberId
     */
    static removeMemberFromTeam(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * SCHEDULE_MATCH - Schedule team match
     * POST /api/matches/schedule
     */
    static scheduleMatch(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * VIEW_SPORT_PRICING - Get sport pricing
     * GET /api/sports/:sportId/pricing
     */
    static getSportPricing(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CREATE_SPORT_PRICING - Create pricing tier for sport
     * POST /api/sports/:sportId/pricing
     */
    static createSportPricing(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * UPDATE_SPORT_PRICING - Update sport pricing
     * PUT /api/sports/:sportId/pricing/:pricingId
     */
    static updateSportPricing(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE_SPORT_PRICING - Delete sport pricing
     * DELETE /api/sports/:sportId/pricing/:pricingId
     */
    static deleteSportPricing(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default SportsController;
//# sourceMappingURL=SportsController.d.ts.map