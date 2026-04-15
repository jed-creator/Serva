/**
 * Orvo super-app — P2P marketplace (Facebook Marketplace + TaskRabbit).
 *
 * Listings cover both physical items for sale and service offerings.
 * Offers are buyer-side bids/inquiries against a listing. Listings carry
 * an optional location because services may be remote (tutoring,
 * consulting) while items usually have a pickup/shipping origin.
 */
import { z } from 'zod';
import { MoneySchema, GeoPointSchema, MediaAssetSchema } from './common';

export const MarketplaceListingKindSchema = z.enum(['item', 'service']);
export type MarketplaceListingKind = z.infer<typeof MarketplaceListingKindSchema>;

export const MarketplaceListingStatusSchema = z.enum([
  'active',
  'pending',
  'sold',
  'withdrawn',
]);
export type MarketplaceListingStatus = z.infer<typeof MarketplaceListingStatusSchema>;

export const MarketplaceListingSchema = z.object({
  id: z.string(),
  sellerUserId: z.string(),
  kind: MarketplaceListingKindSchema,
  title: z.string().min(1),
  description: z.string(),
  media: z.array(MediaAssetSchema),
  price: MoneySchema,
  location: GeoPointSchema.optional(),
  status: MarketplaceListingStatusSchema,
  createdAt: z.iso.datetime(),
});
export type MarketplaceListing = z.infer<typeof MarketplaceListingSchema>;

export const MarketplaceOfferStatusSchema = z.enum([
  'pending',
  'accepted',
  'declined',
  'withdrawn',
]);
export type MarketplaceOfferStatus = z.infer<typeof MarketplaceOfferStatusSchema>;

export const MarketplaceOfferSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  buyerUserId: z.string(),
  amount: MoneySchema,
  message: z.string().optional(),
  status: MarketplaceOfferStatusSchema,
});
export type MarketplaceOffer = z.infer<typeof MarketplaceOfferSchema>;
