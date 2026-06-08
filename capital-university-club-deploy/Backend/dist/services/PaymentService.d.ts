import { Payment, PaymentType, PaymentStatus, PaymentMethod, EntityType, RelatedEntityType } from '../entities/Payment';
export interface CreatePaymentDTO {
    entityType: EntityType;
    entityId: number;
    paymentType: PaymentType;
    relatedEntityType: RelatedEntityType;
    relatedEntityId: string;
    amount: number;
    currency?: string;
    description?: string;
    gatewayName?: string;
    paymentMethod?: PaymentMethod;
    metadata?: Record<string, unknown>;
}
export interface ConfirmPaymentDTO {
    transactionId: string;
    gatewayResponse?: string;
    paymentMethod?: PaymentMethod;
    metadata?: Record<string, unknown>;
}
export declare class PaymentService {
    private paymentRepository;
    /**
     * Generate unique payment reference
     * Format: PAY_YYYYMMDD_HHMMSS_RANDOM
     */
    private generatePaymentReference;
    /**
     * Create a new payment record
     */
    createPayment(data: CreatePaymentDTO): Promise<Payment>;
    /**
     * Confirm a payment (called by payment gateway webhook or manual confirmation)
     */
    confirmPayment(paymentReference: string, data: ConfirmPaymentDTO): Promise<Payment>;
    /**
     * Mark payment as failed
     */
    failPayment(paymentReference: string, reason?: string): Promise<Payment>;
    /**
     * Process a refund
     */
    refundPayment(paymentReference: string, staffId: number, reason?: string): Promise<Payment>;
    /**
     * Process manual/cash payment (staff processed)
     */
    processManualPayment(paymentReference: string, staffId: number, paymentMethod?: PaymentMethod): Promise<Payment>;
    /**
     * Get payment by reference
     */
    getPaymentByReference(paymentReference: string): Promise<Payment | null>;
    /**
     * Get payment by ID
     */
    getPaymentById(id: number): Promise<Payment | null>;
    /**
     * Get payments for an entity (member/team_member)
     */
    getPaymentsByEntity(entityType: EntityType, entityId: number, status?: PaymentStatus): Promise<Payment[]>;
    /**
     * Get payments for a related entity (e.g., all payments for a specific team)
     */
    getPaymentsByRelatedEntity(relatedEntityType: RelatedEntityType, relatedEntityId: string, status?: PaymentStatus): Promise<Payment[]>;
    /**
     * Get payments by type
     */
    getPaymentsByType(paymentType: PaymentType, status?: PaymentStatus, limit?: number): Promise<Payment[]>;
    /**
     * Get payment statistics for a date range
     */
    getPaymentStatistics(startDate: Date, endDate: Date, paymentType?: PaymentType): Promise<{
        totalAmount: number;
        count: number;
        byStatus: Record<PaymentStatus, {
            count: number;
            amount: number;
        }>;
        byMethod: Record<string, {
            count: number;
            amount: number;
        }>;
    }>;
    /**
     * Cancel a pending payment
     */
    cancelPayment(paymentReference: string, reason?: string): Promise<Payment>;
}
//# sourceMappingURL=PaymentService.d.ts.map