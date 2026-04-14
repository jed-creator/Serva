import { describe, it, expect } from 'vitest';
import { resnexusAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('resnexusAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(resnexusAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await resnexusAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(resnexusAdapter.getDetails('x')).rejects.toThrow();
  });
});
