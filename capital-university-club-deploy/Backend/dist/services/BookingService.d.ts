import { DataSource } from "typeorm";
import { Booking, BookingStatus, UserType } from "../entities/Booking";
import { BookingParticipant } from "../entities/BookingParticipant";
export type { UserType };
export interface CreateBookingRequest {
    userType: UserType;
    userId: number;
    sport_id: number;
    field_id: string;
    start_time: Date;
    end_time: Date;
    expected_participants?: number;
    notes?: string;
    language?: "ar" | "en";
}
export interface BookingParticipantInput {
    full_name: string;
    phone_number?: string;
    national_id?: string;
    email?: string;
    national_id_front?: string;
    national_id_back?: string;
}
export interface AvailableFieldsResponse {
    field_id: string;
    field_name: string;
    sport_id: string;
    description?: string;
}
export interface OperatingHoursResponse {
    day_of_week: number;
    opening_time: string;
    closing_time: string;
}
export interface BookingDetailsResponse {
    id: string;
    sport_id: number;
    field_id: string;
    field_name_ar: string;
    field_name_en: string;
    sport_name_ar: string;
    sport_name_en: string;
    start_time: Date;
    end_time: Date;
    duration_minutes: number;
    price: number;
    status: BookingStatus;
    share_token: string;
    share_url: string;
    expected_participants: number;
    participants: Array<{
        id: string;
        full_name: string;
        phone_number: string | null;
        national_id: string | null;
        email: string | null;
        is_creator: boolean;
    }>;
    created_at: Date;
}
export declare class BookingService {
    private dataSource;
    private bookingRepository;
    private participantRepository;
    private operatingHoursRepository;
    private sportRepository;
    private trainingScheduleRepository;
    private fieldRepository;
    constructor(dataSource: DataSource);
    /**
     * Check for booking conflicts
     */
    checkBookingConflict(fieldId: string, startTime: Date, endTime: Date): Promise<boolean>;
    /**
     * Check for training schedule conflicts
     */
    checkTrainingConflict(fieldId: string, startTime: Date, endTime: Date): Promise<boolean>;
    /**
     * Check for all conflicts (bookings + training schedules)
     */
    checkAllConflicts(fieldId: string, startTime: Date, endTime: Date): Promise<{
        hasConflict: boolean;
        conflictType?: 'booking' | 'training';
    }>;
    /**
     * Create a new booking
     */
    createBooking(request: CreateBookingRequest): Promise<Booking>;
    /**
     * Get booking details with share URL
     */
    getBookingDetails(bookingId: string, baseUrl: string): Promise<BookingDetailsResponse>;
    /**
     * Validate and retrieve booking by share token
     */
    getBookingByShareToken(shareToken: string): Promise<Booking>;
    /**
     * Register a participant via shared link
     */
    registerParticipantViaLink(shareToken: string, participantData: BookingParticipantInput): Promise<BookingParticipant>;
    /**
     * Confirm booking after successful payment
     */
    confirmBooking(bookingId: string, paymentReference: string): Promise<Booking>;
    /**
     * Cancel booking
     */
    cancelBooking(bookingId: string, reason?: string): Promise<Booking>;
    /**
     * Get user's bookings
     */
    getUserBookings(userType: UserType, userId: string): Promise<Booking[]>;
    /**
     * Get booking statistics
     */
    getBookingStats(userType: UserType, userId: string): Promise<{
        total_bookings: number;
        confirmed_bookings: number;
        total_participants: number;
        total_revenue: number;
    }>;
    /**
     * Helper: Generate 64-character unique share token
     */
    private generateShareToken;
    private assertFieldBookable;
    /**
     * Get operating hours for a field
     */
    getFieldOperatingHoursList(fieldId: string): Promise<OperatingHoursResponse[]>;
    /**
     * Mark booking as completed
     */
    completeBooking(bookingId: string): Promise<Booking>;
    /**
     * Get available booking slots for a specific field and date
     */
    getAvailableSlots(fieldId: string, date: string): Promise<{
        field_id: string;
        field_name: string;
        date: string;
        day_of_week: number;
        slots: Array<{
            start_time: string;
            end_time: string;
            status: 'available' | 'booked' | 'training' | 'closed';
            booking_id?: string;
            training_id?: string;
            booking_status?: BookingStatus;
            member_id?: number | null;
            team_member_id?: number | null;
            actual_booking_start?: string;
            actual_booking_end?: string;
        }>;
    }>;
    /**
     * Get calendar view for a field (multiple days)
     */
    getCalendarView(fieldId: string, startDate: string, // YYYY-MM-DD
    endDate: string): Promise<{
        field_id: string;
        field_name: string;
        start_date: string;
        end_date: string;
        days: Array<{
            date: string;
            day_of_week: number;
            operating_hours: {
                opening_time: string;
                closing_time: string;
            } | null;
            slots: Array<{
                start_time: string;
                end_time: string;
                status: 'available' | 'booked' | 'training' | 'closed';
                booking_id?: string;
                training_id?: string;
                booking_status?: BookingStatus;
                member_id?: number | null;
                team_member_id?: number | null;
                actual_booking_start?: string;
                actual_booking_end?: string;
            }>;
        }>;
    }>;
    /**
     * Get all bookings (admin view)
     */
    getAllBookings(filters?: {
        field_id?: string;
        status?: BookingStatus;
        start_date?: string;
        end_date?: string;
    }): Promise<Booking[]>;
    /**
     * Get security dashboard bookings with all necessary details
     */
    getSecurityDashboardBookings(baseUrl: string, filters?: {
        field_id?: string;
        sport_id?: number;
        status?: BookingStatus;
        start_date?: string;
        end_date?: string;
    }): Promise<any[]>;
}
//# sourceMappingURL=BookingService.d.ts.map