import { describe, it, expect } from 'vitest';
import { ecwidAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('ecwidAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(ecwidAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await ecwidAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(ecwidAdapter.getDetails('x')).rejects.toThrow();
  });
});
