import { describe, it, expect } from 'vitest';
import { roverAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('roverAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(roverAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await roverAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(roverAdapter.getDetails('x')).rejects.toThrow();
  });
});
