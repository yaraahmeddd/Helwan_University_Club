"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../database/data-source");
const TeamMember_1 = require("../../entities/TeamMember");
async function listMembers() {
    try {
        await data_source_1.AppDataSource.initialize();
        const members = await data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember).find({
            order: { id: 'DESC' },
            take: 5
        });
        console.log('--- CLEAN LIST ---');
        members.forEach(m => {
            console.log(`ID: ${m.id}, Name: ${m.first_name_en} ${m.last_name_en}, Photo: ${m.photo}`);
        });
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
    }
}
listMembers();
//# sourceMappingURL=list-members-clean.js.map