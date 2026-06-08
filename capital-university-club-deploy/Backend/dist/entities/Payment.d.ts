import { Staff } from './Staff';
export type PaymentType = 'team_subscription' | 'field_booking' | 'package_purchase' | 'membership_fee' | 'training_session' | 'tournament_registration' | 'equipment_rental' | 'late_fee' | 'refund';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'cash' | 'bank_transfer' | 'wallet' | 'installment';
export type EntityType = 'member' | 'team_member' | 'guest';
export type RelatedEntityType = 'team' | 'team_subscription' | 'field_booking' | 'package' | 'membership' | 'training_session';
export declare class Payment {
    id: number;
    payment_reference: string;
    transaction_id?: string;
    payment_type: PaymentType;
    entity_type?: EntityType;
    entity_id?: number;
    related_entity_type?: RelatedEntityType;
    related_entity_id?: string;
    amount: number;
    currency: string;
    payment_method?: PaymentMethod;
    gateway_name?: string;
    gateway_response?: string;
    status: PaymentStatus;
    created_at: Date;
    updated_at: Date;
    completed_at?: Date;
    refunded_at?: Date;
    processed_by_staff_id?: number;
    processed_by_staff?: Staff;
    refunded_by_staff_id?: number;
    refunded_by_staff?: Staff;
    description?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
}
//# sourceMappingURL=Payment.d.ts.map