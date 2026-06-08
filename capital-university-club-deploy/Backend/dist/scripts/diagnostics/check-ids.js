"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../database/data-source");
const TeamMember_1 = require("../../entities/TeamMember");
async function checkIds() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
        }
        const repo = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
        const latest = await repo.find({
            order: { id: 'DESC' },
            take: 5
        });
        console.log('--- LATEST TEAM MEMBERS ---');
        latest.forEach(m => {
            console.log(`ID (Primary): ${m.id}, Name: ${m.first_name_en} ${m.last_name_en}, Status: ${m.status}`);
            console.log(`Photo Path in DB: "${m.photo}"`);
        });
    }
    catch (err) {
        console.error('Error:', err);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
    }
}
checkIds();
//# sourceMappingURL=check-ids.js.map