import { describe, it, expect } from 'vitest';
import { squareOnlineAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('squareOnlineAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(squareOnlineAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await squareOnlineAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(squareOnlineAdapter.getDetails('x')).rejects.toThrow();
  });
});
