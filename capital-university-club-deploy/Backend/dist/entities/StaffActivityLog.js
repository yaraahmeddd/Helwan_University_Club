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
exports.StaffActivityLog = void 0;
const typeorm_1 = require("typeorm");
const Staff_1 = require("./Staff");
/**
 * StaffActivityLog Entity
 *
 * Tracks all significant actions performed on staff accounts:
 * - Account creation
 * - Privilege assignments/changes
 * - Account deactivation
 * - Password changes
 * - Status changes
 *
 * Used for audit trails and activity monitoring.
 */
let StaffActivityLog = class StaffActivityLog {
};
exports.StaffActivityLog = StaffActivityLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StaffActivityLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], StaffActivityLog.prototype, "staff_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'staff_id' }),
    __metadata("design:type", Staff_1.Staff)
], StaffActivityLog.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], StaffActivityLog.prototype, "action_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], StaffActivityLog.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], StaffActivityLog.prototype, "performed_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StaffActivityLog.prototype, "created_at", void 0);
exports.StaffActivityLog = StaffActivityLog = __decorate([
    (0, typeorm_1.Entity)('staff_activity_logs')
], StaffActivityLog);
//# sourceMappingURL=StaffActivityLog.js.map