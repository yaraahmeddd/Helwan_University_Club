"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const data_source_1 = require("../database/data-source");
const MemberTeamSubscription_1 = require("../entities/MemberTeamSubscription");
const TeamMemberTeamSubscription_1 = require("../entities/TeamMemberTeamSubscription");
const TeamService_1 = require("./TeamService");
/**
 * SubscriptionService
 *
 * Handles business logic for member and team member subscriptions to teams
 * Manages the complete lifecycle: create, approve, decline, cancel
 */
class SubscriptionService {
    constructor() {
        this.memberSubRepo = data_source_1.AppDataSource.getRepository(MemberTeamSubscription_1.MemberTeamSubscription);
        this.teamMemberSubRepo = data_source_1.AppDataSource.getRepository(TeamMemberTeamSubscription_1.TeamMemberTeamSubscription);
        this.teamService = new TeamService_1.TeamService();
    }
    // ==================== MEMBER SUBSCRIPTIONS ====================
    /**
     * Create a member subscription to a team
     */
    async createMemberSubscription(data) {
        // Check if member already has an active or pending subscription for this team
        const existingSub = await this.memberSubRepo.findOne({
            where: [
                { member_id: data.member_id, team_id: data.team_id, status: 'active' },
                { member_id: data.member_id, team_id: data.team_id, status: 'pending' },
                { member_id: data.member_id, team_id: data.team_id, status: 'approved' }
            ]
        });
        if (existingSub) {
            throw new Error('You already have an active or pending subscription for this sport. You can only re-join after your current subscription ends.');
        }
        // Set default start and end dates if not provided
        // Subscriptions last exactly 1 month
        const now = new Date();
        const startDate = data.start_date || new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = data.end_date || new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const subscription = this.memberSubRepo.create({
            member_id: data.member_id,
            team_id: data.team_id,
            announcement_id: data.announcement_id || null,
            monthly_fee: data.monthly_fee,
            registration_fee: data.registration_fee || null,
            start_date: startDate,
            end_date: endDate,
            status: 'pending',
            payment_status: 'unpaid',
            discount_amount: 0,
        });
        subscription.status = 'active';
        if (!subscription.end_date) {
            const startDate = subscription.start_date ? new Date(subscription.start_date) : new Date();
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            subscription.end_date = endDate;
        }
        const saved = await this.memberSubRepo.save(subscription);
        // Increment team participants
        await this.teamService.incrementParticipants(data.team_id);
        return saved;
    }
    /**
     * Get member subscription by ID
     */
    async getMemberSubscriptionById(subscriptionId) {
        return await this.memberSubRepo.findOne({
            where: { id: subscriptionId },
            relations: ['member', 'team', 'approved_by', 'announcement'],
        });
    }
    /**
     * Get all subscriptions for a member
     */
    async getMemberSubscriptions(memberId, status) {
        let query = this.memberSubRepo.createQueryBuilder('sub')
            .where('sub.member_id = :member_id', { member_id: memberId });
        if (status) {
            query = query.andWhere('sub.status = :status', { status });
        }
        return await query
            .leftJoinAndSelect('sub.team', 'team')
            .leftJoinAndSelect('team.sport', 'sport')
            .leftJoinAndSelect('team.branch', 'branch')
            .leftJoinAndSelect('sub.approved_by', 'approved_by')
            .orderBy('sub.created_at', 'DESC')
            .getMany();
    }
    /**
     * Approve member subscription
     */
    async approveMemberSubscription(subscriptionId, approvedByStaffId, customPrice, notes) {
        const subscription = await this.getMemberSubscriptionById(subscriptionId);
        if (!subscription)
            return null;
        await this.memberSubRepo.update(subscriptionId, {
            status: 'approved',
            approved_by_staff_id: approvedByStaffId,
            approved_at: new Date(),
            custom_price: customPrice || null,
            approval_notes: notes || null,
        });
        return await this.getMemberSubscriptionById(subscriptionId);
    }
    /**
     * Decline member subscription
     */
    async declineMemberSubscription(subscriptionId, reason, approvedByStaffId) {
        const subscription = await this.getMemberSubscriptionById(subscriptionId);
        if (!subscription)
            return null;
        // Decrement team participants since this subscription was declined
        await this.teamService.decrementParticipants(subscription.team_id);
        await this.memberSubRepo.update(subscriptionId, {
            status: 'declined',
            decline_reason: reason,
            approved_by_staff_id: approvedByStaffId,
            declined_at: new Date(),
        });
        return await this.getMemberSubscriptionById(subscriptionId);
    }
    /**
     * Cancel member subscription
     */
    async cancelMemberSubscription(subscriptionId, reason, approvedByStaffId) {
        const subscription = await this.getMemberSubscriptionById(subscriptionId);
        if (!subscription)
            return null;
        // Only decrement if subscription was approved/active
        if (['approved', 'active'].includes(subscription.status)) {
            await this.teamService.decrementParticipants(subscription.team_id);
        }
        await this.memberSubRepo.update(subscriptionId, {
            status: 'cancelled',
            cancellation_reason: reason,
            approved_by_staff_id: approvedByStaffId,
            cancelled_at: new Date(),
        });
        return await this.getMemberSubscriptionById(subscriptionId);
    }
    /**
     * Get pending member subscriptions for approval
     */
    async getPendingMemberSubscriptions() {
        return await this.memberSubRepo.createQueryBuilder('sub')
            .where('sub.status = :status', { status: 'pending' })
            .leftJoinAndSelect('sub.member', 'member')
            .leftJoinAndSelect('sub.team', 'team')
            .leftJoinAndSelect('team.sport', 'sport')
            .leftJoinAndSelect('team.branch', 'branch')
            .orderBy('sub.created_at', 'ASC')
            .getMany();
    }
    // ==================== TEAM MEMBER SUBSCRIPTIONS ====================
    /**
     * Create a team member subscription to a team
     */
    async createTeamMemberSubscription(data) {
        // Check if team member already has an active or pending subscription for this team
        const existingSub = await this.teamMemberSubRepo.findOne({
            where: [
                { team_member_id: data.team_member_id, team_id: data.team_id, status: 'active' },
                { team_member_id: data.team_member_id, team_id: data.team_id, status: 'pending' },
                { team_member_id: data.team_member_id, team_id: data.team_id, status: 'approved' }
            ]
        });
        if (existingSub) {
            throw new Error('You already have an active or pending subscription for this sport. You can only re-join after your current subscription ends.');
        }
        // Set default start and end dates if not provided
        // Subscriptions last exactly 1 month
        const now = new Date();
        const startDate = data.start_date || new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = data.end_date || new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const subscription = this.teamMemberSubRepo.create({
            team_member_id: data.team_member_id,
            team_id: data.team_id,
            announcement_id: data.announcement_id || null,
            monthly_fee: data.monthly_fee,
            registration_fee: data.registration_fee || null,
            start_date: startDate,
            end_date: endDate,
            status: 'pending',
            payment_status: 'unpaid',
            discount_amount: 0,
            is_captain: false,
        });
        const saved = await this.teamMemberSubRepo.save(subscription);
        // Increment team participants
        await this.teamService.incrementParticipants(data.team_id);
        return saved;
    }
    /**
     * Get team member subscription by ID
     */
    async getTeamMemberSubscriptionById(subscriptionId) {
        return await this.teamMemberSubRepo.findOne({
            where: { id: subscriptionId },
            relations: ['team_member', 'team', 'approved_by', 'announcement'],
        });
    }
    /**
     * Get all subscriptions for a team member
     */
    async getTeamMemberSubscriptions(teamMemberId, status) {
        let query = this.teamMemberSubRepo.createQueryBuilder('sub')
            .where('sub.team_member_id = :team_member_id', { team_member_id: teamMemberId });
        if (status) {
            query = query.andWhere('sub.status = :status', { status });
        }
        return await query
            .leftJoinAndSelect('sub.team', 'team')
            .leftJoinAndSelect('team.sport', 'sport')
            .leftJoinAndSelect('team.branch', 'branch')
            .leftJoinAndSelect('sub.approved_by', 'approved_by')
            .orderBy('sub.created_at', 'DESC')
            .getMany();
    }
    /**
     * Approve team member subscription
     */
    async approveTeamMemberSubscription(subscriptionId, approvedByStaffId, customPrice, isCaptain, notes) {
        const subscription = await this.getTeamMemberSubscriptionById(subscriptionId);
        if (!subscription)
            return null;
        await this.teamMemberSubRepo.update(subscriptionId, {
            status: 'approved',
            approved_by_staff_id: approvedByStaffId,
            approved_at: new Date(),
            custom_price: customPrice || null,
            is_captain: isCaptain || false,
            approval_notes: notes || null,
        });
        return await this.getTeamMemberSubscriptionById(subscriptionId);
    }
    /**
     * Decline team member subscription
     */
    async declineTeamMemberSubscription(subscriptionId, reason, approvedByStaffId) {
        const subscription = await this.getTeamMemberSubscriptionById(subscriptionId);
        if (!subscription)
            return null;
        // Decrement team participants
        await this.teamService.decrementParticipants(subscription.team_id);
        await this.teamMemberSubRepo.update(subscriptionId, {
            status: 'declined',
            decline_reason: reason,
            approved_by_staff_id: approvedByStaffId,
            declined_at: new Date(),
        });
        return await this.getTeamMemberSubscriptionById(subscriptionId);
    }
    /**
     * Cancel team member subscription
     */
    async cancelTeamMemberSubscription(subscriptionId, reason, approvedByStaffId) {
        const subscription = await this.getTeamMemberSubscriptionById(subscriptionId);
        if (!subscription)
            return null;
        // Only decrement if subscription was approved/active
        if (['approved', 'active'].includes(subscription.status)) {
            await this.teamService.decrementParticipants(subscription.team_id);
        }
        await this.teamMemberSubRepo.update(subscriptionId, {
            status: 'cancelled',
            cancellation_reason: reason,
            approved_by_staff_id: approvedByStaffId,
            cancelled_at: new Date(),
        });
        return await this.getTeamMemberSubscriptionById(subscriptionId);
    }
    /**
     * Get pending team member subscriptions for approval
     */
    async getPendingTeamMemberSubscriptions() {
        return await this.teamMemberSubRepo.createQueryBuilder('sub')
            .where('sub.status = :status', { status: 'pending' })
            .leftJoinAndSelect('sub.team_member', 'team_member')
            .leftJoinAndSelect('sub.team', 'team')
            .leftJoinAndSelect('team.sport', 'sport')
            .leftJoinAndSelect('team.branch', 'branch')
            .orderBy('sub.created_at', 'ASC')
            .getMany();
    }
    /**
     * Set team member as captain
     */
    async setTeamMemberAsCaptain(subscriptionId) {
        await this.teamMemberSubRepo.update(subscriptionId, { is_captain: true });
        return await this.getTeamMemberSubscriptionById(subscriptionId);
    }
    /**
     * Unset team member as captain
     */
    async unsetTeamMemberAsCaptain(subscriptionId) {
        await this.teamMemberSubRepo.update(subscriptionId, { is_captain: false });
        return await this.getTeamMemberSubscriptionById(subscriptionId);
    }
    /**
     * Get subscription statistics
     */
    async getSubscriptionStats() {
        const memberStats = await this.memberSubRepo
            .createQueryBuilder('sub')
            .select('sub.status', 'status')
            .addSelect('COUNT(sub.id)', 'count')
            .groupBy('sub.status')
            .getRawMany();
        const teamMemberStats = await this.teamMemberSubRepo
            .createQueryBuilder('sub')
            .select('sub.status', 'status')
            .addSelect('COUNT(sub.id)', 'count')
            .groupBy('sub.status')
            .getRawMany();
        // Convert to object format
        const memberCounts = {
            pending: 0,
            approved: 0,
            active: 0,
            declined: 0,
            cancelled: 0,
        };
        const teamMemberCounts = {
            pending: 0,
            approved: 0,
            active: 0,
            declined: 0,
            cancelled: 0,
        };
        memberStats.forEach((stat) => {
            if (stat.status in memberCounts) {
                memberCounts[stat.status] = parseInt(String(stat.count)) || 0;
            }
        });
        teamMemberStats.forEach((stat) => {
            if (stat.status in teamMemberCounts) {
                teamMemberCounts[stat.status] = parseInt(String(stat.count)) || 0;
            }
        });
        return {
            members: memberCounts,
            teamMembers: teamMemberCounts,
        };
    }
}
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=SubscriptionService.js.map