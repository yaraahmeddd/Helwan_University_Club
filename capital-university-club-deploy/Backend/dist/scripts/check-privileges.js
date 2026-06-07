"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../database/data-source");
const Account_1 = require("../entities/Account");
const Staff_1 = require("../entities/Staff");
const PrivilegeCalculationService_1 = require("../services/PrivilegeCalculationService");
async function checkMediaPrivileges() {
    try {
        await data_source_1.AppDataSource.initialize();
        const email = 'Media@club.com';
        const accountRepo = data_source_1.AppDataSource.getRepository(Account_1.Account);
        const account = await accountRepo.findOne({ where: { email } });
        if (!account) {
            console.log('Account not found');
            return;
        }
        const staffRepo = data_source_1.AppDataSource.getRepository(Staff_1.Staff);
        const staff = await staffRepo.findOne({ where: { account_id: account.id } });
        if (!staff) {
            console.log('Staff record not found');
            return;
        }
        console.log(`Checking privileges for Staff ID: ${staff.id} (${email})`);
        const privileges = await PrivilegeCalculationService_1.PrivilegeCalculationService.calculateFinalPrivilegeCodes(staff.id);
        console.log('Final Privileges:');
        console.log(Array.from(privileges));
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
checkMediaPrivileges();
//# sourceMappingURL=check-privileges.js.map