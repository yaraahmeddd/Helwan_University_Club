export interface SubscribeMemberToSportRequest {
    member_id: number;
    sport_id: number;
}
export interface GetMemberSubscriptionsResponse {
    member_id: number;
    member_name_en: string;
    member_name_ar: string;
    subscriptions: Array<{
        sport_id: number;
        sport_name_en: string;
        sport_name_ar: string;
        subscription_date: Date;
        status: 'active' | 'inactive' | 'cancelled';
    }>;
}
export interface GetSportMembersResponse {
    sport_id: number;
    sport_name_en: string;
    sport_name_ar: string;
    total_members: number;
    members: Array<{
        member_id: number;
        member_name_en: string;
        member_name_ar: string;
        member_type: string;
        subscription_date: Date;
        status: 'active' | 'inactive' | 'cancelled';
    }>;
}
export declare class MemberSubscriptionService {
    private memberRepository;
    private sportRepository;
    private auditLogService;
    /**
     * Subscribe a member to a sport
     * Creates a many-to-many relationship between member and sport
     */
    subscribeMemberToSport(memberId: number, sportId: number, staffId: number): Promise<{
        success: boolean;
        message: string;
        data?: Record<string, unknown>;
    }>;
    /**
     * Unsubscribe a member from a sport
     */
    unsubscribeMemberFromSport(memberId: number, sportId: number, staffId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get all subscriptions for a specific member
     */
    getMemberSubscriptions(memberId: number): Promise<GetMemberSubscriptionsResponse>;
    /**
     * Get all members subscribed to a specific sport
     */
    getSportMembers(sportId: number): Promise<GetSportMembersResponse>;
    /**
     * Check if member is subscribed to a sport
     */
    isMemberSubscribed(memberId: number, sportId: number): Promise<boolean>;
    /**
     * Get subscription count for a sport
     */
    getSportSubscriptionCount(sportId: number): Promise<number>;
}
//# sourceMappingURL=MemberSubscriptionService.d.ts.map