"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../database/data-source");
async function listTables() {
    try {
        await data_source_1.AppDataSource.initialize();
        const tables = await data_source_1.AppDataSource.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables in database:');
        console.log(tables.map((t) => t.table_name));
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
listTables();
//# sourceMappingURL=list-tables.js.map