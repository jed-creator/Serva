import { describe, it, expect } from 'vitest';
import { viatorAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('viatorAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(viatorAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await viatorAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(viatorAdapter.getDetails('x')).rejects.toThrow();
  });
});
