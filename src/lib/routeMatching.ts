import { CommuteRoute, CorridorDriver, DeckFilters } from './types';

const CORRIDOR_KEYWORDS: readonly string[] = [
  'ajah',
  'lekki',
  'victoria island',
  'marina',
  'cms',
  'ikota',
  'vgc',
  'chevron',
  'jakande',
  'sangotedo',
  'yaba',
  'ikeja',
  'surulere',
  'ikoyi',
  'adeola',
  'admiralty',
];

const ISLAND_CORRIDOR_TOKENS = new Set([
  'ajah',
  'lekki',
  'victoria island',
  'vi',
  'ikota',
  'vgc',
  'chevron',
  'jakande',
  'sangotedo',
  'ikoyi',
  'marina',
  'cms',
  'adeola',
  'admiralty',
]);

/**
 * Extract canonical Lagos corridor keywords from a location string.
 */
export function normalizeCorridorTokens(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (const keyword of CORRIDOR_KEYWORDS) {
    if (lower.includes(keyword)) {
      found.add(keyword);
    }
  }

  // Handle "VI" as a standalone abbreviation and normalize to "victoria island"
  if (/\bvi\b/.test(lower)) {
    found.add('victoria island');
    found.add('vi');
  } else if (found.has('victoria island')) {
    found.add('vi');
  }

  return Array.from(found);
}

function hasTokenOverlap(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const setB = new Set(b);
  return a.some((token) => setB.has(token));
}

function sharesIslandProximity(a: string[], b: string[]): boolean {
  const islandA = a.some((t) => ISLAND_CORRIDOR_TOKENS.has(t));
  const islandB = b.some((t) => ISLAND_CORRIDOR_TOKENS.has(t));
  return islandA && islandB;
}

/**
 * Score and explain how closely a driver's corridor matches the rider's selected route.
 */
export function scoreDriverForRoute(
  driver: CorridorDriver,
  route: CommuteRoute
): { score: number; matchPercent: number; matchReason: string } {
  const routeOriginTokens = normalizeCorridorTokens(route.origin);
  const routeDestTokens = normalizeCorridorTokens(route.destination);
  const driverOriginTokens = normalizeCorridorTokens(driver.corridor.origin);
  const driverDestTokens = normalizeCorridorTokens(driver.corridor.destination);

  const originMatch = hasTokenOverlap(routeOriginTokens, driverOriginTokens);
  const destMatch = hasTokenOverlap(routeDestTokens, driverDestTokens);
  const corridorProximity =
    sharesIslandProximity(routeOriginTokens, driverOriginTokens) &&
    sharesIslandProximity(routeDestTokens, driverDestTokens);

  const ratingBonus = Math.max(0, Math.round((driver.rating - 4.5) * 20));
  const score =
    (originMatch ? 40 : 0) +
    (destMatch ? 40 : 0) +
    (corridorProximity ? 10 : 0) +
    ratingBonus;

  const matchPercent = Math.max(72, Math.min(99, 68 + Math.round((score / 100) * 31)));

  let matchReason = 'Active Lagos corridor';
  if (originMatch && destMatch) {
    matchReason = 'Exact corridor';
  } else if (destMatch) {
    matchReason = 'Same destination';
  } else if (originMatch) {
    matchReason = 'Nearby pickup';
  }

  return { score, matchPercent, matchReason };
}

/**
 * Check whether a driver's departure fits the requested time window filter.
 */
export function matchesTimeWindow(
  driver: CorridorDriver,
  window: DeckFilters['timeWindow']
): boolean {
  if (window === 'all') return true;
  if (window === 'leaving_now') {
    return (
      driver.trip_type === 'leaving_now' ||
      /leaving/i.test(driver.corridor.departure_time)
    );
  }
  if (window === 'morning') {
    return (
      driver.trip_type === 'morning' ||
      /\bAM\b/i.test(driver.corridor.departure_time)
    );
  }
  return (
    driver.trip_type === 'evening' ||
    /\bPM\b/i.test(driver.corridor.departure_time)
  );
}

/**
 * Filter drivers by active deck filters and sort descending by route match score.
 */
export function filterAndRankDrivers(
  allDrivers: CorridorDriver[],
  route: CommuteRoute,
  filters: DeckFilters
): CorridorDriver[] {
  const filtered = allDrivers.filter((driver) => {
    if (!matchesTimeWindow(driver, filters.timeWindow)) return false;
    if (filters.acOnly && !(driver.corridor.ac_included || driver.vehicle.has_ac)) {
      return false;
    }
    if (filters.femaleOnly && driver.gender !== 'female') return false;
    if (
      filters.maxFareNgn !== null &&
      driver.corridor.fuel_split_ngn > filters.maxFareNgn
    ) {
      return false;
    }
    return true;
  });

  return filtered
    .map((driver) => ({
      driver,
      score: scoreDriverForRoute(driver, route).score,
    }))
    .sort((a, b) => b.score - a.score || b.driver.rating - a.driver.rating)
    .map((entry) => entry.driver);
}
