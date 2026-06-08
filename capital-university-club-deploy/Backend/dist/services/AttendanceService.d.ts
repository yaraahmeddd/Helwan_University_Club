import { Attendance } from '../entities/Attendance';
import { TeamTrainingSchedule } from '../entities/TeamTrainingSchedule';
export interface RecordAttendanceRequest {
    member_id?: number;
    team_member_id?: number;
    team_id: string;
    training_schedule_id: string;
    attendance_date: Date;
    attended: boolean;
    notes?: string;
}
export interface AbsenceReport {
    entity_id: number;
    entity_type: 'member' | 'team_member';
    name: string;
    team_id: string;
    team_name: string;
    absence_count: number;
    absence_percentage: number;
    last_absence_date: string | null;
}
export declare class AttendanceService {
    private attendanceRepository;
    private memberRepository;
    private teamMemberRepository;
    private teamRepository;
    private scheduleRepository;
    private memberTeamRepository;
    private teamMemberTeamRepository;
    constructor();
    /**
     * Record attendance for a member or team member
     */
    recordAttendance(request: RecordAttendanceRequest): Promise<Attendance>;
    /**
     * Get attendance stats for a member or team member
     */
    getEntityOverallStats(id: number, type: 'member' | 'team_member'): Promise<{
        total_sessions: number;
        attended_sessions: number;
        missed_sessions: number;
        attendance_rate: number;
    }>;
    /**
     * Get member sports (teams they are joined in)
     */
    getJoinedSports(id: number, type: 'member' | 'team_member'): Promise<{
        id: string;
        name: string;
        name_ar: string;
        sport_name: string;
        sport_name_ar: string;
        sport_image: string | null;
        status: string;
        start_date: Date | null;
        end_date: Date | null;
        schedules: TeamTrainingSchedule[];
    }[]>;
    /**
     * Get complete dashboard summary for a team member
     */
    getTeamMemberDashboardStats(teamMemberId: number): Promise<{
        overall: {
            total_sessions: number;
            attended_sessions: number;
            missed_sessions: number;
            attendance_rate: number;
        };
        sports: {
            stats: {
                attended: number;
                absent: number;
                total: number;
                rate: number;
                records: {
                    date: string;
                    attended: boolean;
                }[];
            };
            id: string;
            name: string;
            name_ar: string;
            sport_name: string;
            sport_name_ar: string;
            sport_image: string | null;
            status: string;
            start_date: Date | null;
            end_date: Date | null;
            schedules: TeamTrainingSchedule[];
        }[];
    }>;
    /**
     * Get complete dashboard summary for a member
     */
    getMemberDashboardStats(memberId: number): Promise<{
        overall: {
            total_sessions: number;
            attended_sessions: number;
            missed_sessions: number;
            attendance_rate: number;
        };
        sports: {
            stats: {
                attended: number;
                absent: number;
                total: number;
                rate: number;
                records: {
                    date: string;
                    attended: boolean;
                }[];
            };
            id: string;
            name: string;
            name_ar: string;
            sport_name: string;
            sport_name_ar: string;
            sport_image: string | null;
            status: string;
            start_date: Date | null;
            end_date: Date | null;
            schedules: TeamTrainingSchedule[];
        }[];
    }>;
}
//# sourceMappingURL=AttendanceService.d.ts.map