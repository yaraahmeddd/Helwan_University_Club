import { AppDataSource, initializeDatabase } from '../database/data-source';
import { Account } from '../entities/Account';
import { Member } from '../entities/Member';
import * as bcrypt from 'bcrypt';

async function checkMemberPasswords() {
    try {
        await initializeDatabase();
        const memberRepo = AppDataSource.getRepository(Member);
        const members = await memberRepo.find({ take: 10, relations: ['account'] });
        
        for (const member of members) {
            console.log(`\nMember ID: ${member.id}`);
            console.log(`Account ID: ${member.account_id}`);
            console.log(`National ID: ${member.national_id}`);
            
            if (member.account) {
                console.log(`Email: ${member.account.email}`);
                const match = await bcrypt.compare(member.national_id, member.account.password);
                console.log(`[MATCH] password == national_id: ${match}`);
                
                // test if the password is the same as the email
                const matchEmail = await bcrypt.compare(member.account.email, member.account.password);
                if (matchEmail) {
                    console.log(`[MATCH] password == email: ${matchEmail}`);
                }
            } else {
                console.log(`No associated account found for this member.`);
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkMemberPasswords();
