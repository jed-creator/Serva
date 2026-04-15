/**
 * Orvo super-app — trip planner.
 *
 * A Trip is the high-level header (dates, destination). TripItem is a
 * discriminated union over the things that can live inside a trip
 * (flights, hotels, restaurants, experiences, activities, transfers) —
 * using a discriminated union leaves room for per-kind extensions
 * (airline + flight number, check-in time, etc.) without fracturing
 * downstream code.
 *
 * TripItinerary groups items by trip and is expected to be rendered in
 * `startsAt` order. Sort order is a presentation concern and is not
 * enforced by the schema.
 */
import { z } from 'zod';
import { MoneySchema, GeoPointSchema, MediaAssetSchema } from './common';

export const TripItemKindSchema = z.enum([
  'flight',
  'hotel',
  'restaurant',
  'experience',
  'activity',
  'transfer',
]);
export type TripItemKind = z.infer<typeof TripItemKindSchema>;

export const TripSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  primaryLocation: GeoPointSchema,
  coverMedia: MediaAssetSchema.optional(),
});
export type Trip = z.infer<typeof TripSchema>;

/**
 * Every trip-item variant currently carries the same fields. The
 * discriminated union exists so future extensions (per-kind metadata)
 * can live in the right branch without forcing a schema-wide bump.
 */
const tripItemBase = {
  provider: z.string(),
  externalId: z.string(),
  title: z.string().min(1),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  location: GeoPointSchema.optional(),
  price: MoneySchema,
  confirmationCode: z.string().optional(),
};

export const TripItemSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('flight'), ...tripItemBase }),
  z.object({ kind: z.literal('hotel'), ...tripItemBase }),
  z.object({ kind: z.literal('restaurant'), ...tripItemBase }),
  z.object({ kind: z.literal('experience'), ...tripItemBase }),
  z.object({ kind: z.literal('activity'), ...tripItemBase }),
  z.object({ kind: z.literal('transfer'), ...tripItemBase }),
]);
export type TripItem = z.infer<typeof TripItemSchema>;

export const TripItinerarySchema = z.object({
  tripId: z.string(),
  items: z.array(TripItemSchema),
});
export type TripItinerary = z.infer<typeof TripItinerarySchema>;
