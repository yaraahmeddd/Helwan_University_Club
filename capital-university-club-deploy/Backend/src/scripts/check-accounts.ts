import { AppDataSource, initializeDatabase } from '../database/data-source';
import { Account } from '../entities/Account';
import * as bcrypt from 'bcrypt';

async function checkAccounts() {
    try {
        await initializeDatabase();
        const accountRepo = AppDataSource.getRepository(Account);
        const accounts = await accountRepo.find({ take: 10 });
        
        console.log(`Found ${accounts.length} accounts`);
        
        for (const account of accounts) {
            console.log(`\nAccount ID: ${account.id}`);
            console.log(`Email: ${account.email}`);
            console.log(`Role: ${account.role}`);
            console.log(`Status: ${account.status}`);
            console.log(`Password Hash: ${account.password}`);
            console.log(`Password Changed At: ${account.password_changed_at}`);
            
            // Try to test some common passwords like '123456', 'admin123', 'password'
            const commonPasswords = ['123456', 'admin123', 'password', '0000'];
            for (const p of commonPasswords) {
                const match = await bcrypt.compare(p, account.password);
                if (match) {
                    console.log(`[MATCH] Password is: ${p}`);
                }
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkAccounts();
