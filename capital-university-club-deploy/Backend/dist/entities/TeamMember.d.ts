import { Account } from './Account';
import { TeamMemberTeam } from './TeamMemberTeam';
import { MemberType } from './MemberType';
export declare class TeamMember {
    id: number;
    account_id: number;
    first_name_en: string;
    first_name_ar: string;
    last_name_en: string;
    last_name_ar: string;
    gender: string;
    phone: string;
    nationality: string;
    birthdate: Date | null;
    national_id: string;
    address: string;
    photo: string;
    medical_report: string;
    national_id_front: string;
    national_id_back: string;
    proof: string;
    is_foreign: boolean;
    member_type_id: number | null;
    status: string;
    created_at: Date;
    updated_at: Date;
    account: Account;
    member_type: MemberType;
    team_member_teams: TeamMemberTeam[];
}
//# sourceMappingURL=TeamMember.d.ts.map