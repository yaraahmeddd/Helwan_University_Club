import { Request, Response } from 'express';
export declare class TeamTrainingScheduleController {
    private scheduleService;
    constructor();
    /**
     * POST /api/teams/:teamId/schedules
     * Create a new training schedule
     */
    createSchedule(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/teams/:teamId/schedules
     * Get all training schedules for a team
     */
    getTeamSchedules(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/schedules/:scheduleId
     * Get a specific training schedule
     */
    getScheduleById(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/schedules/:scheduleId
     * Update a training schedule
     */
    updateSchedule(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/schedules/:scheduleId
     * Delete a training schedule
     */
    deleteSchedule(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/sports/:sportId/schedules
     * Get all training schedules for a sport
     */
    getSportSchedules(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/schedules/:scheduleId/availability
     * Check availability (remaining slots) for a training schedule
     */
    checkAvailability(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=TeamTrainingScheduleController.d.ts.map