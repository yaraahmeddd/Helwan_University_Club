// Type declarations for card print utilities

export type CardType = 'member' | 'team' | 'staff';

export interface CardData {
    id: string | number;
    nameAr?: string;
    nameEn?: string;
    memberId?: string;
    memberType?: string;
    phone?: string;
    nationalId?: string;
    photoUrl?: string;
    jobTitle?: string;
    staffType?: string;
    sport?: string;
    validUntil?: string;
    issueDate?: string;
    barcode?: string;
}

export interface MemberCardPreviewProps {
    data: CardData;
    type?: CardType;
    scale?: number;
}

export interface PrintOptions {
    data?: CardData;
    type?: CardType;
    includeFooter?: boolean;
}

declare function MemberCardPreview(props: MemberCardPreviewProps): JSX.Element;

declare function printMemberTeamCard(
    memberName: string,
    teamName: string,
    imgs: string,
    ssn: string,
    endDate: string,
): Promise<void>;

declare function printMemberTeamCardFromOptions(options?: PrintOptions): Promise<void>;

export default MemberCardPreview;
export { printMemberTeamCard, printMemberTeamCardFromOptions };
