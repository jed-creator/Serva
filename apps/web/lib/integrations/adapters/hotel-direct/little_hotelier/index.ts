/**
 * Little Hotelier adapter (stub).
 *
 * Minimum-viable implementation — declares `search` + `details`
 * capabilities, returns an empty search result set, and throws on
 * `getDetails`. This exists so the registry can list Little Hotelier
 * as a known provider while the real connector is being negotiated.
 * Replace the method bodies (and expand capabilities) when a real
 * client lands.
 */
import type { IntegrationAdapter } from '../../../core';

export const littleHotelierAdapter: IntegrationAdapter = {
  key: 'little_hotelier',
  category: 'hotel-direct',
  displayName: 'Little Hotelier',
  capabilities: ['search', 'details'],

  async search() {
    return [];
  },

  async getDetails() {
    throw new Error('Little Hotelier adapter: not implemented');
  },
};
