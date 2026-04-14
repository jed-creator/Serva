import { describe, it, expect } from 'vitest';
import { mangomintAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('mangomintAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(mangomintAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await mangomintAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(mangomintAdapter.getDetails('x')).rejects.toThrow();
  });
});
