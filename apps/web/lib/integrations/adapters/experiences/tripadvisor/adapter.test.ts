import { describe, it, expect } from 'vitest';
import { tripadvisorAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('tripadvisorAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(tripadvisorAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await tripadvisorAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(tripadvisorAdapter.getDetails('x')).rejects.toThrow();
  });
});
