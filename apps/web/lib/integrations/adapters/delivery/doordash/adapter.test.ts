import { describe, it, expect } from 'vitest';
import { doordashAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('doordashAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(doordashAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await doordashAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(doordashAdapter.getDetails('x')).rejects.toThrow();
  });
});
