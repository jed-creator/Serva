import { describe, it, expect } from 'vitest';
import { instacartAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('instacartAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(instacartAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await instacartAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(instacartAdapter.getDetails('x')).rejects.toThrow();
  });
});
