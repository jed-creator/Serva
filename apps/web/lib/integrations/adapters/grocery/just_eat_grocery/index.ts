/**
 * Just Eat Grocery adapter (stub).
 *
 * Minimum-viable implementation — declares `search` + `details`
 * capabilities, returns an empty search result set, and throws on
 * `getDetails`. This exists so the registry can list Just Eat Grocery
 * as a known provider while the real connector is being negotiated.
 * Replace the method bodies (and expand capabilities) when a real
 * client lands.
 */
import type { IntegrationAdapter } from '../../../core';

export const justEatGroceryAdapter: IntegrationAdapter = {
  key: 'just_eat_grocery',
  category: 'grocery',
  displayName: 'Just Eat Grocery',
  capabilities: ['search', 'details'],

  async search() {
    return [];
  },

  async getDetails() {
    throw new Error('Just Eat Grocery adapter: not implemented');
  },
};
