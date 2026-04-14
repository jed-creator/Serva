# Orvo MVP Build Plan

**Project:** Orvo — Universal Booking & Payments Marketplace
**Goal:** Complete 108-step MVP build from source PDFs (Build Guide, Roadmap, Tech Spec, Architecture)
**Stack:** Next.js 14 (TypeScript) + React Native/Expo + Supabase + Stripe Connect + Vercel
**Timeline:** 10 phases, 108 steps, executed in batches with checkpoints

---

## Architecture Decisions

1. **MVP Stack only** — Follow Build Guide's simpler stack (Supabase, Vercel, Stripe Connect). The AWS microservices in the Technical Architecture doc are the long-term vision, not the MVP.
2. **Monorepo** — Three apps sharing one backend: `/apps/web` (Next.js dashboard + admin), `/apps/mobile` (Expo consumer app), `/packages/shared` (types, utils, schemas).
3. **Git** — Initialize in current directory, work on `main` branch (greenfield, no existing code to isolate from).
4. **Order** — Build business dashboard before consumer app (providers must exist before consumers can book).

---

## Phase Breakdown (10 phases / 108 steps)

### Phase 1 — Environment Setup (Steps 1-15)
Install tooling, create accounts, initialize monorepo structure, push to GitHub.
- Steps 1-5: Node, Git, VS Code/Cursor, extensions, GitHub + SSH
- Steps 6-11: Supabase, Stripe, Vercel, Resend, Twilio, Apple/Google dev accounts
- Steps 12-15: Expo CLI, monorepo folders, npm workspaces, initial commit

**Milestone:** Empty monorepo on GitHub with all accounts provisioned.

### Phase 2 — Database Setup (Steps 16-28)
Build PostgreSQL schema in Supabase: users, businesses, services, staff, bookings, payments, reviews, intake forms, notifications, favorites, refunds, categories.
- Steps 16-22: Core tables with foreign keys
- Step 23: Seed 40+ service categories
- Steps 24-25: Row Level Security, indices
- Steps 26-28: DB functions, seed script, validation

**Milestone:** Fully structured, secured database with test data.

### Phase 3 — Authentication (Steps 29-35)
Supabase Auth with email/password + social providers, profile completion, middleware, end-to-end testing.

**Milestone:** Users can sign up, log in, verify email, reset password.

### Phase 4 — Business Dashboard Core (Steps 36-50)
Next.js + Tailwind + shadcn/ui. Business onboarding, profile, services, availability, calendar, bookings list, Stripe Connect, analytics, email notifications.

**Milestone:** A business can fully set up on Orvo and manage bookings.

### Phase 5 — Business Dashboard Advanced (Steps 51-58)
Intake form builder, form previews, staff manager, reviews management, settings.

**Milestone:** Providers have full autonomy — no admin handholding required.

### Phase 6 — Consumer Mobile App Setup (Steps 59-63)
Expo project, navigation, Supabase client, auth flow, theme.

**Milestone:** Mobile app foundation with auth working.

### Phase 7 — Consumer Mobile App Features (Steps 64-82)
Home, search, geo-location, business profiles, service selection, calendar, intake forms, Stripe payment sheet, confirmation, my bookings, cancellation, reschedule, reviews, profile, favorites.

**Milestone:** End-to-end booking loop works on device.

### Phase 8 — Notifications (Steps 83-88)
Expo push, Resend email templates, Twilio SMS, reminder scheduling, in-app notification center.

**Milestone:** Users receive all notification types reliably.

### Phase 9 — Admin Panel (Steps 89-95)
Admin auth guard, dashboard metrics, business approval queue, user management, review moderation, category management.

**Milestone:** Platform is operable without code access.

### Phase 10 — Testing & Launch (Steps 96-108)
Integration tests (booking, payment), Playwright E2E, Sentry, Vercel deploy, custom domain, EAS Build, TestFlight, Google Play testing, app store submissions, analytics, launch checklist.

**Milestone:** Apps are live in both stores, website is deployed, analytics flowing.

---

## Execution Rules

1. Work through steps **sequentially** — no skipping ahead.
2. Batch execution with checkpoints every **phase boundary**.
3. After each step: verify "You'll know it's working when..." criteria from the Build Guide.
4. For steps requiring browser actions (account creation, clicking buttons), pause and give Bridget explicit instructions.
5. For steps requiring API keys, pause and ask Bridget to paste them, then write to `.env.local`.
6. Commit after each phase, not each step (keeps history clean).
7. Never mark a phase complete until all its verification criteria pass.

---

## Current Status

**Phase:** 1 — Environment Setup
**Step:** About to execute Steps 1-15
**Git:** Not yet initialized in project directory
**Verified tools:** Node v25.7.0, npm 11.10.1, Git 2.39.5, SSH key exists
**Pending verification:** VS Code/Cursor installation, all SaaS accounts

---

# Super-App Expansion (parallel track)

Layered **on top of** the MVP above: a universal search-and-book
surface that fans a single query across 89 third-party providers
(OpenTable, Uber, Expedia, Ticketmaster, Shopify, …) in 16
integration categories. Full architecture in
[`docs/SUPER_APP.md`](./docs/SUPER_APP.md); PDF Feature Outline
coverage in [`docs/FEATURE_OUTLINE_COVERAGE.md`](./docs/FEATURE_OUTLINE_COVERAGE.md).

## Expansion Phases

### Phase 1 — Integration contracts + shared package
Adapter interface, `NormalizedSearchResult`, category enum, Zod
schemas in `packages/shared/src/super-app/`.

### Phase 2 — Core registry + conformance
`IntegrationRegistry` singleton, conformance tests, bootstrap module.

### Phase 3 — Adapter rollout (89 providers, 16 categories)
One directory per provider under `apps/web/lib/integrations/adapters/`.
Seeded in `db/seeds/20260414_integration_providers.sql`.

### Phase 4 — Per-module services + API routes + web UI
`eat`, `book`, `ride`, `trips`, `tickets`, `shop`, `market`,
`compare` services fan across categories. API routes expose a JSON
search endpoint each. Next.js route groups render consumer UI.

### Phase 4.13 — Anonymous-friendly auth gate
Super-app consumer roots (`/shop`, `/eat`, `/ride`, `/trips`,
`/tickets`, `/market`, `/book`, `/compare`, `/explore`) bypass the
Supabase auth proxy. 41 unit tests pin exact-or-prefix matching.

### Phase 5 — Mobile super-app hub
Expo Explore tab + 8 category screens at
`apps/mobile/app/(super-app)/`. Calls web API via
`apps/mobile/lib/super-app-api.ts`; no adapter code in Metro's
bundle.

### Phase 6.1 — Admin Integration Hub
`/admin/integrations` page with per-provider toggle + admin notes +
24h error health. Migration 006 adds `enabled` + `admin_notes`
columns to `integration_providers`.

### Phase 6.2 — Book sub-filters
`home-services` + `pet-care` wired into `booking.service.ts`
fan-out. `BOOK_SUB_FILTERS` vocabulary + `resolveBookFilter` helper
so the /book UI can render narrowing tabs. `GET /api/book/services`
now accepts `?filter=<key>`.

### Phase 7 — Docs
This file's super-app section + `docs/SUPER_APP.md` + README update.

### Phase 8 — Loyalty, household, privacy, wallet, preferences, a11y
- 8.1: Orvo Points loyalty schema + earn/redeem service
- 8.2: Household profiles (shared family accounts)
- 8.3: Privacy dashboard (GDPR export + delete)
- 8.4: Wallet credits schema + service
- 8.5: Per-category notification preferences
- 8.6: Accessibility settings (theme, font, reduced motion)

### Phase 9 — Final verification
Full test suite + typecheck across web, mobile, shared.
