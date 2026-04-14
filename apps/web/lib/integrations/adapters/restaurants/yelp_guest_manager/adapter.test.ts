import { describe, it, expect } from 'vitest';
import { yelpGuestManagerAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('yelpGuestManagerAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(yelpGuestManagerAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await yelpGuestManagerAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(yelpGuestManagerAdapter.getDetails('x')).rejects.toThrow();
  });
});
