import { z } from 'zod';
import {
  zArabicName,
  zBirthdate,
  zEgyptianPhone,
  zEnglishName,
  zOptionalArabicName,
  zRegistrationEmail,
  zRegistrationPassword,
  zStaffNationalId,
  type ValidationTranslator,
} from './zodBuilders';
import { FIELD_LIMITS } from './patterns';

export const MemberRoleEnum = z.enum(['social_member', 'sports_player']);
export type MemberRole = z.infer<typeof MemberRoleEnum>;

export const createRegisterSchema = (t: ValidationTranslator) =>
  z.object({
    memberRole: MemberRoleEnum,
    selectedSports: z.array(z.string()).default([]),
    sportTimeSelections: z.record(z.string(), z.string()).default({}),
    category: z.string().min(1, t('category.required')).optional(),
    citizenship_type: z.enum(['egyptian', 'non_egyptian']),
    first_name_ar: zArabicName(t),
    last_name_ar: zArabicName(t),
    first_name_en: zEnglishName(t),
    last_name_en: zEnglishName(t),
    nationalId: z.string().optional(),
    passportNumber: z.string().max(20, t('passport.invalid')).optional(),
    nationality: z.string().optional(),
    dob: zBirthdate(t, FIELD_LIMITS.MAX_AGE_REGISTER),
    gender: z.string().min(1, t('gender.required')),
    phone: zEgyptianPhone(t),
    email: zRegistrationEmail(t),
    password: zRegistrationPassword(t),
    confirmPassword: z.string().min(1, t('password.confirmRequired')),
    address: z.string().optional(),
    universityId: z.string().optional(),
    facultyId: z.string().optional(),
    graduationYear: z.string().optional(),
    professionId: z.string().optional(),
    department: z.string().optional(),
    salary: z.string().optional(),
    professionCode: z.string().optional(),
    retirementDate: z.string().optional(),
    seasonalDuration: z.string().optional(),
    visaStatus: z.string().optional(),
    paymentType: z.string().optional(),
    relatedMemberId: z.string().optional(),
    relationshipType: z.string().optional(),
    visitor_type: z.string().optional(),
    fullName: z.string().optional(),
  })
    .passthrough()
    .refine((data) => data.password === data.confirmPassword, {
      message: t('password.mismatch'),
      path: ['confirmPassword'],
    })
    .superRefine((data, ctx) => {
      if (data.citizenship_type === 'non_egyptian' || data.category === 'foreigner') {
        if (!data.passportNumber || data.passportNumber.length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('passport.invalid'),
            path: ['passportNumber'],
          });
        }
      } else if (!data.nationalId || !/^[1-9]\d{13}$/.test(data.nationalId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('nationalId.memberInvalid'),
          path: ['nationalId'],
        });
      }
    });

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export const createMemberEditSchema = (t: ValidationTranslator) =>
  z.object({
    first_name_ar: zArabicName(t),
    last_name_ar: zArabicName(t),
    first_name_en: zEnglishName(t),
    last_name_en: zEnglishName(t),
    gender: z.enum(['male', 'female', 'other'], { message: t('gender.invalid') }),
    phone: zEgyptianPhone(t),
    birthdate: zBirthdate(t),
    nationality: z.string()
      .min(1, t('nationality.required'))
      .max(FIELD_LIMITS.NATIONALITY_MAX, t('nationality.max', { max: FIELD_LIMITS.NATIONALITY_MAX }))
      .transform((v) => v.trim()),
    address: z.string()
      .max(FIELD_LIMITS.ADDRESS_MAX, t('address.max', { max: FIELD_LIMITS.ADDRESS_MAX }))
      .transform((v) => v.trim())
      .optional()
      .or(z.literal('')),
    health_status: z.string()
      .max(FIELD_LIMITS.HEALTH_MAX, t('health.max', { max: FIELD_LIMITS.HEALTH_MAX }))
      .transform((v) => v.trim())
      .optional()
      .or(z.literal('')),
  });

export type MemberEditFormValues = z.infer<ReturnType<typeof createMemberEditSchema>>;

export const createStaffFormSchema = (t: ValidationTranslator) =>
  z.object({
    first_name_en: zEnglishName(t),
    first_name_ar: zArabicName(t),
    last_name_en: zEnglishName(t),
    last_name_ar: zOptionalArabicName(t),
    national_id: zStaffNationalId(t),
    phone: zEgyptianPhone(t),
    address: z.string().max(100, t('address.max', { max: 100 })).optional().or(z.literal('')),
    staff_type_id: z.string().min(1, t('staffType.required')),
    employment_start_date: z.string().min(1, t('employmentDate.required')),
  });

export type StaffFormValues = z.infer<ReturnType<typeof createStaffFormSchema>>;
