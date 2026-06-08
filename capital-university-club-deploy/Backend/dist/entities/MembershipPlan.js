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
exports.MembershipPlan = void 0;
const typeorm_1 = require("typeorm");
const MemberType_1 = require("./MemberType");
const MemberMembership_1 = require("./MemberMembership");
let MembershipPlan = class MembershipPlan {
};
exports.MembershipPlan = MembershipPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MembershipPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MembershipPlan.prototype, "member_type_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], MembershipPlan.prototype, "plan_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], MembershipPlan.prototype, "name_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], MembershipPlan.prototype, "name_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MembershipPlan.prototype, "description_en", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 4000, nullable: true }),
    __metadata("design:type", String)
], MembershipPlan.prototype, "description_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], MembershipPlan.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'EGP' }),
    __metadata("design:type", String)
], MembershipPlan.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MembershipPlan.prototype, "duration_months", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], MembershipPlan.prototype, "renewal_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MembershipPlan.prototype, "is_installable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], MembershipPlan.prototype, "max_installments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], MembershipPlan.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MembershipPlan.prototype, "is_for_foreigner", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], MembershipPlan.prototype, "min_age", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], MembershipPlan.prototype, "max_age", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MembershipPlan.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MembershipPlan.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MemberType_1.MemberType, (type) => type.membership_plans),
    (0, typeorm_1.JoinColumn)({ name: 'member_type_id' }),
    __metadata("design:type", MemberType_1.MemberType)
], MembershipPlan.prototype, "member_type", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MemberMembership_1.MemberMembership, (mem) => mem.membership_plan),
    __metadata("design:type", Array)
], MembershipPlan.prototype, "member_memberships", void 0);
exports.MembershipPlan = MembershipPlan = __decorate([
    (0, typeorm_1.Entity)('membership_plans'),
    (0, typeorm_1.Unique)(['plan_code'])
], MembershipPlan);
//# sourceMappingURL=MembershipPlan.js.map