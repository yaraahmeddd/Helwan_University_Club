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
exports.Field = void 0;
const typeorm_1 = require("typeorm");
const Sport_1 = require("./Sport");
const Branch_1 = require("./Branch");
const FieldOperatingHours_1 = require("./FieldOperatingHours");
let Field = class Field {
};
exports.Field = Field;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Field.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, name: "name_en" }),
    __metadata("design:type", String)
], Field.prototype, "name_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, name: "name_ar" }),
    __metadata("design:type", String)
], Field.prototype, "name_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "description_en" }),
    __metadata("design:type", Object)
], Field.prototype, "description_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "description_ar" }),
    __metadata("design:type", Object)
], Field.prototype, "description_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", name: "sport_id" }),
    __metadata("design:type", Number)
], Field.prototype, "sport_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sport_1.Sport),
    (0, typeorm_1.JoinColumn)({ name: "sport_id" }),
    __metadata("design:type", Sport_1.Sport)
], Field.prototype, "sport", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: true, name: "capacity" }),
    __metadata("design:type", Object)
], Field.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: true, name: "branch_id" }),
    __metadata("design:type", Object)
], Field.prototype, "branch_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Branch_1.Branch, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "branch_id" }),
    __metadata("design:type", Object)
], Field.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        length: 20,
        default: "active",
        name: "status",
    }),
    __metadata("design:type", String)
], Field.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", precision: 10, scale: 2, nullable: true, name: "hourly_rate" }),
    __metadata("design:type", Object)
], Field.prototype, "hourly_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: true,
        name: "is_available_for_booking",
        comment: "Whether this field can be booked by members/team members"
    }),
    __metadata("design:type", Boolean)
], Field.prototype, "is_available_for_booking", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        default: 60,
        name: "booking_slot_duration",
        comment: "Booking time slot duration in minutes (e.g., 60 for 1-hour slots)"
    }),
    __metadata("design:type", Number)
], Field.prototype, "booking_slot_duration", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FieldOperatingHours_1.FieldOperatingHours, (hours) => hours.field, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Field.prototype, "operating_hours", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Field.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Field.prototype, "updated_at", void 0);
exports.Field = Field = __decorate([
    (0, typeorm_1.Entity)("fields"),
    (0, typeorm_1.Index)("idx_fields_sport_id", ["sport_id"]),
    (0, typeorm_1.Index)("idx_fields_branch_id", ["branch_id"]),
    (0, typeorm_1.Index)("idx_fields_status", ["status"])
], Field);
//# sourceMappingURL=Field.js.map