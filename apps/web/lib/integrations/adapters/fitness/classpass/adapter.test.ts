import { describe, it, expect } from 'vitest';
import { classpassAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('classpassAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(classpassAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await classpassAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(classpassAdapter.getDetails('x')).rejects.toThrow();
  });
});
