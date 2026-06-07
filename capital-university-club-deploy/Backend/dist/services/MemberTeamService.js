"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberTeamService = void 0;
const data_source_1 = require("../database/data-source");
const MemberTeam_1 = require("../entities/MemberTeam");
const Member_1 = require("../entities/Member");
const Sport_1 = require("../entities/Sport");
class MemberTeamService {
    constructor() {
        this.memberTeamRepo = data_source_1.AppDataSource.getRepository(MemberTeam_1.MemberTeam);
        this.memberRepo = data_source_1.AppDataSource.getRepository(Member_1.Member);
        this.sportRepo = data_source_1.AppDataSource.getRepository(Sport_1.Sport);
    }
    /**
     * CREATE - Add a sport subscription for a member
     */
    async addSportSubscription(memberId, teamId, startDate, endDate, price = 0) {
        // Validate member exists
        const member = await this.memberRepo.findOne({ where: { id: memberId } });
        if (!member) {
            throw new Error(`Member with ID ${memberId} not found`);
        }
        // Validate team exists
        const team = await data_source_1.AppDataSource.getRepository('Team').findOne({ where: { id: teamId } });
        if (!team) {
            throw new Error(`Team with ID ${teamId} not found`);
        }
        // Check if subscription already exists
        const existing = await this.memberTeamRepo.findOne({
            where: { member_id: memberId, team_id: teamId }
        });
        if (existing) {
            throw new Error(`Member is already subscribed to this team`);
        }
        const memberTeam = this.memberTeamRepo.create({
            member_id: memberId,
            team_id: teamId,
            start_date: startDate || new Date(),
            end_date: endDate,
            status: 'pending',
            price
        });
        return await this.memberTeamRepo.save(memberTeam);
    }
    /**
     * READ - Get all sport subscriptions for a member
     */
    async getMemberSubscriptions(memberId) {
        const subscriptions = await this.memberTeamRepo.find({
            where: { member_id: memberId },
            relations: ['team', 'team.sport']
        });
        console.log(`[MemberTeamService] getMemberSubscriptions for member ${memberId}:`, subscriptions.map(sub => ({
            id: sub.id,
            team_id: sub.team_id,
            has_team: !!sub.team,
            team_name: sub.team?.name_en || sub.team?.name_ar,
            has_sport: !!sub.team?.sport,
            sport_id: sub.team?.sport?.id,
            sport_name: sub.team?.sport?.name_ar || sub.team?.sport?.name_en
        })));
        return subscriptions;
    }
    /**
     * READ - Get a specific subscription
     */
    async getSubscriptionById(subscriptionId) {
        return await this.memberTeamRepo.findOne({
            where: { id: subscriptionId },
            relations: ['member', 'team']
        });
    }
    /**
     * READ - Get all subscriptions
     */
    async getAllSubscriptions(limit = 100, offset = 0) {
        const [data, total] = await this.memberTeamRepo.findAndCount({
            relations: ['member', 'team'],
            take: limit,
            skip: offset,
            order: { created_at: 'DESC' }
        });
        return { data, total };
    }
    /**
     * UPDATE - Update a subscription
     */
    async updateSubscription(subscriptionId, updates) {
        const subscription = await this.memberTeamRepo.findOne({
            where: { id: subscriptionId }
        });
        if (!subscription) {
            throw new Error(`Subscription with ID ${subscriptionId} not found`);
        }
        // Update fields
        if (updates.start_date)
            subscription.start_date = updates.start_date;
        if (updates.end_date)
            subscription.end_date = updates.end_date;
        if (updates.status)
            subscription.status = updates.status;
        if (updates.price !== undefined)
            subscription.price = updates.price;
        return await this.memberTeamRepo.save(subscription);
    }
    /**
     * DELETE - Remove a subscription (soft delete by changing status)
     */
    async deactivateSubscription(subscriptionId) {
        const subscription = await this.memberTeamRepo.findOne({
            where: { id: subscriptionId }
        });
        if (!subscription) {
            throw new Error(`Subscription with ID ${subscriptionId} not found`);
        }
        subscription.status = 'inactive';
        return await this.memberTeamRepo.save(subscription);
    }
    /**
     * DELETE - Permanently remove a subscription
     */
    async deleteSubscription(subscriptionId) {
        const result = await this.memberTeamRepo.delete(subscriptionId);
        return result.affected ? result.affected > 0 : false;
    }
    /**
     * DELETE - Remove all subscriptions for a member
     */
    async deleteAllMemberSubscriptions(memberId) {
        const result = await this.memberTeamRepo.delete({ member_id: memberId });
        return result.affected || 0;
    }
    /**
     * Get active subscriptions for a member
     */
    async getActiveMemberSubscriptions(memberId) {
        return await this.memberTeamRepo.find({
            where: { member_id: memberId, status: 'active' },
            relations: ['team']
        });
    }
    /**
     * Get subscriptions count by status
     */
    async getSubscriptionCountByStatus() {
        const result = await this.memberTeamRepo
            .createQueryBuilder('mt')
            .select('mt.status', 'status')
            .addSelect('COUNT(mt.id)', 'count')
            .groupBy('mt.status')
            .getRawMany();
        const counts = {};
        result.forEach((row) => {
            counts[row.status] = parseInt(row.count, 10);
        });
        return counts;
    }
    /**
     * Delete a specific member's sport subscription by team_id
     */
    async deleteMemberSportSubscription(memberId, teamId) {
        const result = await this.memberTeamRepo.delete({
            member_id: memberId,
            team_id: teamId
        });
        return result.affected ? result.affected > 0 : false;
    }
}
exports.MemberTeamService = MemberTeamService;
//# sourceMappingURL=MemberTeamService.js.map