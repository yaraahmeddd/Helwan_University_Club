"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../database/data-source");
async function finalCheck() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('--- TABLE: team_member_teams ---');
        const teamsCols = await data_source_1.AppDataSource.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'team_member_teams';
        `);
        console.log(JSON.stringify(teamsCols, null, 2));
        console.log('\n--- TABLE: team_member_details ---');
        const detailsCols = await data_source_1.AppDataSource.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'team_member_details';
        `);
        console.log(JSON.stringify(detailsCols, null, 2));
        await data_source_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Error:', error);
    }
}
finalCheck();
//# sourceMappingURL=final-check.js.map