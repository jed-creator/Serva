import { describe, it, expect } from 'vitest';
import { tockAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('tockAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(tockAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await tockAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(tockAdapter.getDetails('x')).rejects.toThrow();
  });
});
