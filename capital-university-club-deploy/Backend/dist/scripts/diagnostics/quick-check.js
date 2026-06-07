"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function checkDetails() {
    try {
        // Let's try to find an ID first by listing or just guessing recent ones
        // In previous steps, ID 35 was mentioned.
        const ids = [26, 35, 36, 40, 41];
        for (const id of ids) {
            try {
                const res = await axios_1.default.get(`http://localhost:3000/api/register/team-member/details/${id}`);
                console.log(`\n--- Member ID: ${id} ---`);
                console.log(`Avatar: ${res.data.data?.avatar}`);
                console.log(`Photo: ${res.data.data?.photo}`);
                console.log(`Documents Avatar: ${res.data.data?.documents?.personal_photo_url}`);
                console.log(`Status: ${res.data.data?.status}`);
            }
            catch (e) {
                // skip
            }
        }
    }
    catch (err) {
        console.error('Error:', err.message);
    }
}
checkDetails();
//# sourceMappingURL=quick-check.js.map