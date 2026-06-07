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
exports.EmployeeDetail = void 0;
const typeorm_1 = require("typeorm");
const Member_1 = require("./Member");
const Profession_1 = require("./Profession");
let EmployeeDetail = class EmployeeDetail {
};
exports.EmployeeDetail = EmployeeDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmployeeDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EmployeeDetail.prototype, "member_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EmployeeDetail.prototype, "profession_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeDetail.prototype, "department_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeDetail.prototype, "department_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeDetail.prototype, "salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeDetail.prototype, "salary_slip", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], EmployeeDetail.prototype, "employment_start_date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeDetail.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeDetail.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Member_1.Member),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", Member_1.Member)
], EmployeeDetail.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Profession_1.Profession, (prof) => prof.employee_details),
    (0, typeorm_1.JoinColumn)({ name: 'profession_id' }),
    __metadata("design:type", Profession_1.Profession)
], EmployeeDetail.prototype, "profession", void 0);
exports.EmployeeDetail = EmployeeDetail = __decorate([
    (0, typeorm_1.Entity)('employee_details'),
    (0, typeorm_1.Unique)(['member_id']),
    (0, typeorm_1.Index)('idx_employee_member', ['member_id']),
    (0, typeorm_1.Index)('idx_employee_profession', ['profession_id'])
], EmployeeDetail);
//# sourceMappingURL=EmployeeDetail.js.map