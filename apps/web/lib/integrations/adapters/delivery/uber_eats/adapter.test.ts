import { describe, it, expect } from 'vitest';
import { uberEatsAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('uberEatsAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(uberEatsAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await uberEatsAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(uberEatsAdapter.getDetails('x')).rejects.toThrow();
  });
});
