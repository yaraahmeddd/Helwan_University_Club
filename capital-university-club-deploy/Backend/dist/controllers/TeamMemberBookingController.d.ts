import { Request, Response } from 'express';
export declare class TeamMemberBookingController {
    private bookingService;
    private fieldService;
    constructor();
    /**
     * Get all sports with bookable fields
     */
    getBookableSports(req: Request, res: Response): Promise<void>;
    /**
     * Get bookable fields for a specific sport
     */
    getBookableFieldsBySport(req: Request, res: Response): Promise<void>;
    /**
     * Get calendar view for a field (defaults to next 7 days)
     */
    getFieldCalendar(req: Request, res: Response): Promise<void>;
    /**
     * Get available slots for a specific date (defaults to today)
     */
    getAvailableSlots(req: Request, res: Response): Promise<void>;
    /**
     * Create booking for team member (simplified)
     */
    createTeamMemberBooking(req: Request, res: Response): Promise<void>;
    /**
     * Get all bookings for a team member
     */
    getTeamMemberBookings(req: Request, res: Response): Promise<void>;
    /**
     * Get upcoming bookings for team member
     */
    getUpcomingBookings(req: Request, res: Response): Promise<void>;
    /**
     * Get booking history for team member
     */
    getBookingHistory(req: Request, res: Response): Promise<void>;
    /**
     * Get booking statistics for team member
     */
    getTeamMemberStats(req: Request, res: Response): Promise<void>;
    /**
     * Confirm payment for booking
     */
    confirmPayment(req: Request, res: Response): Promise<void>;
    /**
     * Cancel booking
     */
    cancelBooking(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=TeamMemberBookingController.d.ts.map