import { describe, it, expect } from 'vitest';
import { barkAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('barkAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(barkAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await barkAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(barkAdapter.getDetails('x')).rejects.toThrow();
  });
});
