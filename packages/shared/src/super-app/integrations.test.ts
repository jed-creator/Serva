import { describe, it, expect } from 'vitest';
import type { IntegrationAdapter } from './integrations';
import {
  IntegrationCategorySchema,
  AdapterCapabilitySchema,
  NormalizedSearchResultSchema,
  AvailabilityQuerySchema,
  SlotSchema,
} from './integrations';

describe('integration contract', () => {
  it('accepts every integration category', () => {
    for (const c of [
      'restaurants',
      'delivery',
      'beauty-wellness',
      'medspa',
      'fitness',
      'general-booking',
      'shopify-booking',
      'travel',
      'hotel-direct',
      'experiences',
      'rideshare',
      'grocery',
      'tickets',
      'home-services',
      'pet-care',
      'ecommerce',
    ] as const) {
      expect(IntegrationCategorySchema.parse(c)).toBe(c);
    }
  });

  it('accepts every adapter capability', () => {
    for (const c of [
      'search',
      'details',
      'availability',
      'book',
      'cancel',
      'webhook',
    ] as const) {
      expect(AdapterCapabilitySchema.parse(c)).toBe(c);
    }
  });

  it('parses a minimal normalized search result', () => {
    const r = NormalizedSearchResultSchema.parse({
      provider: 'opentable',
      externalId: 'rest_123',
      title: 'Pai Northern Thai',
      category: 'restaurants',
    });
    expect(r.provider).toBe('opentable');
  });

  it('parses a rich normalized search result', () => {
    const r = NormalizedSearchResultSchema.parse({
      provider: 'ticketmaster',
      externalId: 'evt_123',
      title: 'The National — MSG',
      category: 'tickets',
      subtitle: 'Sept 12, 2026',
      media: [{ url: 'https://cdn.example.com/e.jpg', kind: 'image' }],
      location: { lat: 40.75, lng: -73.99 },
      price: { amount: 14500, currency: 'USD' },
      rating: 4.7,
      url: 'https://www.ticketmaster.com/event/123',
    });
    expect(r.rating).toBe(4.7);
    expect(r.media?.[0].kind).toBe('image');
  });

  it('rejects a search result with an out-of-range rating', () => {
    expect(() =>
      NormalizedSearchResultSchema.parse({
        provider: 'yelp',
        externalId: 'biz_1',
        title: 'Cafe',
        category: 'restaurants',
        rating: 6,
      })
    ).toThrow();
  });

  it('rejects a search result with an unknown category', () => {
    expect(() =>
      NormalizedSearchResultSchema.parse({
        provider: 'yelp',
        externalId: 'biz_1',
        title: 'Cafe',
        category: 'nonsense',
      })
    ).toThrow();
  });

  it('parses an availability query for a table booking', () => {
    const q = AvailabilityQuerySchema.parse({
      externalId: 'rest_123',
      date: '2026-04-14',
      party: 4,
    });
    expect(q.party).toBe(4);
  });

  it('parses an availability query for a ticket quantity', () => {
    const q = AvailabilityQuerySchema.parse({
      externalId: 'evt_123',
      date: '2026-09-12',
      quantity: 2,
    });
    expect(q.quantity).toBe(2);
  });

  it('rejects an availability query with a bad date', () => {
    expect(() =>
      AvailabilityQuerySchema.parse({
        externalId: 'rest_123',
        date: 'tomorrow',
      })
    ).toThrow();
  });

  it('parses a minimal slot', () => {
    const s = SlotSchema.parse({
      startsAt: '2026-04-14T19:00:00Z',
      externalSlotId: 'slot_1',
    });
    expect(s.endsAt).toBeUndefined();
    expect(s.price).toBeUndefined();
  });

  it('parses a priced slot with duration', () => {
    const s = SlotSchema.parse({
      startsAt: '2026-04-14T19:00:00Z',
      endsAt: '2026-04-14T21:00:00Z',
      price: { amount: 5000, currency: 'USD' },
      externalSlotId: 'slot_1',
    });
    expect(s.price?.amount).toBe(5000);
  });

  it('compile-time: a minimal adapter satisfies IntegrationAdapter', () => {
    // Defined inside the test so the TS error would surface in `npm run
    // typecheck`. If this file compiles, the interface shape is honored.
    const stub: IntegrationAdapter = {
      key: 'stub',
      category: 'restaurants',
      displayName: 'Stub',
      capabilities: ['search', 'details'],
      async search() {
        return [];
      },
      async getDetails() {
        return {
          provider: 'stub',
          externalId: 'x',
          title: 'Test',
          category: 'restaurants',
        };
      },
    };
    expect(stub.key).toBe('stub');
  });
});
