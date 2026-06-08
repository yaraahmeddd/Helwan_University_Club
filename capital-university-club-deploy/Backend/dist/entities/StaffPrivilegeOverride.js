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
exports.StaffPrivilegeOverride = void 0;
const typeorm_1 = require("typeorm");
const Staff_1 = require("./Staff");
const Privilege_1 = require("./Privilege");
/**
 * StaffPrivilegeOverride Entity
 *
 * Tracks individual privilege modifications for staff members.
 * Used for two scenarios:
 *
 * 1. Granting additional privileges (is_granted = true)
 *    - Privileges not part of any assigned package
 *    - Extra privileges added to a package assignment
 *
 * 2. Revoking privileges (is_granted = false)
 *    - Removing specific privileges from an assigned package
 *    - Temporarily disabling a privilege
 *
 * If a staff member is assigned a complete package without modifications,
 * no records are created here. Instead, the assignment is tracked in staff_packages table.
 */
let StaffPrivilegeOverride = class StaffPrivilegeOverride {
};
exports.StaffPrivilegeOverride = StaffPrivilegeOverride;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], StaffPrivilegeOverride.prototype, "staff_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'staff_id' }),
    __metadata("design:type", Staff_1.Staff)
], StaffPrivilegeOverride.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], StaffPrivilegeOverride.prototype, "privilege_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Privilege_1.Privilege, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'privilege_id' }),
    __metadata("design:type", Privilege_1.Privilege)
], StaffPrivilegeOverride.prototype, "privilege", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], StaffPrivilegeOverride.prototype, "is_granted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StaffPrivilegeOverride.prototype, "assigned_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], StaffPrivilegeOverride.prototype, "assigned_by", void 0);
exports.StaffPrivilegeOverride = StaffPrivilegeOverride = __decorate([
    (0, typeorm_1.Entity)('staff_privileges_override')
], StaffPrivilegeOverride);
//# sourceMappingURL=StaffPrivilegeOverride.js.map