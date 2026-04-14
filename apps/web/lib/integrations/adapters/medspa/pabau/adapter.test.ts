import { describe, it, expect } from 'vitest';
import { pabauAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('pabauAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(pabauAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await pabauAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(pabauAdapter.getDetails('x')).rejects.toThrow();
  });
});
