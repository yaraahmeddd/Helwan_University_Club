import { Member } from './Member';
import { TeamMember } from './TeamMember';
import { ActivityLog } from './ActivityLog';
export declare class Account {
    id: number;
    email: string;
    password: string;
    role: string;
    status: string;
    last_login: Date | null;
    password_changed_at: Date | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    member: Member;
    team_member: TeamMember;
    activity_logs: ActivityLog[];
}
//# sourceMappingURL=Account.d.ts.map