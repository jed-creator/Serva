/**
 * OpenTable reference adapter (mock mode).
 *
 * Runs entirely on hard-coded fixtures — no network. Used as the
 * "reference" implementation of the restaurants vertical until a real
 * OpenTable connector agreement is signed. Swapping in the live client
 * only requires replacing `client.ts`.
 */
import type { IntegrationAdapter } from '../../../core';
import { MockOpenTableClient } from './client';
import { toNormalized } from './mapper';

const client = new MockOpenTableClient();

export const openTableAdapter: IntegrationAdapter = {
  key: 'opentable',
  category: 'restaurants',
  displayName: 'OpenTable',
  capabilities: ['search', 'details', 'availability', 'book', 'cancel'],

  async search(q) {
    const rows = await client.searchRestaurants(q.text);
    return rows.map(toNormalized);
  },

  async getDetails(externalId) {
    const row = await client.getRestaurant(externalId);
    return toNormalized(row);
  },

  async checkAvailability(q) {
    return client.getSlots(q.externalId, q.date, q.party ?? 2);
  },

  async book({ externalId, slotId, userId }) {
    return client.createBooking(externalId, slotId, userId);
  },

  async cancel(externalBookingId) {
    return client.cancelBooking(externalBookingId);
  },
};
