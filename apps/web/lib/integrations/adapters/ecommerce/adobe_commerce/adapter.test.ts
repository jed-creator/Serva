import { describe, it, expect } from 'vitest';
import { adobeCommerceAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('adobeCommerceAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(adobeCommerceAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await adobeCommerceAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(adobeCommerceAdapter.getDetails('x')).rejects.toThrow();
  });
});
