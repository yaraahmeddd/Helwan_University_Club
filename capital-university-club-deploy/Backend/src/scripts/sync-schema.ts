import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from '../database/data-source';

async function main() {
    console.log('Initializing data source...');
    await AppDataSource.initialize();
    console.log('Connected. Running synchronize (creates/updates tables to match entities)...');
    await AppDataSource.synchronize(false);
    console.log('Schema synchronized successfully.');
    await AppDataSource.destroy();
    console.log('Done.');
    process.exit(0);
}

main().catch((err) => {
    console.error('Schema sync failed:', err);
    process.exit(1);
});
