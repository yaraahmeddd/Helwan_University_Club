"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../database/data-source");
async function checkMemberTypes() {
    try {
        await data_source_1.AppDataSource.initialize();
        const types = await data_source_1.AppDataSource.query('SELECT * FROM member_types');
        console.log(JSON.stringify(types, null, 2));
        await data_source_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Error:', error);
    }
}
checkMemberTypes();
//# sourceMappingURL=check-member-types.js.map