import { Request, Response } from 'express';
export declare class AttendanceController {
    /**
     * Get team member dashboard stats
     * @route GET /api/attendance/team-member-stats/:teamMemberId
     */
    static getTeamMemberStats(req: Request, res: Response): Promise<void>;
    /**
     * Get member dashboard stats
     * @route GET /api/attendance/member-stats/:memberId
     */
    static getMemberStats(req: Request, res: Response): Promise<void>;
    /**
     * Get basic attendance record (for history, etc.)
     */
    static recordAttendance(req: Request, res: Response): Promise<void>;
    /**
     * Update attendance record (Stub)
     */
    static updateAttendance(req: Request, res: Response): Promise<void>;
    /**
     * Get member attendance history (Stub)
     */
    static getMemberAttendance(req: Request, res: Response): Promise<void>;
    /**
     * Get member team absences (Stub)
     */
    static getMemberTeamAbsences(req: Request, res: Response): Promise<void>;
    /**
     * Get team attendance report (Stub)
     */
    static getTeamAttendanceReport(req: Request, res: Response): Promise<void>;
    /**
     * Send absence alert (Stub)
     */
    static sendAbsenceAlert(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AttendanceController.d.ts.map