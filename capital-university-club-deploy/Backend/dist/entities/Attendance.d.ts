import { Member } from './Member';
import { TeamTrainingSchedule } from './TeamTrainingSchedule';
export declare class Attendance {
    id: string;
    member_id: number | null;
    member: Member;
    team_member_id: number | null;
    team_member: any;
    team_id: string;
    training_schedule_id: string;
    training_schedule: TeamTrainingSchedule;
    attendance_date: string;
    attended: boolean;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=Attendance.d.ts.map