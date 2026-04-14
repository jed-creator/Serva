import { describe, it, expect } from 'vitest';
import { siteminderAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('siteminderAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(siteminderAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await siteminderAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(siteminderAdapter.getDetails('x')).rejects.toThrow();
  });
});
