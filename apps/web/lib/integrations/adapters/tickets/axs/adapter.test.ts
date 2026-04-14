import { describe, it, expect } from 'vitest';
import { axsAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('axsAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(axsAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await axsAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(axsAdapter.getDetails('x')).rejects.toThrow();
  });
});
