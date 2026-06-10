import { resolveFileUrl } from '../utils/fileUrl';

const LEGACY_ASSET_PREFIX = '/assets/';

/** Default sport icon paths keyed by English sport name. */
export const SPORT_IMAGE_BY_NAME_EN: Record<string, string> = {
  Tennis: 'uploads/sports/table-tennis.svg',
  Swimming: 'uploads/sports/swimming.svg',
  Judo: 'uploads/sports/aikido.svg',
  Karate: 'uploads/sports/aikido.svg',
  Squash: 'uploads/sports/table-tennis.svg',
  Snooker: 'uploads/sports/bowling.svg',
  Chess: 'uploads/sports/bowling.svg',
  Athletics: 'uploads/sports/archery.svg',
  Yoga: 'uploads/sports/aikido.svg',
  Football: 'uploads/sports/default.svg',
  Basketball: 'uploads/sports/default.svg',
  Volleyball: 'uploads/sports/default.svg',
};

const GENERIC_IMAGE_MARKERS = ['speed-ball', 'default.svg'];

function catalogPathForName(nameEn?: string | null): string | undefined {
  if (!nameEn?.trim()) return undefined;
  return SPORT_IMAGE_BY_NAME_EN[nameEn.trim()];
}

function isGenericSportImage(path: string): boolean {
  const lower = path.toLowerCase();
  return GENERIC_IMAGE_MARKERS.some((marker) => lower.includes(marker));
}

/** Resolve sport image paths from DB, uploads, base64, or legacy frontend /assets URLs. */
export function resolveSportImageUrl(raw?: string | null): string | undefined {
  if (!raw?.trim()) return undefined;

  const value = raw.trim();
  if (value.startsWith('data:')) return value;

  if (value.startsWith(LEGACY_ASSET_PREFIX)) {
    const fileName = value.slice(LEGACY_ASSET_PREFIX.length).replace(/\\/g, '/');
    return resolveFileUrl(`uploads/sports/${fileName}`) ?? resolveFileUrl(`uploads/sports/${fileName.toLowerCase()}`);
  }

  return resolveFileUrl(value);
}

/** Prefer the catalog icon for a sport when DB value is missing or a generic placeholder. */
export function resolveSportImageForSport(
  raw?: string | null,
  nameEn?: string | null,
): string | undefined {
  const catalogPath = catalogPathForName(nameEn);
  const trimmedRaw = raw?.trim();

  if (trimmedRaw?.startsWith('data:')) {
    return resolveSportImageUrl(trimmedRaw);
  }

  if (catalogPath) {
    const shouldPreferCatalog =
      !trimmedRaw ||
      (isGenericSportImage(trimmedRaw) && catalogPath !== trimmedRaw && !isGenericSportImage(catalogPath));

    if (shouldPreferCatalog) {
      return resolveFileUrl(catalogPath) ?? resolveSportImageUrl(catalogPath);
    }
  }

  return resolveSportImageUrl(trimmedRaw) ?? (catalogPath ? resolveFileUrl(catalogPath) : undefined);
}
