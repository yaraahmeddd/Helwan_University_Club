import { AppDataSource } from '../database/data-source';
import { StaffType } from '../entities/StaffType';

type CacheEntry = { value: StaffType | null; loadedAt: number };

const TTL_MS = 10 * 60 * 1000;
const byId = new Map<number, CacheEntry>();
let allLoadedAt = 0;

function isFresh(loadedAt: number): boolean {
  return Date.now() - loadedAt < TTL_MS;
}

async function loadAll(): Promise<void> {
  const repo = AppDataSource.getRepository(StaffType);
  const rows = await repo.find();
  byId.clear();
  const now = Date.now();
  for (const row of rows) {
    byId.set(row.id, { value: row, loadedAt: now });
  }
  allLoadedAt = now;
}

export async function getStaffTypeById(id: number | null | undefined): Promise<StaffType | null> {
  if (id == null) return null;
  const cached = byId.get(id);
  if (cached && isFresh(cached.loadedAt)) return cached.value;

  if (!isFresh(allLoadedAt)) {
    await loadAll();
    return byId.get(id)?.value ?? null;
  }

  const repo = AppDataSource.getRepository(StaffType);
  const row = await repo.findOne({ where: { id } });
  byId.set(id, { value: row, loadedAt: Date.now() });
  return row;
}

export async function getStaffTypeCodeById(id: number | null | undefined): Promise<string> {
  const row = await getStaffTypeById(id);
  return row?.code ?? '';
}

export function invalidateStaffTypeCache(): void {
  byId.clear();
  allLoadedAt = 0;
}
