/**
 * Foreigner/Seasonal Visitor Service
 * Handles registration for foreigners with VISITOR_SEASONAL membership type
 * Two subtypes: visitor-seasonal-egy (Egyptian) and visitor-seasonal-foreigner
 */
export declare class ForeignerSeasonalService {
    private memberRepository;
    private outsiderDetailRepository;
    private membershipRepository;
    private membershipPlanRepository;
    private activityLogRepository;
    constructor();
    /**
     * Get foreigner seasonal duration options with pricing
     */
    getSeasonalDurationOptions(): Promise<{
        duration_months: number;
        label_en: string;
        label_ar: string;
        price: number;
        currency: string;
        plan_code: string;
    }[]>;
    /**
     * Get visa status options
     */
    getVisaStatusOptions(): {
        code: string;
        label_en: string;
        label_ar: string;
    }[];
    /**
     * Get payment options (installments or lump sum)
     */
    getPaymentOptions(): {
        code: string;
        label_en: string;
        label_ar: string;
        installments: number;
    }[];
    /**
     * Submit detailed info for foreigner/seasonal visitor member
     */
    submitForeignerSeasonalDetailedInfo(memberData: {
        member_id: number;
        seasonal_type: string;
        duration_months: number;
        payment_type: string;
        passport_number?: string;
        passport_photo?: string;
        country?: string;
        visa_status?: string;
        national_id_front?: string;
        national_id_back?: string;
        personal_photo?: string;
        medical_report?: string;
        address?: string;
    }): Promise<{
        success: boolean;
        message: string;
        outsider_id: number | undefined;
        payment_info: {
            payment_type: string;
            duration_months: number;
            installments_available: boolean;
            currency: string;
        };
    }>;
    /**
     * Calculate membership end date and pricing details
     */
    getMembershipPricingDetails(duration_months: number): Promise<{
        duration_months: number;
        total_price: number;
        currency: string;
        plan_code: string;
        installment_options: ({
            option: string;
            label_en: string;
            label_ar: string;
            amount: number;
            installments: number;
            first_installment?: undefined;
            second_installment?: undefined;
        } | {
            option: string;
            label_en: string;
            label_ar: string;
            amount: number;
            installments: number;
            first_installment: number;
            second_installment: number;
        })[];
    }>;
    /**
     * Create membership subscription for foreigner/seasonal member
     */
    createSeasonalMembership(memberData: {
        member_id: number;
        duration_months: number;
        payment_type: string;
    }): Promise<{
        success: boolean;
        message: string;
        membership_id: any;
        details: {
            start_date: string;
            end_date: string;
            duration_months: number;
            payment_status: string;
            plan_code: string;
        };
    }>;
    /**
     * Get foreigner member status with all details
     */
    getForeignerMemberStatus(memberId: number): Promise<{
        member_id: number;
        member_type: string;
        status: string;
        seasonal_type: string | undefined;
        duration_months: number | null | undefined;
        passport_number: string | null | undefined;
        country: string | null | undefined;
        visa_status: string | null | undefined;
        is_installable: boolean | undefined;
        membership_active: boolean;
        membership_details: {
            start_date: string;
            end_date: string;
            status: string;
            payment_status: string;
            plan_code: string;
        } | null;
        documents_uploaded: {
            passport_photo: boolean;
            national_id_front: boolean;
            national_id_back: boolean;
            personal_photo: boolean;
            medical_report: boolean;
        };
    }>;
}
declare const _default: ForeignerSeasonalService;
export default _default;
//# sourceMappingURL=ForeignerSeasonalService.d.ts.map