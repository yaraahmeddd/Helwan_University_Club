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
exports.StaffPackage = void 0;
const typeorm_1 = require("typeorm");
const Staff_1 = require("./Staff");
const PrivilegePackage_1 = require("./PrivilegePackage");
/**
 * StaffPackage Entity
 *
 * Tracks complete privilege package assignments to staff members.
 *
 * Used ONLY when assigning a complete package without modifications.
 * If any modifications are needed (adding extra privileges or removing specific ones),
 * use StaffPrivilegeOverride instead.
 *
 * Relationship:
 * - Staff --(one-to-many)--> StaffPackage --(many-to-one)--> PrivilegePackage
 * - Through PrivilegePackage -> Privilege (via privilege_package_members)
 */
let StaffPackage = class StaffPackage {
};
exports.StaffPackage = StaffPackage;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], StaffPackage.prototype, "staff_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'staff_id' }),
    __metadata("design:type", Staff_1.Staff)
], StaffPackage.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], StaffPackage.prototype, "package_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PrivilegePackage_1.PrivilegePackage, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", PrivilegePackage_1.PrivilegePackage)
], StaffPackage.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StaffPackage.prototype, "assigned_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], StaffPackage.prototype, "assigned_by", void 0);
exports.StaffPackage = StaffPackage = __decorate([
    (0, typeorm_1.Entity)('staff_packages')
], StaffPackage);
//# sourceMappingURL=StaffPackage.js.map