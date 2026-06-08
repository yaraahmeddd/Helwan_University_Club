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
exports.BookingParticipant = void 0;
const typeorm_1 = require("typeorm");
const Booking_1 = require("./Booking");
let BookingParticipant = class BookingParticipant {
};
exports.BookingParticipant = BookingParticipant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], BookingParticipant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", name: "booking_id" }),
    __metadata("design:type", String)
], BookingParticipant.prototype, "booking_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Booking_1.Booking, (booking) => booking.participants, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "booking_id" }),
    __metadata("design:type", Booking_1.Booking)
], BookingParticipant.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, name: "full_name" }),
    __metadata("design:type", String)
], BookingParticipant.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true, name: "phone_number" }),
    __metadata("design:type", Object)
], BookingParticipant.prototype, "phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true, name: "national_id" }),
    __metadata("design:type", Object)
], BookingParticipant.prototype, "national_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, name: "email" }),
    __metadata("design:type", Object)
], BookingParticipant.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, name: "national_id_front" }),
    __metadata("design:type", Object)
], BookingParticipant.prototype, "national_id_front", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, name: "national_id_back" }),
    __metadata("design:type", Object)
], BookingParticipant.prototype, "national_id_back", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "is_creator" }),
    __metadata("design:type", Boolean)
], BookingParticipant.prototype, "is_creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], BookingParticipant.prototype, "created_at", void 0);
exports.BookingParticipant = BookingParticipant = __decorate([
    (0, typeorm_1.Entity)("booking_participants"),
    (0, typeorm_1.Index)("idx_booking_participants_booking_id", ["booking_id"]),
    (0, typeorm_1.Index)("idx_booking_participants_email", ["email"]),
    (0, typeorm_1.Index)("idx_booking_participants_national_id", ["national_id"])
], BookingParticipant);
//# sourceMappingURL=BookingParticipant.js.map