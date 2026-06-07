"use strict";
/**
 * TeamController
 *
 * Thin HTTP adapter: parse request → call service → return response.
 * All business-rule validation lives in TeamValidationService.
 * All data-access operations live in TeamService.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const TeamService_1 = require("../services/TeamService");
const TeamVisibilityService_1 = require("../services/TeamVisibilityService");
const TeamEnums_1 = require("../constants/TeamEnums");
// ─── Helper ───────────────────────────────────────────────────────────────────
/**
 * Determines the appropriate HTTP status code for a given Error.
 * Validation errors (detected by the "Validation error:" prefix or
 * "conflict" keyword) are surfaced as 422 / 409; anything else as 400.
 */
function errorStatus(error) {
    if (!(error instanceof Error))
        return 400;
    const msg = error.message.toLowerCase();
    if (msg.startsWith('validation error'))
        return 422;
    if (msg.includes('conflict'))
        return 409;
    if (msg.includes('not found'))
        return 404;
    return 400;
}
// ─── Controller ───────────────────────────────────────────────────────────────
class TeamController {
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
    static async createTeam(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ success: false, message: 'Authentication required.' });
                return;
            }
            const body = req.body;
            // Minimal presence check before handing off to the validation service
            const missing = [];
            if (!body.sport_id)
                missing.push('sport_id');
            if (!body.field_id)
                missing.push('field_id');
            if (!body.name_en)
                missing.push('name_en');
            if (!body.name_ar)
                missing.push('name_ar');
            if (body.max_participants === undefined || body.max_participants === null)
                missing.push('max_participants');
            if (!body.visibility_type)
                missing.push('visibility_type');
            if (missing.length > 0) {
                res.status(422).json({
                    success: false,
                    message: `Missing required fields: ${missing.join(', ')}.`,
                    missing_fields: missing,
                });
                return;
            }
            const input = {
                sport_id: Number(body.sport_id),
                field_id: body.field_id,
                name_en: body.name_en,
                name_ar: body.name_ar,
                max_participants: Number(body.max_participants),
                visibility_type: body.visibility_type,
                status: body.status || TeamEnums_1.TeamStatus.ACTIVE,
                branch_id: body.branch_id ? Number(body.branch_id) : undefined,
                training_schedules: Array.isArray(body.training_schedules)
                    ? body.training_schedules.map((s) => ({
                        days_en: s.days_en,
                        days_ar: s.days_ar,
                        start_time: s.start_time,
                        end_time: s.end_time,
                        field_id: s.field_id,
                        training_fee: s.training_fee !== undefined ? Number(s.training_fee) : 0,
                    }))
                    : [],
            };
            const teamService = new TeamService_1.TeamService();
            const team = await teamService.createTeam(input);
            res.status(201).json({
                success: true,
                message: 'Team created successfully.',
                data: team,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create team.';
            console.error('[TeamController] createTeam:', error);
            res.status(errorStatus(error)).json({ success: false, message });
        }
    }
    /**
     * @route   GET /api/teams
     * @desc    Get all teams with optional filters
     * @access  Requires VIEW_TEAMS privilege
     * @query   sport_id?, status?, branch_id?, visibility_type?
     */
    static async getAllTeams(req, res) {
        try {
            const query = req.query;
            const filters = {};
            if (query.sport_id)
                filters.sport_id = parseInt(query.sport_id);
            if (query.status)
                filters.status = query.status;
            if (query.branch_id)
                filters.branch_id = parseInt(query.branch_id);
            if (query.visibility_type)
                filters.visibility_type = query.visibility_type;
            const teamService = new TeamService_1.TeamService();
            const teams = await teamService.getAllTeams(filters);
            res.status(200).json({ success: true, data: teams, count: teams.length });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch teams.';
            console.error('[TeamController] getAllTeams:', error);
            res.status(500).json({ success: false, message });
        }
    }
    /**
     * @route   GET /api/teams/:id
     * @desc    Get team by ID with full details
     * @access  Requires VIEW_TEAMS privilege
     */
    static async getTeamById(req, res) {
        try {
            const teamService = new TeamService_1.TeamService();
            const team = await teamService.getTeamById(req.params.id);
            if (!team) {
                res.status(404).json({ success: false, message: 'Team not found.' });
                return;
            }
            res.status(200).json({ success: true, data: team });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch team.';
            console.error('[TeamController] getTeamById:', error);
            res.status(500).json({ success: false, message });
        }
    }
    /**
     * @route   PUT /api/teams/:id
     * @desc    Update team details (partial update supported)
     * @access  Requires UPDATE_TEAM privilege
     */
    static async updateTeam(req, res) {
        try {
            const teamId = req.params.id;
            const body = req.body;
            const updates = {};
            if (body.name_en !== undefined)
                updates.name_en = body.name_en;
            if (body.name_ar !== undefined)
                updates.name_ar = body.name_ar;
            if (body.branch_id !== undefined)
                updates.branch_id = body.branch_id !== null ? Number(body.branch_id) : null;
            if (body.field_id !== undefined)
                updates.field_id = body.field_id;
            if (body.max_participants !== undefined)
                updates.max_participants = Number(body.max_participants);
            if (body.status !== undefined)
                updates.status = body.status;
            if (body.visibility_type !== undefined)
                updates.visibility_type = body.visibility_type;
            if (Array.isArray(body.training_schedules)) {
                updates.training_schedules = body.training_schedules.map((s) => ({
                    days_en: s.days_en,
                    days_ar: s.days_ar,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    field_id: s.field_id,
                    training_fee: s.training_fee !== undefined ? Number(s.training_fee) : 0,
                }));
            }
            const teamService = new TeamService_1.TeamService();
            const updatedTeam = await teamService.updateTeam(teamId, updates);
            res.status(200).json({
                success: true,
                message: 'Team updated successfully.',
                data: updatedTeam,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update team.';
            console.error('[TeamController] updateTeam:', error);
            res.status(errorStatus(error)).json({ success: false, message });
        }
    }
    /**
     * @route   PATCH /api/teams/:id/status
     * @desc    Update team status only
     * @access  Requires MANAGE_TEAM_STATUS privilege
     */
    static async updateTeamStatus(req, res) {
        try {
            const { status } = req.body;
            if (!status) {
                res.status(422).json({ success: false, message: '"status" is required.' });
                return;
            }
            const teamService = new TeamService_1.TeamService();
            const updatedTeam = await teamService.updateTeamStatus(req.params.id, status);
            res.status(200).json({
                success: true,
                message: 'Team status updated successfully.',
                data: updatedTeam,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update team status.';
            console.error('[TeamController] updateTeamStatus:', error);
            res.status(errorStatus(error)).json({ success: false, message });
        }
    }
    /**
     * @route   DELETE /api/teams/:id
     * @desc    Delete a team
     * @access  Requires DELETE_TEAM privilege
     */
    static async deleteTeam(req, res) {
        try {
            const teamService = new TeamService_1.TeamService();
            await teamService.deleteTeam(req.params.id);
            res.status(200).json({ success: true, message: 'Team deleted successfully.' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete team.';
            console.error('[TeamController] deleteTeam:', error);
            res.status(errorStatus(error)).json({ success: false, message });
        }
    }
    /**
     * @route   GET /api/teams/:id/members
     * @desc    Get all members in a team (regular + team members)
     * @access  Requires VIEW_TEAM_MEMBERS privilege
     */
    static async getTeamMembers(req, res) {
        try {
            const teamService = new TeamService_1.TeamService();
            const members = await teamService.getTeamMembers(req.params.id);
            res.status(200).json({ success: true, data: members });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch team members.';
            console.error('[TeamController] getTeamMembers:', error);
            res.status(errorStatus(error)).json({ success: false, message });
        }
    }
    /**
     * @route   GET /api/teams/:id/available-slots
     * @desc    Get available participant slots in a team
     * @access  Requires VIEW_AVAILABLE_SLOTS privilege
     */
    static async getAvailableSlots(req, res) {
        try {
            const teamService = new TeamService_1.TeamService();
            const slots = await teamService.getAvailableSlots(req.params.id);
            res.status(200).json({ success: true, data: slots });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch available slots.';
            console.error('[TeamController] getAvailableSlots:', error);
            res.status(errorStatus(error)).json({ success: false, message });
        }
    }
    /**
     * @route   GET /api/teams/sport/:sport_id/with-members
     * @desc    Get all teams for a specific sport, including their members
     * @access  Requires VIEW_TEAMS privilege
     * @query   team_id? (optional — filter to a single team)
     */
    static async getTeamsBySportWithMembers(req, res) {
        try {
            const sportId = req.params.sport_id;
            if (!sportId) {
                res.status(422).json({ success: false, message: '"sport_id" is required.' });
                return;
            }
            const query = req.query;
            const teamId = query.team_id;
            const teamService = new TeamService_1.TeamService();
            const teamsWithMembers = await teamService.getTeamsBySportWithMembers(parseInt(sportId), teamId);
            res.status(200).json({
                success: true,
                data: teamsWithMembers,
                count: teamsWithMembers.length,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch teams with members.';
            console.error('[TeamController] getTeamsBySportWithMembers:', error);
            res.status(500).json({ success: false, message });
        }
    }
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
    static async getAvailableTeamsForMe(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ success: false, message: 'Authentication required.' });
                return;
            }
            // Only members and team-members should call this endpoint
            const role = user.role;
            if (role !== 'member' && role !== 'team_member') {
                res.status(403).json({
                    success: false,
                    message: 'This endpoint is only available for members and team-members.',
                });
                return;
            }
            // Build caller identity from the JWT payload
            const caller = {
                member_id: user.member_id,
                team_member_id: user.team_member_id,
                member_type_id: user.member_type_id,
            };
            // Optional sport filter
            const sportId = req.query.sport_id
                ? parseInt(req.query.sport_id)
                : undefined;
            const visibilityService = new TeamVisibilityService_1.TeamVisibilityService();
            const teams = await visibilityService.getTeamsForCaller(caller, sportId);
            res.status(200).json({
                success: true,
                data: teams,
                count: teams.length,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch available teams.';
            console.error('[TeamController] getAvailableTeamsForMe:', error);
            res.status(500).json({ success: false, message });
        }
    }
}
exports.TeamController = TeamController;
//# sourceMappingURL=TeamController.js.map