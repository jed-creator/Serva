import { describe, it, expect } from 'vitest';
import { uberEatsGroceryAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('uberEatsGroceryAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(uberEatsGroceryAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await uberEatsGroceryAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(uberEatsGroceryAdapter.getDetails('x')).rejects.toThrow();
  });
});
