-- =============================================================================
-- ORVO — Integration Provider Admin Columns (Phase 6.1)
-- =============================================================================
-- Adds the columns needed by the admin Integration Hub UI:
--
--   * enabled (BOOLEAN, default TRUE) — admins toggle a provider off to
--     remove it from super-app search fan-out without redeploying. The
--     runtime gate (services skipping disabled providers) lands in a
--     follow-up phase; this migration only adds the column and the
--     matching index so the admin page can read/write state.
--
--   * admin_notes (TEXT, nullable) — free-form notes from the admin
--     (e.g., "disabled pending credential refresh from Expedia").
--     Read by the admin page alongside the toggle.
--
-- Migration is append-only and idempotent (ADD COLUMN IF NOT EXISTS).
-- =============================================================================

ALTER TABLE public.integration_providers
  ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.integration_providers
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Partial index so admins can quickly list just the disabled providers.
CREATE INDEX IF NOT EXISTS integration_providers_disabled_idx
  ON public.integration_providers (key)
  WHERE enabled = FALSE;
