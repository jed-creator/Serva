import { describe, it, expect } from 'vitest';
import { openTableAdapter } from './index';
import { assertAdapterConforms } from '../../../core';
import {
  NormalizedSearchResultSchema,
  SlotSchema,
} from '../../../core';

describe('openTableAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(openTableAdapter)).not.toThrow();
  });

  it('declares the expected capabilities', () => {
    expect(openTableAdapter.key).toBe('opentable');
    expect(openTableAdapter.category).toBe('restaurants');
    expect(openTableAdapter.capabilities).toEqual(
      expect.arrayContaining(['search', 'details', 'availability', 'book', 'cancel'])
    );
  });

  it('search() returns normalized results for a matching query', async () => {
    const results = await openTableAdapter.search({ text: 'Thai' });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(() => NormalizedSearchResultSchema.parse(r)).not.toThrow();
      expect(r.provider).toBe('opentable');
      expect(r.category).toBe('restaurants');
    }
    // At least one result should match the query text.
    expect(results.some((r) => /thai/i.test(r.title))).toBe(true);
  });

  it('search() returns an empty array when nothing matches', async () => {
    const results = await openTableAdapter.search({ text: 'zzz-no-such-cuisine' });
    expect(results).toEqual([]);
  });

  it('getDetails() returns a normalized result for a known externalId', async () => {
    const details = await openTableAdapter.getDetails('ot-thai-orchid');
    expect(() => NormalizedSearchResultSchema.parse(details)).not.toThrow();
    expect(details.externalId).toBe('ot-thai-orchid');
    expect(details.provider).toBe('opentable');
  });

  it('getDetails() throws for an unknown externalId', async () => {
    await expect(openTableAdapter.getDetails('ot-does-not-exist')).rejects.toThrow();
  });

  it('checkAvailability() returns slots in Slot shape', async () => {
    const slots = await openTableAdapter.checkAvailability!({
      externalId: 'ot-thai-orchid',
      date: '2026-05-01',
      party: 2,
    });
    expect(slots.length).toBeGreaterThan(0);
    for (const s of slots) {
      expect(() => SlotSchema.parse(s)).not.toThrow();
    }
  });

  it('book() returns a confirmed booking with an externalBookingId', async () => {
    const booking = await openTableAdapter.book!({
      externalId: 'ot-thai-orchid',
      slotId: 'slot-1',
      userId: 'user-abc',
    });
    expect(booking.externalBookingId).toMatch(/^ot-book-/);
    expect(booking.status).toBe('confirmed');
  });

  it('cancel() returns a cancelled status for a known booking', async () => {
    const booking = await openTableAdapter.book!({
      externalId: 'ot-thai-orchid',
      slotId: 'slot-1',
      userId: 'user-abc',
    });
    const result = await openTableAdapter.cancel!(booking.externalBookingId);
    expect(result.status).toBe('cancelled');
  });
});
