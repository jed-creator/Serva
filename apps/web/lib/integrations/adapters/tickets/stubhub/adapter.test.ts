import { describe, it, expect } from 'vitest';
import { stubhubAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('stubhubAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(stubhubAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await stubhubAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(stubhubAdapter.getDetails('x')).rejects.toThrow();
  });
});
