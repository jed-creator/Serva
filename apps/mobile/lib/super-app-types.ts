/**
 * Mobile-side types for the super-app fan-out API.
 *
 * Mirrors `apps/web/lib/integrations/core/types.ts` — we re-declare here
 * rather than importing across the workspace because Metro's monorepo
 * bundling has quirks. If the web side changes these shapes, update
 * here in lockstep.
 */

export type IntegrationCategory =
  | 'restaurants'
  | 'delivery'
  | 'beauty-wellness'
  | 'medspa'
  | 'fitness'
  | 'general-booking'
  | 'shopify-booking'
  | 'travel'
  | 'hotel-direct'
  | 'experiences'
  | 'rideshare'
  | 'grocery'
  | 'tickets'
  | 'home-services'
  | 'pet-care'
  | 'ecommerce';

/**
 * Shape returned by every adapter's `search()`. Same as the web side —
 * keep in sync with `NormalizedSearchResult` in core/types.ts.
 */
export interface NormalizedSearchResult {
  id: string;
  provider: string;
  category: IntegrationCategory;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  priceCents?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  location?: {
    lat?: number;
    lng?: number;
    label?: string;
  };
  externalUrl?: string;
  meta?: Record<string, unknown>;
}

/**
 * Shape of responses from `/api/<category>/search`. Some routes use
 * `results`, some `services`, some `rides` — all normalize to a flat
 * array client-side (see `super-app-api.ts`).
 */
export type ApiSearchResponse = {
  results?: NormalizedSearchResult[];
  services?: NormalizedSearchResult[];
  rides?: NormalizedSearchResult[];
  trips?: NormalizedSearchResult[];
  tickets?: NormalizedSearchResult[];
  products?: NormalizedSearchResult[];
  listings?: NormalizedSearchResult[];
  items?: NormalizedSearchResult[];
};
