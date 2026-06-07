import { Request, Response } from "express";
/**
 * Public Participant Registration Controller
 * Handles participant registration via booking invitation links
 * NO AUTHENTICATION REQUIRED - Anyone with valid share token can register
 */
export declare class ParticipantRegistrationController {
    private bookingService;
    constructor();
    /**
     * GET /api/bookings/join/:shareToken
     * Get booking details by share token (public endpoint)
     */
    getBookingByShareToken(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/bookings/join/:shareToken
     * Register participant via share token (public endpoint with file upload)
     *
     * Form-data fields:
     * - full_name: string (required)
     * - phone_number: string (optional)
     * - national_id: string (optional)
     * - email: string (optional)
     * - national_id_front: file (optional - national ID front photo)
     * - national_id_back: file (optional - national ID back photo)
     */
    registerParticipant(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/admin/bookings/:bookingId/participants
     * Get all participants for a booking (admin endpoint)
     * Requires authentication and admin privileges
     */
    getBookingParticipants(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/admin/bookings/invitations
     * Get all invitation links with booker and participants info
     * Requires authentication and admin privileges
     */
    getAllInvitations(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/admin/bookings/:bookingId/invitation
     * Get specific invitation details
     * Requires authentication and admin privileges
     */
    getInvitationDetails(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/admin/bookings/:bookingId/participants/:participantId
     * Remove a participant from a booking
     * Requires authentication and admin privileges
     */
    removeParticipant(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ParticipantRegistrationController.d.ts.map