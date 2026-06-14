import { BookingParticipant } from "./BookingParticipant";
import { Sport } from "./Sport";
import { Field } from "./Field";
import { Member } from "./Member";
import { TeamMember } from "./TeamMember";
export type UserType = "member" | "team_member";
export type BookingStatus = "pending_payment" | "confirmed" | "completed" | "cancelled";
export declare class Booking {
    id: string;
    member_id: number | null;
    team_member_id: number | null;
    sport_id: number;
    sport: Sport;
    field_id: string;
    field: Field;
    member: Member | null;
    team_member: TeamMember | null;
    start_time: Date;
    end_time: Date;
    duration_minutes: number;
    price: number;
    status: BookingStatus;
    payment_reference: string | null;
    payment_completed_at: Date | null;
    share_token: string;
    expected_participants: number;
    uses_parking: boolean;
    parking_cars_count: number;
    notes: string | null;
    language: "ar" | "en";
    cancelled_at: Date | null;
    completed_at: Date | null;
    created_at: Date;
    updated_at: Date;
    participants: BookingParticipant[];
}
//# sourceMappingURL=Booking.d.ts.map