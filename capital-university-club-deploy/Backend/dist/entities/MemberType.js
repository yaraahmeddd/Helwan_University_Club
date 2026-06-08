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
exports.MemberType = void 0;
const typeorm_1 = require("typeorm");
const MembershipPlan_1 = require("./MembershipPlan");
let MemberType = class MemberType {
};
exports.MemberType = MemberType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MemberType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], MemberType.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], MemberType.prototype, "name_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], MemberType.prototype, "name_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MemberType.prototype, "description_en", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 4000, nullable: true }),
    __metadata("design:type", String)
], MemberType.prototype, "description_ar", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MemberType.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MemberType.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MembershipPlan_1.MembershipPlan, (plan) => plan.member_type),
    __metadata("design:type", Array)
], MemberType.prototype, "membership_plans", void 0);
exports.MemberType = MemberType = __decorate([
    (0, typeorm_1.Entity)('member_types'),
    (0, typeorm_1.Unique)(['code'])
], MemberType);
//# sourceMappingURL=MemberType.js.map