-- =============================================================================
-- ORVO — Super App Expansion
-- Adds catalog, delivery, rideshare, trips, tickets, marketplace,
-- integration hub, and pricing tables.
-- =============================================================================
-- This migration is ADDITIVE ONLY. No existing Orvo tables are modified.
-- 21 new public.* tables + seed data for super_app_categories.
--
-- How to run:
--   Via Supabase Management API (SUPABASE_MANAGEMENT_PAT) or
--   Supabase Dashboard → SQL Editor → paste + Run.
--
-- Tables created:
--   Shopping:      products, product_variants, product_offers
--   Delivery:      delivery_merchants, delivery_items, delivery_orders,
--                  delivery_order_items
--   Rideshare:     rideshare_quotes, rideshare_bookings
--   Trips:         trips, trip_items
--   Tickets:       tickets_events, tickets_listings, ticket_orders
--   Marketplace:   marketplace_listings, marketplace_offers
--   Integrations:  integration_providers, integration_connections,
--                  integration_sync_log
--   Pricing:       price_snapshots
--   Routing:       super_app_categories
-- =============================================================================


-- =============================================================================
-- SECTION 1: EXTENSIONS
-- =============================================================================
-- Already present from 001_initial_schema.sql; re-declared idempotently
-- so this migration is safe to run standalone.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";


-- =============================================================================
-- SECTION 2: SHOPPING CATALOG
-- =============================================================================
-- `products` are canonical SKU rows identified by `fingerprint`
-- (a provider-agnostic hash of brand+title+variant). `product_offers`
-- are provider-specific price/availability rows — the price comparison
-- engine ranks offers by `price_amount` grouped by `fingerprint`.

CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  brand       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,
  fingerprint TEXT NOT NULL UNIQUE,
  media       JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS products_category_idx    ON public.products (category);
CREATE INDEX IF NOT EXISTS products_fingerprint_idx ON public.products (fingerprint);

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE IF NOT EXISTS public.product_variants (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size       TEXT,
  color      TEXT,
  sku        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS product_variants_product_idx ON public.product_variants (product_id);


CREATE TABLE IF NOT EXISTS public.product_offers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id        UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  provider          TEXT NOT NULL,
  external_id       TEXT NOT NULL,
  price_amount      INTEGER NOT NULL CHECK (price_amount >= 0),
  currency          TEXT NOT NULL,
  url               TEXT NOT NULL,
  in_stock          BOOLEAN NOT NULL DEFAULT TRUE,
  shipping_eta_days INTEGER,
  captured_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, external_id)
);
CREATE INDEX IF NOT EXISTS product_offers_product_idx ON public.product_offers (product_id);


-- =============================================================================
-- SECTION 3: DELIVERY & GROCERY
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.delivery_merchants (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider         TEXT NOT NULL,
  external_id      TEXT NOT NULL,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL CHECK (category IN ('restaurant','grocery','convenience','retail')),
  location         GEOGRAPHY(POINT, 4326),
  rating           NUMERIC(3,2) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  avg_prep_minutes INTEGER,
  raw              JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, external_id)
);
CREATE INDEX IF NOT EXISTS delivery_merchants_location_idx
  ON public.delivery_merchants USING GIST (location);
CREATE INDEX IF NOT EXISTS delivery_merchants_category_idx
  ON public.delivery_merchants (category);


CREATE TABLE IF NOT EXISTS public.delivery_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id  UUID NOT NULL REFERENCES public.delivery_merchants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price_amount INTEGER NOT NULL CHECK (price_amount >= 0),
  currency     TEXT NOT NULL,
  media        JSONB NOT NULL DEFAULT '[]'::jsonb,
  category     TEXT
);
CREATE INDEX IF NOT EXISTS delivery_items_merchant_idx ON public.delivery_items (merchant_id);


CREATE TABLE IF NOT EXISTS public.delivery_orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id       UUID NOT NULL REFERENCES public.delivery_merchants(id),
  provider          TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  subtotal_amount   INTEGER NOT NULL CHECK (subtotal_amount >= 0),
  fees_amount       INTEGER NOT NULL DEFAULT 0 CHECK (fees_amount >= 0),
  total_amount      INTEGER NOT NULL CHECK (total_amount >= 0),
  currency          TEXT NOT NULL,
  delivery_location GEOGRAPHY(POINT, 4326),
  placed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS delivery_orders_user_idx     ON public.delivery_orders (user_id, placed_at DESC);
CREATE INDEX IF NOT EXISTS delivery_orders_merchant_idx ON public.delivery_orders (merchant_id);


CREATE TABLE IF NOT EXISTS public.delivery_order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  item_id    UUID REFERENCES public.delivery_items(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  notes      TEXT
);
CREATE INDEX IF NOT EXISTS delivery_order_items_order_idx ON public.delivery_order_items (order_id);


-- =============================================================================
-- SECTION 4: RIDESHARE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rideshare_quotes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider         TEXT NOT NULL,
  product_type     TEXT NOT NULL CHECK (product_type IN ('standard','xl','lux','pool','carshare','taxi')),
  pickup           GEOGRAPHY(POINT, 4326) NOT NULL,
  dropoff          GEOGRAPHY(POINT, 4326) NOT NULL,
  eta_seconds      INTEGER NOT NULL CHECK (eta_seconds >= 0),
  price_amount     INTEGER NOT NULL CHECK (price_amount >= 0),
  currency         TEXT NOT NULL,
  surge_multiplier NUMERIC(4,2) CHECK (surge_multiplier IS NULL OR surge_multiplier >= 1.0),
  capacity         INTEGER,
  captured_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rideshare_quotes_pickup_idx ON public.rideshare_quotes USING GIST (pickup);


CREATE TABLE IF NOT EXISTS public.rideshare_bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,
  external_id   TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','arriving','in_progress','completed','cancelled')),
  quote_id      UUID REFERENCES public.rideshare_quotes(id),
  driver_name   TEXT,
  driver_phone  TEXT,
  vehicle       TEXT,
  license_plate TEXT,
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS rideshare_bookings_user_idx ON public.rideshare_bookings (user_id, requested_at DESC);


-- =============================================================================
-- SECTION 5: TRIPS
-- =============================================================================
-- `trip_items` is intentionally flexible: provider/external_id are nullable
-- so users can add manually-entered reservations. The app layer (shared
-- TripItemSchema) enforces provider+externalId for adapter-sourced items.

CREATE TABLE IF NOT EXISTS public.trips (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL CHECK (end_date >= start_date),
  primary_location GEOGRAPHY(POINT, 4326),
  cover_media      JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS trips_user_idx ON public.trips (user_id, start_date DESC);

DROP TRIGGER IF EXISTS set_trips_updated_at ON public.trips;
CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE IF NOT EXISTS public.trip_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id           UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  kind              TEXT NOT NULL CHECK (kind IN ('flight','hotel','restaurant','experience','activity','transfer')),
  provider          TEXT,
  external_id       TEXT,
  title             TEXT NOT NULL,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ,
  location          GEOGRAPHY(POINT, 4326),
  price_amount      INTEGER,
  currency          TEXT,
  confirmation_code TEXT,
  raw               JSONB
);
CREATE INDEX IF NOT EXISTS trip_items_trip_idx ON public.trip_items (trip_id, starts_at);


-- =============================================================================
-- SECTION 6: TICKETS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tickets_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider    TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title       TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('concert','sports','theater','comedy','festival')),
  venue       TEXT,
  location    GEOGRAPHY(POINT, 4326),
  starts_at   TIMESTAMPTZ NOT NULL,
  media       JSONB NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (provider, external_id)
);
CREATE INDEX IF NOT EXISTS tickets_events_starts_idx   ON public.tickets_events (starts_at);
CREATE INDEX IF NOT EXISTS tickets_events_location_idx ON public.tickets_events USING GIST (location);


CREATE TABLE IF NOT EXISTS public.tickets_listings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID NOT NULL REFERENCES public.tickets_events(id) ON DELETE CASCADE,
  provider     TEXT NOT NULL,
  external_id  TEXT NOT NULL,
  section      TEXT,
  "row"        TEXT,
  seat         TEXT,
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_amount INTEGER NOT NULL CHECK (price_amount >= 0),
  currency     TEXT NOT NULL,
  source       TEXT NOT NULL CHECK (source IN ('primary','resale')),
  captured_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, external_id)
);
CREATE INDEX IF NOT EXISTS tickets_listings_event_idx ON public.tickets_listings (event_id);


CREATE TABLE IF NOT EXISTS public.ticket_orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id          UUID NOT NULL REFERENCES public.tickets_events(id),
  listing_ids       UUID[] NOT NULL,
  total_amount      INTEGER NOT NULL CHECK (total_amount >= 0),
  currency          TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','fulfilled','cancelled','refunded')),
  confirmation_code TEXT,
  placed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ticket_orders_user_idx ON public.ticket_orders (user_id, placed_at DESC);


-- =============================================================================
-- SECTION 7: MARKETPLACE (P2P + services)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind           TEXT NOT NULL CHECK (kind IN ('item','service')),
  title          TEXT NOT NULL,
  description    TEXT,
  media          JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_amount   INTEGER NOT NULL CHECK (price_amount >= 0),
  currency       TEXT NOT NULL,
  location       GEOGRAPHY(POINT, 4326),
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','pending','sold','withdrawn')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS marketplace_listings_location_idx ON public.marketplace_listings USING GIST (location);
CREATE INDEX IF NOT EXISTS marketplace_listings_seller_idx   ON public.marketplace_listings (seller_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_listings_status_idx   ON public.marketplace_listings (status);

DROP TRIGGER IF EXISTS set_marketplace_listings_updated_at ON public.marketplace_listings;
CREATE TRIGGER set_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE IF NOT EXISTS public.marketplace_offers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL CHECK (amount >= 0),
  currency      TEXT NOT NULL,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','declined','withdrawn')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS marketplace_offers_listing_idx ON public.marketplace_offers (listing_id);
CREATE INDEX IF NOT EXISTS marketplace_offers_buyer_idx   ON public.marketplace_offers (buyer_user_id);


-- =============================================================================
-- SECTION 8: INTEGRATION HUB
-- =============================================================================
-- `integration_providers` is the static registry (82+ providers).
-- `integration_connections` holds per-user/per-business OAuth tokens.
-- `integration_sync_log` is the operational audit trail.

CREATE TABLE IF NOT EXISTS public.integration_providers (
  key          TEXT PRIMARY KEY,
  category     TEXT NOT NULL,
  display_name TEXT NOT NULL,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  is_reference BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS integration_providers_category_idx ON public.integration_providers (category);


CREATE TABLE IF NOT EXISTS public.integration_connections (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_key      TEXT NOT NULL REFERENCES public.integration_providers(key),
  owner_user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  access_token      TEXT,
  refresh_token     TEXT,
  token_expires_at  TIMESTAMPTZ,
  scopes            TEXT[],
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','revoked','expired','error')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (owner_user_id IS NOT NULL OR owner_business_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS integration_connections_user_idx     ON public.integration_connections (owner_user_id);
CREATE INDEX IF NOT EXISTS integration_connections_business_idx ON public.integration_connections (owner_business_id);
CREATE INDEX IF NOT EXISTS integration_connections_provider_idx ON public.integration_connections (provider_key);

DROP TRIGGER IF EXISTS set_integration_connections_updated_at ON public.integration_connections;
CREATE TRIGGER set_integration_connections_updated_at
  BEFORE UPDATE ON public.integration_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE IF NOT EXISTS public.integration_sync_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_key  TEXT REFERENCES public.integration_providers(key),
  connection_id UUID REFERENCES public.integration_connections(id) ON DELETE SET NULL,
  operation     TEXT NOT NULL, -- search|details|availability|book|cancel|webhook
  level         TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info','warn','error')),
  message       TEXT,
  payload       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS integration_sync_log_provider_idx ON public.integration_sync_log (provider_key, created_at DESC);
CREATE INDEX IF NOT EXISTS integration_sync_log_level_idx    ON public.integration_sync_log (level, created_at DESC);


-- =============================================================================
-- SECTION 9: PRICING SNAPSHOTS
-- =============================================================================
-- Historical record of every price we've observed for a given fingerprint.
-- Used by the price comparison engine for history charts and staleness checks.

CREATE TABLE IF NOT EXISTS public.price_snapshots (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint  TEXT NOT NULL,
  provider     TEXT NOT NULL,
  price_amount INTEGER NOT NULL CHECK (price_amount >= 0),
  currency     TEXT NOT NULL,
  url          TEXT NOT NULL,
  captured_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS price_snapshots_fingerprint_idx
  ON public.price_snapshots (fingerprint, captured_at DESC);
CREATE INDEX IF NOT EXISTS price_snapshots_provider_idx
  ON public.price_snapshots (provider, captured_at DESC);


-- =============================================================================
-- SECTION 10: SUPER-APP CATEGORIES (top-level routing metadata)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.super_app_categories (
  key        TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  icon       TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled    BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO public.super_app_categories (key, title, icon, sort_order) VALUES
  ('shop',    'Shop',    'shopping-bag', 10),
  ('eat',     'Eat',     'utensils',     20),
  ('ride',    'Ride',    'car',          30),
  ('trips',   'Trips',   'plane',        40),
  ('tickets', 'Tickets', 'ticket',       50),
  ('market',  'Market',  'store',        60),
  ('book',    'Book',    'calendar',     70),
  ('compare', 'Compare', 'bar-chart',    80)
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- SECTION 11: ROW LEVEL SECURITY
-- =============================================================================
-- Permissive defaults. These will be tightened per table as product
-- requirements solidify. Public catalog data is world-readable; user-owned
-- rows are scoped to auth.uid().

ALTER TABLE public.products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_offers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_merchants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rideshare_quotes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rideshare_bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets_listings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_offers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_providers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_snapshots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_app_categories    ENABLE ROW LEVEL SECURITY;

-- ---------- Public catalog reads ----------

DROP POLICY IF EXISTS "public read products" ON public.products;
CREATE POLICY "public read products" ON public.products
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read product variants" ON public.product_variants;
CREATE POLICY "public read product variants" ON public.product_variants
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read product offers" ON public.product_offers;
CREATE POLICY "public read product offers" ON public.product_offers
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read delivery merchants" ON public.delivery_merchants;
CREATE POLICY "public read delivery merchants" ON public.delivery_merchants
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read delivery items" ON public.delivery_items;
CREATE POLICY "public read delivery items" ON public.delivery_items
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read rideshare quotes" ON public.rideshare_quotes;
CREATE POLICY "public read rideshare quotes" ON public.rideshare_quotes
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read tickets events" ON public.tickets_events;
CREATE POLICY "public read tickets events" ON public.tickets_events
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read tickets listings" ON public.tickets_listings;
CREATE POLICY "public read tickets listings" ON public.tickets_listings
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read marketplace listings" ON public.marketplace_listings;
CREATE POLICY "public read marketplace listings" ON public.marketplace_listings
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "public read super app categories" ON public.super_app_categories;
CREATE POLICY "public read super app categories" ON public.super_app_categories
  FOR SELECT USING (enabled = TRUE);

DROP POLICY IF EXISTS "public read integration providers" ON public.integration_providers;
CREATE POLICY "public read integration providers" ON public.integration_providers
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read price snapshots" ON public.price_snapshots;
CREATE POLICY "public read price snapshots" ON public.price_snapshots
  FOR SELECT USING (TRUE);

-- ---------- Owner reads/writes on user-scoped tables ----------

DROP POLICY IF EXISTS "user owns delivery orders" ON public.delivery_orders;
CREATE POLICY "user owns delivery orders" ON public.delivery_orders
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user owns delivery order items" ON public.delivery_order_items;
CREATE POLICY "user owns delivery order items" ON public.delivery_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.delivery_orders o
      WHERE o.id = delivery_order_items.order_id AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.delivery_orders o
      WHERE o.id = delivery_order_items.order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "user owns rideshare bookings" ON public.rideshare_bookings;
CREATE POLICY "user owns rideshare bookings" ON public.rideshare_bookings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user owns trips" ON public.trips;
CREATE POLICY "user owns trips" ON public.trips
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user owns trip items" ON public.trip_items;
CREATE POLICY "user owns trip items" ON public.trip_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_items.trip_id AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_items.trip_id AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "user owns ticket orders" ON public.ticket_orders;
CREATE POLICY "user owns ticket orders" ON public.ticket_orders
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "seller owns marketplace listings" ON public.marketplace_listings;
CREATE POLICY "seller owns marketplace listings" ON public.marketplace_listings
  FOR ALL USING (auth.uid() = seller_user_id)
  WITH CHECK (auth.uid() = seller_user_id);

DROP POLICY IF EXISTS "buyer or seller reads marketplace offers" ON public.marketplace_offers;
CREATE POLICY "buyer or seller reads marketplace offers" ON public.marketplace_offers
  FOR SELECT USING (
    auth.uid() = buyer_user_id OR
    EXISTS (
      SELECT 1 FROM public.marketplace_listings l
      WHERE l.id = marketplace_offers.listing_id AND l.seller_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "buyer creates marketplace offers" ON public.marketplace_offers;
CREATE POLICY "buyer creates marketplace offers" ON public.marketplace_offers
  FOR INSERT WITH CHECK (auth.uid() = buyer_user_id);

DROP POLICY IF EXISTS "buyer updates own marketplace offers" ON public.marketplace_offers;
CREATE POLICY "buyer updates own marketplace offers" ON public.marketplace_offers
  FOR UPDATE USING (auth.uid() = buyer_user_id) WITH CHECK (auth.uid() = buyer_user_id);

DROP POLICY IF EXISTS "owner reads integration connections" ON public.integration_connections;
CREATE POLICY "owner reads integration connections" ON public.integration_connections
  FOR SELECT USING (
    auth.uid() = owner_user_id OR
    (owner_business_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = integration_connections.owner_business_id AND b.owner_id = auth.uid()
    ))
  );

-- integration_sync_log is admin-only for now — no policies means default deny
-- except for the service role, which bypasses RLS.

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
