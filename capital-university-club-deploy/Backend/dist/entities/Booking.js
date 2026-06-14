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
exports.Booking = void 0;
const typeorm_1 = require("typeorm");
const BookingParticipant_1 = require("./BookingParticipant");
const Sport_1 = require("./Sport");
const Field_1 = require("./Field");
const Member_1 = require("./Member");
const TeamMember_1 = require("./TeamMember");
let Booking = class Booking {
};
exports.Booking = Booking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Booking.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: true, name: "member_id" }),
    __metadata("design:type", Object)
], Booking.prototype, "member_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: true, name: "team_member_id" }),
    __metadata("design:type", Object)
], Booking.prototype, "team_member_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", name: "sport_id" }),
    __metadata("design:type", Number)
], Booking.prototype, "sport_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sport_1.Sport, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "sport_id" }),
    __metadata("design:type", Sport_1.Sport)
], Booking.prototype, "sport", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", name: "field_id" }),
    __metadata("design:type", String)
], Booking.prototype, "field_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Field_1.Field, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "field_id" }),
    __metadata("design:type", Field_1.Field)
], Booking.prototype, "field", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Member_1.Member, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "member_id" }),
    __metadata("design:type", Object)
], Booking.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TeamMember_1.TeamMember, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "team_member_id" }),
    __metadata("design:type", Object)
], Booking.prototype, "team_member", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", name: "start_time" }),
    __metadata("design:type", Date)
], Booking.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", name: "end_time" }),
    __metadata("design:type", Date)
], Booking.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", name: "duration_minutes", nullable: true }),
    __metadata("design:type", Number)
], Booking.prototype, "duration_minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0, name: "price" }),
    __metadata("design:type", Number)
], Booking.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, default: "pending_payment", name: "status" }),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, name: "payment_reference" }),
    __metadata("design:type", Object)
], Booking.prototype, "payment_reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "payment_completed_at" }),
    __metadata("design:type", Object)
], Booking.prototype, "payment_completed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, unique: true, name: "share_token" }),
    __metadata("design:type", String)
], Booking.prototype, "share_token", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: 1, name: "expected_participants" }),
    __metadata("design:type", Number)
], Booking.prototype, "expected_participants", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "uses_parking" }),
    __metadata("design:type", Boolean)
], Booking.prototype, "uses_parking", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: 0, name: "parking_cars_count" }),
    __metadata("design:type", Number)
], Booking.prototype, "parking_cars_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "notes" }),
    __metadata("design:type", Object)
], Booking.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 2, default: "ar", name: "language" }),
    __metadata("design:type", String)
], Booking.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "cancelled_at" }),
    __metadata("design:type", Object)
], Booking.prototype, "cancelled_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "completed_at" }),
    __metadata("design:type", Object)
], Booking.prototype, "completed_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Booking.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Booking.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => BookingParticipant_1.BookingParticipant, (participant) => participant.booking, {
        cascade: ["insert", "update"],
    }),
    __metadata("design:type", Array)
], Booking.prototype, "participants", void 0);
exports.Booking = Booking = __decorate([
    (0, typeorm_1.Entity)("bookings"),
    (0, typeorm_1.Index)("idx_bookings_field_id", ["field_id"]),
    (0, typeorm_1.Index)("idx_bookings_status", ["status"]),
    (0, typeorm_1.Index)("idx_bookings_start_time", ["start_time"]),
    (0, typeorm_1.Index)("idx_bookings_member_id", ["member_id"]),
    (0, typeorm_1.Index)("idx_bookings_team_member_id", ["team_member_id"])
], Booking);
//# sourceMappingURL=Booking.js.map