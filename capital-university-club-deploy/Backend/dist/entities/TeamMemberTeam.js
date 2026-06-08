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
exports.TeamMemberTeam = void 0;
const typeorm_1 = require("typeorm");
const TeamMember_1 = require("./TeamMember");
const Team_1 = require("./Team");
const Payment_1 = require("./Payment");
let TeamMemberTeam = class TeamMemberTeam {
};
exports.TeamMemberTeam = TeamMemberTeam;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TeamMemberTeam.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TeamMemberTeam.prototype, "team_member_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], TeamMemberTeam.prototype, "team_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], TeamMemberTeam.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], TeamMemberTeam.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'pending', comment: 'pending, approved, declined, cancelled, active, inactive' }),
    __metadata("design:type", String)
], TeamMemberTeam.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'pending_payment', comment: 'pending_payment, pending_admin_approval, active, cancelled, expired' }),
    __metadata("design:type", String)
], TeamMemberTeam.prototype, "subscription_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeam.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeam.prototype, "payment_reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeam.prototype, "payment_completed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeam.prototype, "admin_approved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], TeamMemberTeam.prototype, "approved_by_staff_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], TeamMemberTeam.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TeamMemberTeam.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TeamMemberTeam.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TeamMember_1.TeamMember, (teamMember) => teamMember.team_member_teams),
    (0, typeorm_1.JoinColumn)({ name: 'team_member_id' }),
    __metadata("design:type", TeamMember_1.TeamMember)
], TeamMemberTeam.prototype, "team_member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Team_1.Team, (team) => team.id),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", Team_1.Team)
], TeamMemberTeam.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Payment_1.Payment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'payment_id' }),
    __metadata("design:type", Payment_1.Payment)
], TeamMemberTeam.prototype, "payment", void 0);
exports.TeamMemberTeam = TeamMemberTeam = __decorate([
    (0, typeorm_1.Entity)('team_member_teams'),
    (0, typeorm_1.Index)('idx_team_member_teams_team_member_id', ['team_member_id']),
    (0, typeorm_1.Index)('idx_team_member_teams_team_id', ['team_id'])
], TeamMemberTeam);
//# sourceMappingURL=TeamMemberTeam.js.map