export interface SubscribeTeamMemberToTeamRequest {
    team_member_id: number;
    team_id: string;
    start_date?: Date;
    price?: number;
}
export interface GetTeamMemberSubscriptionsResponse {
    team_member_id: number;
    team_member_name_en: string;
    team_member_name_ar: string;
    subscriptions: Array<{
        subscription_id: number;
        team_id: string;
        team_name_en: string;
        team_name_ar: string;
        sport_name_en: string;
        sport_name_ar: string;
        start_date: Date;
        end_date: Date | null;
        status: string;
        subscription_status: string;
        payment_id: number | null;
        payment_reference: string | null;
        payment_completed_at: Date | null;
        price: number;
    }>;
}
export interface GetTeamMembersResponse {
    team_id: string;
    team_name_en: string;
    team_name_ar: string;
    sport_name_en: string;
    sport_name_ar: string;
    total_members: number;
    max_capacity: number;
    available_slots: number;
    members: Array<{
        subscription_id: number;
        team_member_id: number;
        team_member_name_en: string;
        team_member_name_ar: string;
        start_date: Date;
        end_date: Date | null;
        status: string;
        price: number;
    }>;
}
export declare class TeamMemberSubscriptionService {
    private teamMemberRepository;
    private teamMemberTeamRepository;
    private teamRepository;
    private sportRepository;
    private auditLogService;
    /**
     * Subscribe a team member to a team
     */
    subscribeTeamMemberToTeam(teamMemberId: number, teamId: string, request: Partial<SubscribeTeamMemberToTeamRequest>, staffId: number): Promise<{
        success: boolean;
        message: string;
        data?: Record<string, unknown>;
    }>;
    /**
     * Unsubscribe a team member from a team
     */
    unsubscribeTeamMemberFromTeam(teamMemberId: number, subscriptionId: number, staffId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Approve a team member subscription (change status from pending to approved)
     */
    approveTeamMemberSubscription(subscriptionId: number, staffId: number): Promise<{
        success: boolean;
        message: string;
        data: Record<string, unknown>;
    }>;
    /**
     * Reject a team member subscription
     */
    rejectTeamMemberSubscription(subscriptionId: number, staffId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get all subscriptions for a specific team member
     */
    getTeamMemberSubscriptions(teamMemberId: number): Promise<GetTeamMemberSubscriptionsResponse>;
    /**
     * Get all team members subscribed to a specific team
     */
    getTeamMembers(teamId: string): Promise<GetTeamMembersResponse>;
    /**
     * Check if team member is subscribed to a team
     */
    isTeamMemberSubscribed(teamMemberId: number, teamId: string): Promise<boolean>;
    /**
     * Get pending subscriptions for a team
     */
    getPendingSubscriptions(teamId: string): Promise<Array<Record<string, unknown>>>;
    /**
     * Get team member subscription count
     */
    getTeamMemberSubscriptionCount(teamMemberId: number): Promise<number>;
}
//# sourceMappingURL=TeamMemberSubscriptionService.d.ts.map