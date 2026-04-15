import { describe, it, expect } from 'vitest';
import { squarespaceAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('squarespaceAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(squarespaceAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await squarespaceAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(squarespaceAdapter.getDetails('x')).rejects.toThrow();
  });
});
