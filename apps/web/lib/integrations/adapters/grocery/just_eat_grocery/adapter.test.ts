import { describe, it, expect } from 'vitest';
import { justEatGroceryAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('justEatGroceryAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(justEatGroceryAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await justEatGroceryAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(justEatGroceryAdapter.getDetails('x')).rejects.toThrow();
  });
});
