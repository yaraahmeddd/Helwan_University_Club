import type { RegisterFormValues } from './schemas/validation';

/** Staff add-member flows: Category → Basic → Details → Documents */
export const STAFF_WIZARD_STEP_FIELDS: Record<number, readonly (keyof RegisterFormValues)[]> = {
    0: [],
    1: [
        'first_name_ar', 'last_name_ar', 'first_name_en', 'last_name_en',
        'email', 'password', 'confirmPassword', 'phone', 'dob', 'gender',
        'nationality', 'nationalId', 'passportNumber',
    ],
    2: [
        'address', 'facultyId', 'graduationYear',
        'professionId', 'department', 'salary', 'professionCode',
        'retirementDate', 'seasonalDuration', 'visaStatus',
        'relatedMemberId', 'relationshipType',
    ],
    3: [],
};

export function getNextStaffWizardStep(current: number): number {
    return Math.min(current + 1, 3);
}

export function getPrevStaffWizardStep(current: number): number {
    return Math.max(0, current - 1);
}
