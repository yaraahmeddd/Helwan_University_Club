"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../database/data-source");
const Sport_1 = require("../../entities/Sport");
async function checkSports() {
    await data_source_1.AppDataSource.initialize();
    const count = await data_source_1.AppDataSource.getRepository(Sport_1.Sport).count();
    console.log(`TOTAL SPORTS IN DB: ${count}`);
    const active = await data_source_1.AppDataSource.getRepository(Sport_1.Sport).find({ where: { status: 'active', is_active: true } });
    console.log(`ACTIVE SPORTS COUNT: ${active.length}`);
    active.forEach(s => console.log(`- ${s.name_ar} (ID: ${s.id}, status: ${s.status}, is_active: ${s.is_active})`));
    await data_source_1.AppDataSource.destroy();
}
checkSports().catch(console.error);
//# sourceMappingURL=check-sports.js.map