"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../database/data-source");
const fixSchema = async () => {
    console.log('🔄 Starting schema fix...');
    // IMPORTANT: Disable synchronization to prevent startup errors
    data_source_1.AppDataSource.setOptions({ synchronize: false });
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('✓ Database connected (Sync Disabled)');
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        // Drop tables that are causing synchronization conflicts
        // Order matters due to Foreign Keys: dependent tables first
        const tablesToDrop = [
            'member_memberships', // Depends on membership_plans
            'membership_plans',
            'member_relationships' // Also showing constraint errors
        ];
        for (const table of tablesToDrop) {
            console.log(`🗑️ Dropping ${table}...`);
            await queryRunner.query(`IF OBJECT_ID('${table}', 'U') IS NOT NULL DROP TABLE ${table}`);
        }
        console.log('✓ Problematic tables dropped successfully.');
        console.log('✓ Please restart the backend server (npm run st or npm run stat) to recreate them with the correct schema.');
        await data_source_1.AppDataSource.destroy();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error fixing schema:', error);
        process.exit(1);
    }
};
fixSchema();
//# sourceMappingURL=fix-db-schema.js.map