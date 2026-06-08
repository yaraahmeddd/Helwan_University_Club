"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../database/data-source");
const TeamMember_1 = require("../../entities/TeamMember");
async function checkLatest() {
    await data_source_1.AppDataSource.initialize();
    const repo = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
    const latest = await repo.find({
        order: { id: 'DESC' },
        take: 5
    });
    console.log('--- LATEST TEAM MEMBERS ---');
    latest.forEach(m => {
        console.log(`ID: ${m.id}`);
        console.log(`Photo: ${m.photo}`);
        console.log(`ID Front: ${m.national_id_front}`);
        console.log(`ID Back: ${m.national_id_back}`);
        console.log(`Medical: ${m.medical_report}`);
        console.log(`Proof: ${m.proof}`);
        console.log('---------------------------');
    });
    await data_source_1.AppDataSource.destroy();
}
checkLatest().catch(console.error);
//# sourceMappingURL=check-latest-db.js.map