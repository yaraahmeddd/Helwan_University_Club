import { Staff } from './Staff';
import { Team } from './Team';
import { TeamTrainingSchedule } from './TeamTrainingSchedule';
export declare class Sport {
    id: number;
    name_en: string;
    name_ar: string;
    description_en: string | null;
    description_ar: string | null;
    price: number | null;
    status: string;
    created_by_staff_id: number;
    created_by: Staff;
    approved_by_staff_id: number | null;
    approved_by: Staff | null;
    approved_at: Date | null;
    approval_comments: string | null;
    sport_image: string | null;
    max_participants: number;
    is_active: boolean;
    requires_booking: boolean;
    teams: Team[];
    training_schedules: TeamTrainingSchedule[];
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=Sport.d.ts.map