import { describe, it, expect } from 'vitest';
import { woocommerceAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('woocommerceAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(woocommerceAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await woocommerceAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(woocommerceAdapter.getDetails('x')).rejects.toThrow();
  });
});
