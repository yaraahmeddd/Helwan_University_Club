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
exports.TeamTrainingSchedule = void 0;
const typeorm_1 = require("typeorm");
const Team_1 = require("./Team");
const Sport_1 = require("./Sport");
const Attendance_1 = require("./Attendance");
const Field_1 = require("./Field");
let TeamTrainingSchedule = class TeamTrainingSchedule {
};
exports.TeamTrainingSchedule = TeamTrainingSchedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TeamTrainingSchedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TeamTrainingSchedule.prototype, "team_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Team_1.Team, (team) => team.training_schedules, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", Team_1.Team)
], TeamTrainingSchedule.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], TeamTrainingSchedule.prototype, "sport_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sport_1.Sport, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sport_id' }),
    __metadata("design:type", Object)
], TeamTrainingSchedule.prototype, "sport", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TeamTrainingSchedule.prototype, "days_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TeamTrainingSchedule.prototype, "days_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], TeamTrainingSchedule.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], TeamTrainingSchedule.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], TeamTrainingSchedule.prototype, "field_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Field_1.Field, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'field_id' }),
    __metadata("design:type", Object)
], TeamTrainingSchedule.prototype, "field", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], TeamTrainingSchedule.prototype, "training_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: 'active',
        enum: ['active', 'inactive', 'archived'],
    }),
    __metadata("design:type", String)
], TeamTrainingSchedule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TeamTrainingSchedule.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TeamTrainingSchedule.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Attendance_1.Attendance, (attendance) => attendance.training_schedule),
    __metadata("design:type", Array)
], TeamTrainingSchedule.prototype, "attendances", void 0);
exports.TeamTrainingSchedule = TeamTrainingSchedule = __decorate([
    (0, typeorm_1.Entity)('team_training_schedules')
], TeamTrainingSchedule);
//# sourceMappingURL=TeamTrainingSchedule.js.map