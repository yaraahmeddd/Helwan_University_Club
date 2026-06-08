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
exports.Advertisement = void 0;
const typeorm_1 = require("typeorm");
const Staff_1 = require("./Staff");
const AdvertisementPhoto_1 = require("./AdvertisementPhoto");
const AdvertisementCategory_1 = require("./AdvertisementCategory");
let Advertisement = class Advertisement {
};
exports.Advertisement = Advertisement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Advertisement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Advertisement.prototype, "title_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Advertisement.prototype, "title_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Advertisement.prototype, "description_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Advertisement.prototype, "description_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Advertisement.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Advertisement.prototype, "approval_status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => AdvertisementCategory_1.AdvertisementCategory, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", AdvertisementCategory_1.AdvertisementCategory)
], Advertisement.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Advertisement.prototype, "category_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", Staff_1.Staff)
], Advertisement.prototype, "created_by_staff", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Advertisement.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Staff_1.Staff, { nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", Object)
], Advertisement.prototype, "approved_by_staff", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Advertisement.prototype, "approved_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Advertisement.prototype, "approved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], Advertisement.prototype, "approval_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Advertisement.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Advertisement.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Advertisement.prototype, "is_featured", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Advertisement.prototype, "view_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Advertisement.prototype, "click_count", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Advertisement.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Advertisement.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AdvertisementPhoto_1.AdvertisementPhoto, (photo) => photo.advertisement, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Advertisement.prototype, "photos", void 0);
exports.Advertisement = Advertisement = __decorate([
    (0, typeorm_1.Entity)('advertisements')
], Advertisement);
//# sourceMappingURL=Advertisement.js.map