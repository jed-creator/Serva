import { describe, it, expect } from 'vitest';
import { bookingAttractionsAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('bookingAttractionsAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(bookingAttractionsAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await bookingAttractionsAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(bookingAttractionsAdapter.getDetails('x')).rejects.toThrow();
  });
});
