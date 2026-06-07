import { Sport } from "./Sport";
import { Branch } from "./Branch";
import { FieldOperatingHours } from "./FieldOperatingHours";
export declare class Field {
    id: string;
    name_en: string;
    name_ar: string;
    description_en: string | null;
    description_ar: string | null;
    sport_id: number;
    sport: Sport;
    capacity: number | null;
    branch_id: number | null;
    branch: Branch | null;
    status: "active" | "inactive" | "maintenance";
    hourly_rate: number | null;
    is_available_for_booking: boolean;
    booking_slot_duration: number;
    operating_hours: FieldOperatingHours[];
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=Field.d.ts.map