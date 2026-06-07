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
exports.AdvertisementPhoto = void 0;
const typeorm_1 = require("typeorm");
const Advertisement_1 = require("./Advertisement");
let AdvertisementPhoto = class AdvertisementPhoto {
};
exports.AdvertisementPhoto = AdvertisementPhoto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AdvertisementPhoto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Advertisement_1.Advertisement, (ad) => ad.photos, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'advertisement_id' }),
    __metadata("design:type", Advertisement_1.Advertisement)
], AdvertisementPhoto.prototype, "advertisement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AdvertisementPhoto.prototype, "advertisement_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], AdvertisementPhoto.prototype, "photo_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], AdvertisementPhoto.prototype, "original_filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], AdvertisementPhoto.prototype, "alt_text_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], AdvertisementPhoto.prototype, "alt_text_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AdvertisementPhoto.prototype, "display_order", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AdvertisementPhoto.prototype, "created_at", void 0);
exports.AdvertisementPhoto = AdvertisementPhoto = __decorate([
    (0, typeorm_1.Entity)('advertisement_photos')
], AdvertisementPhoto);
//# sourceMappingURL=AdvertisementPhoto.js.map