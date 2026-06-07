import { Request, Response } from 'express';
export declare class ForeignerSeasonalController {
    /**
     * GET /register/seasonal/duration-options
     * Returns duration options (1, 6, 12 months) with pricing
     */
    static getDurationOptions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/seasonal/visa-statuses
     * Returns visa status options for foreigner members
     */
    static getVisaStatusOptions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/seasonal/payment-options
     * Returns payment options (full payment or installments)
     */
    static getPaymentOptions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/seasonal/pricing/:duration_months
     * Returns detailed pricing and installment options for a specific duration
     */
    static getPricingDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /register/details/foreigner-seasonal
     * Submit detailed information for foreigner/seasonal visitor member
     * Body: {
     *   member_id: number,
     *   seasonal_type: string (seasonal-egy or seasonal-foreigner),
     *   duration_months: number (1, 6, or 12),
     *   payment_type: string (full or installments),
     *   passport_number?: string,
     *   passport_photo?: string (file path),
     *   country?: string (required if seasonal-foreigner),
     *   visa_status?: string (valid, expired, pending),
     *   national_id_front?: string (file path),
     *   national_id_back?: string (file path),
     *   personal_photo?: string (file path),
     *   medical_report?: string (file path),
     *   address?: string
     * }
     */
    static submitForeignerSeasonalDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /register/seasonal/membership
     * Create membership subscription for foreigner/seasonal member
     * Body: {
     *   member_id: number,
     *   duration_months: number (1, 6, or 12),
     *   payment_type: string (full or installments)
     * }
     */
    static createSeasonalMembership(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/seasonal/status/:member_id
     * Get foreigner/seasonal member registration status
     */
    static getForeignerStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default ForeignerSeasonalController;
//# sourceMappingURL=ForeignerSeasonalController.d.ts.map