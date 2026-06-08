"use strict";
/**
 * Script to create Media Specialist account
 * Email: Media@club.com, Password: Media123
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../database/data-source");
const Account_1 = require("../entities/Account");
const Staff_1 = require("../entities/Staff");
const StaffType_1 = require("../entities/StaffType");
const Privilege_1 = require("../entities/Privilege");
const PrivilegePackage_1 = require("../entities/PrivilegePackage");
const StaffPackage_1 = require("../entities/StaffPackage");
const bcrypt = __importStar(require("bcrypt"));
async function createMediaAccount() {
    try {
        console.log('🔄 Initializing database connection...');
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connected');
        const accountRepo = data_source_1.AppDataSource.getRepository(Account_1.Account);
        const staffRepo = data_source_1.AppDataSource.getRepository(Staff_1.Staff);
        const staffTypeRepo = data_source_1.AppDataSource.getRepository(StaffType_1.StaffType);
        const privilegeRepo = data_source_1.AppDataSource.getRepository(Privilege_1.Privilege);
        const packageRepo = data_source_1.AppDataSource.getRepository(PrivilegePackage_1.PrivilegePackage);
        const staffPackageRepo = data_source_1.AppDataSource.getRepository(StaffPackage_1.StaffPackage);
        // 1. Ensure Media Staff Type exists
        let mediaStaffType = await staffTypeRepo.findOne({ where: { code: 'MEDIA' } });
        if (!mediaStaffType) {
            mediaStaffType = staffTypeRepo.create({
                code: 'MEDIA',
                name_en: 'Media Specialist',
                name_ar: 'المسؤول الإعلامي',
                description_en: 'Responsible for media and communications',
                description_ar: 'مسؤول عن الإعلام والتواصل',
                is_active: true
            });
            mediaStaffType = await staffTypeRepo.save(mediaStaffType);
            console.log('✅ Media Staff Type created');
        }
        // 2. Ensure Media Privileges exist
        const mediaPrivileges = [
            { code: 'media.view', name_en: 'View Media', name_ar: 'عرض الوسائط', module: 'MediaGallery' },
            { code: 'media.create', name_en: 'Create Media', name_ar: 'إضافة وسائط', module: 'MediaGallery' },
            { code: 'media.edit', name_en: 'Edit Media', name_ar: 'تعديل الوسائط', module: 'MediaGallery' },
            { code: 'media.delete', name_en: 'Delete Media', name_ar: 'حذف الوسائط', module: 'MediaGallery' },
        ];
        const savedPrivileges = [];
        for (const priv of mediaPrivileges) {
            let p = await privilegeRepo.findOne({ where: { code: priv.code } });
            if (!p) {
                p = privilegeRepo.create({
                    ...priv,
                    is_active: true
                });
                p = await privilegeRepo.save(p);
                console.log(`✅ Privilege ${priv.code} created`);
            }
            savedPrivileges.push(p);
        }
        // 3. Ensure Media Package exists
        let mediaPackage = await packageRepo.findOne({ where: { code: 'MEDIA_FULL' } });
        if (!mediaPackage) {
            mediaPackage = packageRepo.create({
                code: 'MEDIA_FULL',
                name_en: 'Full Media Access',
                name_ar: 'صلاحيات الإعلام كاملة',
                description_en: 'Allows all media operations',
                description_ar: 'يسمح بجميع عمليات الإعلام',
                is_active: true
            });
            mediaPackage = await packageRepo.save(mediaPackage);
            console.log('✅ Media Package created');
            // Link privileges to package (manual query for join table)
            for (const p of savedPrivileges) {
                await data_source_1.AppDataSource.query('INSERT INTO privileges_packages (package_id, privilege_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [mediaPackage.id, p.id]);
            }
            console.log('✅ Privileges linked to Media Package');
        }
        // 4. Create Media Account
        const email = 'Media@club.com';
        const password = 'Media123';
        const hashedPassword = await bcrypt.hash(password, 10);
        let mediaAccount = await accountRepo.findOne({ where: { email } });
        if (mediaAccount) {
            console.log('⚠️ Media user account already exists. Updating password...');
            mediaAccount.password = hashedPassword;
            mediaAccount.role = 'MEDIA';
            await accountRepo.save(mediaAccount);
        }
        else {
            mediaAccount = accountRepo.create({
                email,
                password: hashedPassword,
                role: 'MEDIA',
                status: 'active',
                is_active: true,
            });
            mediaAccount = await accountRepo.save(mediaAccount);
            console.log('✅ Media Account created');
        }
        // 5. Create Media Staff Record
        let mediaStaff = await staffRepo.findOne({ where: { account_id: mediaAccount.id } });
        if (mediaStaff) {
            console.log('⚠️ Media staff record already exists');
        }
        else {
            mediaStaff = staffRepo.create({
                account_id: mediaAccount.id,
                staff_type_id: mediaStaffType.id,
                first_name_en: 'Media',
                last_name_en: 'Specialist',
                first_name_ar: 'المسؤول',
                last_name_ar: 'الإعلامي',
                national_id: '99999999999999',
                phone: '+201000000000',
                address: 'Club Media Office',
                employment_start_date: new Date(),
                status: 'active',
                is_active: true,
            });
            mediaStaff = await staffRepo.save(mediaStaff);
            console.log('✅ Media Staff record created');
        }
        // 6. Assign Package to Staff
        const existingStaffPackage = await staffPackageRepo.findOne({
            where: { staff_id: mediaStaff.id, package_id: mediaPackage.id }
        });
        if (!existingStaffPackage) {
            const newStaffPackage = new StaffPackage_1.StaffPackage();
            newStaffPackage.staff_id = mediaStaff.id;
            newStaffPackage.package_id = mediaPackage.id;
            await staffPackageRepo.save(newStaffPackage);
            console.log('✅ Media Package assigned to staff');
        }
        console.log('\n' + '='.repeat(50));
        console.log('🎉 MEDIA ACCOUNT CREATED SUCCESSFULLY');
        console.log('='.repeat(50));
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role:     MEDIA`);
        console.log('='.repeat(50));
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
createMediaAccount();
//# sourceMappingURL=create-media-account.js.map