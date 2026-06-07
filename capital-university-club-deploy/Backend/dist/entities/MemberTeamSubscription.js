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
exports.MemberTeamSubscription = void 0;
const typeorm_1 = require("typeorm");
const Member_1 = require("./Member");
const BranchSportTeam_1 = require("./BranchSportTeam");
const Staff_1 = require("./Staff");
const Announcement_1 = require("./Announcement");
/**
 * MemberTeamSubscription Entity
 *
 * Tracks member subscriptions to specific team(s).
 * A member can subscribe to multiple teams across different sports and branches.
 */
let MemberTeamSubscription = class MemberTeamSubscription {
};
exports.MemberTeamSubscription = MemberTeamSubscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MemberTeamSubscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MemberTeamSubscription.prototype, "member_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MemberTeamSubscription.prototype, "team_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "created_by_staff_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "approved_by_staff_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "announcement_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], MemberTeamSubscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "decline_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "cancellation_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "approved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "declined_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "cancelled_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], MemberTeamSubscription.prototype, "monthly_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "registration_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MemberTeamSubscription.prototype, "discount_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "custom_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'unpaid' }),
    __metadata("design:type", String)
], MemberTeamSubscription.prototype, "payment_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "approval_notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MemberTeamSubscription.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MemberTeamSubscription.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Member_1.Member, { eager: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", Member_1.Member)
], MemberTeamSubscription.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => BranchSportTeam_1.BranchSportTeam, (team) => team.member_subscriptions, {
        eager: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", BranchSportTeam_1.BranchSportTeam)
], MemberTeamSubscription.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_staff_id' }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by_staff_id' }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "approved_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Announcement_1.Announcement, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'announcement_id' }),
    __metadata("design:type", Object)
], MemberTeamSubscription.prototype, "announcement", void 0);
exports.MemberTeamSubscription = MemberTeamSubscription = __decorate([
    (0, typeorm_1.Entity)('member_team_subscriptions'),
    (0, typeorm_1.Index)('idx_mts_member_id', ['member_id']),
    (0, typeorm_1.Index)('idx_mts_team_id', ['team_id']),
    (0, typeorm_1.Index)('idx_mts_status', ['status']),
    (0, typeorm_1.Index)('idx_mts_created_at', ['created_at']),
    (0, typeorm_1.Index)('idx_mts_member_status', ['member_id', 'status']),
    (0, typeorm_1.Index)('idx_mts_team_status', ['team_id', 'status'])
], MemberTeamSubscription);
//# sourceMappingURL=MemberTeamSubscription.js.map