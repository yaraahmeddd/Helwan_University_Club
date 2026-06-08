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
exports.RetiredEmployeeDetail = void 0;
const typeorm_1 = require("typeorm");
const Member_1 = require("./Member");
let RetiredEmployeeDetail = class RetiredEmployeeDetail {
};
exports.RetiredEmployeeDetail = RetiredEmployeeDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RetiredEmployeeDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RetiredEmployeeDetail.prototype, "member_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], RetiredEmployeeDetail.prototype, "profession_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], RetiredEmployeeDetail.prototype, "former_department_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], RetiredEmployeeDetail.prototype, "former_department_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], RetiredEmployeeDetail.prototype, "retirement_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], RetiredEmployeeDetail.prototype, "last_salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], RetiredEmployeeDetail.prototype, "salary_slip", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RetiredEmployeeDetail.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RetiredEmployeeDetail.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Member_1.Member),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", Member_1.Member)
], RetiredEmployeeDetail.prototype, "member", void 0);
exports.RetiredEmployeeDetail = RetiredEmployeeDetail = __decorate([
    (0, typeorm_1.Entity)('retired_employee_details'),
    (0, typeorm_1.Unique)(['member_id']),
    (0, typeorm_1.Index)('idx_retired_member', ['member_id'])
], RetiredEmployeeDetail);
//# sourceMappingURL=RetiredEmployeeDetail.js.map