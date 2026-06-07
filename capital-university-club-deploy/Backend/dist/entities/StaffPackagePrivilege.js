"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffPackagePrivilege = void 0;
const typeorm_1 = require("typeorm");
const PrivilegePackage_1 = require("./PrivilegePackage");
const Privilege_1 = require("./Privilege");
/**
 * StaffPackagePrivilege Entity
 *
 * Junction table that maps privileges to privilege packages.
 * Allows defining which privileges belong to which package.
 *
 * Example: The "MEDIA_CENTER_MANAGER" package contains:
 *   - MEDIA_CENTER_APPROVE
 *   - MEDIA_CENTER_PUBLISH
 *   - MEDIA_CENTER_EDIT
 *   - MEDIA_CENTER_MANAGE_CATEGORIES
 */
let StaffPackagePrivilege = class StaffPackagePrivilege {
};
exports.StaffPackagePrivilege = StaffPackagePrivilege;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], StaffPackagePrivilege.prototype, "package_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PrivilegePackage_1.PrivilegePackage, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", PrivilegePackage_1.PrivilegePackage)
], StaffPackagePrivilege.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], StaffPackagePrivilege.prototype, "privilege_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Privilege_1.Privilege, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'privilege_id' }),
    __metadata("design:type", Privilege_1.Privilege)
], StaffPackagePrivilege.prototype, "privilege", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StaffPackagePrivilege.prototype, "added_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], StaffPackagePrivilege.prototype, "added_by", void 0);
exports.StaffPackagePrivilege = StaffPackagePrivilege = __decorate([
    (0, typeorm_1.Entity)('staff_package_privileges')
], StaffPackagePrivilege);
//# sourceMappingURL=StaffPackagePrivilege.js.map