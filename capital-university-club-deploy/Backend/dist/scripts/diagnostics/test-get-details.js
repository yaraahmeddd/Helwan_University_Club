"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../database/data-source");
const TeamMemberService_1 = require("../../services/TeamMemberService");
async function testGetService() {
    try {
        await data_source_1.AppDataSource.initialize();
        const service = new TeamMemberService_1.TeamMemberService();
        // Find a member that has photos
        const repo = data_source_1.AppDataSource.getRepository(TeamMemberService_1.TeamMemberService); // Not really, but we'll use the one from service if we can
        // Re-use logic from check-data
        const teamMemberRepo = data_source_1.AppDataSource.getRepository(require('./entities/TeamMember').TeamMember);
        const members = await teamMemberRepo.find();
        if (members.length > 0) {
            const memberId = members[0].id;
            console.log(`🔍 Testing for member ID: ${memberId}`);
            const details = await service.getTeamMemberDetails(memberId);
            console.log('✅ Details:', JSON.stringify(details, null, 2));
        }
        else {
            console.log('❌ No members found');
        }
        await data_source_1.AppDataSource.destroy();
    }
    catch (err) {
        console.error('❌ Error:', err);
    }
}
testGetService();
//# sourceMappingURL=test-get-details.js.map