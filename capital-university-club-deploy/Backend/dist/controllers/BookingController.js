"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const BookingService_1 = require("../services/BookingService");
const data_source_1 = require("../database/data-source");
class BookingController {
    constructor() {
        /**
         * GET /api/bookings/fields/:fieldId/hours
         * Get operating hours for a field (next 7 days)
         */
        this.getFieldOperatingHours = async (req, res) => {
            try {
                const { fieldId } = req.params;
                if (!fieldId) {
                    res.status(400).json({ success: false, error: "Field ID is required" });
                    return;
                }
                const hours = await this.bookingService.getFieldOperatingHoursList(fieldId);
                res.json({
                    success: true,
                    data: hours,
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Failed to get operating hours";
                res.status(500).json({ success: false, error });
            }
        };
        /**
         * POST /api/bookings
         * Create a new booking (members or team members)
         */
        this.createBooking = async (req, res) => {
            try {
                const { userType, userId, sport_id, field_id, start_time, end_time, uses_parking, parking_cars_count, notes, language, } = req.body;
                console.log('[BookingController] Create booking request:', {
                    userType,
                    userId,
                    sport_id,
                    field_id,
                    start_time,
                    end_time,
                    uses_parking,
                    parking_cars_count,
                    notes,
                    language,
                });
                // Validate required fields
                if (!userType || !userId || !sport_id || !field_id || !start_time || !end_time) {
                    console.error('[BookingController] Missing required fields');
                    res.status(400).json({
                        success: false,
                        error: "Missing required fields: userType, userId, sport_id, field_id, start_time, end_time",
                    });
                    return;
                }
                // Validate userType
                if (!["member", "team_member"].includes(userType)) {
                    console.error('[BookingController] Invalid userType:', userType);
                    res.status(400).json({
                        success: false,
                        error: "Invalid userType. Must be 'member' or 'team_member'",
                    });
                    return;
                }
                // Parse ISO datetime strings
                let startDateTime;
                let endDateTime;
                try {
                    startDateTime = new Date(start_time);
                    endDateTime = new Date(end_time);
                    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                        throw new Error("Invalid date format");
                    }
                }
                catch {
                    res.status(400).json({
                        success: false,
                        error: "start_time and end_time must be valid ISO datetime strings",
                    });
                    return;
                }
                const booking = await this.bookingService.createBooking({
                    userType: userType,
                    userId,
                    sport_id,
                    field_id,
                    start_time: startDateTime,
                    end_time: endDateTime,
                    uses_parking: !!uses_parking,
                    parking_cars_count: Number(parking_cars_count) || 0,
                    notes: notes || undefined,
                    language: language || "ar",
                    skipBookableCheck: true, // Staff can book any active field
                });
                // Return the booking directly instead of fetching details
                // (to avoid issues with relations not loading properly)
                res.status(201).json({
                    success: true,
                    data: {
                        id: booking.id,
                        sport_id: booking.sport_id,
                        field_id: booking.field_id,
                        start_time: booking.start_time,
                        end_time: booking.end_time,
                        duration_minutes: booking.duration_minutes,
                        price: booking.price,
                        status: booking.status,
                        payment_reference: booking.payment_reference,
                        share_token: booking.share_token,
                        expected_participants: booking.expected_participants,
                        uses_parking: booking.uses_parking,
                        parking_cars_count: booking.parking_cars_count,
                        created_at: booking.created_at,
                    },
                    message: "Booking created successfully.",
                });
            }
            catch (err) {
                console.error('[BookingController] Error creating booking:', err);
                const error = err instanceof Error ? err.message : "Failed to create booking";
                res.status(400).json({ success: false, error });
            }
        };
        /**
         * GET /api/bookings/:bookingId
         * Get booking details (authenticated users only)
         */
        this.getBookingDetails = async (req, res) => {
            try {
                const { bookingId } = req.params;
                if (!bookingId) {
                    res.status(400).json({ success: false, error: "Booking ID is required" });
                    return;
                }
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                const details = await this.bookingService.getBookingDetails(bookingId, baseUrl);
                res.json({
                    success: true,
                    data: details,
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Booking not found";
                res.status(err instanceof Error && error === "Booking not found" ? 404 : 500).json({
                    success: false,
                    error,
                });
            }
        };
        /**
         * GET /api/bookings/users/:userType/:userId
         * Get all bookings for a user (member or team member)
         */
        this.getUserBookings = async (req, res) => {
            try {
                const { userType, userId } = req.params;
                if (!userType || !userId) {
                    res.status(400).json({
                        success: false,
                        error: "User type and user ID are required",
                    });
                    return;
                }
                if (!["member", "team_member"].includes(userType)) {
                    res.status(400).json({
                        success: false,
                        error: "Invalid userType. Must be 'member' or 'team_member'",
                    });
                    return;
                }
                const bookings = await this.bookingService.getUserBookings(userType, userId);
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                const bookingDetails = await Promise.all(bookings.map((b) => this.bookingService.getBookingDetails(b.id, baseUrl)));
                res.json({
                    success: true,
                    data: bookingDetails,
                    count: bookingDetails.length,
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Failed to get bookings";
                res.status(500).json({ success: false, error });
            }
        };
        /**
         * GET /api/bookings/stats/:userType/:userId
         * Get booking statistics for a user
         */
        this.getBookingStats = async (req, res) => {
            try {
                const { userType, userId } = req.params;
                if (!userType || !userId) {
                    res.status(400).json({
                        success: false,
                        error: "User type and user ID are required",
                    });
                    return;
                }
                if (!["member", "team_member"].includes(userType)) {
                    res.status(400).json({
                        success: false,
                        error: "Invalid userType. Must be 'member' or 'team_member'",
                    });
                    return;
                }
                const stats = await this.bookingService.getBookingStats(userType, userId);
                res.json({
                    success: true,
                    data: stats,
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Failed to get booking stats";
                res.status(500).json({ success: false, error });
            }
        };
        /**
         * POST /api/bookings/:bookingId/confirm-payment
         * Confirm booking after successful payment
         */
        this.confirmPayment = async (req, res) => {
            try {
                const { bookingId } = req.params;
                const { paymentReference } = req.body;
                if (!bookingId || !paymentReference) {
                    res.status(400).json({
                        success: false,
                        error: "Booking ID and payment reference are required",
                    });
                    return;
                }
                const booking = await this.bookingService.confirmBooking(bookingId, paymentReference);
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                const details = await this.bookingService.getBookingDetails(booking.id, baseUrl);
                res.json({
                    success: true,
                    data: details,
                    message: "Payment confirmed. Booking is now confirmed.",
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Failed to confirm payment";
                res.status(400).json({ success: false, error });
            }
        };
        /**
         * DELETE /api/bookings/:bookingId
         * Cancel a booking
         */
        this.cancelBooking = async (req, res) => {
            try {
                const { bookingId } = req.params;
                const reason = req.body?.reason || "No reason provided";
                if (!bookingId) {
                    res.status(400).json({ success: false, error: "Booking ID is required" });
                    return;
                }
                await this.bookingService.cancelBooking(bookingId, reason);
                res.json({
                    success: true,
                    message: "Booking cancelled successfully.",
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Failed to cancel booking";
                res.status(400).json({ success: false, error });
            }
        };
        /**
         * POST /api/bookings/share/:shareToken/register
         * Register a participant via shared link
         */
        this.registerParticipantViaLink = async (req, res) => {
            try {
                const { shareToken } = req.params;
                const { full_name, phone_number, national_id, email } = req.body;
                // Validate required full_name
                if (!shareToken || !full_name) {
                    res.status(400).json({
                        success: false,
                        error: "Missing required fields: shareToken (in URL), full_name",
                    });
                    return;
                }
                // At least one contact method is required
                if (!phone_number && !national_id && !email) {
                    res.status(400).json({
                        success: false,
                        error: "At least one contact method is required: phone_number, national_id, or email",
                    });
                    return;
                }
                const participant = await this.bookingService.registerParticipantViaLink(shareToken, {
                    full_name,
                    phone_number: phone_number || undefined,
                    national_id: national_id || undefined,
                    email: email || undefined,
                });
                res.status(201).json({
                    success: true,
                    data: {
                        id: participant.id,
                        full_name: participant.full_name,
                        phone_number: participant.phone_number,
                        national_id: participant.national_id,
                        email: participant.email,
                        is_creator: participant.is_creator,
                    },
                    message: "You have been successfully registered for this booking!",
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Failed to register participant";
                const statusCode = error.includes("Invalid share token")
                    ? 404
                    : error.includes("already registered")
                        ? 409
                        : 400;
                res.status(statusCode).json({ success: false, error });
            }
        };
        /**
         * GET /api/bookings/share/:shareToken/details
         * Get booking details via share token (public endpoint)
         */
        this.getBookingByShareToken = async (req, res) => {
            try {
                const { shareToken } = req.params;
                if (!shareToken) {
                    res.status(400).json({ success: false, error: "Share token is required" });
                    return;
                }
                const booking = await this.bookingService.getBookingByShareToken(shareToken);
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                const details = await this.bookingService.getBookingDetails(booking.id, baseUrl);
                // Remove sensitive info for shared link view
                const publicDetails = {
                    ...details,
                    share_url: undefined, // Don't show URL again on this request
                };
                res.json({
                    success: true,
                    data: publicDetails,
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Booking not found";
                res.status(404).json({ success: false, error });
            }
        };
        /**
         * GET /api/bookings/fields/:fieldId/available-slots
         * Get available booking slots for a specific field and date
         */
        this.getAvailableSlots = async (req, res) => {
            try {
                const { fieldId } = req.params;
                const { date } = req.query;
                if (!fieldId || !date) {
                    res.status(400).json({
                        success: false,
                        error: "Field ID and date (YYYY-MM-DD) are required",
                    });
                    return;
                }
                // Validate date format
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(date)) {
                    res.status(400).json({
                        success: false,
                        error: "Date must be in YYYY-MM-DD format",
                    });
                    return;
                }
                const slots = await this.bookingService.getAvailableSlots(fieldId, date);
                res.json({
                    success: true,
                    data: slots,
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Failed to get available slots";
                const statusCode = error.includes("not found") ? 404 : error.includes("not available") ? 400 : 500;
                res.status(statusCode).json({ success: false, error });
            }
        };
        /**
         * GET /api/bookings/fields/:fieldId/calendar
         * Get calendar view for a field (multiple days)
         */
        this.getCalendarView = async (req, res) => {
            try {
                const { fieldId } = req.params;
                const { start_date, end_date } = req.query;
                if (!fieldId || !start_date || !end_date) {
                    res.status(400).json({
                        success: false,
                        error: "Field ID, start_date, and end_date (YYYY-MM-DD) are required",
                    });
                    return;
                }
                // Validate date format
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
                    res.status(400).json({
                        success: false,
                        error: "Dates must be in YYYY-MM-DD format",
                    });
                    return;
                }
                // Validate date range
                const start = new Date(start_date);
                const end = new Date(end_date);
                if (end < start) {
                    res.status(400).json({
                        success: false,
                        error: "end_date must be after start_date",
                    });
                    return;
                }
                // Limit to 31 days
                const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff > 31) {
                    res.status(400).json({
                        success: false,
                        error: "Date range cannot exceed 31 days",
                    });
                    return;
                }
                const calendar = await this.bookingService.getCalendarView(fieldId, start_date, end_date);
                res.json({
                    success: true,
                    data: calendar,
                });
            }
            catch (err) {
                console.error('[BookingController] Error in getCalendarView:', err);
                const error = err instanceof Error ? err.message : "Failed to get calendar view";
                const statusCode = error.includes("not found") ? 404 : 500;
                res.status(statusCode).json({ success: false, error });
            }
        };
        /**
         * GET /api/security/bookings
         * Get all bookings for security dashboard (with all necessary details)
         */
        this.getSecurityDashboardBookings = async (req, res) => {
            try {
                const { field_id, sport_id, status, start_date, end_date } = req.query;
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                const bookings = await this.bookingService.getSecurityDashboardBookings(baseUrl, {
                    field_id: field_id,
                    sport_id: sport_id ? parseInt(sport_id) : undefined,
                    status: status,
                    start_date: start_date,
                    end_date: end_date,
                });
                res.json({
                    success: true,
                    data: bookings,
                    count: bookings.length,
                });
            }
            catch (err) {
                console.error('[BookingController] Error in getSecurityDashboardBookings:', err);
                const error = err instanceof Error ? err.message : "Failed to get security dashboard bookings";
                res.status(500).json({ success: false, error });
            }
        };
        /**
         * GET /api/bookings/all
         * Get all bookings (admin view)
         */
        this.getAllBookings = async (req, res) => {
            try {
                const { field_id, status, start_date, end_date } = req.query;
                const bookings = await this.bookingService.getAllBookings({
                    field_id: field_id,
                    status: status,
                    start_date: start_date,
                    end_date: end_date,
                });
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                const bookingDetails = await Promise.all(bookings.map((b) => this.bookingService.getBookingDetails(b.id, baseUrl)));
                res.json({
                    success: true,
                    data: bookingDetails,
                    count: bookingDetails.length,
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Failed to get all bookings";
                res.status(500).json({ success: false, error });
            }
        };
        /**
         * POST /api/bookings/:bookingId/complete
         * Mark a booking as completed
         */
        this.completeBooking = async (req, res) => {
            try {
                const { bookingId } = req.params;
                if (!bookingId) {
                    res.status(400).json({ success: false, error: "Booking ID is required" });
                    return;
                }
                const booking = await this.bookingService.completeBooking(bookingId);
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                const details = await this.bookingService.getBookingDetails(booking.id, baseUrl);
                res.json({
                    success: true,
                    data: details,
                    message: "Booking marked as completed",
                });
            }
            catch (err) {
                const error = err instanceof Error ? err.message : "Failed to complete booking";
                const statusCode = error.includes("not found") ? 404 : 400;
                res.status(statusCode).json({ success: false, error });
            }
        };
        this.bookingService = new BookingService_1.BookingService(data_source_1.AppDataSource);
    }
}
exports.BookingController = BookingController;
//# sourceMappingURL=BookingController.js.map