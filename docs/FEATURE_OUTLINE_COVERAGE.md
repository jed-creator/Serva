# Orvo Feature Outline — Coverage Report

**Source PDF:** `docs/Orvo - Feature Outline.pdf` (22 pages, parent repo)
**Branch:** `feat/super-app-expansion`
**Worktree:** `.worktrees/super-app-expansion`
**Audit date:** 2026-04-14
**Purpose:** Verify every requirement from the Feature Outline PDF is implemented, scaffolded, or explicitly deferred with a phase mapping. This file is the durable audit record for the Phase 4 scaffold pass — it survives conversation compaction and should be the first doc a reviewer reads before Phase 5 starts.

---

## TL;DR

The PDF describes a 10-category consumer super-app ("Orvo") on top of Orvo's existing merchant platform. This branch scaffolds web routes, services, API endpoints, and integration adapters covering every top-level category and registers **89 adapters (5 reference + 84 stubs)** — covering **63/63 platforms from PDF Appendix A** plus 26 additional providers.

- **Adapter registry:** 89 adapters, asserted by `apps/web/lib/integrations/bootstrap.test.ts`
- **PDF Appendix A coverage:** 63/63 (closed this session by adding `square_online_ordering`)
- **Web routes:** 8 super-app category landing pages (`/shop`, `/eat`, `/ride`, `/trips`, `/tickets`, `/market`, `/book`, `/compare`) plus the `/explore` hub
- **Services + APIs:** 1 service + 1 GET route per category with fan-out over `integrationRegistry`
- **Tests:** 371 across 104 files, all passing
- **Typecheck:** Clean
- **One critical unfixed gap:** `lib/supabase/proxy.ts` `PUBLIC_PATHS` blocks all super-app routes behind auth — see §4 below. Queued as Phase 4.13.

The remaining outline items are deliberately deferred to Phases 5–8: mobile scaffolds, admin Integration Hub UI, docs, and the verification/PR pass.

---

## 1. Coverage by Top-Level Category (10 sections)

### 1.1 Shop (PDF pp. 3–4)

**Built:**
- `apps/web/app/(shop)/shop/layout.tsx`, `page.tsx`
- `apps/web/lib/services/shop.service.ts` (+ test)
- `apps/web/app/api/shop/search/route.ts` (+ test)
- 7 ecommerce adapters (see §3)

**Deferred:**
- Visual search / barcode scanning → Phase 5 (mobile)
- Price history graphs, price-drop alerts → Phase 5 mobile + Phase 6 admin
- Loyalty program integration → out of scope (§5)

### 1.2 Eat (PDF pp. 4–6)

**Built:**
- `apps/web/app/(eat)/eat/layout.tsx`, `page.tsx`
- `apps/web/lib/services/eat.service.ts` — fans out to `restaurants` + `delivery` categories (+ test)
- `apps/web/app/api/eat/search/route.ts` (+ test)
- 8 restaurant + 7 delivery adapters (see §3)

**Deferred:**
- Group ordering, dietary filters → Phase 5 (mobile UI)
- Reservation waitlists → Phase 6 (admin)
- Recipe/meal planning → out of scope (§5)

### 1.3 Ride (PDF pp. 6–7)

**Built:**
- `apps/web/app/(ride)/ride/layout.tsx`, `page.tsx`
- `apps/web/lib/services/ride.service.ts` (+ test)
- `apps/web/app/api/ride/search/route.ts` (+ test)
- 5 rideshare adapters (see §3)

**Deferred:**
- Cross-provider fare comparison UI → Phase 5 mobile
- Driver rating aggregation → Phase 6 admin

### 1.4 Trips (PDF pp. 7–9)

**Built:**
- `apps/web/app/(trips)/trips/layout.tsx`, `page.tsx`
- `apps/web/lib/services/trips.service.ts` — fans out to `travel`, `hotel-direct`, `experiences` (+ test)
- `apps/web/app/api/trips/search/route.ts` (+ test)
- 9 travel + 4 hotel-direct + 6 experiences adapters (see §3)

**Deferred:**
- Trip itinerary builder → Phase 5 mobile
- Group trip planning, travel insurance → out of scope (§5)

### 1.5 Tickets (PDF pp. 9–10)

**Built:**
- `apps/web/app/(tickets)/tickets/layout.tsx`, `page.tsx`
- `apps/web/lib/services/tickets.service.ts` (+ test)
- `apps/web/app/api/tickets/search/route.ts` (+ test)
- 4 ticket adapters (see §3)

**Deferred:**
- Seat map overlay, resale alerts → Phase 5 mobile

### 1.6 Market (PDF p. 10)

**Built:**
- `apps/web/app/(market)/market/layout.tsx`, `page.tsx`
- `apps/web/lib/services/market.service.ts` — fans out to `grocery` (+ test)
- `apps/web/app/api/market/search/route.ts` (+ test)
- 6 grocery adapters (see §3)

**Deferred:**
- Recurring orders, pantry tracking, substitution preferences → Phase 5 mobile

### 1.7 Book (PDF pp. 11–13) — *scaffolded this session*

**Built this session (commit `7e27854`):**
- `apps/web/app/(book)/book/layout.tsx`, `page.tsx` — *new*
- `apps/web/lib/services/booking.service.ts` — fans out to `beauty-wellness`, `medspa`, `fitness`, `general-booking`, `shopify-booking` — *new*
- `apps/web/app/api/book/services/route.ts` (+ test) — *new*
- `apps/web/tests/e2e/book.spec.ts` — *new*
- `hrefForCategory('book')` now routes to `/book` instead of `/services` — this was a latent routing bug; `/services` is a merchant-dashboard route that must NOT be reachable from consumer super-app nav. A negative assertion `expect(hrefForCategory('book')).not.toBe('/services')` guards against regression.

**Adapters registered (see §3):**
- 7 beauty-wellness + 3 medspa + 2 fitness + 9 general-booking + 6 shopify-booking = 27 adapters routed through `/book`

**Deferred:**
- Recurring appointments, provider profiles, service history timeline → Phase 5 mobile
- Home-services (`thumbtack`, `taskrabbit`, `angi`, `bark`) and pet-care (`rover`, `wag`) are registered as adapters but not yet wired into `booking.service.ts`'s category filter. They surface through the general Integration Hub. A Phase 6 Book UI pass should add sub-filters.

### 1.8 Compare (PDF pp. 13–14)

**Built:**
- `apps/web/app/(compare)/compare/layout.tsx`, `page.tsx`
- `apps/web/lib/services/compare.service.ts` — cross-category comparison (+ test)
- `apps/web/app/api/compare/route.ts` (+ test)
- No new adapters — aggregates existing ones by category

**Deferred:**
- Side-by-side comparison UI → Phase 5 mobile
- Saved comparison lists, price alerts, historical trends → Phase 5 mobile + Phase 6 admin

### 1.9 Integration Hub (PDF pp. 14–16)

PDF claim: *"85+ third-party platforms"*. Current registry: **89 adapters**. Every Appendix A platform is present (see §3).

**Built:**
- `apps/web/lib/integrations/core/registry.ts` (+ test)
- `apps/web/lib/integrations/core/types.ts` — `IntegrationAdapter`, `IntegrationCategory`, `NormalizedSearchResult`, `IntegrationCapability`
- `apps/web/lib/integrations/bootstrap.ts` — **generated** via `tools/scripts/gen-bootstrap.ts`; imports every adapter and registers with the shared singleton on first import
- `apps/web/lib/integrations/bootstrap.test.ts` — asserts: 89 adapters, every category has ≥1 adapter, reference adapters declare extra capabilities, `bootstrap()` throws on double-registration
- `apps/web/tools/scripts/manifest.ts` — declarative stub spec list (84 entries)
- `apps/web/tools/scripts/gen-stub-adapter.ts` — per-adapter stub generator
- `apps/web/tools/scripts/gen-bootstrap.ts` — bootstrap file generator
- **5 reference adapters** with full E2E capabilities: `opentable` (search/details/availability/book/cancel), `uber` (…+webhook), `shopify` (search/details/webhook), `ticketmaster` (search/details/availability/book), `expedia` (search/details/availability/book/cancel)
- **84 stub adapters** — implement interface minimum: `search` returns `[]`, `getDetails` throws `"not implemented"`
- `db/seeds/20260414_integration_providers.sql` — 89 provider rows, idempotent upsert by key

**Deferred:**
- Admin Integration Hub UI — enable/disable, health status, credential config → Phase 6
- OAuth / credential vault → Phase 6 + Phase 7 docs
- Health monitoring / success-rate dashboards → Phase 6

### 1.10 Account & Platform (PDF pp. 17–22)

**Already built on main** (carried into this branch):
- Supabase SSR auth (login/signup/forgot-password/reset-password/`/auth/*`)
- Profile, preferences, addresses, payment methods (Stripe)
- Notifications: SMS + reminder cron + in-app center (commit `6fd3ac4`)
- Admin panel: approvals, users, reviews, categories (commit `736c7af`)

**Deferred / out of scope:**
See §5. PDF Section 10 describes substantial loyalty, privacy-dashboard, and accessibility work that the scaffold phase deliberately defers.

---

## 2. Super-App Routes Built

All 8 super-app category modules + the `/explore` hub. Route-group folders isolate each module so layouts stay per-category:

| Route | Route group | Service | API route |
|---|---|---|---|
| `/shop` | `app/(shop)/shop/` | `shop.service.ts` | `/api/shop/search` |
| `/eat` | `app/(eat)/eat/` | `eat.service.ts` | `/api/eat/search` |
| `/ride` | `app/(ride)/ride/` | `ride.service.ts` | `/api/ride/search` |
| `/trips` | `app/(trips)/trips/` | `trips.service.ts` | `/api/trips/search` |
| `/tickets` | `app/(tickets)/tickets/` | `tickets.service.ts` | `/api/tickets/search` |
| `/market` | `app/(market)/market/` | `market.service.ts` | `/api/market/search` |
| `/book` | `app/(book)/book/` | `booking.service.ts` | `/api/book/services` |
| `/compare` | `app/(compare)/compare/` | `compare.service.ts` | `/api/compare` |
| `/explore` | `app/(super-app)/explore/` | `super-app.service.ts` | — (SSR-only hub) |

The `super-app.service.ts` `SUPER_APP_CATEGORIES_FALLBACK` list (8 entries) is the compiled-in seed for the `/explore` hub when Supabase is unreachable — kept in lockstep with `db/migrations/005_super_app_expansion.sql`.

---

## 3. Platform Coverage — PDF Appendix A (63/63)

Every platform named in PDF Appendix A has a registered adapter. The tables below list the **current registry state** (89 adapters) organized by category. Earlier verification against the PDF confirmed Appendix A is fully covered.

### 3.1 Restaurant Booking (8 adapters)
| Platform | Adapter key | Notes |
|---|---|---|
| OpenTable | `opentable` | **REFERENCE** — search/details/availability/book/cancel |
| Resy | `resy` | stub |
| Tock | `tock` | stub |
| SevenRooms | `sevenrooms` | stub |
| Yelp Guest Manager | `yelp_guest_manager` | stub |
| Eat App | `eat_app` | stub |
| Toast Tables | `toast_tables` | stub |
| TouchBistro | `touchbistro` | stub |

### 3.2 Food Delivery & Takeout (7 adapters)
| Platform | Adapter key | Notes |
|---|---|---|
| Uber Eats | `uber_eats` | stub |
| DoorDash | `doordash` | stub |
| Grubhub | `grubhub` | stub |
| SkipTheDishes | `skip` | stub |
| Just Eat | `just_eat` | stub |
| Toast Online Ordering | `toast_ordering` | stub |
| Square Online Ordering | `square_online_ordering` | stub — **added this session (commit `d0286a8`)** |

### 3.3 Beauty & Wellness (7 adapters)
| Platform | Adapter key |
|---|---|
| Fresha | `fresha` |
| Vagaro | `vagaro` |
| GlossGenius | `glossgenius` |
| Boulevard | `boulevard` |
| Phorest | `phorest` |
| Booksy | `booksy` |
| Zenoti | `zenoti` |

### 3.4 Medspa / Clinical Practice (3 adapters)
| Platform | Adapter key |
|---|---|
| Pabau | `pabau` |
| Mangomint | `mangomint` |
| Jane | `jane` |

### 3.5 Fitness (2 adapters)
| Platform | Adapter key |
|---|---|
| Mindbody | `mindbody` |
| ClassPass | `classpass` |

### 3.6 General Booking / Schedulers (9 adapters)
| Platform | Adapter key |
|---|---|
| Square Appointments | `square_appointments` |
| Acuity Scheduling | `acuity` |
| Calendly | `calendly` |
| Setmore | `setmore` |
| SimplyBook.me | `simplybook` |
| Bookeo | `bookeo` |
| Appointy | `appointy` |
| Wix Bookings | `wix_bookings` |
| Zoho Bookings | `zoho_bookings` |

### 3.7 Shopify Booking Apps (6 adapters)
| Platform | Adapter key |
|---|---|
| Cowlendar | `cowlendar` |
| Meety | `meety` |
| BookX | `bookx` |
| Appointo | `appointo` |
| Book That App (BTA) | `bta` |
| Easy Appointment | `easy_appointment` |

### 3.8 Travel / OTAs (9 adapters)
| Platform | Adapter key | Notes |
|---|---|---|
| Booking.com | `booking_com` | stub |
| Expedia | `expedia` | **REFERENCE** — search/details/availability/book/cancel |
| Hotels.com | `hotels_com` | stub |
| KAYAK | `kayak` | stub |
| Skyscanner | `skyscanner` | stub |
| Trip.com | `trip_com` | stub |
| Airbnb | `airbnb` | stub |
| Vrbo | `vrbo` | stub |
| Turo | `turo` | stub |

### 3.9 Hotel Direct (PMS / channel managers) (4 adapters)
| Platform | Adapter key |
|---|---|
| SiteMinder | `siteminder` |
| Cloudbeds | `cloudbeds` |
| Little Hotelier | `little_hotelier` |
| ResNexus | `resnexus` |

### 3.10 Experiences / Tours (6 adapters)
| Platform | Adapter key |
|---|---|
| Viator | `viator` |
| GetYourGuide | `getyourguide` |
| Klook | `klook` |
| Tripadvisor | `tripadvisor` |
| Airbnb Experiences | `airbnb_experiences` |
| Booking.com Attractions | `booking_attractions` |

### 3.11 Rideshare (5 adapters)
| Platform | Adapter key | Notes |
|---|---|---|
| Uber | `uber` | **REFERENCE** — search/details/availability/book/cancel/webhook |
| Lyft | `lyft` | stub |
| DiDi | `didi` | stub |
| Grab | `grab` | stub |
| Bolt | `bolt` | stub |

### 3.12 Grocery Delivery (6 adapters)
| Platform | Adapter key |
|---|---|
| Instacart | `instacart` |
| Uber Eats Grocery | `uber_eats_grocery` |
| DoorDash Grocery | `doordash_grocery` |
| Skip Grocery | `skip_grocery` |
| Just Eat Grocery | `just_eat_grocery` |
| GrabMart | `grabmart` |

### 3.13 Event Tickets (4 adapters)
| Platform | Adapter key | Notes |
|---|---|---|
| Ticketmaster | `ticketmaster` | **REFERENCE** — search/details/availability/book |
| Eventbrite | `eventbrite` | stub |
| StubHub | `stubhub` | stub |
| AXS | `axs` | stub |

### 3.14 Home Services (4 adapters)
| Platform | Adapter key |
|---|---|
| Thumbtack | `thumbtack` |
| TaskRabbit | `taskrabbit` |
| Angi | `angi` |
| Bark | `bark` |

### 3.15 Pet Care (2 adapters)
| Platform | Adapter key |
|---|---|
| Rover | `rover` |
| Wag | `wag` |

### 3.16 E-commerce Platforms (7 adapters)
| Platform | Adapter key | Notes |
|---|---|---|
| Shopify | `shopify` | **REFERENCE** — search/details/webhook |
| WooCommerce | `woocommerce` | stub |
| BigCommerce | `bigcommerce` | stub |
| Adobe Commerce (Magento) | `adobe_commerce` | stub |
| Squarespace | `squarespace` | stub |
| Square Online | `square_online` | stub — distinct from `square_online_ordering` (§3.2) |
| Ecwid | `ecwid` | stub |

**Registry total: 8 + 7 + 7 + 3 + 2 + 9 + 6 + 9 + 4 + 6 + 5 + 6 + 4 + 4 + 2 + 7 = 89 adapters.**

PDF Appendix A lists 63 platforms total; all 63 are covered by the rows above. The remaining 26 adapters extend the registry beyond the PDF's explicit examples — each is a major provider in its category (e.g., the rest of the top-9 OTAs, the full rideshare top-5, the full grocery delivery fan-out). They're not ad-hoc: every row is reflected in `db/seeds/20260414_integration_providers.sql`, `apps/web/tools/scripts/manifest.ts` (for stubs), and `apps/web/lib/integrations/bootstrap.ts` (which is regenerated from the manifest + reference list).

---

## 4. Critical Unfixed Gap — Auth Gate Blocks Consumer Browsing

**Severity: HIGH. Filed as Phase 4.13 below.**

`apps/web/lib/supabase/proxy.ts` defines (verified 2026-04-14):

```typescript
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth',
  // API routes handle their own auth (bearer token, webhook signature, etc.)
  // so the proxy never redirects them. Each route handler decides.
  '/api',
];
```

Every non-listed path redirects unauthenticated requests to `/login?redirectTo=<path>`. None of the super-app consumer routes (`/shop`, `/eat`, `/ride`, `/trips`, `/tickets`, `/market`, `/book`, `/compare`, `/explore`) are whitelisted.

**Live verification** (localhost:3300, anonymous request, 2026-04-14):
```
GET /shop    → 307 /login?redirectTo=/shop
GET /eat     → 307 /login?redirectTo=/eat
GET /ride    → 307 /login?redirectTo=/ride
GET /trips   → 307 /login?redirectTo=/trips
GET /tickets → 307 /login?redirectTo=/tickets
GET /market  → 307 /login?redirectTo=/market
GET /book    → 307 /login?redirectTo=/book
GET /compare → 307 /login?redirectTo=/compare
GET /explore → 307 /login?redirectTo=/explore
```

**Why this contradicts the PDF:** Feature Outline p. 14, "For Consumers" says:

> *"Book any merchant without installing their app"*

The super-app's consumer-browsing model is explicitly anonymous-friendly — landing on `/shop` or `/book` from a search engine, share link, or social post must not hit a login wall. Requiring auth for browsing defeats the PDF's core value proposition for unauthenticated visitors.

**Proposed fix (Phase 4.13):**
Extend `PUBLIC_PATHS` in `apps/web/lib/supabase/proxy.ts` to include the super-app consumer roots:

```typescript
const PUBLIC_PATHS = [
  '/',
  '/login', '/signup', '/forgot-password', '/reset-password', '/auth',
  '/api',
  // Super-app consumer browsing — anonymous-friendly per Feature Outline p. 14
  '/shop', '/eat', '/ride', '/trips', '/tickets',
  '/market', '/book', '/compare', '/explore',
];
```

Auth remains required for per-user actions — checkout, saved lists, profile, order history, etc. — because those live under authenticated API routes or separate sub-paths not affected by this allowlist. The `isPublicPath` helper uses prefix matching (`pathname.startsWith(\`${path}/\`)`), so deep routes like `/shop/provider/123` also become public; if any sub-path should be authed (e.g. `/shop/cart`), it must be matched by a more specific deny rule or routed through `/api`.

Tests to add:
- Proxy unit test: public paths return 200, sub-paths of public paths return 200, authed-only paths still 307
- E2E smoke: `playwright test tests/e2e/book.spec.ts` currently passes only because the `/api/book/services` call it makes is under `/api`; the page-visit portion must also pass anonymously

---

## 5. Phase Mapping — Remaining Outline Items

| PDF requirement | Phase | Notes |
|---|---|---|
| Mobile Explore tab + category screens | **Phase 5** | React Native scaffolds mirroring web routes |
| Mobile API client (shared TS types, fetch wrapper) | **Phase 5** | Reuse `NormalizedSearchResult`, `IntegrationCapability` types |
| Admin Integration Hub UI | **Phase 6** | Enable/disable adapters, view health, manage credentials |
| Book-module category sub-filters (home services, pet care) | **Phase 6** | Extend `booking.service.ts` or add secondary service |
| README / SUPER_APP.md / PLAN.md | **Phase 7** | Consumer-facing and contributor docs |
| Verification + PR | **Phase 8** | Full suite, E2E smoke, PR description |
| **Auth-gate `PUBLIC_PATHS` fix** | **Phase 4.13** | Unblocks anonymous consumer browsing. New todo. |

---

## 6. Out of Scope for Scaffold Phase

The PDF describes a rich long-tail of consumer features the scaffold deliberately defers. Each is listed here so the Phase-5 planner knows they're known-absent, not forgotten.

### 6.1 From PDF Section 10 (Account & Platform)
- **Orvo Points / loyalty tiers** — earn/redeem, tier progression, partner rewards
- **Household profiles** — shared family accounts with per-member preferences and spending limits
- **Accessibility themes** — high-contrast, dyslexia-friendly fonts, reduced motion
- **Voice commands** — "book a table for four at 7" style dictation
- **Privacy dashboard** — GDPR/CCPA/PIPEDA rights portal (data export, deletion, consent log)
- **Wallet credits** — Orvo-internal balance distinct from Stripe saved payment methods

### 6.2 Per-Category Rich Features
- **Shop:** visual search, barcode scanning, price history, price-drop alerts
- **Eat:** group ordering, dietary restriction filters, recipe/meal planning
- **Ride:** cross-provider fare comparison UI, driver rating aggregation
- **Trips:** itinerary builder, group trip planning, travel insurance
- **Tickets:** seat map overlays, resale alerts
- **Market:** recurring orders, pantry tracking, substitution preferences
- **Book:** recurring appointments, provider Q&A, service-history timeline
- **Compare:** saved comparison lists, price alerts, historical trends

### 6.3 Platform-Wide
- Notification per-category preferences (granular opt-in/opt-out)
- Multi-language UI (i18n beyond English)
- Referral program / invite rewards

---

## 7. Verification Artifacts

| Check | Result |
|---|---|
| Unit + integration tests | 371 passing / 104 files |
| Typecheck (`apps/web`) | Clean |
| Bootstrap regeneration (`node apps/web/tools/scripts/gen-bootstrap.ts`) | No diff — manifest and bootstrap in sync |
| `bootstrap.test.ts` registry count | `registry.list().length === 89` ✓ |
| Every category has ≥1 adapter | ✓ (all 16 `IntegrationCategory` values) |
| Reference adapters declare extra capabilities | ✓ (all 5: opentable, uber, shopify, ticketmaster, expedia) |
| `bootstrap()` throws on double-registration | ✓ |

**Phase 4 commits in this branch:**
- `7e27854` — Book module scaffold (service, API, layout, page, e2e, `hrefForCategory` fix)
- `d0286a8` — `square_online_ordering` adapter + bootstrap regen + seed row

---

## 8. Reading This Doc Later

This file is the durable audit record for the Phase 4 scaffold pass. It pairs with:
- `apps/web/tools/scripts/manifest.ts` — generator input (truth for stub adapters)
- `db/seeds/20260414_integration_providers.sql` — DB-side truth for provider metadata
- `apps/web/lib/integrations/bootstrap.test.ts` — runtime truth for adapter count and category coverage
- `apps/web/lib/integrations/bootstrap.ts` — **generated** file; regenerate via `node apps/web/tools/scripts/gen-bootstrap.ts` after any manifest change

If a future audit finds a gap against the PDF, the fix touches (in order): manifest → regen bootstrap → seed SQL → bootstrap test count. A new reference adapter adds to `REFERENCE_ADAPTERS` in `gen-bootstrap.ts` instead of the manifest.
