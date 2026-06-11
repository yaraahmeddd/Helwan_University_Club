import api from '@/services/axios';
import { BACKEND_ORIGIN } from '@/config/backend';
import type { MemberCardPrintData } from '@/utils/memberCardPrint';
import { buildMemberCardPrintData } from '@/utils/memberCardPrint';

export type MemberCardPrintInput = {
    id: string | number;
    isTeamPlayer?: boolean;
    firstNameAr?: string;
    lastNameAr?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    sportAr?: string;
    sportEn?: string;
    endDate?: string | null;
};

type MemberCardApiData = {
    card_number?: string;
    member_name_en?: string;
    member_name_ar?: string;
    valid_until?: string | Date;
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
    team_member_teams?: Array<{
        team?: {
            name_ar?: string;
            name_en?: string;
            sport?: { name_ar?: string; name_en?: string; name?: string };
        };
    }>;
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

function formatValidUntil(value?: string | Date | null): string {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function splitName(full?: string): { first: string; last: string } {
    const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { first: '', last: '' };
    if (parts.length === 1) return { first: parts[0], last: '' };
    return { first: parts[0], last: parts.slice(1).join(' ') };
}

function firstSportFromTeamMember(data: TeamMemberApiData): { sportAr: string; sportEn: string } {
    const team = data.team_member_teams?.[0]?.team;
    const sport = team?.sport;
    const sportAr = sport?.name_ar ?? team?.name_ar ?? sport?.name ?? '—';
    const sportEn = sport?.name_en ?? team?.name_en ?? sport?.name ?? sportAr;
    return { sportAr, sportEn };
}

export async function fetchMemberCardPrintData(
    input: MemberCardPrintInput,
): Promise<MemberCardPrintData> {
    const fallback = buildMemberCardPrintData({
        firstNameAr: input.firstNameAr,
        lastNameAr: input.lastNameAr,
        firstNameEn: input.firstNameEn,
        lastNameEn: input.lastNameEn,
        id: input.id,
        sportAr: input.sportAr,
        sportEn: input.sportEn,
        endDate: input.endDate,
    });

    try {
        if (input.isTeamPlayer) {
            const res = await api.get<{ success?: boolean; data?: TeamMemberApiData }>(
                `/team-members/${input.id}`,
            );
            const data = res.data?.data;
            if (!data) return { ...fallback, hasCard: false, cardFrontUrl: null };

            const sports = firstSportFromTeamMember(data);
            const photoUrl = resolveMemberPhotoUrl(data.photo);
            return {
                ...buildMemberCardPrintData({
                    firstNameAr: data.first_name_ar ?? input.firstNameAr,
                    lastNameAr: data.last_name_ar ?? input.lastNameAr,
                    firstNameEn: data.first_name_en ?? input.firstNameEn,
                    lastNameEn: data.last_name_en ?? input.lastNameEn,
                    id: data.id ?? input.id,
                    sportAr: sports.sportAr !== '—' ? sports.sportAr : input.sportAr,
                    sportEn: sports.sportEn !== '—' ? sports.sportEn : input.sportEn,
                    endDate: input.endDate,
                }),
                hasCard: Boolean(photoUrl),
                cardFrontUrl: photoUrl,
            };
        }

        const res = await api.get<{ success?: boolean; data?: MemberCardApiData }>(
            `/members/${input.id}/card`,
        );
        const data = res.data?.data;
        if (!data) return { ...fallback, hasCard: false, cardFrontUrl: null };

        const nameArParts = splitName(data.member_name_ar);
        const nameEnParts = splitName(data.member_name_en);
        const photoUrl = resolveMemberPhotoUrl(data.photo);

        return {
            ...buildMemberCardPrintData({
                firstNameAr: nameArParts.first,
                lastNameAr: nameArParts.last,
                firstNameEn: nameEnParts.first,
                lastNameEn: nameEnParts.last,
                id: data.card_number ?? input.id,
                sportAr: input.sportAr,
                sportEn: input.sportEn,
                endDate: formatValidUntil(data.valid_until),
            }),
            memberId: data.card_number ?? fallback.memberId,
            hasCard: Boolean(photoUrl),
            cardFrontUrl: photoUrl,
        };
    } catch {
        return { ...fallback, hasCard: false, cardFrontUrl: null };
    }
}
