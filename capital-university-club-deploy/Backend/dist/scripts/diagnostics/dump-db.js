"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../database/data-source");
const { TeamMember } = require('./entities/TeamMember');
async function check() {
    await data_source_1.AppDataSource.initialize();
    const repo = data_source_1.AppDataSource.getRepository(TeamMember);
    const all = await repo.find();
    const fs = require('fs');
    fs.writeFileSync('db_members.json', JSON.stringify(all, null, 2));
    await data_source_1.AppDataSource.destroy();
}
check();
//# sourceMappingURL=dump-db.js.map