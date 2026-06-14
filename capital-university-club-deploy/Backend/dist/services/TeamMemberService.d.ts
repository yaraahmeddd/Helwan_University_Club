import { TeamMember } from '../entities/TeamMember';
export declare class TeamMemberService {
    private teamMemberRepo;
    private teamRepo;
    private logRepo;
    private sportRepo;
    private accountRepo;
    /**
     * Submit team member details (photo, medical report, address, national ID photos, proof)
     * Saves to team_members table
     */
    submitDetails(teamMemberId: number, photoPath?: string, medicalReportPath?: string, address?: string, nationalIdFrontPath?: string, nationalIdBackPath?: string, proofPath?: string): Promise<{
        id: number;
        team_member_id: number;
        status: string;
    }>;
    /**
     * Select teams for a team member
     */
    selectTeams(teamMemberId: number, teams: string[], startDateStr?: string, endDateStr?: string): Promise<{
        count: number;
        message: string;
        added?: undefined;
    } | {
        count: number;
        added: string[];
        message?: undefined;
    }>;
    /**
     * Get status of a team member
     */
    getStatus(teamMemberId: number): Promise<{
        team_member_info: {
            id: number;
            name_en: string;
            name_ar: string;
            status: string;
        };
        type: string;
        selected_teams: {
            name: string;
            teamId: string;
            startDate: Date;
            endDate: Date;
            status: string;
            price: number;
        }[];
        documents_uploaded: {
            personal_photo: boolean;
            medical_report: boolean;
        };
    }>;
    /**
     * Get all team members with optional status filter and pagination
     */
    getAllTeamMembers(status?: string, limit?: number, page?: number): Promise<{
        data: {
            id: number;
            firstNameEn: string;
            lastNameEn: string;
            firstNameAr: string;
            lastNameAr: string;
            name_en: string;
            name_ar: string;
            national_id: string;
            phone: string;
            status: string;
            membershipStatus: string;
            created_at: Date;
            photo: string | null;
            medical_report: string | null;
            national_id_front: string | null;
            national_id_back: string | null;
            proof: string | null;
            sports: {
                id: number | null;
                name: string;
                teamId: string;
                startDate: Date;
                endDate: Date;
                status: string;
                price: number;
            }[];
            teams: {
                name: string;
                teamId: string;
                startDate: Date;
                endDate: Date;
                status: string;
                price: number;
            }[];
        }[];
        total: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    } | {
        data: {
            id: number;
            firstNameEn: string;
            lastNameEn: string;
            firstNameAr: string;
            lastNameAr: string;
            name_en: string;
            name_ar: string;
            national_id: string;
            phone: string;
            status: string;
            membershipStatus: string;
            created_at: Date;
            photo: string | null;
            medical_report: string | null;
            national_id_front: string | null;
            national_id_back: string | null;
            proof: string | null;
            sports: {
                id: number | null;
                name: string;
                teamId: string;
                startDate: Date;
                endDate: Date;
                status: string;
                price: number;
            }[];
            teams: {
                name: string;
                teamId: string;
                startDate: Date;
                endDate: Date;
                status: string;
                price: number;
            }[];
        }[];
        total: number;
        pagination?: undefined;
    }>;
    /**
     * Get team member full details
     */
    getTeamMemberDetails(teamMemberId: number): Promise<{
        id: number;
        firstNameEn: string;
        lastNameEn: string;
        firstNameAr: string;
        lastNameAr: string;
        name_en: string;
        name_ar: string;
        national_id: string;
        phone: string;
        gender: string;
        nationality: string;
        birthdate: string | null;
        address: string;
        status: string;
        type: string;
        created_at: string | null;
        createdAt: string | null;
        join_date: string | null;
        personal_photo_url: string | null;
        medical_report_url: string | null;
        national_id_front_url: string | null;
        national_id_back_url: string | null;
        proof_url: string | null;
        photo: string | null;
        teams: {
            id: number;
            name: string;
            teamId: string;
            startDate: string | null;
            endDate: string | null;
            status: string;
            price: number;
        }[];
        documents: {
            personal_photo_url: string | null;
            medical_report_url: string | null;
            national_id_front_url: string | null;
            national_id_back_url: string | null;
            proof_url: string | null;
        };
    }>;
    /**
     * Update team member profile
     */
    updateProfile(teamMemberId: number, data: Partial<TeamMember> & {
        photo?: string;
        medical_report?: string;
        national_id_front?: string;
        national_id_back?: string;
        proof?: string;
    }): Promise<TeamMember>;
    /**
     * Create a new team member with account and sports
     */
    createTeamMember(email: string, password: string, firstNameEn: string, firstNameAr: string, lastNameEn: string, lastNameAr: string, nationalId: string, phone?: string, gender?: string, nationality?: string, birthdate?: Date, address?: string, isForeign?: boolean, sportIds?: number[], photoPath?: string, nationalIdFrontPath?: string, nationalIdBackPath?: string, medicalReportPath?: string, proofPath?: string): Promise<{
        id: number;
        account_id: number;
        name_en: string;
        name_ar: string;
        email: string;
        status: string;
    }>;
    /**
     * Update team member with sports
     */
    updateTeamMemberWithSports(teamMemberId: number, data: {
        email?: string;
        national_id?: string;
        first_name_en?: string;
        first_name_ar?: string;
        last_name_en?: string;
        last_name_ar?: string;
        phone?: string;
        address?: string;
        gender?: string;
        nationality?: string;
        birthdate?: Date | string;
        sport_ids?: number[];
    }): Promise<{
        id: number;
        name_en: string;
        name_ar: string;
        status: string;
    }>;
    /**
     * Add sports to a team member
     * Note: This creates team subscriptions for teams belonging to the given sports
     */
    private addTeamSports;
    /**
     * Get single team member by ID
     */
    getTeamMemberById(teamMemberId: number): Promise<{
        id: number;
        account_id: number;
        name_en: string;
        name_ar: string;
        first_name_en: string;
        first_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        email: string;
        phone: string;
        gender: string;
        nationality: string;
        birthdate: string | null;
        national_id: string;
        address: string;
        is_foreign: boolean;
        status: string;
        created_at: Date;
        updated_at: Date;
        photo: string | null;
        medical_report: string | null;
        national_id_front: string | null;
        national_id_back: string | null;
        proof: string | null;
        sports: {
            id: number;
            name: string;
            teamId: string;
            start_date: Date;
            end_date: Date;
            price: number;
            status: string;
        }[];
    }>;
    /**
     * Deactivate a team member account (soft delete)
     */
    deactivateTeamMember(teamMemberId: number): Promise<{
        id: number;
        status: string;
        message: string;
    }>;
    /**
     * Delete a team member permanently (including account)
     */
    deleteTeamMember(teamMemberId: number): Promise<{
        id: number;
        message: string;
    }>;
    /**
     * Get all pending team members (status = 'pending')
     */
    getPendingTeamMembers(): Promise<{
        id: number;
        first_name_ar: string;
        last_name_ar: string;
        first_name_en: string;
        last_name_en: string;
        phone: string;
        national_id: string;
        birth_date: string;
        gender: "male" | "female";
        address: string;
        social_status: string;
        status: string;
        created_at: string;
        photo: string | undefined;
        national_id_front: string | undefined;
        national_id_back: string | undefined;
        medical_report: string | undefined;
        memberType: "team_member";
        teams: string[];
        email: string;
        nationality: string;
        membership_plan: string;
    }[]>;
    /**
     * Approve a pending team member
     */
    approveTeamMember(teamMemberId: number): Promise<{
        id: number;
        status: string;
    }>;
    /**
     * Assign sports to a team member
     * Replaces all existing sports with the provided list
     */
    assignSportsToTeamMember(teamMemberId: number, sportIds: number[]): Promise<{
        team_member_id: number;
        sports_assigned: number;
        sport_ids: number[];
        message: string;
    }>;
    getTeamMemberBookings(teamMemberId: number): Promise<import("../entities/Booking").Booking[]>;
}
//# sourceMappingURL=TeamMemberService.d.ts.map