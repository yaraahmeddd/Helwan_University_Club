import { MemberTeam } from '../entities/MemberTeam';
export declare class MemberTeamService {
    private memberTeamRepo;
    private memberRepo;
    private sportRepo;
    /**
     * CREATE - Add a sport subscription for a member
     */
    addSportSubscription(memberId: number, teamId: string, startDate?: Date, endDate?: Date, price?: number): Promise<MemberTeam>;
    /**
     * READ - Get all sport subscriptions for a member
     */
    getMemberSubscriptions(memberId: number): Promise<MemberTeam[]>;
    /**
     * READ - Get a specific subscription
     */
    getSubscriptionById(subscriptionId: number): Promise<MemberTeam | null>;
    /**
     * READ - Get all subscriptions
     */
    getAllSubscriptions(limit?: number, offset?: number): Promise<{
        data: MemberTeam[];
        total: number;
    }>;
    /**
     * UPDATE - Update a subscription
     */
    updateSubscription(subscriptionId: number, updates: Partial<{
        start_date: Date;
        end_date: Date;
        status: string;
        price: number;
    }>): Promise<MemberTeam>;
    /**
     * DELETE - Remove a subscription (soft delete by changing status)
     */
    deactivateSubscription(subscriptionId: number): Promise<MemberTeam>;
    /**
     * DELETE - Permanently remove a subscription
     */
    deleteSubscription(subscriptionId: number): Promise<boolean>;
    /**
     * DELETE - Remove all subscriptions for a member
     */
    deleteAllMemberSubscriptions(memberId: number): Promise<number>;
    /**
     * Get active subscriptions for a member
     */
    getActiveMemberSubscriptions(memberId: number): Promise<MemberTeam[]>;
    /**
     * Get subscriptions count by status
     */
    getSubscriptionCountByStatus(): Promise<{
        [key: string]: number;
    }>;
    /**
     * Delete a specific member's sport subscription by team_id
     */
    deleteMemberSportSubscription(memberId: number, teamId: string): Promise<boolean>;
}
//# sourceMappingURL=MemberTeamService.d.ts.map