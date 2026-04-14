import { describe, it, expect } from 'vitest';
import { janeAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('janeAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(janeAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await janeAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(janeAdapter.getDetails('x')).rejects.toThrow();
  });
});
