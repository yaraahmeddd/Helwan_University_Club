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
exports.FieldOperatingHours = void 0;
const typeorm_1 = require("typeorm");
const Field_1 = require("./Field");
let FieldOperatingHours = class FieldOperatingHours {
};
exports.FieldOperatingHours = FieldOperatingHours;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], FieldOperatingHours.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", name: "field_id" }),
    __metadata("design:type", String)
], FieldOperatingHours.prototype, "field_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Field_1.Field, (field) => field.operating_hours, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "field_id" }),
    __metadata("design:type", Field_1.Field)
], FieldOperatingHours.prototype, "field", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", name: "day_of_week" }),
    __metadata("design:type", Number)
], FieldOperatingHours.prototype, "day_of_week", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", name: "opening_time" }),
    __metadata("design:type", String)
], FieldOperatingHours.prototype, "opening_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", name: "closing_time" }),
    __metadata("design:type", String)
], FieldOperatingHours.prototype, "closing_time", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], FieldOperatingHours.prototype, "created_at", void 0);
exports.FieldOperatingHours = FieldOperatingHours = __decorate([
    (0, typeorm_1.Entity)("field_operating_hours"),
    (0, typeorm_1.Index)("idx_field_operating_hours_field_id", ["field_id"]),
    (0, typeorm_1.Unique)("uq_field_operating_hours_field_day", ["field_id", "day_of_week"])
], FieldOperatingHours);
//# sourceMappingURL=FieldOperatingHours.js.map