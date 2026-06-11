/**
 * Bulk import helpers for members, team members, and staff registration flows.
 */

import api from '@/services/axios';
import { AuthService } from '@/services/authService';
import { getApiErrorMessage } from './importApiHelper';

function mapCategoryToMembershipCode(category: string): string {
  const map: Record<string, string> = {
    regular: 'VISITOR',
    visitor: 'VISITOR',
    staff: 'WORKING',
    student: 'STUDENT',
    dependent: 'DEPENDENT',
    foreigner: 'FOREIGNER',
    retired: 'WORKING',
  };
  return map[category.trim().toLowerCase()] || 'VISITOR';
}

function resolveNationalId(row: Record<string, string>, category: string): string {
  const passport = row.passport_number?.trim();
  const nationalId = row.national_id?.trim();
  if (category === 'foreigner') {
    if (!passport) throw new Error('passport_number is required for foreigner category');
    return passport;
  }
  if (!nationalId) throw new Error('national_id is required');
  return nationalId;
}

function buildDeterminationPayload(memberId: number, category: string, row: Record<string, string>, isSportsPlayer: boolean) {
  return {
    member_id: memberId,
    is_student: category === 'student',
    is_working: category === 'staff',
    is_foreign: category === 'foreigner',
    is_graduated: false,
    has_relation: category === 'dependent',
    is_retired: category === 'retired',
    is_sports_player: isSportsPlayer,
    selected_sports: [] as string[],
    relation_member_id:
      category === 'dependent' && row.related_member_id?.trim()
        ? Number(row.related_member_id)
        : undefined,
  };
}

async function registerMemberFromRow(
  row: Record<string, string>,
  role: 'member' | 'team_member',
  isSportsPlayer: boolean,
): Promise<void> {
  const category = (row.category || 'visitor').trim().toLowerCase();
  const nationalId = resolveNationalId(row, category);

  let basicRes;
  try {
    basicRes = await AuthService.registerBasic({
      role,
      email: row.email.trim(),
      first_name_en: row.first_name_en.trim(),
      first_name_ar: row.first_name_ar.trim(),
      last_name_en: row.last_name_en.trim(),
      last_name_ar: row.last_name_ar.trim(),
      phone: row.phone.trim(),
      gender: row.gender.trim(),
      nationality: row.nationality?.trim() || 'Egyptian',
      birthdate: row.dob.trim(),
      password: row.password.trim(),
      national_id: nationalId,
      membership_type_code: mapCategoryToMembershipCode(category),
    });
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }

  if (!basicRes.success || !basicRes.data) {
    throw new Error(basicRes.message || 'Registration failed');
  }

  const memberId = basicRes.data.member_id ?? basicRes.data.team_member_id;
  const accountId = basicRes.data.account_id;
  if (!memberId || !accountId) {
    throw new Error('Registration did not return member ID');
  }

  try {
    await AuthService.determineMembership(
      buildDeterminationPayload(memberId, category, row, isSportsPlayer),
    );
  } catch (err) {
    await AuthService.rollbackRegistration(accountId);
    throw new Error(getApiErrorMessage(err));
  }
}

export async function importSocialMemberRow(row: Record<string, string>): Promise<void> {
  await registerMemberFromRow(row, 'member', false);
}

export async function importTeamMemberRow(row: Record<string, string>): Promise<void> {
  await registerMemberFromRow(row, 'team_member', true);
}

export async function importStaffRow(row: Record<string, string>): Promise<void> {
  const formData = new FormData();
  formData.append('first_name_en', row.first_name_en.trim());
  formData.append('first_name_ar', row.first_name_ar.trim());
  formData.append('last_name_en', row.last_name_en.trim());
  formData.append('last_name_ar', row.last_name_ar?.trim() || row.last_name_en.trim());
  formData.append('national_id', row.national_id.trim());
  formData.append('phone', row.phone.trim());
  if (row.address?.trim()) formData.append('address', row.address.trim());
  formData.append('staff_type_id', row.staff_type_id.trim());
  formData.append('employment_start_date', row.employment_start_date.trim());

  try {
    await api.post('/staff/register', formData);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}
