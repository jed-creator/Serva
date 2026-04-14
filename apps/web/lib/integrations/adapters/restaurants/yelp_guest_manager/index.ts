/**
 * Yelp Guest Manager adapter (stub).
 *
 * Minimum-viable implementation — declares `search` + `details`
 * capabilities, returns an empty search result set, and throws on
 * `getDetails`. This exists so the registry can list Yelp Guest Manager
 * as a known provider while the real connector is being negotiated.
 * Replace the method bodies (and expand capabilities) when a real
 * client lands.
 */
import type { IntegrationAdapter } from '../../../core';

export const yelpGuestManagerAdapter: IntegrationAdapter = {
  key: 'yelp_guest_manager',
  category: 'restaurants',
  displayName: 'Yelp Guest Manager',
  capabilities: ['search', 'details'],

  async search() {
    return [];
  },

  async getDetails() {
    throw new Error('Yelp Guest Manager adapter: not implemented');
  },
};
