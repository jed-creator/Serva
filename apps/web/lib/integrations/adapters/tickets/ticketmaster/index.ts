/**
 * Ticketmaster reference adapter (mock mode).
 *
 * Covers search (events near a city), getDetails, checkAvailability
 * (returns seat inventory as Slots with price), and book (simulates a
 * confirmed order). Cancel is intentionally omitted — Ticketmaster
 * refunds go through the event organizer, not through a simple API
 * call, and the mock shouldn't pretend otherwise.
 */
import type { IntegrationAdapter } from '../../../core';
import { MockTicketmasterClient } from './client';
import { toNormalized } from './mapper';

const client = new MockTicketmasterClient();

export const ticketmasterAdapter: IntegrationAdapter = {
  key: 'ticketmaster',
  category: 'tickets',
  displayName: 'Ticketmaster',
  capabilities: ['search', 'details', 'availability', 'book'],

  async search(q) {
    const rows = await client.searchEvents(q.text);
    return rows.map(toNormalized);
  },

  async getDetails(externalId) {
    const row = await client.getEvent(externalId);
    return toNormalized(row);
  },

  async checkAvailability(q) {
    return client.getSeats(q.externalId);
  },

  async book({ externalId, slotId, userId }) {
    return client.createOrder(externalId, slotId, userId);
  },
};
