import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';

async function seedPackagePrivileges() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Connected to database');

        // List all privileges
        const privileges = await AppDataSource.query(
            `SELECT id, code, name_en, module FROM privileges WHERE is_active = true ORDER BY module, code`
        );
        console.log('\nAll active privileges:');
        privileges.forEach((p: { id: number; code: string; name_en: string; module: string }) => {
            console.log(`  [${p.id}] ${p.code} (${p.module}) — ${p.name_en}`);
        });

        // Helper to get privilege ID by code
        const privMap: Record<string, number> = {};
        privileges.forEach((p: { id: number; code: string }) => { privMap[p.code] = p.id; });

        // Get all packages
        const packages = await AppDataSource.query(
            `SELECT id, code, name_en FROM packages WHERE is_active = true ORDER BY id`
        );
        console.log('\nPackages:');
        packages.forEach((p: { id: number; code: string; name_en: string }) => {
            console.log(`  [${p.id}] ${p.code} — ${p.name_en}`);
        });

        // Assign all privileges to PKG_ADMIN (full admin access)
        const adminPkg = packages.find((p: { code: string }) => p.code === 'PKG_ADMIN');
        if (adminPkg) {
            for (const priv of privileges) {
                await AppDataSource.query(
                    `INSERT INTO privileges_packages (package_id, privilege_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [adminPkg.id, priv.id]
                );
            }
            console.log(`\n✅ Assigned all ${privileges.length} privileges to PKG_ADMIN`);
        }

        // For other packages assign relevant privileges based on code/module
        for (const pkg of packages) {
            if (pkg.code === 'PKG_ADMIN') continue; // Already handled

            const relevantPrivIds: number[] = [];

            if (pkg.code === 'PKG_SPORTS') {
                // Sports-related privileges
                privileges.forEach((p: { id: number; code: string; module: string }) => {
                    if (p.module === 'sports' || p.code.includes('SPORT') || p.code.includes('FIELD') ||
                        p.code.includes('SCHEDULE') || p.code.includes('TEAM') || p.code.includes('TRAINING')) {
                        relevantPrivIds.push(p.id);
                    }
                });
            } else if (pkg.code === 'PKG_FINANCE') {
                privileges.forEach((p: { id: number; code: string; module: string }) => {
                    if (p.module === 'finance' || p.code.includes('FINANCE') || p.code.includes('PAYMENT') ||
                        p.code.includes('SUBSCRIPTION') || p.code.includes('VIEW')) {
                        relevantPrivIds.push(p.id);
                    }
                });
            } else if (pkg.code === 'PKG_REG') {
                privileges.forEach((p: { id: number; code: string; module: string }) => {
                    if (p.module === 'member_management' || p.code.includes('MEMBER') || p.code.includes('VIEW')) {
                        relevantPrivIds.push(p.id);
                    }
                });
            } else if (pkg.code === 'PKG_MEDIA') {
                privileges.forEach((p: { id: number; code: string; module: string }) => {
                    if (p.module === 'media' || p.code.includes('MEDIA') || p.code.includes('CONTENT') || p.code.includes('VIEW')) {
                        relevantPrivIds.push(p.id);
                    }
                });
            }

            // Ensure VIEW_PRIVILEGES is available to all packages for basic visibility
            if (privMap['VIEW_PRIVILEGES'] && !relevantPrivIds.includes(privMap['VIEW_PRIVILEGES'])) {
                relevantPrivIds.push(privMap['VIEW_PRIVILEGES']);
            }

            // If no specific privileges matched, assign all VIEW_* privileges
            if (relevantPrivIds.length <= 1) {
                privileges.forEach((p: { id: number; code: string }) => {
                    if (p.code.startsWith('VIEW_')) relevantPrivIds.push(p.id);
                });
            }

            // Deduplicate
            const uniqueIds = [...new Set(relevantPrivIds)];
            for (const privId of uniqueIds) {
                await AppDataSource.query(
                    `INSERT INTO privileges_packages (package_id, privilege_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [pkg.id, privId]
                );
            }
            console.log(`✅ Assigned ${uniqueIds.length} privileges to ${pkg.code}`);
        }

        // Verify final state
        const finalCount = await AppDataSource.query(
            `SELECT pp.package_id, p.code as package_code, COUNT(*) as priv_count
             FROM privileges_packages pp
             JOIN packages p ON pp.package_id = p.id
             GROUP BY pp.package_id, p.code
             ORDER BY pp.package_id`
        );
        console.log('\nFinal state:');
        finalCount.forEach((row: { package_code: string; priv_count: number }) => {
            console.log(`  ${row.package_code}: ${row.priv_count} privileges`);
        });

        console.log('\n✅ Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedPackagePrivileges();
