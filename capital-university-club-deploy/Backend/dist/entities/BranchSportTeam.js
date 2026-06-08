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
exports.BranchSportTeam = void 0;
const typeorm_1 = require("typeorm");
const Branch_1 = require("./Branch");
const Sport_1 = require("./Sport");
const Staff_1 = require("./Staff");
const MemberTeamSubscription_1 = require("./MemberTeamSubscription");
const TeamMemberTeamSubscription_1 = require("./TeamMemberTeamSubscription");
/**
 * BranchSportTeam Entity
 *
 * Represents the hierarchical structure:
 * Branch -> Sport -> Team
 *
 * Each team belongs to:
 * - Exactly one Branch
 * - Exactly one Sport (within that branch)
 *
 * Each team has:
 * - Specific training days (e.g., Sunday, Tuesday, Thursday)
 * - Start and end times (e.g., 8 PM - 10 PM)
 * - Monthly fee for subscription
 * - Maximum participants
 * - Status (pending, active, inactive, archived)
 */
let BranchSportTeam = class BranchSportTeam {
};
exports.BranchSportTeam = BranchSportTeam;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BranchSportTeam.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BranchSportTeam.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BranchSportTeam.prototype, "sport_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BranchSportTeam.prototype, "created_by_staff_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], BranchSportTeam.prototype, "name_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], BranchSportTeam.prototype, "name_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], BranchSportTeam.prototype, "description_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], BranchSportTeam.prototype, "description_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], BranchSportTeam.prototype, "training_days", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], BranchSportTeam.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], BranchSportTeam.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], BranchSportTeam.prototype, "monthly_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], BranchSportTeam.prototype, "registration_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], BranchSportTeam.prototype, "max_participants", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], BranchSportTeam.prototype, "current_participants", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], BranchSportTeam.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], BranchSportTeam.prototype, "status_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], BranchSportTeam.prototype, "approved_by_staff_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], BranchSportTeam.prototype, "approved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], BranchSportTeam.prototype, "approval_comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], BranchSportTeam.prototype, "team_image", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], BranchSportTeam.prototype, "min_age", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], BranchSportTeam.prototype, "max_age", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BranchSportTeam.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BranchSportTeam.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BranchSportTeam.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Branch_1.Branch, { eager: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'branch_id' }),
    __metadata("design:type", Branch_1.Branch)
], BranchSportTeam.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sport_1.Sport, { eager: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sport_id' }),
    __metadata("design:type", Sport_1.Sport)
], BranchSportTeam.prototype, "sport", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_staff_id' }),
    __metadata("design:type", Staff_1.Staff)
], BranchSportTeam.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by_staff_id' }),
    __metadata("design:type", Object)
], BranchSportTeam.prototype, "approved_by", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MemberTeamSubscription_1.MemberTeamSubscription, (sub) => sub.team, { eager: false }),
    __metadata("design:type", Array)
], BranchSportTeam.prototype, "member_subscriptions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TeamMemberTeamSubscription_1.TeamMemberTeamSubscription, (sub) => sub.team, { eager: false }),
    __metadata("design:type", Array)
], BranchSportTeam.prototype, "team_member_subscriptions", void 0);
exports.BranchSportTeam = BranchSportTeam = __decorate([
    (0, typeorm_1.Entity)('branch_sport_teams'),
    (0, typeorm_1.Index)('idx_branch_sport_team_status', ['status']),
    (0, typeorm_1.Index)('idx_branch_sport_team_branch_id', ['branch_id']),
    (0, typeorm_1.Index)('idx_branch_sport_team_sport_id', ['sport_id']),
    (0, typeorm_1.Index)('idx_branch_sport_team_composite', ['branch_id', 'sport_id'])
], BranchSportTeam);
//# sourceMappingURL=BranchSportTeam.js.map