/**
 * Hard-coded restaurant fixtures used by the mock OpenTable client.
 *
 * These exist so the Explore hub, the booking flow, and the trip builder
 * have real-looking data to render and exercise against while connector
 * agreements are being negotiated. When a real OpenTable token is wired
 * up, swap out `client.ts` — fixtures and mapper stay as the local
 * offline fallback for tests.
 */

export type RestaurantFixture = {
  externalId: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  priceTier: 1 | 2 | 3 | 4;
  rating: number;
  imageUrl: string;
  location: { lat: number; lng: number };
};

export const RESTAURANTS: RestaurantFixture[] = [
  {
    externalId: 'ot-thai-orchid',
    name: 'Thai Orchid',
    cuisine: 'Thai',
    neighborhood: 'Capitol Hill',
    priceTier: 2,
    rating: 4.5,
    imageUrl: 'https://example.com/media/thai-orchid.jpg',
    location: { lat: 47.6205, lng: -122.3212 },
  },
  {
    externalId: 'ot-bangkok-street',
    name: 'Bangkok Street Food',
    cuisine: 'Thai',
    neighborhood: 'Belltown',
    priceTier: 1,
    rating: 4.2,
    imageUrl: 'https://example.com/media/bangkok-street.jpg',
    location: { lat: 47.6149, lng: -122.3449 },
  },
  {
    externalId: 'ot-il-terrazzo',
    name: 'Il Terrazzo Carmine',
    cuisine: 'Italian',
    neighborhood: 'Pioneer Square',
    priceTier: 4,
    rating: 4.7,
    imageUrl: 'https://example.com/media/il-terrazzo.jpg',
    location: { lat: 47.6012, lng: -122.3341 },
  },
  {
    externalId: 'ot-sushi-kashiba',
    name: 'Sushi Kashiba',
    cuisine: 'Japanese',
    neighborhood: 'Pike Place',
    priceTier: 4,
    rating: 4.8,
    imageUrl: 'https://example.com/media/sushi-kashiba.jpg',
    location: { lat: 47.6101, lng: -122.3421 },
  },
  {
    externalId: 'ot-tacos-chukis',
    name: 'Tacos Chukis',
    cuisine: 'Mexican',
    neighborhood: 'Capitol Hill',
    priceTier: 1,
    rating: 4.4,
    imageUrl: 'https://example.com/media/tacos-chukis.jpg',
    location: { lat: 47.6147, lng: -122.3200 },
  },
];

export type SlotFixture = {
  externalSlotId: string;
  startsAt: string; // ISO-8601 datetime
  party: number;
};

/**
 * Slots are generated per-request by the client from a date + party size
 * so we don't have to hard-code every possible combination. These are the
 * hour offsets (local to the restaurant) we return for any given date.
 */
export const SLOT_HOURS = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
