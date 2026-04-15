/**
 * Booking.com Attractions adapter (stub).
 *
 * Minimum-viable implementation — declares `search` + `details`
 * capabilities, returns an empty search result set, and throws on
 * `getDetails`. This exists so the registry can list Booking.com Attractions
 * as a known provider while the real connector is being negotiated.
 * Replace the method bodies (and expand capabilities) when a real
 * client lands.
 */
import type { IntegrationAdapter } from '../../../core';

export const bookingAttractionsAdapter: IntegrationAdapter = {
  key: 'booking_attractions',
  category: 'experiences',
  displayName: 'Booking.com Attractions',
  capabilities: ['search', 'details'],

  async search() {
    return [];
  },

  async getDetails() {
    throw new Error('Booking.com Attractions adapter: not implemented');
  },
};
