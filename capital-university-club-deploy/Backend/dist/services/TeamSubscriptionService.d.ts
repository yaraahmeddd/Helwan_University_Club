import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { Team } from '../entities/Team';
import { Payment } from '../entities/Payment';
interface SubscriptionRequest {
    userId: number;
    userType: 'member' | 'team_member';
    teamId: string;
}
interface ValidationResult {
    valid: boolean;
    errors: string[];
}
interface CreateSubscriptionResult {
    subscription: TeamMemberTeam;
    payment: Payment;
    team: Team;
    requiresApproval: boolean;
}
interface ConfirmPaymentResult {
    subscription: TeamMemberTeam;
    payment: Payment;
    requiresAdminApproval: boolean;
    message: string;
}
interface ApproveSubscriptionResult {
    subscription: TeamMemberTeam;
    message: string;
}
interface PendingApproval {
    subscriptionId: number;
    userId: number;
    userType: string;
    userName: string;
    teamId: string;
    teamName: string;
    price: number;
    paymentStatus: string;
    createdAt: Date;
}
export declare class TeamSubscriptionService {
    private teamMemberTeamRepo;
    private teamRepo;
    private memberRepo;
    private teamMemberRepo;
    private paymentRepo;
    /**
     * Validate subscription rules before subscribing
     */
    validateSubscription(request: SubscriptionRequest): Promise<ValidationResult>;
    /**
     * Create subscription with a pending payment record
     */
    createSubscription(request: SubscriptionRequest): Promise<CreateSubscriptionResult>;
    /**
     * Confirm payment for a subscription
     */
    confirmPayment(subscriptionId: number, userType: 'member' | 'team_member', paymentReference: string, transactionId?: string, gatewayResponse?: Record<string, unknown>): Promise<ConfirmPaymentResult>;
    /**
     * Admin approves a subscription
     */
    approveSubscription(subscriptionId: number, userType: 'member' | 'team_member', staffId: number): Promise<ApproveSubscriptionResult>;
    /**
     * Get all pending approvals (admin view)
     */
    getPendingApprovals(userType?: 'member' | 'team_member'): Promise<PendingApproval[]>;
}
export {};
//# sourceMappingURL=TeamSubscriptionService.d.ts.map