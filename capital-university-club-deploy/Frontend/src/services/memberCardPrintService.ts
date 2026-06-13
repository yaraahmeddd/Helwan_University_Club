import api from '@/services/axios';
import { BACKEND_ORIGIN } from '@/config/backend';
import type {
    CardPrintKind,
    MemberCardPrintData,
    MemberClubCardPrintData,
    StaffCardPrintData,
    TeamMemberCardPrintData,
} from '@/utils/memberCardPrint';
import {
    formatMemberCardDate,
    getSeasonYearRange,
} from '@/utils/memberCardPrint';

export type MemberCardPrintInput = {
    id: string | number;
    cardType?: CardPrintKind;
    /** @deprecated use cardType: 'team_member' */
    isTeamPlayer?: boolean;
    firstNameAr?: string;
    lastNameAr?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    sportAr?: string;
    sportEn?: string;
    endDate?: string | null;
    jobTitleAr?: string;
};

type MemberCardApiData = {
    card_number?: string;
    member_name_en?: string;
    member_name_ar?: string;
    valid_from?: string | Date;
    valid_until?: string | Date;
    membership_name_ar?: string;
    photo?: string | null;
    member_type?: string;
};

type TeamMemberApiData = {
    id?: number;
    first_name_ar?: string;
    last_name_ar?: string;
    first_name_en?: string;
    last_name_en?: string;
    photo?: string | null;
    sports?: Array<{ name?: string }>;
    team_member_teams?: Array<{
        team?: {
            name_ar?: string;
            sport?: { name_ar?: string; name_en?: string; name?: string };
        };
    }>;
};

type StaffApiData = {
    id?: number;
    first_name_ar?: string;
    last_name_ar?: string;
    personal_photo?: string | null;
    staff_type?: {
        name_ar?: string;
    };
};

export function resolveMemberPhotoUrl(photo?: string | null): string | null {
    if (!photo?.trim()) return null;
    const f = photo.trim();
    if (f.startsWith('data:') || f.startsWith('blob:')) return f;
    if (f.startsWith('http://') || f.startsWith('https://')) {
        try {
            const url = new URL(f);
            return `${BACKEND_ORIGIN}${url.pathname}${url.search}`;
        } catch {
            return f;
        }
    }
    return encodeURI(`${BACKEND_ORIGIN}/${f.replace(/^\/+/, '')}`);
}

function resolveCardType(input: MemberCardPrintInput): CardPrintKind {
    if (input.cardType) return input.cardType;
    if (input.isTeamPlayer) return 'team_member';
    return 'member';
}

function buildNameAr(input: MemberCardPrintInput): string {
    return `${input.firstNameAr ?? ''} ${input.lastNameAr ?? ''}`.trim() || '—';
}

function sportsFromTeamMember(data: TeamMemberApiData): string[] {
    if (Array.isArray(data.sports) && data.sports.length > 0) {
        return data.sports
            .map((s) => s.name?.trim())
            .filter((n): n is string => Boolean(n))
            .slice(0, 4);
    }

    const fromTeams = (data.team_member_teams ?? [])
        .map((t) => {
            const sport = t.team?.sport;
            return sport?.name_ar ?? t.team?.name_ar ?? sport?.name ?? '';
        })
        .map((n) => n.trim())
        .filter(Boolean);

    return [...new Set(fromTeams)].slice(0, 4);
}

function baseFallback(input: MemberCardPrintInput): MemberCardPrintData {
    const nameAr = buildNameAr(input);
    const seasonYear = getSeasonYearRange();
    const cardType = resolveCardType(input);

    if (cardType === 'staff') {
        return {
            cardType: 'staff',
            nameAr,
            seasonYear,
            jobTitleAr: input.jobTitleAr?.trim() || '—',
            hasCard: false,
            cardFrontUrl: null,
            memberId: input.id,
        } satisfies StaffCardPrintData;
    }

    if (cardType === 'team_member') {
        const sport = input.sportAr?.trim();
        return {
            cardType: 'team_member',
            nameAr,
            seasonYear,
            sportsAr: sport ? [sport] : [],
            hasCard: false,
            cardFrontUrl: null,
            memberId: input.id,
        } satisfies TeamMemberCardPrintData;
    }

    return {
        cardType: 'member',
        nameAr,
        seasonYear,
        membershipAr: '—',
        validFrom: '—',
        validUntil: input.endDate?.trim() || '—',
        hasCard: false,
        cardFrontUrl: null,
        memberId: input.id,
    } satisfies MemberClubCardPrintData;
}

export async function fetchMemberCardPrintData(
    input: MemberCardPrintInput,
): Promise<MemberCardPrintData> {
    const fallback = baseFallback(input);
    const cardType = resolveCardType(input);

    try {
        if (cardType === 'staff') {
            const res = await api.get<{ success?: boolean; data?: StaffApiData }>(
                `/staff/${input.id}`,
            );
            const data = res.data?.data;
            if (!data) return fallback;

            const nameAr = `${data.first_name_ar ?? ''} ${data.last_name_ar ?? ''}`.trim() || fallback.nameAr;
            const photoUrl = resolveMemberPhotoUrl(data.personal_photo);

            return {
                cardType: 'staff',
                nameAr,
                seasonYear: getSeasonYearRange(),
                jobTitleAr: data.staff_type?.name_ar?.trim() || input.jobTitleAr?.trim() || '—',
                hasCard: Boolean(photoUrl),
                cardFrontUrl: photoUrl,
                memberId: input.id,
            };
        }

        if (cardType === 'team_member') {
            const res = await api.get<{ success?: boolean; data?: TeamMemberApiData }>(
                `/team-members/${input.id}`,
            );
            const data = res.data?.data;
            if (!data) return fallback;

            const nameAr = `${data.first_name_ar ?? ''} ${data.last_name_ar ?? ''}`.trim() || fallback.nameAr;
            const photoUrl = resolveMemberPhotoUrl(data.photo);
            const sportsAr = sportsFromTeamMember(data);

            return {
                cardType: 'team_member',
                nameAr,
                seasonYear: getSeasonYearRange(),
                sportsAr,
                hasCard: Boolean(photoUrl),
                cardFrontUrl: photoUrl,
                memberId: input.id,
            };
        }

        const res = await api.get<{ success?: boolean; data?: MemberCardApiData }>(
            `/members/${input.id}/card`,
        );
        const data = res.data?.data;
        if (!data) return fallback;

        const nameAr = data.member_name_ar?.trim() || fallback.nameAr;
        const photoUrl = resolveMemberPhotoUrl(data.photo);

        return {
            cardType: 'member',
            nameAr,
            seasonYear: getSeasonYearRange(),
            membershipAr: data.membership_name_ar?.trim() || '—',
            validFrom: formatMemberCardDate(data.valid_from),
            validUntil: formatMemberCardDate(data.valid_until),
            hasCard: Boolean(photoUrl),
            cardFrontUrl: photoUrl,
            memberId: data.card_number || input.id,
        };
    } catch {
        return fallback;
    }
}
