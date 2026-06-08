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
exports.Team = void 0;
const typeorm_1 = require("typeorm");
const Sport_1 = require("./Sport");
const Branch_1 = require("./Branch");
const Field_1 = require("./Field");
const TeamTrainingSchedule_1 = require("./TeamTrainingSchedule");
const TeamMemberTeam_1 = require("./TeamMemberTeam");
const TeamEnums_1 = require("../constants/TeamEnums");
let Team = class Team {
};
exports.Team = Team;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Team.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Team.prototype, "sport_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sport_1.Sport, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sport_id' }),
    __metadata("design:type", Sport_1.Sport)
], Team.prototype, "sport", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Team.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Branch_1.Branch, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'branch_id' }),
    __metadata("design:type", Object)
], Team.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Team.prototype, "field_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Field_1.Field, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'field_id' }),
    __metadata("design:type", Object)
], Team.prototype, "field", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Team.prototype, "name_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Team.prototype, "name_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 20 }),
    __metadata("design:type", Number)
], Team.prototype, "max_participants", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: TeamEnums_1.TeamStatus.ACTIVE,
        enum: Object.values(TeamEnums_1.TeamStatus),
    }),
    __metadata("design:type", String)
], Team.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: TeamEnums_1.TeamVisibilityType.BOTH,
        enum: Object.values(TeamEnums_1.TeamVisibilityType),
        comment: 'INTERNAL | EXTERNAL | BOTH',
    }),
    __metadata("design:type", String)
], Team.prototype, "visibility_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Team.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Team.prototype, "subscription_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Team.prototype, "approval_required", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Team.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Team.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TeamTrainingSchedule_1.TeamTrainingSchedule, (schedule) => schedule.team),
    __metadata("design:type", Array)
], Team.prototype, "training_schedules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TeamMemberTeam_1.TeamMemberTeam, (teamMemberTeam) => teamMemberTeam.team),
    __metadata("design:type", Array)
], Team.prototype, "team_member_teams", void 0);
exports.Team = Team = __decorate([
    (0, typeorm_1.Entity)('teams')
], Team);
//# sourceMappingURL=Team.js.map