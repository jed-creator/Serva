import { describe, it, expect } from 'vitest';
import { resyAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('resyAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(resyAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await resyAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(resyAdapter.getDetails('x')).rejects.toThrow();
  });
});
