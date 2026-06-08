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
exports.TeamMemberTeamSubscription = void 0;
const typeorm_1 = require("typeorm");
const TeamMember_1 = require("./TeamMember");
const BranchSportTeam_1 = require("./BranchSportTeam");
const Staff_1 = require("./Staff");
const Announcement_1 = require("./Announcement");
/**
 * TeamMemberTeamSubscription Entity
 *
 * Tracks team member subscriptions to specific team(s).
 * A team member (athlete) can subscribe to multiple teams across different sports and branches.
 */
let TeamMemberTeamSubscription = class TeamMemberTeamSubscription {
};
exports.TeamMemberTeamSubscription = TeamMemberTeamSubscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TeamMemberTeamSubscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TeamMemberTeamSubscription.prototype, "team_member_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TeamMemberTeamSubscription.prototype, "team_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "created_by_staff_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "approved_by_staff_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "announcement_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], TeamMemberTeamSubscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "decline_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "cancellation_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "approved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "declined_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "cancelled_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], TeamMemberTeamSubscription.prototype, "monthly_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "registration_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], TeamMemberTeamSubscription.prototype, "discount_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "custom_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'unpaid' }),
    __metadata("design:type", String)
], TeamMemberTeamSubscription.prototype, "payment_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "approval_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "special_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TeamMemberTeamSubscription.prototype, "is_captain", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TeamMemberTeamSubscription.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TeamMemberTeamSubscription.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TeamMember_1.TeamMember, { eager: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'team_member_id' }),
    __metadata("design:type", TeamMember_1.TeamMember)
], TeamMemberTeamSubscription.prototype, "team_member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => BranchSportTeam_1.BranchSportTeam, (team) => team.team_member_subscriptions, {
        eager: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", BranchSportTeam_1.BranchSportTeam)
], TeamMemberTeamSubscription.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_staff_id' }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by_staff_id' }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "approved_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Announcement_1.Announcement, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'announcement_id' }),
    __metadata("design:type", Object)
], TeamMemberTeamSubscription.prototype, "announcement", void 0);
exports.TeamMemberTeamSubscription = TeamMemberTeamSubscription = __decorate([
    (0, typeorm_1.Entity)('team_member_team_subscriptions'),
    (0, typeorm_1.Index)('idx_tmts_team_member_id', ['team_member_id']),
    (0, typeorm_1.Index)('idx_tmts_team_id', ['team_id']),
    (0, typeorm_1.Index)('idx_tmts_status', ['status']),
    (0, typeorm_1.Index)('idx_tmts_created_at', ['created_at']),
    (0, typeorm_1.Index)('idx_tmts_team_member_status', ['team_member_id', 'status']),
    (0, typeorm_1.Index)('idx_tmts_team_status', ['team_id', 'status'])
], TeamMemberTeamSubscription);
//# sourceMappingURL=TeamMemberTeamSubscription.js.map