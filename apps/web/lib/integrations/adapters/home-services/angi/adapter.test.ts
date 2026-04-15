import { describe, it, expect } from 'vitest';
import { angiAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('angiAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(angiAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await angiAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(angiAdapter.getDetails('x')).rejects.toThrow();
  });
});
