import { describe, it, expect } from 'vitest';
import { grubhubAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('grubhubAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(grubhubAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await grubhubAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(grubhubAdapter.getDetails('x')).rejects.toThrow();
  });
});
