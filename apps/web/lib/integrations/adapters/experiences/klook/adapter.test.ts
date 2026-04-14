import { describe, it, expect } from 'vitest';
import { klookAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('klookAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(klookAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await klookAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(klookAdapter.getDetails('x')).rejects.toThrow();
  });
});
