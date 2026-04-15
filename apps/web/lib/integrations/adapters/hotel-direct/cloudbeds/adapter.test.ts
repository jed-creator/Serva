import { describe, it, expect } from 'vitest';
import { cloudbedsAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('cloudbedsAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(cloudbedsAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await cloudbedsAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(cloudbedsAdapter.getDetails('x')).rejects.toThrow();
  });
});
