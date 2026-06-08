import { Request, Response } from 'express';
export declare class TrainingScheduleController {
    /**
     * @route   POST /api/training-schedules
     * @desc    Create training schedule for a team (Admin/Staff)
     * @access  SportActivityManager, SportActivitySpecialist
     * @body    {
     *   team_id: string (UUID),
     *   day_of_week: 'MONDAY' | 'TUESDAY' | ... | 'SUNDAY',
     *   start_time: 'HH:MM:SS',
     *   end_time: 'HH:MM:SS',
     *   location?: string,
     *   max_participants?: number,
     *   training_fee?: number
     * }
     */
    static createTrainingSchedule(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/teams/:team_id/training-schedules
     * @desc    Get all training schedules for a team
     * @access  All authenticated users
     */
    static getTeamSchedules(req: Request, res: Response): Promise<void>;
    /**
     * @route   PUT /api/training-schedules/:id
     * @desc    Update training schedule
     * @access  SportActivityManager, SportActivitySpecialist
     */
    static updateTrainingSchedule(req: Request, res: Response): Promise<void>;
    /**
     * @route   DELETE /api/training-schedules/:id
     * @desc    Delete training schedule
     * @access  SportActivityManager
     */
    static deleteTrainingSchedule(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=TrainingScheduleController.d.ts.map