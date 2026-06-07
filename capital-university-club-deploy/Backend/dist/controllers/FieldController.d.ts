import { Request, Response } from 'express';
export declare class FieldController {
    /**
     * POST /api/fields
     * Create a new field
     */
    static createField(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/fields
     * Get all fields with optional filters
     */
    static getAllFields(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/fields/:id
     * Get field by ID
     */
    static getFieldById(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/fields/:id
     * Update field details
     */
    static updateField(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/fields/:id
     * Delete a field
     */
    static deleteField(req: Request, res: Response): Promise<void>;
    /**
     * PATCH /api/fields/:id/status
     * Update field status
     */
    static updateFieldStatus(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/fields/:id/operating-hours
     * Add operating hours to a field
     */
    static addOperatingHours(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/fields/:id/operating-hours
     * Update operating hours for a field (replaces all existing hours)
     */
    static updateOperatingHours(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/fields/:id/operating-hours
     * Get operating hours for a field
     */
    static getOperatingHours(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/fields/:id/operating-hours/:day
     * Delete operating hours for a specific day
     */
    static deleteOperatingHours(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/fields/sport/:sport_id/available
     * Get available fields for a sport
     */
    static getAvailableFields(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/fields/branch/:branch_id
     * Get fields by branch
     */
    static getFieldsByBranch(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/fields/:id/check-availability
     * Check field availability at a specific time
     */
    static checkAvailability(req: Request, res: Response): Promise<void>;
    /**
     * PATCH /api/fields/:id/booking-settings
     * Update field booking settings
     */
    static updateBookingSettings(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/fields/bookable
     * Get all bookable fields
     */
    static getBookableFields(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/fields/bookable/by-sport
     * Get bookable fields grouped by sport
     */
    static getBookableFieldsBySport(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=FieldController.d.ts.map