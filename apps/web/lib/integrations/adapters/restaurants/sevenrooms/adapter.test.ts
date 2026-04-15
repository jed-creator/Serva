import { describe, it, expect } from 'vitest';
import { sevenroomsAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('sevenroomsAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(sevenroomsAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await sevenroomsAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(sevenroomsAdapter.getDetails('x')).rejects.toThrow();
  });
});
