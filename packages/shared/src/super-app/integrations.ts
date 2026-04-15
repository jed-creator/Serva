/**
 * Orvo super-app — third-party integration contract.
 *
 * Every adapter (OpenTable, DoorDash, Uber, Ticketmaster, Shopify, …)
 * implements the `IntegrationAdapter` interface. The shape is deliberately
 * narrow: `search`, `getDetails`, and optional `checkAvailability`, `book`,
 * `cancel`, `handleWebhook`. That keeps the surface area for adapter
 * authors small — a conformance test (Phase 3) walks every registered
 * adapter and asserts the declared capabilities match the implemented
 * methods.
 *
 * Results cross the adapter boundary as `NormalizedSearchResult`. Each
 * vertical (restaurants, flights, tickets, …) has vertical-specific
 * fields, but the normalized shape is what the UI, price comparison,
 * trip builder, and search index all consume. Adapter-specific details
 * can ride along as `metadata` if truly needed, but UI code must not
 * depend on the shape of `metadata` — it's an escape hatch, not a
 * contract.
 *
 * `AvailabilityQuery` carries both `party` (restaurants, experiences)
 * and `quantity` (tickets, items) because the same query schema covers
 * the full catalog. Adapters ignore whichever field doesn't apply.
 */
import { z } from 'zod';
import { MoneySchema, GeoPointSchema, MediaAssetSchema } from './common';

export const IntegrationCategorySchema = z.enum([
  'restaurants',
  'delivery',
  'beauty-wellness',
  'medspa',
  'fitness',
  'general-booking',
  'shopify-booking',
  'travel',
  'hotel-direct',
  'experiences',
  'rideshare',
  'grocery',
  'tickets',
  'home-services',
  'pet-care',
  'ecommerce',
]);
export type IntegrationCategory = z.infer<typeof IntegrationCategorySchema>;

export const AdapterCapabilitySchema = z.enum([
  'search',
  'details',
  'availability',
  'book',
  'cancel',
  'webhook',
]);
export type AdapterCapability = z.infer<typeof AdapterCapabilitySchema>;

export const NormalizedSearchResultSchema = z.object({
  provider: z.string(),
  externalId: z.string(),
  title: z.string().min(1),
  category: IntegrationCategorySchema,
  subtitle: z.string().optional(),
  media: z.array(MediaAssetSchema).optional(),
  location: GeoPointSchema.optional(),
  price: MoneySchema.optional(),
  rating: z.number().min(0).max(5).optional(),
  url: z.url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type NormalizedSearchResult = z.infer<typeof NormalizedSearchResultSchema>;

export const AvailabilityQuerySchema = z.object({
  externalId: z.string(),
  date: z.iso.date(),
  party: z.number().int().positive().optional(),
  quantity: z.number().int().positive().optional(),
});
export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>;

export const SlotSchema = z.object({
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime().optional(),
  price: MoneySchema.optional(),
  externalSlotId: z.string(),
});
export type Slot = z.infer<typeof SlotSchema>;

/**
 * Every vertical adapter implements this interface. `search` and
 * `getDetails` are required — they're the minimum to surface a result in
 * the Explore hub. Everything else is optional and gated on the
 * adapter's declared `capabilities`: a conformance test in Phase 3
 * asserts that an adapter that declares `'book'` actually implements
 * `book`, and vice versa.
 */
export interface IntegrationAdapter {
  readonly key: string;
  readonly category: IntegrationCategory;
  readonly displayName: string;
  readonly capabilities: AdapterCapability[];

  search(query: {
    text: string;
    near?: { lat: number; lng: number };
  }): Promise<NormalizedSearchResult[]>;

  getDetails(externalId: string): Promise<NormalizedSearchResult>;

  checkAvailability?(q: AvailabilityQuery): Promise<Slot[]>;

  book?(req: {
    externalId: string;
    slotId: string;
    userId: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ externalBookingId: string; status: string }>;

  cancel?(externalBookingId: string): Promise<{ status: string }>;

  handleWebhook?(payload: unknown, signature?: string): Promise<void>;
}
