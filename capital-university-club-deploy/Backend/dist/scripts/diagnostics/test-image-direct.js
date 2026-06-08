"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function testImage() {
    try {
        const url = 'http://localhost:3000/uploads/personal_photo-1771834501837-89984212.png';
        console.log(`Checking image: ${url}`);
        const res = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        console.log('Status:', res.status);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Size:', res.data.byteLength);
    }
    catch (err) {
        console.error('Error fetching image:', err.message);
    }
}
testImage();
//# sourceMappingURL=test-image-direct.js.map