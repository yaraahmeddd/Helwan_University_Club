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
exports.Sport = void 0;
const typeorm_1 = require("typeorm");
const Staff_1 = require("./Staff");
const Team_1 = require("./Team");
const TeamTrainingSchedule_1 = require("./TeamTrainingSchedule");
let Sport = class Sport {
};
exports.Sport = Sport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Sport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Sport.prototype, "name_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Sport.prototype, "name_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], Sport.prototype, "description_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], Sport.prototype, "description_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Sport.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], Sport.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Sport.prototype, "created_by_staff_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_staff_id' }),
    __metadata("design:type", Staff_1.Staff)
], Sport.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Sport.prototype, "approved_by_staff_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by_staff_id' }),
    __metadata("design:type", Object)
], Sport.prototype, "approved_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Sport.prototype, "approved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Sport.prototype, "approval_comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Sport.prototype, "sport_image", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Sport.prototype, "max_participants", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Sport.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Sport.prototype, "requires_booking", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Team_1.Team, (team) => team.sport),
    __metadata("design:type", Array)
], Sport.prototype, "teams", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TeamTrainingSchedule_1.TeamTrainingSchedule, (schedule) => schedule.sport),
    __metadata("design:type", Array)
], Sport.prototype, "training_schedules", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Sport.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Sport.prototype, "updated_at", void 0);
exports.Sport = Sport = __decorate([
    (0, typeorm_1.Entity)('sports')
], Sport);
//# sourceMappingURL=Sport.js.map