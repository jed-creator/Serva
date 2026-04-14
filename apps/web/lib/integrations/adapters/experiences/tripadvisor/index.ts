/**
 * Tripadvisor adapter (stub).
 *
 * Minimum-viable implementation — declares `search` + `details`
 * capabilities, returns an empty search result set, and throws on
 * `getDetails`. This exists so the registry can list Tripadvisor
 * as a known provider while the real connector is being negotiated.
 * Replace the method bodies (and expand capabilities) when a real
 * client lands.
 */
import type { IntegrationAdapter } from '../../../core';

export const tripadvisorAdapter: IntegrationAdapter = {
  key: 'tripadvisor',
  category: 'experiences',
  displayName: 'Tripadvisor',
  capabilities: ['search', 'details'],

  async search() {
    return [];
  },

  async getDetails() {
    throw new Error('Tripadvisor adapter: not implemented');
  },
};
