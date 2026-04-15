/**
 * Mock OpenTable client. Returns fixture data with no network I/O.
 *
 * The real client (when connector agreement lands) will mirror this shape
 * and hit https://platform.opentable.com/. Keeping the same method names
 * means the adapter index doesn't need to change — only the client does.
 */
import type { Slot } from '../../../core';
import {
  RESTAURANTS,
  SLOT_HOURS,
  type RestaurantFixture,
} from './fixtures';

let bookingCounter = 0;

export class MockOpenTableClient {
  async searchRestaurants(text: string): Promise<RestaurantFixture[]> {
    const needle = text.trim().toLowerCase();
    if (!needle) return [...RESTAURANTS];
    return RESTAURANTS.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        r.cuisine.toLowerCase().includes(needle) ||
        r.neighborhood.toLowerCase().includes(needle)
    );
  }

  async getRestaurant(externalId: string): Promise<RestaurantFixture> {
    const row = RESTAURANTS.find((r) => r.externalId === externalId);
    if (!row) {
      throw new Error(`OpenTable: unknown restaurant ${externalId}`);
    }
    return row;
  }

  /**
   * Returns a deterministic set of slots for the given date. Party size is
   * accepted for API parity with the real endpoint but doesn't affect the
   * mock result — every slot is treated as bookable.
   */
  async getSlots(externalId: string, date: string, _party: number): Promise<Slot[]> {
    // Throws if restaurant doesn't exist — matches real API behavior.
    await this.getRestaurant(externalId);
    return SLOT_HOURS.map((hhmm, i) => ({
      externalSlotId: `slot-${i + 1}`,
      startsAt: `${date}T${hhmm}:00.000Z`,
    }));
  }

  async createBooking(
    externalId: string,
    slotId: string,
    _userId: string
  ): Promise<{ externalBookingId: string; status: string }> {
    await this.getRestaurant(externalId);
    bookingCounter += 1;
    return {
      externalBookingId: `ot-book-${bookingCounter}-${slotId}`,
      status: 'confirmed',
    };
  }

  async cancelBooking(externalBookingId: string): Promise<{ status: string }> {
    if (!externalBookingId.startsWith('ot-book-')) {
      throw new Error(`OpenTable: invalid booking id ${externalBookingId}`);
    }
    return { status: 'cancelled' };
  }
}
