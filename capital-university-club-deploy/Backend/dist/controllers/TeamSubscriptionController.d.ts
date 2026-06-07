import { Request, Response } from 'express';
export declare class TeamSubscriptionController {
    constructor();
    /**
     * Validate subscription rules (can be called before showing payment page)
     */
    validateSubscription(req: Request, res: Response): Promise<void>;
    /**
     * Create subscription (validates and creates pending_payment record)
     */
    createSubscription(req: Request, res: Response): Promise<void>;
    /**
     * Confirm payment (called by payment webhook or frontend after payment)
     */
    confirmPayment(req: Request, res: Response): Promise<void>;
    /**
     * Admin approve subscription
     */
    approveSubscription(req: Request, res: Response): Promise<void>;
    /**
     * Get pending approvals (admin view)
     */
    getPendingApprovals(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=TeamSubscriptionController.d.ts.map