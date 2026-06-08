import { MemberTeamSubscription } from '../entities/MemberTeamSubscription';
import { TeamMemberTeamSubscription } from '../entities/TeamMemberTeamSubscription';
/**
 * SubscriptionService
 *
 * Handles business logic for member and team member subscriptions to teams
 * Manages the complete lifecycle: create, approve, decline, cancel
 */
export declare class SubscriptionService {
    private memberSubRepo;
    private teamMemberSubRepo;
    private teamService;
    constructor();
    /**
     * Create a member subscription to a team
     */
    createMemberSubscription(data: {
        member_id: number;
        team_id: number;
        announcement_id?: number | null;
        monthly_fee: number;
        registration_fee?: number | null;
        start_date?: Date | null;
        end_date?: Date | null;
    }): Promise<MemberTeamSubscription>;
    /**
     * Get member subscription by ID
     */
    getMemberSubscriptionById(subscriptionId: number): Promise<MemberTeamSubscription | null>;
    /**
     * Get all subscriptions for a member
     */
    getMemberSubscriptions(memberId: number, status?: string): Promise<MemberTeamSubscription[]>;
    /**
     * Approve member subscription
     */
    approveMemberSubscription(subscriptionId: number, approvedByStaffId: number, customPrice?: number | null, notes?: string | null): Promise<MemberTeamSubscription | null>;
    /**
     * Decline member subscription
     */
    declineMemberSubscription(subscriptionId: number, reason: string, approvedByStaffId: number): Promise<MemberTeamSubscription | null>;
    /**
     * Cancel member subscription
     */
    cancelMemberSubscription(subscriptionId: number, reason: string, approvedByStaffId: number): Promise<MemberTeamSubscription | null>;
    /**
     * Get pending member subscriptions for approval
     */
    getPendingMemberSubscriptions(): Promise<MemberTeamSubscription[]>;
    /**
     * Create a team member subscription to a team
     */
    createTeamMemberSubscription(data: {
        team_member_id: number;
        team_id: number;
        announcement_id?: number | null;
        monthly_fee: number;
        registration_fee?: number | null;
        start_date?: Date | null;
        end_date?: Date | null;
    }): Promise<TeamMemberTeamSubscription>;
    /**
     * Get team member subscription by ID
     */
    getTeamMemberSubscriptionById(subscriptionId: number): Promise<TeamMemberTeamSubscription | null>;
    /**
     * Get all subscriptions for a team member
     */
    getTeamMemberSubscriptions(teamMemberId: number, status?: string): Promise<TeamMemberTeamSubscription[]>;
    /**
     * Approve team member subscription
     */
    approveTeamMemberSubscription(subscriptionId: number, approvedByStaffId: number, customPrice?: number | null, isCaptain?: boolean, notes?: string | null): Promise<TeamMemberTeamSubscription | null>;
    /**
     * Decline team member subscription
     */
    declineTeamMemberSubscription(subscriptionId: number, reason: string, approvedByStaffId: number): Promise<TeamMemberTeamSubscription | null>;
    /**
     * Cancel team member subscription
     */
    cancelTeamMemberSubscription(subscriptionId: number, reason: string, approvedByStaffId: number): Promise<TeamMemberTeamSubscription | null>;
    /**
     * Get pending team member subscriptions for approval
     */
    getPendingTeamMemberSubscriptions(): Promise<TeamMemberTeamSubscription[]>;
    /**
     * Set team member as captain
     */
    setTeamMemberAsCaptain(subscriptionId: number): Promise<TeamMemberTeamSubscription | null>;
    /**
     * Unset team member as captain
     */
    unsetTeamMemberAsCaptain(subscriptionId: number): Promise<TeamMemberTeamSubscription | null>;
    /**
     * Get subscription statistics
     */
    getSubscriptionStats(): Promise<{
        members: {
            pending: number;
            approved: number;
            active: number;
            declined: number;
            cancelled: number;
        };
        teamMembers: {
            pending: number;
            approved: number;
            active: number;
            declined: number;
            cancelled: number;
        };
    }>;
}
//# sourceMappingURL=SubscriptionService.d.ts.map