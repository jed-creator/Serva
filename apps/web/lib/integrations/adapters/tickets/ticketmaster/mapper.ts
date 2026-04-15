import type { NormalizedSearchResult } from '../../../core';
import { SEAT_INVENTORY, type TicketmasterEventFixture } from './fixtures';

export function toNormalized(row: TicketmasterEventFixture): NormalizedSearchResult {
  // "Starting at" price: the cheapest seat in the event's inventory.
  const seats = SEAT_INVENTORY[row.externalId] ?? [];
  const minPriceCents = seats.length
    ? Math.min(...seats.map((s) => s.priceCents))
    : undefined;

  return {
    provider: 'ticketmaster',
    externalId: row.externalId,
    title: row.name,
    category: 'tickets',
    subtitle: `${row.venue} · ${row.kind}`,
    media: [
      {
        url: row.imageUrl,
        kind: 'image',
        alt: row.name,
      },
    ],
    location: row.location,
    price: minPriceCents
      ? { amount: minPriceCents, currency: 'USD' }
      : undefined,
    metadata: {
      startsAt: row.startsAt,
      kind: row.kind,
    },
  };
}
