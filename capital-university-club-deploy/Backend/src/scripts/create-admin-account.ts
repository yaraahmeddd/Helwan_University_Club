/**
 * Creates or resets the default system administrator account.
 * Run with: npm run create:admin-account
 *
 * Email:    admin@club.local
 * Password: Password@123
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../database/data-source';
import { Account } from '../entities/Account';
import { Staff } from '../entities/Staff';
import { StaffType } from '../entities/StaffType';

const ADMIN_EMAIL = 'admin@club.local';
const ADMIN_PASSWORD = 'Password@123';

async function createAdminAccount() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  const accountRepo = AppDataSource.getRepository(Account);
  const staffRepo = AppDataSource.getRepository(Staff);
  const staffTypeRepo = AppDataSource.getRepository(StaffType);

  let adminStaffType = await staffTypeRepo.findOne({ where: { code: 'ADMIN' } });
  if (!adminStaffType) {
    adminStaffType = await staffTypeRepo.save(
      staffTypeRepo.create({
        code: 'ADMIN',
        name_en: 'Administrator',
        name_ar: 'مدير النظام',
        description_en: 'Full admin access',
        description_ar: 'صلاحيات كاملة',
        is_active: true,
      }),
    );
    console.log('Created ADMIN staff type');
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  let account = await accountRepo.findOne({ where: { email: ADMIN_EMAIL } });
  if (account) {
    account.password = passwordHash;
    account.role = 'admin';
    account.status = 'active';
    account.is_active = true;
    account = await accountRepo.save(account);
    console.log('Updated existing admin account password');
  } else {
    account = await accountRepo.save(
      accountRepo.create({
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: 'admin',
        status: 'active',
        is_active: true,
      }),
    );
    console.log('Created admin account');
  }

  let staff = await staffRepo.findOne({ where: { account_id: account.id } });
  if (staff) {
    staff.staff_type_id = adminStaffType.id;
    staff.first_name_en = staff.first_name_en || 'Amr';
    staff.last_name_en = staff.last_name_en || 'El Sayed';
    staff.first_name_ar = staff.first_name_ar || 'عمرو';
    staff.last_name_ar = staff.last_name_ar || 'السيد';
    staff.status = 'active';
    staff.is_active = true;
    staff = await staffRepo.save(staff);
    console.log('Updated existing admin staff record');
  } else {
    staff = await staffRepo.save(
      staffRepo.create({
        account_id: account.id,
        staff_type_id: adminStaffType.id,
        first_name_en: 'Amr',
        last_name_en: 'El Sayed',
        first_name_ar: 'عمرو',
        last_name_ar: 'السيد',
        national_id: '29001011234001',
        phone: '01001110001',
        address: 'Cairo, Egypt',
        employment_start_date: new Date(),
        status: 'active',
        is_active: true,
      }),
    );
    console.log('Created admin staff record');
  }

  console.log('\n' + '='.repeat(50));
  console.log('ADMIN ACCOUNT READY');
  console.log('='.repeat(50));
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log('='.repeat(50));

  await AppDataSource.destroy();
  process.exit(0);
}

createAdminAccount().catch((error) => {
  console.error('Failed to create admin account:', error);
  process.exit(1);
});
