/**
 * TeamController
 *
 * Thin HTTP adapter: parse request → call service → return response.
 * All business-rule validation lives in TeamValidationService.
 * All data-access operations live in TeamService.
 */
import { Request, Response } from 'express';
export declare class TeamController {
    /**
     * @route   POST /api/teams
     * @desc    Create a new team with full backend validation
     * @access  Requires CREATE_TEAM privilege
     *
     * @body {
     *   sport_id:          number          — required; must exist
     *   field_id:          string (UUID)   — required; must belong to sport
     *   name_en:           string          — required
     *   name_ar:           string          — required
     *   max_participants:  number          — required; must be ≤ field.capacity
     *   visibility_type:   "INTERNAL" | "EXTERNAL" | "BOTH"  — required

     *   status?:           "active" | "inactive" | "suspended" | "archived"  (default: "active")
     *   branch_id?:        number
     *   training_schedules?: Array<{
     *     days_en:       string   — comma-separated day names, e.g. "Sunday,Tuesday"
     *     days_ar:       string
     *     start_time:    string   — HH:MM or HH:MM:SS
     *     end_time:      string
     *     field_id:      string   — UUID
     *     training_fee?: number
     *   }>
     * }
     */
    static createTeam(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/teams
     * @desc    Get all teams with optional filters
     * @access  Requires VIEW_TEAMS privilege
     * @query   sport_id?, status?, branch_id?, visibility_type?
     */
    static getAllTeams(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/teams/:id
     * @desc    Get team by ID with full details
     * @access  Requires VIEW_TEAMS privilege
     */
    static getTeamById(req: Request, res: Response): Promise<void>;
    /**
     * @route   PUT /api/teams/:id
     * @desc    Update team details (partial update supported)
     * @access  Requires UPDATE_TEAM privilege
     */
    static updateTeam(req: Request, res: Response): Promise<void>;
    /**
     * @route   PATCH /api/teams/:id/status
     * @desc    Update team status only
     * @access  Requires MANAGE_TEAM_STATUS privilege
     */
    static updateTeamStatus(req: Request, res: Response): Promise<void>;
    /**
     * @route   DELETE /api/teams/:id
     * @desc    Delete a team
     * @access  Requires DELETE_TEAM privilege
     */
    static deleteTeam(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/teams/:id/members
     * @desc    Get all members in a team (regular + team members)
     * @access  Requires VIEW_TEAM_MEMBERS privilege
     */
    static getTeamMembers(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/teams/:id/available-slots
     * @desc    Get available participant slots in a team
     * @access  Requires VIEW_AVAILABLE_SLOTS privilege
     */
    static getAvailableSlots(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/teams/sport/:sport_id/with-members
     * @desc    Get all teams for a specific sport, including their members
     * @access  Requires VIEW_TEAMS privilege
     * @query   team_id? (optional — filter to a single team)
     */
    static getTeamsBySportWithMembers(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/teams/available/for-me
     * @desc    Returns only the teams visible to the currently logged-in Member or TeamMember.
     *          Visibility is resolved from the JWT payload (member_id / team_member_id)
     *          and the member's type:
     *            - Internal members/team-members → INTERNAL + BOTH teams
     *            - External members/team-members → EXTERNAL + BOTH teams
     * @access  Requires authenticate middleware (member or team_member role)
     * @query   sport_id? — filter results to a specific sport
     */
    static getAvailableTeamsForMe(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=TeamController.d.ts.map