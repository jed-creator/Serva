/**
 * Maps raw OpenTable fixture rows into the shared NormalizedSearchResult
 * shape. Every vertical has its own mapper so provider-specific knowledge
 * doesn't leak into the UI or the trip builder — they only see the
 * normalized shape.
 */
import type { NormalizedSearchResult } from '../../../core';
import type { RestaurantFixture } from './fixtures';

/** Average-dinner-per-person estimate in cents, indexed by OpenTable priceTier. */
const PRICE_TIER_TO_CENTS: Record<1 | 2 | 3 | 4, number> = {
  1: 1500,
  2: 3500,
  3: 6500,
  4: 11000,
};

export function toNormalized(row: RestaurantFixture): NormalizedSearchResult {
  return {
    provider: 'opentable',
    externalId: row.externalId,
    title: row.name,
    category: 'restaurants',
    subtitle: `${row.cuisine} · ${row.neighborhood}`,
    media: [
      {
        url: row.imageUrl,
        kind: 'image',
        alt: row.name,
      },
    ],
    location: row.location,
    price: {
      amount: PRICE_TIER_TO_CENTS[row.priceTier],
      currency: 'USD',
    },
    rating: row.rating,
  };
}
