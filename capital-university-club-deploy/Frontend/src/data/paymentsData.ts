export type PaymentStatus = "active" | "expiring" | "overdue";

export type MemberPayment = {
    memberId: number;
    memberCode: string;
    memberType: "member" | "team_member";
    lastPaymentDate: string;       // "YYYY-MM-DD"
    lastPaymentAmount: number;     // EGP
    nextRenewalDate: string;       // "YYYY-MM-DD"
    subscriptionType: string;      // "شهري" | "ربع سنوي" | "نصف سنوي" | "سنوي"
    paymentStatus: PaymentStatus;  // stored but always recomputed on display
};

// Always recompute from date — never trust stored status alone
// TODO: Backend should return this computed server-side
export const computePaymentStatus = (nextRenewalDate: string): PaymentStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = new Date(nextRenewalDate);
    renewal.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
        (renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return "overdue";
    if (diffDays <= 30) return "expiring";
    return "active";
};

export const getDaysUntilRenewal = (nextRenewalDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = new Date(nextRenewalDate);
    renewal.setHours(0, 0, 0, 0);
    return Math.ceil(
        (renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
};

// Utility helpers for subscription renewal alerts and member payment status.
