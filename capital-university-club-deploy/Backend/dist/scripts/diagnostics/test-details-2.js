"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../database/data-source");
const TeamMemberService_1 = require("../../services/TeamMemberService");
async function test() {
    await data_source_1.AppDataSource.initialize();
    const service = new TeamMemberService_1.TeamMemberService();
    const details = await service.getTeamMemberDetails(2);
    console.log('DETAILS_START');
    console.log(JSON.stringify(details, null, 2));
    console.log('DETAILS_END');
    await data_source_1.AppDataSource.destroy();
}
test();
//# sourceMappingURL=test-details-2.js.map