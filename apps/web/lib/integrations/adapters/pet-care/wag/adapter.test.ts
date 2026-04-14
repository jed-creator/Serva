import { describe, it, expect } from 'vitest';
import { wagAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('wagAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(wagAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await wagAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(wagAdapter.getDetails('x')).rejects.toThrow();
  });
});
