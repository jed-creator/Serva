import { describe, it, expect } from 'vitest';
import { grabmartAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('grabmartAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(grabmartAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await grabmartAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(grabmartAdapter.getDetails('x')).rejects.toThrow();
  });
});
