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
exports.MemberRelationship = void 0;
const typeorm_1 = require("typeorm");
const Member_1 = require("./Member");
let MemberRelationship = class MemberRelationship {
};
exports.MemberRelationship = MemberRelationship;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MemberRelationship.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MemberRelationship.prototype, "member_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MemberRelationship.prototype, "related_member_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], MemberRelationship.prototype, "relationship_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], MemberRelationship.prototype, "relationship_name_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MemberRelationship.prototype, "is_dependent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], MemberRelationship.prototype, "age_group", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MemberRelationship.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Member_1.Member, (member) => member.relationships),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", Member_1.Member)
], MemberRelationship.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Member_1.Member),
    (0, typeorm_1.JoinColumn)({ name: 'related_member_id' }),
    __metadata("design:type", Member_1.Member)
], MemberRelationship.prototype, "related_member", void 0);
exports.MemberRelationship = MemberRelationship = __decorate([
    (0, typeorm_1.Entity)('member_relationships'),
    (0, typeorm_1.Index)('idx_relationship_member', ['member_id']),
    (0, typeorm_1.Index)('idx_relationship_related', ['related_member_id'])
], MemberRelationship);
//# sourceMappingURL=MemberRelationship.js.map