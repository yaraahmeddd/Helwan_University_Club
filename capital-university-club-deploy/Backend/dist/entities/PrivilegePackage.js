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
exports.PrivilegePackage = void 0;
const typeorm_1 = require("typeorm");
/**
 * PrivilegePackage Entity
 *
 * Groups of related privileges that can be assigned together to staff members.
 * Examples: ADMIN_FULL, FINANCE_MANAGER, EVENTS_MANAGER
 *
 * Relationship to privileges:
 * - PrivilegePackage --(many-to-many)--> Privilege via privileges_packages table
 * - This allows grouping multiple privileges into a single package
 */
let PrivilegePackage = class PrivilegePackage {
};
exports.PrivilegePackage = PrivilegePackage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PrivilegePackage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], PrivilegePackage.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], PrivilegePackage.prototype, "name_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], PrivilegePackage.prototype, "name_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], PrivilegePackage.prototype, "description_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], PrivilegePackage.prototype, "description_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PrivilegePackage.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PrivilegePackage.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PrivilegePackage.prototype, "updated_at", void 0);
exports.PrivilegePackage = PrivilegePackage = __decorate([
    (0, typeorm_1.Entity)('packages'),
    (0, typeorm_1.Unique)(['code'])
], PrivilegePackage);
//# sourceMappingURL=PrivilegePackage.js.map