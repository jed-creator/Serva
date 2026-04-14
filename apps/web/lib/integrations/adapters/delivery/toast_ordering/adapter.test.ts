import { describe, it, expect } from 'vitest';
import { toastOrderingAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('toastOrderingAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(toastOrderingAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await toastOrderingAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(toastOrderingAdapter.getDetails('x')).rejects.toThrow();
  });
});
