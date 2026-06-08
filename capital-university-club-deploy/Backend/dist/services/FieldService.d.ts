import { Field } from '../entities/Field';
import { FieldOperatingHours } from '../entities/FieldOperatingHours';
export interface CreateFieldInput {
    name_en: string;
    name_ar: string;
    description_en?: string;
    description_ar?: string;
    sport_id: number;
    capacity?: number;
    branch_id?: number;
    status?: 'active' | 'inactive' | 'maintenance';
    hourly_rate?: number;
    operating_hours?: OperatingHourInput[];
}
export interface UpdateFieldInput {
    name_en?: string;
    name_ar?: string;
    description_en?: string;
    description_ar?: string;
    sport_id?: number;
    capacity?: number;
    branch_id?: number;
    status?: 'active' | 'inactive' | 'maintenance';
    hourly_rate?: number;
}
export interface OperatingHourInput {
    day_of_week: number;
    opening_time: string;
    closing_time: string;
}
export declare class FieldService {
    private fieldRepo;
    private operatingHoursRepo;
    private sportRepo;
    private branchRepo;
    /**
     * Create a new field with optional operating hours
     */
    createField(data: CreateFieldInput): Promise<Field>;
    /**
     * Get all fields with optional filters
     */
    getAllFields(filters?: {
        sport_id?: number;
        branch_id?: number;
        status?: string;
    }): Promise<Field[]>;
    /**
     * Get field by ID with all relations
     */
    getFieldById(id: string): Promise<Field>;
    /**
     * Update field details
     */
    updateField(id: string, data: UpdateFieldInput): Promise<Field>;
    /**
     * Delete a field
     */
    deleteField(id: string): Promise<void>;
    /**
     * Update field status
     */
    updateFieldStatus(id: string, status: 'active' | 'inactive' | 'maintenance'): Promise<Field>;
    /**
     * Add operating hours to a field
     */
    addOperatingHours(fieldId: string, hours: OperatingHourInput[]): Promise<FieldOperatingHours[]>;
    /**
     * Update operating hours for a field
     */
    updateOperatingHours(fieldId: string, hours: OperatingHourInput[]): Promise<FieldOperatingHours[]>;
    /**
     * Get operating hours for a field
     */
    getOperatingHours(fieldId: string): Promise<FieldOperatingHours[]>;
    /**
     * Delete operating hours for a specific day
     */
    deleteOperatingHours(fieldId: string, dayOfWeek: number): Promise<void>;
    /**
     * Get available fields for a sport
     */
    getAvailableFields(sportId: number): Promise<Field[]>;
    /**
     * Get fields by branch
     */
    getFieldsByBranch(branchId: number): Promise<Field[]>;
    /**
     * Check field availability at a specific time
     */
    checkAvailability(fieldId: string, dayOfWeek: number, time: string): Promise<boolean>;
    /**
     * Update field booking settings
     */
    updateBookingSettings(fieldId: string, settings: {
        is_available_for_booking?: boolean;
        booking_slot_duration?: number;
    }): Promise<Field>;
    /**
     * Get all bookable fields (active and available for booking)
     */
    getBookableFields(sportId?: number): Promise<Field[]>;
    /**
     * Get bookable fields grouped by sport
     */
    getBookableFieldsBySport(): Promise<{
        sport_id: number;
        sport_name_en: string;
        sport_name_ar: string;
        fields: Field[];
    }[]>;
}
//# sourceMappingURL=FieldService.d.ts.map