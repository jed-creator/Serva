/**
 * Mock Ticketmaster Discovery client. No HTTP.
 *
 * Real Ticketmaster Discovery API returns paginated events with a
 * geo radius param and venue metadata. The mock returns a fixed
 * set of Seattle-area events regardless of the `near` argument.
 */
import type { Slot } from '../../../core';
import {
  EVENTS,
  SEAT_INVENTORY,
  type TicketmasterEventFixture,
  type SeatInventoryFixture,
} from './fixtures';

let orderCounter = 0;

export class MockTicketmasterClient {
  async searchEvents(text: string): Promise<TicketmasterEventFixture[]> {
    const needle = text.trim().toLowerCase();
    if (!needle) return [...EVENTS];
    return EVENTS.filter(
      (e) =>
        e.name.toLowerCase().includes(needle) ||
        e.venue.toLowerCase().includes(needle) ||
        e.kind.toLowerCase().includes(needle)
    );
  }

  async getEvent(externalId: string): Promise<TicketmasterEventFixture> {
    const row = EVENTS.find((e) => e.externalId === externalId);
    if (!row) {
      throw new Error(`Ticketmaster: unknown event ${externalId}`);
    }
    return row;
  }

  async getSeats(externalId: string): Promise<Slot[]> {
    const event = await this.getEvent(externalId);
    const inventory: SeatInventoryFixture[] = SEAT_INVENTORY[externalId] ?? [];
    return inventory.map((seat) => ({
      externalSlotId: seat.externalSlotId,
      startsAt: event.startsAt,
      price: {
        amount: seat.priceCents,
        currency: 'USD',
      },
    }));
  }

  async createOrder(
    externalId: string,
    slotId: string,
    _userId: string
  ): Promise<{ externalBookingId: string; status: string }> {
    await this.getEvent(externalId);
    orderCounter += 1;
    return {
      externalBookingId: `tm-order-${orderCounter}-${slotId}`,
      status: 'confirmed',
    };
  }
}
