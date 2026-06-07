"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../database/data-source");
const TeamMember_1 = require("../../entities/TeamMember");
const TeamMemberTeam_1 = require("../../entities/TeamMemberTeam");
async function check() {
    await data_source_1.AppDataSource.initialize();
    const members = await data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember).find();
    console.log(`TOTAL MEMBERS: ${members.length}`);
    for (const m of members) {
        const joined = await data_source_1.AppDataSource.getRepository(TeamMemberTeam_1.TeamMemberTeam).find({
            where: { team_member_id: m.id },
            relations: ['team', 'team.sport']
        });
        console.log(`Member ID: ${m.id}, Name: ${m.first_name_ar} ${m.last_name_ar}, Status: ${m.status}, Joined: ${joined.length}`);
        joined.forEach(j => console.log(`  - Team: ${j.team.name_ar}, Sport: ${j.team.sport?.name_ar}, Status: ${j.status}`));
    }
    await data_source_1.AppDataSource.destroy();
}
check().catch(console.error);
//# sourceMappingURL=check-members.js.map