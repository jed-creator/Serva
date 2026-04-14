/**
 * Orvo super-app — shopping (cross-brand product catalog).
 *
 * Products are canonical items; variants are sizes/colors; offers are
 * per-retailer listings. `fingerprint` lets the price comparison engine
 * dedup the same physical product across multiple providers.
 */
import { z } from 'zod';
import { MoneySchema, MediaAssetSchema } from './common';

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  brand: z.string(),
  description: z.string(),
  category: z.string(),
  media: z.array(MediaAssetSchema),
  /** Stable cross-provider dedup key, e.g. `sha256:<hash-of-title+brand+attrs>`. */
  fingerprint: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  size: z.string().optional(),
  color: z.string().optional(),
  sku: z.string().optional(),
});
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductOfferSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string().optional(),
  /** Integration provider key, e.g. 'shopify' or 'woocommerce'. */
  provider: z.string(),
  /** ID the provider itself uses for this offer. */
  externalId: z.string(),
  price: MoneySchema,
  url: z.url(),
  inStock: z.boolean(),
  shippingEstimateDays: z.number().int().optional(),
});
export type ProductOffer = z.infer<typeof ProductOfferSchema>;

export const ProductSearchQuerySchema = z.object({
  text: z.string().min(1),
  brand: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().int().optional(),
  maxPrice: z.number().int().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ProductSearchQuery = z.infer<typeof ProductSearchQuerySchema>;
