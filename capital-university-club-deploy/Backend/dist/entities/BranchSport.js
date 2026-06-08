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
exports.BranchSport = void 0;
const typeorm_1 = require("typeorm");
const Branch_1 = require("./Branch");
const Sport_1 = require("./Sport");
/**
 * BranchSport Entity
 *
 * Represents a many-to-many relationship between Branches and Sports.
 * This allows filtering:
 * 1. By branch to see available sports
 * 2. By sport to see available branches
 *
 * Each branch can have multiple sports.
 * Each sport can be available in multiple branches.
 */
let BranchSport = class BranchSport {
};
exports.BranchSport = BranchSport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BranchSport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BranchSport.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BranchSport.prototype, "sport_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Branch_1.Branch, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'branch_id' }),
    __metadata("design:type", Branch_1.Branch)
], BranchSport.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sport_1.Sport, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sport_id' }),
    __metadata("design:type", Sport_1.Sport)
], BranchSport.prototype, "sport", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'active' }),
    __metadata("design:type", String)
], BranchSport.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BranchSport.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BranchSport.prototype, "updated_at", void 0);
exports.BranchSport = BranchSport = __decorate([
    (0, typeorm_1.Entity)('branch_sports'),
    (0, typeorm_1.Index)('idx_branch_sport_branch_id', ['branch_id']),
    (0, typeorm_1.Index)('idx_branch_sport_sport_id', ['sport_id']),
    (0, typeorm_1.Unique)(['branch_id', 'sport_id'])
], BranchSport);
//# sourceMappingURL=BranchSport.js.map