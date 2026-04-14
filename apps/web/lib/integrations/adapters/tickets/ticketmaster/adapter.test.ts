import { describe, it, expect } from 'vitest';
import { ticketmasterAdapter } from './index';
import {
  assertAdapterConforms,
  NormalizedSearchResultSchema,
  SlotSchema,
} from '../../../core';

describe('ticketmasterAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(ticketmasterAdapter)).not.toThrow();
  });

  it('declares the expected capabilities (search, details, availability, book)', () => {
    expect(ticketmasterAdapter.key).toBe('ticketmaster');
    expect(ticketmasterAdapter.category).toBe('tickets');
    expect(ticketmasterAdapter.capabilities).toEqual(
      expect.arrayContaining(['search', 'details', 'availability', 'book'])
    );
    // No cancel on the ticket side — ticketing refunds go through
    // the event organizer, not the adapter.
    expect(ticketmasterAdapter.capabilities).not.toContain('cancel');
  });

  it('search() returns events near a city', async () => {
    const results = await ticketmasterAdapter.search({
      text: 'concert',
      near: { lat: 47.6062, lng: -122.3321 },
    });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(() => NormalizedSearchResultSchema.parse(r)).not.toThrow();
      expect(r.provider).toBe('ticketmaster');
      expect(r.category).toBe('tickets');
    }
  });

  it('getDetails() returns an event for a known externalId', async () => {
    const details = await ticketmasterAdapter.getDetails('tm-event-1');
    expect(() => NormalizedSearchResultSchema.parse(details)).not.toThrow();
    expect(details.externalId).toBe('tm-event-1');
  });

  it('getDetails() throws for an unknown externalId', async () => {
    await expect(ticketmasterAdapter.getDetails('tm-event-9999')).rejects.toThrow();
  });

  it('checkAvailability() returns seat inventory shaped as Slots', async () => {
    const slots = await ticketmasterAdapter.checkAvailability!({
      externalId: 'tm-event-1',
      date: '2026-05-01',
      quantity: 2,
    });
    expect(slots.length).toBeGreaterThan(0);
    for (const s of slots) {
      expect(() => SlotSchema.parse(s)).not.toThrow();
      // Ticket slots must have a price — that's the whole point.
      expect(s.price).toBeDefined();
    }
  });

  it('book() returns a confirmed order with an externalBookingId', async () => {
    const booking = await ticketmasterAdapter.book!({
      externalId: 'tm-event-1',
      slotId: 'sec-a-row-12',
      userId: 'user-abc',
    });
    expect(booking.externalBookingId).toMatch(/^tm-order-/);
    expect(booking.status).toBe('confirmed');
  });
});
