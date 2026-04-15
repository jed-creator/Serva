import { describe, it, expect } from 'vitest';
import { skipGroceryAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('skipGroceryAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(skipGroceryAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await skipGroceryAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(skipGroceryAdapter.getDetails('x')).rejects.toThrow();
  });
});
