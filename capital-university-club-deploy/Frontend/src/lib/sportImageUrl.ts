import { resolveFileUrl } from '../utils/fileUrl';

const LEGACY_ASSET_PREFIX = '/assets/';

/** Default sport icon paths keyed by English sport name. */
export const SPORT_IMAGE_BY_NAME_EN: Record<string, string> = {
  Tennis: '/assets/Table-Tennis.svg',
  Swimming: '/assets/swimming.svg',
  Judo: '/assets/Aikido.svg',
  Karate: '/assets/Aikido.svg',
  Squash: '/assets/Table-Tennis.svg',
  Snooker: '/assets/Bowling.svg',
  Chess: '/assets/Bowling.svg',
  Athletics: '/assets/Archery.svg',
  Yoga: '/assets/Aikido.svg',
  Football: '/assets/speed-Ball.svg',
  Basketball: '/assets/speed-Ball.svg',
  Volleyball: '/assets/speed-Ball.svg',
};

const GENERIC_IMAGE_MARKERS = ['speed-ball', 'default.svg', 'speed-Ball.svg'];

/**
 * Map DB-stored `uploads/sports/X.svg` paths → frontend `/assets/` equivalents.
 * The backend seeds these paths but the SVG files only exist in the frontend public/assets dir.
 */
const DB_PATH_TO_ASSET: Record<string, string> = {
  'uploads/sports/table-tennis.svg': '/assets/Table-Tennis.svg',
  'uploads/sports/swimming.svg': '/assets/swimming.svg',
  'uploads/sports/aikido.svg': '/assets/Aikido.svg',
  'uploads/sports/bowling.svg': '/assets/Bowling.svg',
  'uploads/sports/archery.svg': '/assets/Archery.svg',
  'uploads/sports/default.svg': '/assets/speed-Ball.svg',
  'uploads/sports/speed-ball.svg': '/assets/speed-Ball.svg',
};

function catalogPathForName(nameEn?: string | null): string | undefined {
  if (!nameEn?.trim()) return undefined;
  return SPORT_IMAGE_BY_NAME_EN[nameEn.trim()];
}

function isGenericSportImage(path: string): boolean {
  const lower = path.toLowerCase();
  return GENERIC_IMAGE_MARKERS.some((marker) => lower.includes(marker.toLowerCase()));
}

/** Resolve sport image paths from DB, uploads, base64, or legacy frontend /assets URLs. */
export function resolveSportImageUrl(raw?: string | null): string | undefined {
  if (!raw?.trim()) return undefined;

  const value = raw.trim();
  if (value.startsWith('data:')) return value;

  // Already a frontend public asset
  if (value.startsWith(LEGACY_ASSET_PREFIX)) {
    return value;
  }

  // Check DB-stored `uploads/sports/` paths – map to frontend assets
  const lowerValue = value.toLowerCase().replace(/\\/g, '/');
  for (const [dbPath, assetPath] of Object.entries(DB_PATH_TO_ASSET)) {
    if (lowerValue === dbPath || lowerValue.endsWith('/' + dbPath) || lowerValue.includes(dbPath)) {
      return assetPath;
    }
  }

  // Otherwise resolve as a backend upload URL
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
      return catalogPath;
    }
  }

  return resolveSportImageUrl(trimmedRaw) ?? catalogPath;
}