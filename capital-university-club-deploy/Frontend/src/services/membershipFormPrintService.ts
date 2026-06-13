import api from '@/services/axios';
import { resolveMemberPhotoUrl } from '@/services/memberCardPrintService';
import {
    MEMBERSHIP_FORM_FEE,
    formatMembershipFormDate,
    type MembershipFormData,
} from '@/utils/membershipFormPrint';

export type MembershipFormPrintInput = {
    id: string | number;
    kind: 'member' | 'team_member';
    firstNameAr?: string;
    lastNameAr?: string;
    birthdate?: string | null;
    address?: string;
    phone?: string;
    nationalId?: string;
    socialStatus?: string;
    job?: string;
    photo?: string | null;
    membershipTypeAr?: string;
    teams?: string[];
};

type MemberApi = {
    first_name_ar?: string;
    last_name_ar?: string;
    birthdate?: string | Date | null;
    address?: string;
    phone?: string;
    national_id?: string;
    photo?: string | null;
    member_type?: { name_ar?: string; name_en?: string };
    memberships?: Array<{ membership_plan?: { name_ar?: string } }>;
    employee_detail?: { profession?: { name_ar?: string } };
    outsider_detail?: { job_title_ar?: string; social_status?: string };
    retired_employee_detail?: { profession_code?: string | null };
};

type TeamMemberApi = {
    first_name_ar?: string;
    last_name_ar?: string;
    birthdate?: string | null;
    address?: string;
    phone?: string;
    national_id?: string;
    photo?: string | null;
    sports?: Array<{ name?: string }>;
    team_member_teams?: Array<{ team?: { name_ar?: string; sport?: { name_ar?: string } } }>;
};

function buildName(first?: string, last?: string): string {
    return `${first ?? ''} ${last ?? ''}`.trim() || '—';
}

function membershipTypeFromMember(data: MemberApi, fallback?: string): string {
    const fromPlan = data.memberships?.[0]?.membership_plan?.name_ar;
    const fromType = data.member_type?.name_ar;
    return fromPlan?.trim() || fromType?.trim() || fallback?.trim() || '—';
}

function professionFromMember(data: MemberApi, fallback?: string): string {
    return (
        data.employee_detail?.profession?.name_ar?.trim()
        || data.outsider_detail?.job_title_ar?.trim()
        || data.retired_employee_detail?.profession_code?.trim()
        || fallback?.trim()
        || '—'
    );
}

function sportsFromTeamMember(data: TeamMemberApi, fallbackTeams?: string[]): string {
    if (fallbackTeams?.length) return fallbackTeams.slice(0, 4).join(' — ');
    const fromSports = (data.sports ?? []).map((s) => s.name?.trim()).filter(Boolean);
    if (fromSports.length) return [...new Set(fromSports)].slice(0, 4).join(' — ');
    const fromTeams = (data.team_member_teams ?? [])
        .map((t) => t.team?.sport?.name_ar ?? t.team?.name_ar ?? '')
        .map((n) => n.trim())
        .filter(Boolean);
    return [...new Set(fromTeams)].slice(0, 4).join(' — ') || '—';
}

function fallbackFormData(input: MembershipFormPrintInput): MembershipFormData {
    const name = buildName(input.firstNameAr, input.lastNameAr);
    const isTeam = input.kind === 'team_member';
    return {
        cost: MEMBERSHIP_FORM_FEE,
        formTitle: isTeam ? 'استمارة عضوية فريق' : 'استمارة عضوية',
        name,
        dob: formatMembershipFormDate(input.birthdate),
        membershipType: input.membershipTypeAr?.trim() || (isTeam ? 'عضو فريق' : '—'),
        address: input.address?.trim() || '—',
        maritalStatus: input.socialStatus?.trim() || '',
        profession: input.job?.trim() || '—',
        phone: input.phone?.trim() || '—',
        nationalId: input.nationalId?.trim() || '—',
        photoUrl: resolveMemberPhotoUrl(input.photo),
        teamsLine: isTeam && input.teams?.length ? input.teams.slice(0, 4).join(' — ') : undefined,
    };
}

export async function fetchMembershipFormData(
    input: MembershipFormPrintInput,
): Promise<MembershipFormData> {
    const fallback = fallbackFormData(input);

    try {
        if (input.kind === 'team_member') {
            const res = await api.get<{ success?: boolean; data?: TeamMemberApi }>(
                `/team-members/${input.id}`,
            );
            const data = res.data?.data;
            if (!data) return fallback;

            const name = buildName(data.first_name_ar, data.last_name_ar) || fallback.name;
            const teamsLine = sportsFromTeamMember(data, input.teams);

            return {
                cost: MEMBERSHIP_FORM_FEE,
                formTitle: 'استمارة عضوية فريق',
                name,
                dob: formatMembershipFormDate(data.birthdate ?? input.birthdate),
                membershipType: 'عضو فريق',
                address: data.address?.trim() || fallback.address,
                maritalStatus: input.socialStatus?.trim() || '',
                profession: input.job?.trim() || '—',
                phone: data.phone?.trim() || fallback.phone,
                nationalId: data.national_id?.trim() || fallback.nationalId,
                photoUrl: resolveMemberPhotoUrl(data.photo),
                teamsLine: teamsLine !== '—' ? teamsLine : undefined,
            };
        }

        const res = await api.get<{ success?: boolean; data?: MemberApi }>(`/members/${input.id}`);
        const data = res.data?.data;
        if (!data) return fallback;

        const name = buildName(data.first_name_ar, data.last_name_ar) || fallback.name;

        return {
            cost: MEMBERSHIP_FORM_FEE,
            formTitle: 'استمارة عضوية',
            name,
            dob: formatMembershipFormDate(data.birthdate ?? input.birthdate),
            membershipType: membershipTypeFromMember(data, input.membershipTypeAr),
            address: data.address?.trim() || fallback.address,
            maritalStatus: data.outsider_detail?.social_status?.trim() || input.socialStatus?.trim() || '',
            profession: professionFromMember(data, input.job),
            phone: data.phone?.trim() || fallback.phone,
            nationalId: data.national_id?.trim() || fallback.nationalId,
            photoUrl: resolveMemberPhotoUrl(data.photo),
        };
    } catch {
        return fallback;
    }
}

/** Build form data directly from a registration table row (no extra API call). */
export function membershipFormFromRegistration(input: {
    firstNameAr?: string;
    lastNameAr?: string;
    birthdate?: string | null;
    address?: string;
    phone?: string;
    nationalId?: string;
    socialStatus?: string;
    job?: string;
    photo?: string | null;
    memberType: 'member' | 'team_member';
    membershipPlanAr?: string;
    teams?: string[];
}): MembershipFormData {
    const name = buildName(input.firstNameAr, input.lastNameAr);
    const isTeam = input.memberType === 'team_member';
    return {
        cost: MEMBERSHIP_FORM_FEE,
        formTitle: isTeam ? 'استمارة عضوية فريق' : 'استمارة عضوية',
        name,
        dob: formatMembershipFormDate(input.birthdate),
        membershipType: isTeam
            ? 'عضو فريق'
            : (input.membershipPlanAr?.trim() || '—'),
        address: input.address?.trim() || '—',
        maritalStatus: input.socialStatus?.trim() || '',
        profession: input.job?.trim() || '—',
        phone: input.phone?.trim() || '—',
        nationalId: input.nationalId?.trim() || '—',
        photoUrl: resolveMemberPhotoUrl(input.photo),
        teamsLine: isTeam && input.teams?.length ? input.teams.slice(0, 4).join(' — ') : undefined,
    };
}
