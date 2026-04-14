import { describe, it, expect } from 'vitest';
import { toastTablesAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('toastTablesAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(toastTablesAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await toastTablesAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(toastTablesAdapter.getDetails('x')).rejects.toThrow();
  });
});
