/**
 * StubHub adapter (stub).
 *
 * Minimum-viable implementation — declares `search` + `details`
 * capabilities, returns an empty search result set, and throws on
 * `getDetails`. This exists so the registry can list StubHub
 * as a known provider while the real connector is being negotiated.
 * Replace the method bodies (and expand capabilities) when a real
 * client lands.
 */
import type { IntegrationAdapter } from '../../../core';

export const stubhubAdapter: IntegrationAdapter = {
  key: 'stubhub',
  category: 'tickets',
  displayName: 'StubHub',
  capabilities: ['search', 'details'],

  async search() {
    return [];
  },

  async getDetails() {
    throw new Error('StubHub adapter: not implemented');
  },
};
