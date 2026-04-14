/**
 * Ticketmaster fixtures for mock mode.
 *
 * Each event has a small seat-inventory table attached. Real Ticketmaster
 * API returns seat maps with hundreds of sections; the mock returns
 * three so the UI has something to page through.
 */

export type TicketmasterEventFixture = {
  externalId: string;
  name: string;
  venue: string;
  kind: 'concert' | 'sports' | 'theater' | 'comedy' | 'festival';
  startsAt: string;
  imageUrl: string;
  location: { lat: number; lng: number };
};

export type SeatInventoryFixture = {
  externalSlotId: string;
  section: string;
  row: string;
  priceCents: number;
  available: number;
};

export const EVENTS: TicketmasterEventFixture[] = [
  {
    externalId: 'tm-event-1',
    name: 'Seattle Symphony: Beethoven Festival',
    venue: 'Benaroya Hall',
    kind: 'concert',
    startsAt: '2026-05-01T19:30:00.000Z',
    imageUrl: 'https://example.com/media/benaroya.jpg',
    location: { lat: 47.6084, lng: -122.3387 },
  },
  {
    externalId: 'tm-event-2',
    name: 'Seattle Kraken vs. Vancouver Canucks',
    venue: 'Climate Pledge Arena',
    kind: 'sports',
    startsAt: '2026-05-03T19:00:00.000Z',
    imageUrl: 'https://example.com/media/kraken.jpg',
    location: { lat: 47.6221, lng: -122.3540 },
  },
  {
    externalId: 'tm-event-3',
    name: 'Hamilton',
    venue: 'Paramount Theatre',
    kind: 'theater',
    startsAt: '2026-05-10T19:30:00.000Z',
    imageUrl: 'https://example.com/media/hamilton.jpg',
    location: { lat: 47.6131, lng: -122.3317 },
  },
];

export const SEAT_INVENTORY: Record<string, SeatInventoryFixture[]> = {
  'tm-event-1': [
    { externalSlotId: 'sec-a-row-12', section: 'A', row: '12', priceCents: 12500, available: 4 },
    { externalSlotId: 'sec-b-row-5', section: 'B', row: '5', priceCents: 8500, available: 6 },
    { externalSlotId: 'sec-c-row-20', section: 'C', row: '20', priceCents: 5500, available: 12 },
  ],
  'tm-event-2': [
    { externalSlotId: 'lower-101', section: 'Lower 101', row: '8', priceCents: 18500, available: 4 },
    { externalSlotId: 'upper-304', section: 'Upper 304', row: '14', priceCents: 6500, available: 10 },
    { externalSlotId: 'upper-315', section: 'Upper 315', row: '3', priceCents: 7500, available: 2 },
  ],
  'tm-event-3': [
    { externalSlotId: 'orch-f', section: 'Orchestra', row: 'F', priceCents: 22500, available: 2 },
    { externalSlotId: 'mezz-c', section: 'Mezzanine', row: 'C', priceCents: 14500, available: 6 },
    { externalSlotId: 'balc-k', section: 'Balcony', row: 'K', priceCents: 8500, available: 14 },
  ],
};
