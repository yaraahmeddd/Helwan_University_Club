import { Request, Response } from 'express';
export declare class SportController {
    /**
     * @route   POST /api/sports
     * @desc    Create a new sport (teams are optional)
     * @access  SportActivityManager, SportActivitySpecialist
     * @body    {
     *   name_en: string,
     *   name_ar: string,
     *   description_en?: string,
     *   description_ar?: string,
     *   sport_image?: string,
     *   price?: number,
     *   max_participants?: number,
     *   teams?: [   // optional - if omitted the sport is created without teams
     *     {
     *       name_en: string,
     *       name_ar: string,
     *       max_participants: number,
     *       training: { days_en, days_ar, start_time, end_time, field_id, training_fee }
     *     }
     *   ]
     * }
     */
    static createSport(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/sports
     * @desc    Get all sports with optional filters
     * @access  SportActivityManager, SportActivitySpecialist
     * @query   status?: string, is_active?: boolean
     */
    static getAllSports(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/sports/:id
     * @desc    Get sport by ID
     * @access  SportActivityManager, SportActivitySpecialist
     */
    static getSportById(req: Request, res: Response): Promise<void>;
    /**
     * @route   PUT /api/sports/:id
     * @desc    Update sport
     * @access  SportActivityManager, SportActivitySpecialist
     * @body    {
     *   name_en?: string,
     *   name_ar?: string,
     *   description_en?: string,
     *   description_ar?: string,
     *   price?: number,  // Only managers can update this
     *   sport_image?: string,
     *   max_participants?: number
     * }
     */
    static updateSport(req: Request, res: Response): Promise<void>;
    /**
     * @route   PUT /api/sports/:id/comprehensive
     * @desc    Update sport with all related fields (teams and trainings)
     * @access  SportActivityManager, Specialist, or Financial Director
     * @body    {
     *   name_en?: string,
     *   name_ar?: string,
     *   description_en?: string,
     *   description_ar?: string,
     *   sport_image?: string,
     *   price?: number,
     *   teams?: [{
     *     id?: string,  // UUID - if provided, update existing team
     *     name_en?: string,
     *     name_ar?: string,
     *     max_participants?: number,
     *     training?: {
     *       id?: string,  // UUID - if provided, update existing training
     *       days_en?: string,
     *       days_ar?: string,
     *       start_time?: string,
     *       end_time?: string,
     *       field_id?: string,
     *       training_fee?: number
     *     }
     *   }]
     * }
     */
    static updateSportComprehensive(req: Request, res: Response): Promise<void>;
    /**
     * @route   POST /api/sports/:id/approve
     * @desc    Approve or reject a pending sport
     * @access  SportActivityManager only
     * @body    {
     *   action: 'approve' | 'reject',
     *   comments?: string
     * }
     */
    static approveSport(req: Request, res: Response): Promise<void>;
    /**
     * @route   DELETE /api/sports/:id
     * @desc    Delete sport
     * @access  SportActivityManager only
     */
    static deleteSport(req: Request, res: Response): Promise<void>;
    /**
     * @route   PATCH /api/sports/:id/toggle-status
     * @desc    Toggle sport active status
     * @access  SportActivityManager only
     */
    static toggleSportStatus(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/sports/team-members
     * @desc    Get all team members
     */
    static getTeamMembers(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/sports/team-members/sport/:sportName
     * @desc    Get team members by sport
     */
    static getTeamMembersBySport(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/sports/team-members/user/:memberId
     * @desc    Get single team member
     */
    static getTeamMemberById(req: Request, res: Response): Promise<void>;
    static getMembersBySport(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/public/sports
     * @desc    Get all active and approved sports (public endpoint - no authentication required)
     * @access  Public
     */
    static getActiveSports(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=SportController.d.ts.map