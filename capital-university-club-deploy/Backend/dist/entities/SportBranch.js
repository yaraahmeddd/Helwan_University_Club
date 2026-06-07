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
exports.SportBranch = void 0;
const typeorm_1 = require("typeorm");
const Sport_1 = require("./Sport");
const Branch_1 = require("./Branch");
const Staff_1 = require("./Staff");
/**
 * SportBranch Entity
 *
 * Represents the many-to-many relationship between Sports and Branches.
 * A sport can exist in multiple branches, and a branch can have multiple sports.
 * This allows configuration of which sports are available in which branches.
 */
let SportBranch = class SportBranch {
};
exports.SportBranch = SportBranch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SportBranch.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SportBranch.prototype, "sport_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SportBranch.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SportBranch.prototype, "created_by_staff_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'active' }),
    __metadata("design:type", String)
], SportBranch.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], SportBranch.prototype, "status_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SportBranch.prototype, "is_enrollment_open", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], SportBranch.prototype, "enrollment_start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], SportBranch.prototype, "enrollment_end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SportBranch.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SportBranch.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sport_1.Sport, { eager: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sport_id' }),
    __metadata("design:type", Sport_1.Sport)
], SportBranch.prototype, "sport", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Branch_1.Branch, { eager: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'branch_id' }),
    __metadata("design:type", Branch_1.Branch)
], SportBranch.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_staff_id' }),
    __metadata("design:type", Staff_1.Staff)
], SportBranch.prototype, "created_by", void 0);
exports.SportBranch = SportBranch = __decorate([
    (0, typeorm_1.Entity)('sport_branches'),
    (0, typeorm_1.Index)('idx_sport_branch_status', ['status']),
    (0, typeorm_1.Index)('idx_sport_branches_sport_id', ['sport_id']),
    (0, typeorm_1.Index)('idx_sport_branches_branch_id', ['branch_id']),
    (0, typeorm_1.Unique)(['sport_id', 'branch_id']) // Ensure each sport-branch combination is unique
], SportBranch);
//# sourceMappingURL=SportBranch.js.map