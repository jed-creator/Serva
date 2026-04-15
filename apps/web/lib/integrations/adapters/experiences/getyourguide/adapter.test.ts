import { describe, it, expect } from 'vitest';
import { getyourguideAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('getyourguideAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(getyourguideAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await getyourguideAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(getyourguideAdapter.getDetails('x')).rejects.toThrow();
  });
});
