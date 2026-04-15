import { describe, it, expect } from 'vitest';
import { justEatAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('justEatAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(justEatAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await justEatAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(justEatAdapter.getDetails('x')).rejects.toThrow();
  });
});
