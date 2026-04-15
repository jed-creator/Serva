import { describe, it, expect } from 'vitest';
import { thumbtackAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('thumbtackAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(thumbtackAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await thumbtackAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(thumbtackAdapter.getDetails('x')).rejects.toThrow();
  });
});
