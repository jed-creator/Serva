import { describe, it, expect } from 'vitest';
import {
  MarketplaceListingSchema,
  MarketplaceOfferSchema,
  MarketplaceListingKindSchema,
  MarketplaceListingStatusSchema,
  MarketplaceOfferStatusSchema,
} from './marketplace';

describe('marketplace schemas', () => {
  it('accepts both listing kinds', () => {
    for (const k of ['item', 'service'] as const) {
      expect(MarketplaceListingKindSchema.parse(k)).toBe(k);
    }
  });

  it('accepts all listing statuses', () => {
    for (const s of ['active', 'pending', 'sold', 'withdrawn'] as const) {
      expect(MarketplaceListingStatusSchema.parse(s)).toBe(s);
    }
  });

  it('parses an item listing', () => {
    const l = MarketplaceListingSchema.parse({
      id: 'l_1',
      sellerUserId: 'u_1',
      kind: 'item',
      title: 'Vintage Eames lounge chair',
      description: 'Good condition, small nick on the arm',
      media: [],
      price: { amount: 120000, currency: 'USD' },
      location: { lat: 43.65, lng: -79.38 },
      status: 'active',
      createdAt: '2026-04-14T10:00:00Z',
    });
    expect(l.kind).toBe('item');
    expect(l.location?.lat).toBe(43.65);
  });

  it('parses a service listing without a location', () => {
    const l = MarketplaceListingSchema.parse({
      id: 'l_2',
      sellerUserId: 'u_2',
      kind: 'service',
      title: 'Dog walking — weekday afternoons',
      description: '30-minute walks in the Annex',
      media: [],
      price: { amount: 2500, currency: 'USD' },
      status: 'active',
      createdAt: '2026-04-14T10:00:00Z',
    });
    expect(l.kind).toBe('service');
    expect(l.location).toBeUndefined();
  });

  it('rejects a listing with an empty title', () => {
    expect(() =>
      MarketplaceListingSchema.parse({
        id: 'l_1',
        sellerUserId: 'u_1',
        kind: 'item',
        title: '',
        description: 'x',
        media: [],
        price: { amount: 100, currency: 'USD' },
        status: 'active',
        createdAt: '2026-04-14T10:00:00Z',
      })
    ).toThrow();
  });

  it('accepts all offer statuses', () => {
    for (const s of ['pending', 'accepted', 'declined', 'withdrawn'] as const) {
      expect(MarketplaceOfferStatusSchema.parse(s)).toBe(s);
    }
  });

  it('parses an offer with a message', () => {
    const o = MarketplaceOfferSchema.parse({
      id: 'o_1',
      listingId: 'l_1',
      buyerUserId: 'u_2',
      amount: { amount: 100000, currency: 'USD' },
      message: 'Would you take $1000 cash today?',
      status: 'pending',
    });
    expect(o.message).toContain('cash');
    expect(o.status).toBe('pending');
  });

  it('parses an offer without a message', () => {
    const o = MarketplaceOfferSchema.parse({
      id: 'o_1',
      listingId: 'l_1',
      buyerUserId: 'u_2',
      amount: { amount: 100000, currency: 'USD' },
      status: 'pending',
    });
    expect(o.message).toBeUndefined();
  });
});
