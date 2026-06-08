import { Request, Response } from "express";
export declare class BookingController {
    private bookingService;
    constructor();
    /**
     * GET /api/bookings/fields/:fieldId/hours
     * Get operating hours for a field (next 7 days)
     */
    getFieldOperatingHours: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/bookings
     * Create a new booking (members or team members)
     */
    createBooking: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/bookings/:bookingId
     * Get booking details (authenticated users only)
     */
    getBookingDetails: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/bookings/users/:userType/:userId
     * Get all bookings for a user (member or team member)
     */
    getUserBookings: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/bookings/stats/:userType/:userId
     * Get booking statistics for a user
     */
    getBookingStats: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/bookings/:bookingId/confirm-payment
     * Confirm booking after successful payment
     */
    confirmPayment: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE /api/bookings/:bookingId
     * Cancel a booking
     */
    cancelBooking: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/bookings/share/:shareToken/register
     * Register a participant via shared link
     */
    registerParticipantViaLink: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/bookings/share/:shareToken/details
     * Get booking details via share token (public endpoint)
     */
    getBookingByShareToken: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/bookings/fields/:fieldId/available-slots
     * Get available booking slots for a specific field and date
     */
    getAvailableSlots: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/bookings/fields/:fieldId/calendar
     * Get calendar view for a field (multiple days)
     */
    getCalendarView: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/security/bookings
     * Get all bookings for security dashboard (with all necessary details)
     */
    getSecurityDashboardBookings: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/bookings/all
     * Get all bookings (admin view)
     */
    getAllBookings: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/bookings/:bookingId/complete
     * Mark a booking as completed
     */
    completeBooking: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=BookingController.d.ts.map