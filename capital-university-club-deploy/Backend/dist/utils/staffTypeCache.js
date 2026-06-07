"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffTypeById = getStaffTypeById;
exports.getStaffTypeCodeById = getStaffTypeCodeById;
exports.invalidateStaffTypeCache = invalidateStaffTypeCache;
const data_source_1 = require("../database/data-source");
const StaffType_1 = require("../entities/StaffType");
const TTL_MS = 10 * 60 * 1000;
const byId = new Map();
let allLoadedAt = 0;
function isFresh(loadedAt) {
    return Date.now() - loadedAt < TTL_MS;
}
async function loadAll() {
    const repo = data_source_1.AppDataSource.getRepository(StaffType_1.StaffType);
    const rows = await repo.find();
    byId.clear();
    const now = Date.now();
    for (const row of rows) {
        byId.set(row.id, { value: row, loadedAt: now });
    }
    allLoadedAt = now;
}
async function getStaffTypeById(id) {
    if (id == null)
        return null;
    const cached = byId.get(id);
    if (cached && isFresh(cached.loadedAt))
        return cached.value;
    if (!isFresh(allLoadedAt)) {
        await loadAll();
        return byId.get(id)?.value ?? null;
    }
    const repo = data_source_1.AppDataSource.getRepository(StaffType_1.StaffType);
    const row = await repo.findOne({ where: { id } });
    byId.set(id, { value: row, loadedAt: Date.now() });
    return row;
}
async function getStaffTypeCodeById(id) {
    const row = await getStaffTypeById(id);
    return row?.code ?? '';
}
function invalidateStaffTypeCache() {
    byId.clear();
    allLoadedAt = 0;
}
//# sourceMappingURL=staffTypeCache.js.map