"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../database/data-source");
const TeamMember_1 = require("../../entities/TeamMember");
async function checkTeamMembers() {
    try {
        await data_source_1.AppDataSource.initialize();
        const repo = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
        const members = await repo.find();
        const result = members.map(m => ({
            id: m.id,
            name: `${m.first_name_en} ${m.last_name_en}`,
            photos: {
                photo: m.photo,
                id_front: m.national_id_front,
                id_back: m.national_id_back,
                report: m.medical_report,
                proof: m.proof
            }
        }));
        console.log(JSON.stringify(result, null, 2));
        await data_source_1.AppDataSource.destroy();
    }
    catch (err) {
        process.exit(1);
    }
}
checkTeamMembers();
//# sourceMappingURL=check-data-clean.js.map