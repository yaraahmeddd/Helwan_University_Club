import { Team } from './Team';
import { Sport } from './Sport';
import { Attendance } from './Attendance';
import { Field } from './Field';
export declare class TeamTrainingSchedule {
    id: string;
    team_id: string;
    team: Team;
    sport_id: number | null;
    sport: Sport | null;
    days_en: string;
    days_ar: string;
    start_time: string;
    end_time: string;
    field_id: string | null;
    field: Field | null;
    training_fee: number;
    status: 'active' | 'inactive' | 'archived';
    created_at: Date;
    updated_at: Date;
    attendances: Attendance[];
}
//# sourceMappingURL=TeamTrainingSchedule.d.ts.map