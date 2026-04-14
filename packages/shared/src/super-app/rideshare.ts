/**
 * Orvo super-app — rideshare / taxi / car share.
 *
 * A quote is a ride that has been priced but not yet booked. A booking
 * carries a quote plus the assigned driver once a provider accepts the
 * ride. The status enum covers the full lifecycle from request to
 * completion.
 */
import { z } from 'zod';
import { MoneySchema, GeoPointSchema } from './common';

export const RideProductTypeSchema = z.enum([
  'standard',
  'xl',
  'lux',
  'pool',
  'carshare',
  'taxi',
]);
export type RideProductType = z.infer<typeof RideProductTypeSchema>;

export const RideBookingStatusSchema = z.enum([
  'pending',
  'accepted',
  'arriving',
  'in_progress',
  'completed',
  'cancelled',
]);
export type RideBookingStatus = z.infer<typeof RideBookingStatusSchema>;

export const RideQuoteSchema = z.object({
  id: z.string(),
  provider: z.string(),
  productType: RideProductTypeSchema,
  pickup: GeoPointSchema,
  dropoff: GeoPointSchema,
  etaSeconds: z.number().int().nonnegative(),
  price: MoneySchema,
  /** 1.0 = no surge, 2.0 = 2x. Providers never quote sub-1 surges. */
  surgeMultiplier: z.number().min(1).optional(),
  capacity: z.number().int().min(1),
});
export type RideQuote = z.infer<typeof RideQuoteSchema>;

export const RideDriverSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  vehicle: z.string().min(1),
  licensePlate: z.string().min(1),
});
export type RideDriver = z.infer<typeof RideDriverSchema>;

export const RideBookingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: z.string(),
  externalId: z.string(),
  status: RideBookingStatusSchema,
  driver: RideDriverSchema.optional(),
  quote: RideQuoteSchema,
  requestedAt: z.iso.datetime(),
  completedAt: z.iso.datetime().optional(),
});
export type RideBooking = z.infer<typeof RideBookingSchema>;
