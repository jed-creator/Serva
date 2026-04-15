import { describe, it, expect } from 'vitest';
import {
  RideQuoteSchema,
  RideBookingSchema,
  RideProductTypeSchema,
  RideBookingStatusSchema,
} from './rideshare';

describe('rideshare schemas', () => {
  it('accepts all product types', () => {
    for (const t of ['standard', 'xl', 'lux', 'pool', 'carshare', 'taxi'] as const) {
      expect(RideProductTypeSchema.parse(t)).toBe(t);
    }
  });

  it('accepts all booking statuses', () => {
    for (const s of [
      'pending',
      'accepted',
      'arriving',
      'in_progress',
      'completed',
      'cancelled',
    ] as const) {
      expect(RideBookingStatusSchema.parse(s)).toBe(s);
    }
  });

  it('parses a quote without surge', () => {
    const q = RideQuoteSchema.parse({
      id: 'q_1',
      provider: 'uber',
      productType: 'standard',
      pickup: { lat: 43.65, lng: -79.38 },
      dropoff: { lat: 43.66, lng: -79.39 },
      etaSeconds: 180,
      price: { amount: 1299, currency: 'USD' },
      capacity: 4,
    });
    expect(q.productType).toBe('standard');
    expect(q.surgeMultiplier).toBeUndefined();
  });

  it('parses a quote with surge', () => {
    const q = RideQuoteSchema.parse({
      id: 'q_1',
      provider: 'uber',
      productType: 'xl',
      pickup: { lat: 43.65, lng: -79.38 },
      dropoff: { lat: 43.66, lng: -79.39 },
      etaSeconds: 240,
      price: { amount: 2499, currency: 'USD' },
      surgeMultiplier: 1.8,
      capacity: 6,
    });
    expect(q.surgeMultiplier).toBe(1.8);
  });

  it('rejects a quote with a surge multiplier below 1', () => {
    expect(() =>
      RideQuoteSchema.parse({
        id: 'q_1',
        provider: 'uber',
        productType: 'standard',
        pickup: { lat: 43.65, lng: -79.38 },
        dropoff: { lat: 43.66, lng: -79.39 },
        etaSeconds: 180,
        price: { amount: 1299, currency: 'USD' },
        surgeMultiplier: 0.5,
        capacity: 4,
      })
    ).toThrow();
  });

  it('parses a booking with driver details', () => {
    const b = RideBookingSchema.parse({
      id: 'b_1',
      userId: 'u_1',
      provider: 'uber',
      externalId: 'ext_abc',
      status: 'accepted',
      driver: {
        name: 'Alex',
        phone: '+1-555-0100',
        vehicle: 'Toyota Prius',
        licensePlate: 'ABC-123',
      },
      quote: {
        id: 'q_1',
        provider: 'uber',
        productType: 'standard',
        pickup: { lat: 43.65, lng: -79.38 },
        dropoff: { lat: 43.66, lng: -79.39 },
        etaSeconds: 180,
        price: { amount: 1299, currency: 'USD' },
        capacity: 4,
      },
      requestedAt: '2026-04-14T12:00:00Z',
    });
    expect(b.driver?.name).toBe('Alex');
    expect(b.status).toBe('accepted');
  });

  it('parses a pending booking with no driver yet', () => {
    const b = RideBookingSchema.parse({
      id: 'b_1',
      userId: 'u_1',
      provider: 'uber',
      externalId: 'ext_abc',
      status: 'pending',
      quote: {
        id: 'q_1',
        provider: 'uber',
        productType: 'standard',
        pickup: { lat: 43.65, lng: -79.38 },
        dropoff: { lat: 43.66, lng: -79.39 },
        etaSeconds: 180,
        price: { amount: 1299, currency: 'USD' },
        capacity: 4,
      },
      requestedAt: '2026-04-14T12:00:00Z',
    });
    expect(b.driver).toBeUndefined();
  });
});
