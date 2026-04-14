import { describe, it, expect } from 'vitest';
import { eventbriteAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('eventbriteAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(eventbriteAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await eventbriteAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(eventbriteAdapter.getDetails('x')).rejects.toThrow();
  });
});
