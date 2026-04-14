import { describe, it, expect } from 'vitest';
import { littleHotelierAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('littleHotelierAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(littleHotelierAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await littleHotelierAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(littleHotelierAdapter.getDetails('x')).rejects.toThrow();
  });
});
