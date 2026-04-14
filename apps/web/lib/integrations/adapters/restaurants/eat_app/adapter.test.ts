import { describe, it, expect } from 'vitest';
import { eatAppAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('eatAppAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(eatAppAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await eatAppAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(eatAppAdapter.getDetails('x')).rejects.toThrow();
  });
});
