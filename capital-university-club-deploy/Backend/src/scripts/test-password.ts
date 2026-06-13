import { AppDataSource, initializeDatabase } from '../database/data-source';
import { Account } from '../entities/Account';
import * as bcrypt from 'bcrypt';

async function testPassword() {
    try {
        await initializeDatabase();
        const accountRepo = AppDataSource.getRepository(Account);
        const account = await accountRepo.findOne({ where: { email: 'NiggeeRXONIGGER@gmail.com' } });
        
        if (account) {
            const match = await bcrypt.compare('Password123!', account.password);
            console.log(`Password is Password123!: ${match}`);
        } else {
            console.log('Account not found');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testPassword();
