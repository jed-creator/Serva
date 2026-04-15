import { describe, it, expect } from 'vitest';
import {
  TripSchema,
  TripItemSchema,
  TripItinerarySchema,
  TripItemKindSchema,
} from './trips';

describe('trips schemas', () => {
  it('parses a trip without cover media', () => {
    const t = TripSchema.parse({
      id: 't_1',
      userId: 'u_1',
      title: 'Tokyo Spring',
      startDate: '2026-04-01',
      endDate: '2026-04-14',
      primaryLocation: { lat: 35.68, lng: 139.69 },
    });
    expect(t.title).toBe('Tokyo Spring');
    expect(t.coverMedia).toBeUndefined();
  });

  it('parses a trip with cover media', () => {
    const t = TripSchema.parse({
      id: 't_1',
      userId: 'u_1',
      title: 'Tokyo Spring',
      startDate: '2026-04-01',
      endDate: '2026-04-14',
      primaryLocation: { lat: 35.68, lng: 139.69 },
      coverMedia: { url: 'https://cdn.example.com/t.jpg', kind: 'image' },
    });
    expect(t.coverMedia?.kind).toBe('image');
  });

  it('rejects a trip with malformed dates', () => {
    expect(() =>
      TripSchema.parse({
        id: 't_1',
        userId: 'u_1',
        title: 'Tokyo Spring',
        startDate: 'April 1',
        endDate: '2026-04-14',
        primaryLocation: { lat: 35.68, lng: 139.69 },
      })
    ).toThrow();
  });

  it('accepts all trip item kinds', () => {
    for (const k of [
      'flight',
      'hotel',
      'restaurant',
      'experience',
      'activity',
      'transfer',
    ] as const) {
      expect(TripItemKindSchema.parse(k)).toBe(k);
    }
  });

  it('parses a flight trip item', () => {
    const item = TripItemSchema.parse({
      kind: 'flight',
      provider: 'expedia',
      externalId: 'ext_flight_1',
      title: 'YYZ → NRT',
      startsAt: '2026-04-01T10:30:00Z',
      endsAt: '2026-04-02T13:45:00Z',
      price: { amount: 120000, currency: 'USD' },
    });
    expect(item.kind).toBe('flight');
  });

  it('parses a hotel trip item with location', () => {
    const item = TripItemSchema.parse({
      kind: 'hotel',
      provider: 'booking-com',
      externalId: 'ext_hotel_1',
      title: 'Park Hyatt Tokyo',
      startsAt: '2026-04-02T15:00:00Z',
      endsAt: '2026-04-14T11:00:00Z',
      location: { lat: 35.68, lng: 139.69 },
      price: { amount: 450000, currency: 'USD' },
      confirmationCode: 'ABC123',
    });
    expect(item.confirmationCode).toBe('ABC123');
  });

  it('parses an itinerary with multiple items', () => {
    const itinerary = TripItinerarySchema.parse({
      tripId: 't_1',
      items: [
        {
          kind: 'flight',
          provider: 'expedia',
          externalId: 'f_1',
          title: 'YYZ → NRT',
          startsAt: '2026-04-01T10:30:00Z',
          endsAt: '2026-04-02T13:45:00Z',
          price: { amount: 120000, currency: 'USD' },
        },
        {
          kind: 'restaurant',
          provider: 'opentable',
          externalId: 'r_1',
          title: 'Sushi Saito',
          startsAt: '2026-04-02T19:00:00Z',
          endsAt: '2026-04-02T21:00:00Z',
          price: { amount: 40000, currency: 'USD' },
        },
      ],
    });
    expect(itinerary.items).toHaveLength(2);
    expect(itinerary.items[0].kind).toBe('flight');
  });
});
