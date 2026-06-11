import { z } from 'zod';

/**
 * Sport type - imported from API service
 */
export type { Sport } from '@/services/sportsApi';

/**
 * Available Sports for Team Members (fallback/reference)
 */
export const AVAILABLE_SPORTS = [
    { id: 'football', label: 'كرة القدم', icon: '⚽' },
    { id: 'basketball', label: 'كرة السلة', icon: '🏀' },
    { id: 'volleyball', label: 'الكرة الطائرة', icon: '🏐' },
    { id: 'tennis', label: 'التنس', icon: '🎾' },
    { id: 'swimming', label: 'السباحة', icon: '🏊' },
    { id: 'handball', label: 'كرة اليد', icon: '🤾' },
    { id: 'squash', label: 'الاسكواش', icon: '🎯' },
    { id: 'athletics', label: 'ألعاب القوى', icon: '🏃' },
] as const;

export {
    MemberRoleEnum,
    createRegisterSchema,
    type MemberRole,
    type RegisterFormValues,
} from '@/lib/validation/schemas';
