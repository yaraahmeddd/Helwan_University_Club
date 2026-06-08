"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamSubscriptionService = void 0;
const data_source_1 = require("../database/data-source");
const TeamMemberTeam_1 = require("../entities/TeamMemberTeam");
const Team_1 = require("../entities/Team");
const Member_1 = require("../entities/Member");
const TeamMember_1 = require("../entities/TeamMember");
const Payment_1 = require("../entities/Payment");
const crypto_1 = require("crypto");
class TeamSubscriptionService {
    constructor() {
        this.teamMemberTeamRepo = data_source_1.AppDataSource.getRepository(TeamMemberTeam_1.TeamMemberTeam);
        this.teamRepo = data_source_1.AppDataSource.getRepository(Team_1.Team);
        this.memberRepo = data_source_1.AppDataSource.getRepository(Member_1.Member);
        this.teamMemberRepo = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
        this.paymentRepo = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
    }
    /**
     * Validate subscription rules before subscribing
     */
    async validateSubscription(request) {
        const errors = [];
        const { userId, userType, teamId } = request;
        // Check team exists and is active
        const team = await this.teamRepo.findOne({ where: { id: teamId } });
        if (!team) {
            errors.push(`Team with ID ${teamId} not found`);
            return { valid: false, errors };
        }
        if (team.status !== 'active') {
            errors.push(`Team is not accepting subscriptions (status: ${team.status})`);
        }
        // Check capacity
        const countResult = await data_source_1.AppDataSource.query(`SELECT COUNT(*) FROM team_member_teams WHERE team_id = $1 AND status NOT IN ('cancelled', 'declined')`, [teamId]);
        const currentCount = parseInt(countResult[0].count, 10);
        if (currentCount >= team.max_participants) {
            errors.push(`Team is at maximum capacity (${team.max_participants} members)`);
        }
        // Validate user exists
        if (userType === 'member') {
            const member = await this.memberRepo.findOne({ where: { id: userId } });
            if (!member) {
                errors.push(`Member with ID ${userId} not found`);
            }
        }
        else {
            const teamMember = await this.teamMemberRepo.findOne({ where: { id: userId } });
            if (!teamMember) {
                errors.push(`Team member with ID ${userId} not found`);
            }
        }
        // Check for existing active subscription
        if (errors.length === 0) {
            const existing = await data_source_1.AppDataSource.query(`SELECT id FROM team_member_teams WHERE team_member_id = $1 AND team_id = $2 AND status NOT IN ('cancelled', 'declined')`, [userId, teamId]);
            if (existing && existing.length > 0) {
                errors.push('User is already subscribed to this team');
            }
        }
        return { valid: errors.length === 0, errors };
    }
    /**
     * Create subscription with a pending payment record
     */
    async createSubscription(request) {
        const { userId, userType, teamId } = request;
        // Validate first
        const validation = await this.validateSubscription(request);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
        }
        const team = await this.teamRepo.findOne({ where: { id: teamId } });
        if (!team) {
            throw new Error(`Team with ID ${teamId} not found`);
        }
        const price = team.subscription_price ?? 0;
        const requiresApproval = team.approval_required;
        // Generate payment reference
        const paymentReference = `TEAM-SUB-${(0, crypto_1.randomUUID)().slice(0, 8).toUpperCase()}`;
        // Create payment record
        const payment = this.paymentRepo.create({
            payment_reference: paymentReference,
            payment_type: 'team_subscription',
            entity_type: userType,
            entity_id: userId,
            related_entity_type: 'team',
            related_entity_id: teamId,
            amount: price,
            currency: 'EGP',
            status: 'pending',
            description: `Team subscription for team: ${team.name_en}`,
        });
        const savedPayment = await this.paymentRepo.save(payment);
        // Create subscription record
        const subscription = this.teamMemberTeamRepo.create({
            team_member_id: userId,
            team_id: teamId,
            start_date: new Date(),
            status: 'pending',
            subscription_status: 'pending_payment',
            payment_id: savedPayment.id,
            payment_reference: paymentReference,
            price,
        });
        const savedSubscription = await this.teamMemberTeamRepo.save(subscription);
        return {
            subscription: savedSubscription,
            payment: savedPayment,
            team,
            requiresApproval,
        };
    }
    /**
     * Confirm payment for a subscription
     */
    async confirmPayment(subscriptionId, userType, paymentReference, transactionId, gatewayResponse) {
        const subscription = await this.teamMemberTeamRepo.findOne({
            where: { id: subscriptionId },
            relations: ['team'],
        });
        if (!subscription) {
            throw new Error(`Subscription with ID ${subscriptionId} not found`);
        }
        if (subscription.payment_reference !== paymentReference) {
            throw new Error('Payment reference does not match this subscription');
        }
        // Update payment record
        const payment = await this.paymentRepo.findOne({
            where: { payment_reference: paymentReference },
        });
        if (!payment) {
            throw new Error(`Payment record with reference ${paymentReference} not found`);
        }
        payment.status = 'completed';
        payment.transaction_id = transactionId;
        payment.completed_at = new Date();
        if (gatewayResponse) {
            payment.gateway_response = JSON.stringify(gatewayResponse);
        }
        const updatedPayment = await this.paymentRepo.save(payment);
        // Update subscription based on whether approval is required
        const team = await this.teamRepo.findOne({ where: { id: subscription.team_id } });
        const requiresApproval = team?.approval_required ?? false;
        subscription.payment_completed_at = new Date();
        if (requiresApproval) {
            subscription.subscription_status = 'pending_admin_approval';
            subscription.status = 'pending';
        }
        else {
            subscription.subscription_status = 'active';
            subscription.status = 'approved';
        }
        const updatedSubscription = await this.teamMemberTeamRepo.save(subscription);
        const message = requiresApproval
            ? 'Payment confirmed. Subscription is pending admin approval.'
            : 'Payment confirmed. Subscription is now active.';
        return {
            subscription: updatedSubscription,
            payment: updatedPayment,
            requiresAdminApproval: requiresApproval,
            message,
        };
    }
    /**
     * Admin approves a subscription
     */
    async approveSubscription(subscriptionId, userType, staffId) {
        const subscription = await this.teamMemberTeamRepo.findOne({
            where: { id: subscriptionId },
        });
        if (!subscription) {
            throw new Error(`Subscription with ID ${subscriptionId} not found`);
        }
        if (!['pending', 'pending_admin_approval'].includes(subscription.status) &&
            subscription.subscription_status !== 'pending_admin_approval') {
            throw new Error(`Subscription is not pending approval (current status: ${subscription.status})`);
        }
        subscription.status = 'approved';
        subscription.subscription_status = 'active';
        subscription.admin_approved_at = new Date();
        subscription.approved_by_staff_id = staffId;
        const updatedSubscription = await this.teamMemberTeamRepo.save(subscription);
        return {
            subscription: updatedSubscription,
            message: 'Subscription approved successfully.',
        };
    }
    /**
     * Get all pending approvals (admin view)
     */
    async getPendingApprovals(userType) {
        const rows = await data_source_1.AppDataSource.query(`SELECT
        tmt.id AS "subscriptionId",
        tmt.team_member_id AS "userId",
        'team_member' AS "userType",
        CONCAT(tm.first_name_en, ' ', tm.last_name_en) AS "userName",
        tmt.team_id AS "teamId",
        t.name_en AS "teamName",
        tmt.price,
        p.status AS "paymentStatus",
        tmt.created_at AS "createdAt"
      FROM team_member_teams tmt
      LEFT JOIN team_members tm ON tmt.team_member_id = tm.id
      LEFT JOIN teams t ON tmt.team_id = t.id
      LEFT JOIN payments p ON tmt.payment_reference = p.payment_reference
      WHERE tmt.subscription_status IN ('pending_admin_approval', 'pending_payment')
        AND tmt.status = 'pending'
      ORDER BY tmt.created_at ASC`);
        return rows;
    }
}
exports.TeamSubscriptionService = TeamSubscriptionService;
//# sourceMappingURL=TeamSubscriptionService.js.map