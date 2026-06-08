import { Request, Response } from "express";
/**
 * Member-focused booking controller
 * Simplified endpoints for member booking flow
 */
export declare class MemberBookingController {
    private bookingService;
    private fieldService;
    constructor();
    /**
     * GET /api/members/bookings/sports
     * Get all sports with bookable fields
     */
    getBookableSports: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/members/bookings/fields/:sportId
     * Get bookable fields for a specific sport
     */
    getBookableFieldsBySport: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/members/bookings/fields/:fieldId/calendar
     * Get calendar view for a field (simplified for members)
     */
    getFieldCalendar: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/members/bookings/fields/:fieldId/available-slots
     * Get available slots for a specific date
     */
    getAvailableSlots: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/members/bookings/book
     * Create a booking (member-focused)
     */
    createMemberBooking: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/members/:memberId/bookings
     * Get all bookings for a member
     */
    getMemberBookings: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/members/:memberId/bookings/upcoming
     * Get upcoming bookings for a member
     */
    getUpcomingBookings: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/members/:memberId/bookings/history
     * Get booking history for a member (past bookings)
     */
    getBookingHistory: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/members/:memberId/bookings/stats
     * Get booking statistics for a member
     */
    getMemberStats: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/members/bookings/:bookingId/confirm-payment
     * Confirm payment for a booking
     */
    confirmPayment: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE /api/members/bookings/:bookingId
     * Cancel a booking
     */
    cancelBooking: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=MemberBookingController.d.ts.map