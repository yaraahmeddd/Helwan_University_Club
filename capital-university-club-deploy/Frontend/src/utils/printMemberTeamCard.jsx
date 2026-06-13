/**
 * Legacy wrapper — delegates to the unified CR80 card print utility.
 * Templates originate from capital-university-club-deploy/card/printMemberTeamCard.jsx.txt
 */
import {
    getSeasonYearRange,
    printMemberCard,
    type MemberCardPrintData,
    type TeamMemberCardPrintData,
} from './memberCardPrint';

/**
 * @deprecated Prefer printMemberCard({ data, includeFooter }) via useMemberCardPrint hook.
 */
export async function printMemberTeamCard(
    memberName,
    teamName,
    imgs,
    _ssn,
    endDate,
) {
    const data: TeamMemberCardPrintData = {
        cardType: 'team_member',
        nameAr: memberName || '—',
        seasonYear: getSeasonYearRange(),
        sportsAr: teamName ? [teamName] : [],
        hasCard: Boolean(imgs),
        cardFrontUrl: imgs || null,
    };

    if (endDate && data.sportsAr.length === 0) {
        data.sportsAr = [`${endDate}`];
    }

    await printMemberCard(data);
}

/**
 * Object-style API used by older callers.
 */
export async function printMemberTeamCardFromOptions({
    data = {},
    type = 'member',
    includeFooter,
} = {}) {
    const cardType = type === 'team' ? 'team_member' : type === 'staff' ? 'staff' : 'member';
    const nameAr = data.nameAr || data.nameEn || '—';
    const photoUrl = data.photoUrl || null;

    let payload: MemberCardPrintData;

    if (cardType === 'staff') {
        payload = {
            cardType: 'staff',
            nameAr,
            seasonYear: getSeasonYearRange(),
            jobTitleAr: data.jobTitle || data.staffType || '—',
            hasCard: Boolean(photoUrl),
            cardFrontUrl: photoUrl,
        };
    } else if (cardType === 'team_member') {
        payload = {
            cardType: 'team_member',
            nameAr,
            seasonYear: getSeasonYearRange(),
            sportsAr: data.sport ? [data.sport] : [],
            hasCard: Boolean(photoUrl),
            cardFrontUrl: photoUrl,
        };
    } else {
        payload = {
            cardType: 'member',
            nameAr,
            seasonYear: getSeasonYearRange(),
            membershipAr: data.memberType || '—',
            validFrom: data.issueDate || '—',
            validUntil: data.validUntil || '—',
            hasCard: Boolean(photoUrl),
            cardFrontUrl: photoUrl,
        };
    }

    await printMemberCard(payload, { includeFooter });
}

export default printMemberTeamCardFromOptions;
