import { describe, it, expect } from 'vitest';
import { taskrabbitAdapter } from './index';
import { assertAdapterConforms } from '../../../core';

describe('taskrabbitAdapter', () => {
  it('conforms to the adapter contract', () => {
    expect(() => assertAdapterConforms(taskrabbitAdapter)).not.toThrow();
  });

  it('search() returns an empty array (stub)', async () => {
    const results = await taskrabbitAdapter.search({ text: 'anything' });
    expect(results).toEqual([]);
  });

  it('getDetails() throws (stub)', async () => {
    await expect(taskrabbitAdapter.getDetails('x')).rejects.toThrow();
  });
});
