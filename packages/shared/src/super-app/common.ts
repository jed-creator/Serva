/**
 * Orvo super-app — common domain primitives.
 *
 * Every super-app module composes these: money is stored in minor units
 * (cents), geography uses WGS84 lat/lng pairs (not PostGIS types — that lives
 * in the database layer), and media uses a discriminated kind tag so we can
 * mix images/video/audio in a single listing.
 */
import { z } from 'zod';

export const CurrencySchema = z.enum(['USD', 'CAD', 'EUR', 'GBP']);
export type Currency = z.infer<typeof CurrencySchema>;

/**
 * Monetary amounts are always stored as integer minor units (e.g. cents) to
 * avoid float rounding. A $12.99 price is `{ amount: 1299, currency: 'USD' }`.
 */
export const MoneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: CurrencySchema,
});
export type Money = z.infer<typeof MoneySchema>;

/** WGS84 lat/lng pair. Used for search, routing, and delivery destinations. */
export const GeoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof GeoPointSchema>;

export const MediaKindSchema = z.enum(['image', 'video', 'audio']);
export type MediaKind = z.infer<typeof MediaKindSchema>;

export const MediaAssetSchema = z.object({
  url: z.url(),
  kind: MediaKindSchema,
  alt: z.string().optional(),
});
export type MediaAsset = z.infer<typeof MediaAssetSchema>;
