-- =============================================================================
-- ORVO — Initial Database Schema
-- Build Guide Phase 2 — Steps 16-28 (condensed to one migration)
-- =============================================================================
-- This migration creates the complete schema for Orvo MVP:
--   * Extensions (PostGIS, uuid-ossp, pg_trgm)
--   * Custom ENUM types for status fields
--   * Tables (profiles, businesses, services, staff, bookings, payments,
--            reviews, intake forms, notifications, favorites, categories)
--   * Indices for query performance
--   * Row-Level Security policies
--   * Triggers (updated_at, auto-create profile, booking status history)
--   * Seed data for 40+ service categories
--
-- How to run:
--   1. Go to Supabase Dashboard → your project → SQL Editor
--   2. Click "New query"
--   3. Paste this entire file
--   4. Click "Run"
--   5. Verify: should see "Success. No rows returned" at the bottom
-- =============================================================================


-- =============================================================================
-- SECTION 1: EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- =============================================================================
-- SECTION 2: CUSTOM ENUM TYPES
-- =============================================================================
-- Using DO blocks so this migration is idempotent (safe to re-run).

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('consumer', 'provider', 'provider_staff', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business', 'enterprise');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE price_type AS ENUM ('fixed', 'starting_at', 'hourly', 'free');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending', 'authorized', 'captured', 'refunded', 'failed'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'booking_confirmed', 'booking_reminder', 'booking_cancelled',
    'booking_rescheduled', 'review_request', 'review_received',
    'payment_received', 'payout_sent', 'system'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE form_field_type AS ENUM (
    'text', 'textarea', 'email', 'phone', 'number',
    'select', 'multiselect', 'checkbox', 'radio',
    'date', 'time', 'file', 'signature'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE refund_status AS ENUM ('pending', 'succeeded', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE business_approval_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- =============================================================================
-- SECTION 3: HELPER FUNCTIONS
-- =============================================================================

-- Generic trigger function to update `updated_at` on any row mutation
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- SECTION 4: TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- categories — reference data for business categories (Hair Salon, Massage, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  icon_emoji    TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- profiles — extends auth.users with application-level user data
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   TEXT NOT NULL,
  phone                   TEXT,
  first_name              TEXT,
  last_name               TEXT,
  avatar_url              TEXT,
  role                    user_role NOT NULL DEFAULT 'consumer',
  stripe_customer_id      TEXT,
  notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "sms": true, "push": true}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- businesses — service provider storefronts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  category_id        UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description        TEXT,
  address            JSONB,
  location           GEOGRAPHY(POINT, 4326),
  phone              TEXT,
  email              TEXT,
  website            TEXT,
  logo_url           TEXT,
  cover_image_url    TEXT,
  operating_hours    JSONB,
  approval_status    business_approval_status NOT NULL DEFAULT 'pending',
  subscription_tier  subscription_tier NOT NULL DEFAULT 'free',
  stripe_account_id  TEXT,
  avg_rating         DECIMAL(3,2) NOT NULL DEFAULT 0,
  total_reviews      INTEGER NOT NULL DEFAULT 0,
  cancellation_policy JSONB NOT NULL DEFAULT '{
    "free_cancel_hours": 24,
    "late_cancel_fee_cents": 0,
    "no_show_fee_cents": 0
  }'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_businesses_updated_at ON public.businesses;
CREATE TRIGGER set_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- business_photos — gallery images for a business
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  photo_url     TEXT NOT NULL,
  caption       TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- form_templates — custom intake forms created by businesses
-- (Declared here because services.intake_form_id references it)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.form_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  is_required   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_form_templates_updated_at ON public.form_templates;
CREATE TRIGGER set_form_templates_updated_at
  BEFORE UPDATE ON public.form_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- services — services offered by a business (the bookable items)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  description           TEXT,
  price_cents           INTEGER NOT NULL,
  price_type            price_type NOT NULL DEFAULT 'fixed',
  duration_minutes      INTEGER NOT NULL DEFAULT 60,
  buffer_minutes        INTEGER NOT NULL DEFAULT 0,
  deposit_required      BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_amount_cents  INTEGER,
  intake_form_id        UUID REFERENCES public.form_templates(id) ON DELETE SET NULL,
  max_per_day           INTEGER,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  display_order         INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_services_updated_at ON public.services;
CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- staff — team members at a business who provide services
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_staff_updated_at ON public.staff;
CREATE TRIGGER set_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- staff_services — junction: which staff can perform which services
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_services (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id   UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (staff_id, service_id)
);


-- -----------------------------------------------------------------------------
-- availability_rules — recurring weekly availability per staff member
-- day_of_week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);


-- -----------------------------------------------------------------------------
-- availability_overrides — date-specific overrides (closed holidays, extra hours)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability_overrides (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id   UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  is_closed  BOOLEAN NOT NULL DEFAULT FALSE,
  start_time TIME,
  end_time   TIME,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (staff_id, date)
);


-- -----------------------------------------------------------------------------
-- bookings — the core transaction (a customer booking a service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  business_id           UUID NOT NULL REFERENCES public.businesses(id) ON DELETE RESTRICT,
  service_id            UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  staff_id              UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  start_time            TIMESTAMPTZ NOT NULL,
  end_time              TIMESTAMPTZ NOT NULL,
  status                booking_status NOT NULL DEFAULT 'pending',
  total_cents           INTEGER NOT NULL,
  deposit_cents         INTEGER NOT NULL DEFAULT 0,
  payment_status        payment_status NOT NULL DEFAULT 'pending',
  intake_submission_id  UUID,
  notes                 TEXT,
  cancellation_reason   TEXT,
  cancelled_at          TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  reminder_24h_sent     BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_1h_sent      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- booking_status_history — audit trail of booking status changes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status  booking_status,
  new_status  booking_status NOT NULL,
  changed_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Trigger function to log booking status changes automatically
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.booking_status_history (booking_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_booking_status_trigger ON public.bookings;
CREATE TRIGGER log_booking_status_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.log_booking_status_change();


-- -----------------------------------------------------------------------------
-- payments — Stripe payment records
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id                UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
  stripe_payment_intent_id  TEXT UNIQUE,
  stripe_charge_id          TEXT,
  amount_cents              INTEGER NOT NULL,
  platform_fee_cents        INTEGER NOT NULL DEFAULT 0,
  currency                  TEXT NOT NULL DEFAULT 'usd',
  status                    payment_status NOT NULL DEFAULT 'pending',
  payment_method_type       TEXT,
  receipt_url               TEXT,
  error_message             TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- refunds — refund records linked to payments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.refunds (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id         UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  stripe_refund_id   TEXT UNIQUE,
  amount_cents       INTEGER NOT NULL,
  reason             TEXT,
  status             refund_status NOT NULL DEFAULT 'pending',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_refunds_updated_at ON public.refunds;
CREATE TRIGGER set_refunds_updated_at
  BEFORE UPDATE ON public.refunds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- reviews — verified reviews (only bookings with status='completed' can review)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_flagged  BOOLEAN NOT NULL DEFAULT FALSE,
  is_removed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- review_responses — business responses to reviews
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_responses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id        UUID NOT NULL UNIQUE REFERENCES public.reviews(id) ON DELETE CASCADE,
  business_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  response_text    TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_review_responses_updated_at ON public.review_responses;
CREATE TRIGGER set_review_responses_updated_at
  BEFORE UPDATE ON public.review_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- form_fields — individual fields in a form template
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.form_fields (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id       UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  field_type    form_field_type NOT NULL,
  placeholder   TEXT,
  help_text     TEXT,
  is_required   BOOLEAN NOT NULL DEFAULT FALSE,
  options       JSONB,
  validation    JSONB,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- form_submissions — a customer submission to a form (tied to a booking)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id       UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
  booking_id    UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  consumer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- form_field_values — individual field answers in a submission
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.form_field_values (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id  UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  field_id       UUID NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
  value          TEXT,
  file_url       TEXT,
  UNIQUE (submission_id, field_id)
);


-- Now that form_submissions exists, backfill FK on bookings.intake_submission_id
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_intake_submission_id_fkey;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_intake_submission_id_fkey
  FOREIGN KEY (intake_submission_id)
  REFERENCES public.form_submissions(id) ON DELETE SET NULL;


-- -----------------------------------------------------------------------------
-- favorites — customers' saved businesses
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (consumer_id, business_id)
);


-- -----------------------------------------------------------------------------
-- notifications — in-app notification feed
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type              notification_type NOT NULL,
  title             TEXT NOT NULL,
  message           TEXT NOT NULL,
  related_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  related_business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  is_read           BOOLEAN NOT NULL DEFAULT FALSE,
  read_at           TIMESTAMPTZ,
  push_token        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- push_tokens — device push notification tokens per user
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  platform   TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_push_tokens_updated_at ON public.push_tokens;
CREATE TRIGGER set_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- SECTION 5: INDICES
-- =============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- businesses
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_approval ON public.businesses(approval_status);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON public.businesses USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm ON public.businesses USING GIN(name gin_trgm_ops);

-- services
CREATE INDEX IF NOT EXISTS idx_services_business ON public.services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(business_id, is_active);

-- staff & availability
CREATE INDEX IF NOT EXISTS idx_staff_business ON public.staff(business_id);
CREATE INDEX IF NOT EXISTS idx_availability_rules_staff ON public.availability_rules(staff_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_overrides_staff_date ON public.availability_overrides(staff_id, date);

-- bookings
CREATE INDEX IF NOT EXISTS idx_bookings_consumer ON public.bookings(consumer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business ON public.bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff ON public.bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_business_start ON public.bookings(business_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_reminders ON public.bookings(start_time)
  WHERE status IN ('confirmed') AND reminder_24h_sent = FALSE;

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_business ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_consumer ON public.reviews(consumer_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- favorites
CREATE INDEX IF NOT EXISTS idx_favorites_consumer ON public.favorites(consumer_id);

-- form submissions
CREATE INDEX IF NOT EXISTS idx_form_submissions_booking ON public.form_submissions(booking_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON public.form_submissions(form_id);


-- =============================================================================
-- SECTION 6: ROW-LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------------
-- Helper: check if current user is admin (used in policies)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- -----------------------------------------------------------------------------
-- Policies: categories (public read, admin write)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- -----------------------------------------------------------------------------
-- Policies: profiles
-- Public read (so customers can see business owner names),
-- users can update their own profile, admins can do anything
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());


-- -----------------------------------------------------------------------------
-- Policies: businesses
-- Approved businesses are public. Owners can manage their own.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Approved businesses are viewable by everyone" ON public.businesses;
CREATE POLICY "Approved businesses are viewable by everyone"
  ON public.businesses FOR SELECT
  USING (approval_status = 'approved' OR owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users can create own business" ON public.businesses;
CREATE POLICY "Users can create own business"
  ON public.businesses FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update own business" ON public.businesses;
CREATE POLICY "Owners can update own business"
  ON public.businesses FOR UPDATE
  USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Owners can delete own business" ON public.businesses;
CREATE POLICY "Owners can delete own business"
  ON public.businesses FOR DELETE
  USING (owner_id = auth.uid() OR public.is_admin());


-- -----------------------------------------------------------------------------
-- Policies: business_photos (public read, owner write)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Business photos are viewable by everyone" ON public.business_photos;
CREATE POLICY "Business photos are viewable by everyone"
  ON public.business_photos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners manage business photos" ON public.business_photos;
CREATE POLICY "Owners manage business photos"
  ON public.business_photos FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_photos.business_id AND owner_id = auth.uid()
  ) OR public.is_admin())
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_photos.business_id AND owner_id = auth.uid()
  ) OR public.is_admin());


-- -----------------------------------------------------------------------------
-- Policies: services (public read, owner write)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners manage services" ON public.services;
CREATE POLICY "Owners manage services"
  ON public.services FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = services.business_id AND owner_id = auth.uid()
  ) OR public.is_admin())
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = services.business_id AND owner_id = auth.uid()
  ) OR public.is_admin());


-- -----------------------------------------------------------------------------
-- Policies: staff (public read, owner write)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff are viewable by everyone" ON public.staff;
CREATE POLICY "Staff are viewable by everyone"
  ON public.staff FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners manage staff" ON public.staff;
CREATE POLICY "Owners manage staff"
  ON public.staff FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = staff.business_id AND owner_id = auth.uid()
  ) OR public.is_admin())
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = staff.business_id AND owner_id = auth.uid()
  ) OR public.is_admin());


-- Similar "owner via business" policies for staff_services, availability, etc.
DROP POLICY IF EXISTS "Staff services viewable" ON public.staff_services;
CREATE POLICY "Staff services viewable" ON public.staff_services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage staff_services" ON public.staff_services;
CREATE POLICY "Owners manage staff_services" ON public.staff_services FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.businesses b ON b.id = s.business_id
    WHERE s.id = staff_services.staff_id AND b.owner_id = auth.uid()
  ) OR public.is_admin())
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.businesses b ON b.id = s.business_id
    WHERE s.id = staff_services.staff_id AND b.owner_id = auth.uid()
  ) OR public.is_admin());

DROP POLICY IF EXISTS "Availability rules viewable" ON public.availability_rules;
CREATE POLICY "Availability rules viewable" ON public.availability_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage availability rules" ON public.availability_rules;
CREATE POLICY "Owners manage availability rules" ON public.availability_rules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.businesses b ON b.id = s.business_id
    WHERE s.id = availability_rules.staff_id AND b.owner_id = auth.uid()
  ) OR public.is_admin())
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.businesses b ON b.id = s.business_id
    WHERE s.id = availability_rules.staff_id AND b.owner_id = auth.uid()
  ) OR public.is_admin());

DROP POLICY IF EXISTS "Availability overrides viewable" ON public.availability_overrides;
CREATE POLICY "Availability overrides viewable" ON public.availability_overrides FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage availability overrides" ON public.availability_overrides;
CREATE POLICY "Owners manage availability overrides" ON public.availability_overrides FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.businesses b ON b.id = s.business_id
    WHERE s.id = availability_overrides.staff_id AND b.owner_id = auth.uid()
  ) OR public.is_admin())
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.businesses b ON b.id = s.business_id
    WHERE s.id = availability_overrides.staff_id AND b.owner_id = auth.uid()
  ) OR public.is_admin());


-- -----------------------------------------------------------------------------
-- Policies: bookings
-- Consumers see their own. Business owners see bookings at their businesses.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users see their bookings" ON public.bookings;
CREATE POLICY "Users see their bookings"
  ON public.bookings FOR SELECT
  USING (
    consumer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = bookings.business_id AND owner_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Consumers create own bookings" ON public.bookings;
CREATE POLICY "Consumers create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (consumer_id = auth.uid());

DROP POLICY IF EXISTS "Users update their bookings" ON public.bookings;
CREATE POLICY "Users update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    consumer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = bookings.business_id AND owner_id = auth.uid()
    )
    OR public.is_admin()
  );


-- -----------------------------------------------------------------------------
-- Policies: booking_status_history (read-only to involved parties)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Booking history viewable by parties" ON public.booking_status_history;
CREATE POLICY "Booking history viewable by parties"
  ON public.booking_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_status_history.booking_id
      AND (
        b.consumer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.businesses WHERE id = b.business_id AND owner_id = auth.uid())
      )
    )
    OR public.is_admin()
  );


-- -----------------------------------------------------------------------------
-- Policies: payments (consumers see theirs, owners see theirs)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Payments viewable by parties" ON public.payments;
CREATE POLICY "Payments viewable by parties"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = payments.booking_id
      AND (
        b.consumer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.businesses WHERE id = b.business_id AND owner_id = auth.uid())
      )
    )
    OR public.is_admin()
  );


-- -----------------------------------------------------------------------------
-- Policies: refunds
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Refunds viewable by parties" ON public.refunds;
CREATE POLICY "Refunds viewable by parties"
  ON public.refunds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      JOIN public.bookings b ON b.id = p.booking_id
      WHERE p.id = refunds.payment_id
      AND (
        b.consumer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.businesses WHERE id = b.business_id AND owner_id = auth.uid())
      )
    )
    OR public.is_admin()
  );


-- -----------------------------------------------------------------------------
-- Policies: reviews (public read if not removed, consumer writes own)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (is_removed = FALSE OR consumer_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Consumers create their reviews" ON public.reviews;
CREATE POLICY "Consumers create their reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    consumer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = reviews.booking_id
      AND consumer_id = auth.uid()
      AND status = 'completed'
    )
  );

DROP POLICY IF EXISTS "Consumers update own reviews" ON public.reviews;
CREATE POLICY "Consumers update own reviews"
  ON public.reviews FOR UPDATE
  USING (consumer_id = auth.uid() OR public.is_admin())
  WITH CHECK (consumer_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Review responses viewable" ON public.review_responses;
CREATE POLICY "Review responses viewable"
  ON public.review_responses FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Business owners respond to reviews" ON public.review_responses;
CREATE POLICY "Business owners respond to reviews"
  ON public.review_responses FOR ALL
  USING (business_owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (business_owner_id = auth.uid() OR public.is_admin());


-- -----------------------------------------------------------------------------
-- Policies: form_templates, form_fields (public read, owner write)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Form templates viewable" ON public.form_templates;
CREATE POLICY "Form templates viewable"
  ON public.form_templates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners manage form templates" ON public.form_templates;
CREATE POLICY "Owners manage form templates"
  ON public.form_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = form_templates.business_id AND owner_id = auth.uid()
  ) OR public.is_admin())
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = form_templates.business_id AND owner_id = auth.uid()
  ) OR public.is_admin());

DROP POLICY IF EXISTS "Form fields viewable" ON public.form_fields;
CREATE POLICY "Form fields viewable"
  ON public.form_fields FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners manage form fields" ON public.form_fields;
CREATE POLICY "Owners manage form fields"
  ON public.form_fields FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.form_templates ft
    JOIN public.businesses b ON b.id = ft.business_id
    WHERE ft.id = form_fields.form_id AND b.owner_id = auth.uid()
  ) OR public.is_admin())
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.form_templates ft
    JOIN public.businesses b ON b.id = ft.business_id
    WHERE ft.id = form_fields.form_id AND b.owner_id = auth.uid()
  ) OR public.is_admin());


-- -----------------------------------------------------------------------------
-- Policies: form_submissions, form_field_values
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Form submissions viewable by parties" ON public.form_submissions;
CREATE POLICY "Form submissions viewable by parties"
  ON public.form_submissions FOR SELECT
  USING (
    consumer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.form_templates ft
      JOIN public.businesses b ON b.id = ft.business_id
      WHERE ft.id = form_submissions.form_id AND b.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Consumers create submissions" ON public.form_submissions;
CREATE POLICY "Consumers create submissions"
  ON public.form_submissions FOR INSERT
  WITH CHECK (consumer_id = auth.uid());

DROP POLICY IF EXISTS "Form field values viewable by parties" ON public.form_field_values;
CREATE POLICY "Form field values viewable by parties"
  ON public.form_field_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.form_submissions fs
      WHERE fs.id = form_field_values.submission_id
      AND (
        fs.consumer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.form_templates ft
          JOIN public.businesses b ON b.id = ft.business_id
          WHERE ft.id = fs.form_id AND b.owner_id = auth.uid()
        )
      )
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Consumers insert field values" ON public.form_field_values;
CREATE POLICY "Consumers insert field values"
  ON public.form_field_values FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.form_submissions fs
    WHERE fs.id = form_field_values.submission_id AND fs.consumer_id = auth.uid()
  ));


-- -----------------------------------------------------------------------------
-- Policies: favorites (consumer sees own)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users see own favorites" ON public.favorites;
CREATE POLICY "Users see own favorites"
  ON public.favorites FOR SELECT
  USING (consumer_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;
CREATE POLICY "Users manage own favorites"
  ON public.favorites FOR ALL
  USING (consumer_id = auth.uid())
  WITH CHECK (consumer_id = auth.uid());


-- -----------------------------------------------------------------------------
-- Policies: notifications (user sees own)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- -----------------------------------------------------------------------------
-- Policies: push_tokens
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users manage own push tokens" ON public.push_tokens;
CREATE POLICY "Users manage own push tokens"
  ON public.push_tokens FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- SECTION 7: AUTO-CREATE PROFILE ON SIGN UP
-- =============================================================================
-- When a new user signs up via Supabase Auth, automatically create a matching
-- row in public.profiles. This keeps profile creation atomic with signup.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'consumer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- SECTION 8: SEED CATEGORIES
-- =============================================================================

INSERT INTO public.categories (name, slug, icon_emoji, display_order) VALUES
  ('Hair Salon',          'hair-salon',         '💇', 10),
  ('Barber Shop',         'barber-shop',        '💈', 20),
  ('Nail Salon',          'nail-salon',         '💅', 30),
  ('Massage & Spa',       'massage-spa',        '💆', 40),
  ('Facial & Skincare',   'facial-skincare',    '✨', 50),
  ('Beauty & Makeup',     'beauty-makeup',      '💄', 60),
  ('Eyelash Extensions',  'eyelash-extensions', '👁', 70),
  ('Waxing',              'waxing',             '🧖', 80),
  ('Tattoo',              'tattoo',             '🎨', 90),
  ('Piercing',            'piercing',           '💎', 100),
  ('Fitness & Personal Training', 'fitness-personal-training', '💪', 110),
  ('Yoga',                'yoga',               '🧘', 120),
  ('Pilates',             'pilates',            '🤸', 130),
  ('Dance Classes',       'dance-classes',      '💃', 140),
  ('Swimming Lessons',    'swimming-lessons',   '🏊', 150),
  ('Tennis Lessons',      'tennis-lessons',     '🎾', 160),
  ('Music Lessons',       'music-lessons',      '🎵', 170),
  ('Art Classes',         'art-classes',        '🎨', 180),
  ('Cooking Classes',     'cooking-classes',    '👨‍🍳', 190),
  ('Tutoring',            'tutoring',           '📚', 200),
  ('Coaching',            'coaching',           '🎯', 210),
  ('Therapy & Counseling','therapy-counseling', '🧠', 220),
  ('Photography',         'photography',        '📷', 230),
  ('Videography',         'videography',        '🎥', 240),
  ('Dentist',             'dentist',            '🦷', 250),
  ('Chiropractor',        'chiropractor',       '🦴', 260),
  ('Acupuncture',         'acupuncture',        '🪡', 270),
  ('Physical Therapy',    'physical-therapy',   '🩺', 280),
  ('Veterinary',          'veterinary',         '🐾', 290),
  ('Pet Grooming',        'pet-grooming',       '🐕', 300),
  ('Dog Walking',         'dog-walking',        '🦮', 310),
  ('Dog Training',        'dog-training',       '🐶', 320),
  ('House Cleaning',      'house-cleaning',     '🧹', 330),
  ('Plumbing',            'plumbing',           '🔧', 340),
  ('Electrical',          'electrical',         '⚡', 350),
  ('Gardening & Landscaping', 'gardening-landscaping', '🌱', 360),
  ('Auto Detailing',      'auto-detailing',     '🚗', 370),
  ('Moving Services',     'moving-services',    '📦', 380),
  ('Event Planning',      'event-planning',     '🎉', 390),
  ('Catering',            'catering',           '🍽', 400),
  ('DJ Services',         'dj-services',        '🎧', 410),
  ('Handyman',            'handyman',           '🔨', 420)
ON CONFLICT (name) DO NOTHING;


-- =============================================================================
-- SECTION 9: SCHEMA VALIDATION
-- =============================================================================
-- Returns a row for every table in the public schema so you can verify the
-- migration ran. Expected: ~22 tables.
-- =============================================================================

-- To verify after running, uncomment and run this query separately:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
