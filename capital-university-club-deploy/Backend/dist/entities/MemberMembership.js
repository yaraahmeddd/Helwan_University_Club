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
exports.MemberMembership = void 0;
const typeorm_1 = require("typeorm");
const Member_1 = require("./Member");
const MembershipPlan_1 = require("./MembershipPlan");
let MemberMembership = class MemberMembership {
};
exports.MemberMembership = MemberMembership;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MemberMembership.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MemberMembership.prototype, "member_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MemberMembership.prototype, "membership_plan_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], MemberMembership.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], MemberMembership.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'active' }),
    __metadata("design:type", String)
], MemberMembership.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'pending' }),
    __metadata("design:type", String)
], MemberMembership.prototype, "payment_status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MemberMembership.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MemberMembership.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Member_1.Member, (member) => member.memberships),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", Member_1.Member)
], MemberMembership.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MembershipPlan_1.MembershipPlan, (plan) => plan.member_memberships),
    (0, typeorm_1.JoinColumn)({ name: 'membership_plan_id' }),
    __metadata("design:type", MembershipPlan_1.MembershipPlan)
], MemberMembership.prototype, "membership_plan", void 0);
exports.MemberMembership = MemberMembership = __decorate([
    (0, typeorm_1.Entity)('member_memberships'),
    (0, typeorm_1.Index)('idx_membership_member', ['member_id']),
    (0, typeorm_1.Index)('idx_membership_status', ['status']),
    (0, typeorm_1.Index)('idx_membership_end_date', ['end_date'])
], MemberMembership);
//# sourceMappingURL=MemberMembership.js.map