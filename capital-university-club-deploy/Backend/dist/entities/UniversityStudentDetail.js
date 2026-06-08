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
exports.UniversityStudentDetail = void 0;
const typeorm_1 = require("typeorm");
const Member_1 = require("./Member");
const Faculty_1 = require("./Faculty");
let UniversityStudentDetail = class UniversityStudentDetail {
};
exports.UniversityStudentDetail = UniversityStudentDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UniversityStudentDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UniversityStudentDetail.prototype, "member_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], UniversityStudentDetail.prototype, "faculty_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], UniversityStudentDetail.prototype, "graduation_year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], UniversityStudentDetail.prototype, "enrollment_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UniversityStudentDetail.prototype, "student_proof", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UniversityStudentDetail.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UniversityStudentDetail.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Member_1.Member),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", Member_1.Member)
], UniversityStudentDetail.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Faculty_1.Faculty, (fac) => fac.university_student_details),
    (0, typeorm_1.JoinColumn)({ name: 'faculty_id' }),
    __metadata("design:type", Faculty_1.Faculty)
], UniversityStudentDetail.prototype, "faculty", void 0);
exports.UniversityStudentDetail = UniversityStudentDetail = __decorate([
    (0, typeorm_1.Entity)('university_student_details'),
    (0, typeorm_1.Unique)(['member_id']),
    (0, typeorm_1.Index)('idx_uni_student_member', ['member_id'])
], UniversityStudentDetail);
//# sourceMappingURL=UniversityStudentDetail.js.map