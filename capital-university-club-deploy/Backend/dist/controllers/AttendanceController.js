"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const AttendanceService_1 = require("../services/AttendanceService");
const attendanceService = new AttendanceService_1.AttendanceService();
class AttendanceController {
    /**
     * Get team member dashboard stats
     * @route GET /api/attendance/team-member-stats/:teamMemberId
     */
    static async getTeamMemberStats(req, res) {
        try {
            const teamMemberId = parseInt(req.params.teamMemberId);
            if (!teamMemberId) {
                res.status(400).json({ success: false, message: 'Invalid team member ID' });
                return;
            }
            const stats = await attendanceService.getTeamMemberDashboardStats(teamMemberId);
            res.status(200).json({ success: true, data: stats });
        }
        catch (error) {
            console.error('Error fetching team member stats:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Get member dashboard stats
     * @route GET /api/attendance/member-stats/:memberId
     */
    static async getMemberStats(req, res) {
        try {
            const memberId = parseInt(req.params.memberId);
            if (!memberId) {
                res.status(400).json({ success: false, message: 'Invalid member ID' });
                return;
            }
            const stats = await attendanceService.getMemberDashboardStats(memberId);
            res.status(200).json({ success: true, data: stats });
        }
        catch (error) {
            console.error('Error fetching member stats:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Get basic attendance record (for history, etc.)
     */
    static async recordAttendance(req, res) {
        try {
            const result = await attendanceService.recordAttendance({
                ...req.body,
                attendance_date: new Date(req.body.attendance_date)
            });
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Update attendance record (Stub)
     */
    static async updateAttendance(req, res) {
        res.status(501).json({ success: false, message: 'Not yet implemented' });
    }
    /**
     * Get member attendance history (Stub)
     */
    static async getMemberAttendance(req, res) {
        res.status(501).json({ success: false, message: 'Not yet implemented' });
    }
    /**
     * Get member team absences (Stub)
     */
    static async getMemberTeamAbsences(req, res) {
        res.status(501).json({ success: false, message: 'Not yet implemented' });
    }
    /**
     * Get team attendance report (Stub)
     */
    static async getTeamAttendanceReport(req, res) {
        res.status(501).json({ success: false, message: 'Not yet implemented' });
    }
    /**
     * Send absence alert (Stub)
     */
    static async sendAbsenceAlert(req, res) {
        try {
            res.status(501).json({ success: false, message: 'Not yet implemented' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
}
exports.AttendanceController = AttendanceController;
//# sourceMappingURL=AttendanceController.js.map