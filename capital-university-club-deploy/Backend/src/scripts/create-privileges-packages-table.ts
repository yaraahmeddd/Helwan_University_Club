import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';

async function createPrivilegesPackagesTable() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Connected to database');

        // 1. Create the missing join table
        await AppDataSource.query(`
            CREATE TABLE IF NOT EXISTS privileges_packages (
                id SERIAL PRIMARY KEY,
                package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
                privilege_id INTEGER NOT NULL REFERENCES privileges(id) ON DELETE CASCADE,
                UNIQUE(package_id, privilege_id)
            )
        `);
        console.log('✅ Created privileges_packages table');

        // 2. Create indexes for fast lookups
        await AppDataSource.query(`
            CREATE INDEX IF NOT EXISTS idx_privileges_packages_package_id ON privileges_packages(package_id);
            CREATE INDEX IF NOT EXISTS idx_privileges_packages_privilege_id ON privileges_packages(privilege_id);
        `);
        console.log('✅ Created indexes');

        // 3. Show existing packages so we know what was seeded
        const packages = await AppDataSource.query(
            `SELECT id, code, name_en FROM packages ORDER BY id`
        );
        console.log('\nExisting packages:');
        packages.forEach((p: { id: number; code: string; name_en: string }) => {
            console.log(`  [${p.id}] ${p.code} — ${p.name_en}`);
        });

        // 4. Show existing privileges count
        const privCount = await AppDataSource.query(
            `SELECT COUNT(*) as count FROM privileges WHERE is_active = true`
        );
        console.log(`\nExisting active privileges: ${privCount[0].count}`);

        // 5. Check current state of privileges_packages
        const joinCount = await AppDataSource.query(
            `SELECT COUNT(*) as count FROM privileges_packages`
        );
        console.log(`Current privileges_packages rows: ${joinCount[0].count}`);

        console.log('\n✅ Done! The privileges_packages table is ready.');
        console.log('ℹ️  Note: You still need to assign privileges to packages via the admin UI or by inserting rows.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createPrivilegesPackagesTable();
