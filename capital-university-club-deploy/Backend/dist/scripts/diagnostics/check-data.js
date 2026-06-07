"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../database/data-source");
const TeamMember_1 = require("../../entities/TeamMember");
async function checkTeamMembers() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connected');
        const repo = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
        const members = await repo.find();
        console.log(`Found ${members.length} team members:`);
        members.forEach(m => {
            console.log(`ID: ${m.id}, Name: ${m.first_name_en} ${m.last_name_en}`);
            console.log(`  Photo: ${m.photo}`);
            console.log(`  ID Front: ${m.national_id_front}`);
            console.log(`  ID Back: ${m.national_id_back}`);
            console.log(`  Medical: ${m.medical_report}`);
            console.log(`  Proof: ${m.proof}`);
            console.log('-------------------');
        });
        await data_source_1.AppDataSource.destroy();
    }
    catch (err) {
        console.error('❌ Error:', err);
    }
}
checkTeamMembers();
//# sourceMappingURL=check-data.js.map