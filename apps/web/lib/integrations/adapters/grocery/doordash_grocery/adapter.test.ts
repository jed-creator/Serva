import { describe, it, expect } from 'vitest';
import { doordashGroceryAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('doordashGroceryAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(doordashGroceryAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await doordashGroceryAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(doordashGroceryAdapter.getDetails('x')).rejects.toThrow();
  });
});
