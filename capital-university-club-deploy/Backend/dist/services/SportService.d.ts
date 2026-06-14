import { Sport } from '../entities/Sport';
import { TeamMember } from '../entities/TeamMember';
import { Team } from '../entities/Team';
import { TeamTrainingSchedule } from '../entities/TeamTrainingSchedule';
export declare class SportService {
    private sportRepository;
    private staffRepository;
    private memberRepository;
    private teamMemberRepository;
    private teamMemberTeamRepository;
    private teamRepository;
    private teamTrainingScheduleRepository;
    private auditLogService;
    /**
     * Create a new sport
     */
    createSport(sportData: {
        name_en: string;
        name_ar: string;
        description_en?: string;
        description_ar?: string;
        price?: number;
        sport_image?: string;
        max_participants?: number;
        is_active?: boolean;
        requires_booking?: boolean;
    }, staffId: number, staffTypeId: number): Promise<Sport>;
    /**
     * Create a new sport with teams (atomic transaction) - DEPRECATED
     * Use createSportWithTeamsAndTraining instead
     */
    createSportWithTeams(sportData: {
        name_en: string;
        name_ar: string;
        description_en?: string;
        description_ar?: string;
        sport_image?: string;
    }, teamsData: Array<{
        name: string;
        branch_id?: number;
        max_members?: number;
    }>, staffId: number, staffTypeId: number): Promise<{
        sport: Sport;
        teams: Team[];
    }>;
    /**
     * Create a new sport with teams and training schedules (atomic transaction)
     * Supports bilingual team names and flexible training schedules
     */
    createSportWithTeamsAndTraining(sportData: {
        name_en: string;
        name_ar: string;
        description_en?: string;
        description_ar?: string;
        sport_image?: string;
    }, teamsData: Array<{
        name_en: string;
        name_ar: string;
        max_participants: number;
        training: {
            days_en: string;
            days_ar: string;
            start_time: string;
            end_time: string;
            field_id: string;
            training_fee: number;
        };
    }>, staffId: number, staffTypeId: number): Promise<{
        sport: Sport;
        teams: Team[];
        trainings: TeamTrainingSchedule[];
    }>;
    getAllSports(filters?: {
        status?: string;
        is_active?: boolean;
    }): Promise<(Sport & {
        membersCount: number;
    })[]>;
    getSportById(sportId: number): Promise<Sport | null>;
    updateSport(sportId: number, updateData: {
        name_en?: string;
        name_ar?: string;
        description_en?: string;
        description_ar?: string;
        price?: number;
        sport_image?: string;
        max_participants?: number;
        is_active?: boolean;
        requires_booking?: boolean;
    }, staffId: number, staffTypeId: number): Promise<Sport>;
    approveSport(sportId: number, action: 'approve' | 'reject', staffId: number, staffTypeId: number, comments?: string): Promise<Sport>;
    deleteSport(sportId: number, staffTypeId: number, staffId: number): Promise<void>;
    toggleSportStatus(sportId: number, staffTypeId: number, staffId: number): Promise<Sport>;
    /**
     * Get all Team Members
     */
    getTeamMembers(): Promise<TeamMember[]>;
    /**
     * Get Team Members by Sport Name
     */
    getTeamMembersBySport(sportName: string): Promise<TeamMember[]>;
    /**
     * Get Single Team Member
     */
    getTeamMemberById(memberId: number): Promise<TeamMember | null>;
    /**
     * Get Regular Members by Sport Name
     * Queries members who have a MemberTeam subscription to a team belonging to the given sport.
     */
    getMembersBySport(sportName: string): Promise<{
        id: any;
        first_name_ar: any;
        last_name_ar: any;
        first_name_en: any;
        last_name_en: any;
        phone: any;
        national_id: any;
        status: any;
        created_at: any;
        member_type: "member";
        team_member_teams: {
            id: any;
            team_name: any;
            team_name_en: any;
            status: any;
        }[];
    }[]>;
    /**
     * Update sport with all related fields (teams and trainings)
     * This method handles atomic updates to sport, teams, and training schedules
     */
    updateSportWithTeamsAndTraining(sportId: number, updateData: {
        name_en?: string;
        name_ar?: string;
        description_en?: string;
        description_ar?: string;
        sport_image?: string;
        price?: number;
        teams?: Array<{
            id?: string;
            name_en?: string;
            name_ar?: string;
            max_participants?: number;
            training?: {
                id?: string;
                days_en?: string;
                days_ar?: string;
                start_time?: string;
                end_time?: string;
                field_id?: string;
                training_fee?: number;
            };
        }>;
    }, staffId: number, staffTypeId: number): Promise<{
        sport: Sport;
        teams: Team[];
        trainings: TeamTrainingSchedule[];
    }>;
    private isStaffSportManager;
    private isStaffSportSpecialist;
    private isStaffDirectorOfFinancialAffairs;
    private isStaffAdmin;
}
//# sourceMappingURL=SportService.d.ts.map