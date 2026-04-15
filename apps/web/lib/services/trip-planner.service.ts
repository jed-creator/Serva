/**
 * Trip planner service.
 *
 * Two responsibilities that share the same domain:
 *
 *   1. `searchTravel(query)` — fans out across every travel adapter
 *      (flights, hotels direct, experiences) and returns a single
 *      normalized result list for the /trips landing page.
 *   2. `validateCreateTrip` / `createStubTrip` / `listStubTrips` —
 *      scaffolded trip-persistence stubs. Real persistence will land
 *      with the `trips` table work.
 */
import { integrationRegistry } from '@/lib/integrations/core';
import type {
  IntegrationCategory,
  NormalizedSearchResult,
} from '@/lib/integrations/core';
import type { Trip } from '@orvo/shared/super-app';

const TRAVEL_CATEGORIES: IntegrationCategory[] = [
  'travel',
  'hotel-direct',
  'experiences',
];

/**
 * Fan out a text search across every travel-adjacent adapter.
 * Mirrors the pattern in `eat.service.ts` / `booking.service.ts` — a
 * misbehaving adapter can't brick the whole fan-out because
 * `Promise.allSettled` drops rejected results silently.
 */
export async function searchTravel(
  query: string,
): Promise<NormalizedSearchResult[]> {
  const adapters = integrationRegistry
    .list()
    .filter((a) => TRAVEL_CATEGORIES.includes(a.category));

  const settled = await Promise.allSettled(
    adapters.map((a) => a.search({ text: query })),
  );

  return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

export interface CreateTripInput {
  title: string;
  startDate: string;
  endDate: string;
}

export interface CreateTripResult {
  ok: true;
  trip: Pick<Trip, 'id' | 'title' | 'startDate' | 'endDate'>;
}

export type CreateTripValidationError =
  | { ok: false; reason: 'missing-title' }
  | { ok: false; reason: 'missing-dates' }
  | { ok: false; reason: 'end-before-start' };

export function validateCreateTrip(
  input: Partial<CreateTripInput>,
): CreateTripValidationError | { ok: true } {
  if (!input.title || input.title.trim() === '') {
    return { ok: false, reason: 'missing-title' };
  }
  if (!input.startDate || !input.endDate) {
    return { ok: false, reason: 'missing-dates' };
  }
  if (input.startDate > input.endDate) {
    return { ok: false, reason: 'end-before-start' };
  }
  return { ok: true };
}

/**
 * Stub trip creation. Returns a deterministic-looking id so callers
 * can round-trip the handler without a database yet. The id shape is
 * `stub-<timestamp>` — the real implementation will return a UUID.
 */
export function createStubTrip(input: CreateTripInput): CreateTripResult {
  return {
    ok: true,
    trip: {
      id: `stub-${Date.now()}`,
      title: input.title.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
    },
  };
}

export function listStubTrips(): [] {
  return [];
}
