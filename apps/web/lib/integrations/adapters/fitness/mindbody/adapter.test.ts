import { describe, it, expect } from 'vitest';
import { mindbodyAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('mindbodyAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(mindbodyAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await mindbodyAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(mindbodyAdapter.getDetails('x')).rejects.toThrow();
  });
});
