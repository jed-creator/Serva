import { describe, it, expect } from 'vitest';
import { touchbistroAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('touchbistroAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(touchbistroAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await touchbistroAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(touchbistroAdapter.getDetails('x')).rejects.toThrow();
  });
});
