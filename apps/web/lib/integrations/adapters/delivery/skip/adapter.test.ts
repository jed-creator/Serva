import { describe, it, expect } from 'vitest';
import { skipAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('skipAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(skipAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await skipAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(skipAdapter.getDetails('x')).rejects.toThrow();
  });
});
