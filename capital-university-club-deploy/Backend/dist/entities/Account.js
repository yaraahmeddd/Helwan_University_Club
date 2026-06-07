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
exports.Account = void 0;
const typeorm_1 = require("typeorm");
const Member_1 = require("./Member");
const TeamMember_1 = require("./TeamMember");
const ActivityLog_1 = require("./ActivityLog");
let Account = class Account {
};
exports.Account = Account;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Account.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Account.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Account.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'member' }),
    __metadata("design:type", String)
], Account.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'pending' }),
    __metadata("design:type", String)
], Account.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Account.prototype, "last_login", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Account.prototype, "password_changed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Account.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Account.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Account.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Member_1.Member, (member) => member.account),
    __metadata("design:type", Member_1.Member)
], Account.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => TeamMember_1.TeamMember, (teamMember) => teamMember.account),
    __metadata("design:type", TeamMember_1.TeamMember)
], Account.prototype, "team_member", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ActivityLog_1.ActivityLog, (log) => log.member),
    __metadata("design:type", Array)
], Account.prototype, "activity_logs", void 0);
exports.Account = Account = __decorate([
    (0, typeorm_1.Entity)('accounts'),
    (0, typeorm_1.Unique)(['email']),
    (0, typeorm_1.Index)('idx_account_email', ['email'])
], Account);
//# sourceMappingURL=Account.js.map