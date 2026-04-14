# Orvo Super-App Expansion — Architecture Guide

This document is the technical reference for Orvo's super-app layer:
the fan-out search surface that lets a single Orvo account book
**any** restaurant reservation, rideshare, flight, hotel, attraction
ticket, e-commerce product, salon appointment, home-services job,
or pet-care booking — without the user ever installing the
third-party app.

It sits **alongside** the original marketplace (first-party
business-dashboard bookings, Stripe Connect payouts, in-app messaging)
rather than replacing it. Orvo-native businesses continue to work
exactly as before; the super-app layer is additive.

If you're looking for the original 108-step MVP plan, see
[`PLAN.md`](../PLAN.md). If you're looking for a concrete mapping
of the Feature Outline PDF to what exists in code, see
[`FEATURE_OUTLINE_COVERAGE.md`](./FEATURE_OUTLINE_COVERAGE.md).

---

## 1. The integration layer

Everything that reaches out to a third-party provider goes through
the integration layer at [`apps/web/lib/integrations`](../apps/web/lib/integrations).

### 1.1 Adapter contract

Every provider — OpenTable, Uber, Expedia, Ticketmaster, Shopify,
TaskRabbit, Rover, … — implements the same TypeScript interface
defined in [`packages/shared/src/super-app/integrations.ts`](../packages/shared/src/super-app/integrations.ts):

```ts
interface IntegrationAdapter {
  readonly key: string;              // "opentable", "uber", …
  readonly category: IntegrationCategory;
  readonly displayName: string;
  readonly capabilities: AdapterCapability[]; // search/details/book/…

  search(q: { text: string; near?: { lat; lng } }): Promise<NormalizedSearchResult[]>;
  getDetails(externalId: string): Promise<NormalizedSearchResult>;
  checkAvailability?(q: AvailabilityQuery): Promise<Slot[]>;
  book?(req: BookRequest): Promise<{ externalBookingId; status }>;
  cancel?(externalBookingId: string): Promise<{ status }>;
  handleWebhook?(payload: unknown, signature?: string): Promise<void>;
}
```

`search` and `getDetails` are required — the minimum to surface a
result in any Explore hub. Everything else is optional and **must**
be gated on `capabilities`: a conformance test in
[`apps/web/lib/integrations/core/conformance.ts`](../apps/web/lib/integrations/core/conformance.ts)
walks every registered adapter and asserts that declared capabilities
match implemented methods.

Cross-adapter responses normalize to `NormalizedSearchResult`:
`{ provider, externalId, title, category, subtitle?, media?, location?,
price?, rating?, url?, metadata? }`. Vertical-specific details (seat
maps, dietary tags, room counts) ride along as `metadata`, but **UI
code must not depend on `metadata` shape** — it's an escape hatch,
not a contract.

### 1.2 Categories

There are **16** integration categories, defined in
`IntegrationCategorySchema`:

| Category | Examples | Module |
|---|---|---|
| `restaurants` | OpenTable, Resy, Tock, Toast Tables | **Eat** |
| `delivery` | DoorDash, Uber Eats, Grubhub, Skip, Toast Ordering, Just Eat, Square Online Ordering | **Eat** |
| `grocery` | Instacart, Uber Eats Grocery, DoorDash Grocery, Grabmart, Skip Grocery | **Eat** |
| `beauty-wellness` | Booksy, Fresha, Boulevard, Vagaro, Zenoti, Phorest, GlossGenius | **Book** |
| `medspa` | Jane, Mangomint, Pabau | **Book** |
| `fitness` | ClassPass, Mindbody | **Book** |
| `general-booking` | Calendly, Acuity, Square Appointments, Setmore, Bookeo, SimplyBook, Zoho Bookings, Wix Bookings, Appointy | **Book** |
| `shopify-booking` | Appointo, BookX, BTA, Cowlendar, Easy Appointment, Meety | **Book** |
| `home-services` | Thumbtack, TaskRabbit, Angi, Bark | **Book** |
| `pet-care` | Rover, Wag | **Book** |
| `travel` | Expedia, Booking.com, Kayak, Skyscanner, Airbnb, VRBO, Hotels.com, Trip.com, Turo | **Trips** |
| `hotel-direct` | SiteMinder, Cloudbeds, Little Hotelier, ResNexus | **Trips** |
| `experiences` | GetYourGuide, Viator, Klook, TripAdvisor, Booking Attractions, Airbnb Experiences | **Trips** |
| `rideshare` | Uber, Lyft, Bolt, Grab, DiDi | **Ride** |
| `tickets` | Ticketmaster, Eventbrite, StubHub, AXS | **Tickets** |
| `ecommerce` | Shopify, BigCommerce, WooCommerce, Squarespace, Adobe Commerce, Square Online, Ecwid | **Shop / Market** |

**Total: 89 provider adapters** across 16 categories. See
[`apps/web/lib/integrations/adapters/`](../apps/web/lib/integrations/adapters/)
for the full tree; every directory is a category, every subdirectory
is a single adapter.

### 1.3 Registry + bootstrap

Adapters live in the module-scoped `integrationRegistry` singleton at
[`apps/web/lib/integrations/core/registry.ts`](../apps/web/lib/integrations/core/registry.ts).
It's populated at server boot by
[`apps/web/lib/integrations/bootstrap.ts`](../apps/web/lib/integrations/bootstrap.ts),
which imports every adapter module and calls `register`.

**Adding a new provider is a two-step change:**
1. Create the adapter module under `adapters/<category>/<key>/`
2. Import + register it from `bootstrap.ts`

Keys must be unique across the entire registry — re-registering
throws. That's a deliberate safety net against double-registration
(e.g., if bootstrap imports a barrel file that itself imports the
adapter).

A script at
[`apps/web/tools/scripts/gen-bootstrap.ts`](../apps/web/tools/scripts/gen-bootstrap.ts)
can regenerate `bootstrap.ts` from the adapter tree. The database
seed at
[`db/seeds/20260414_integration_providers.sql`](../db/seeds/20260414_integration_providers.sql)
mirrors the registry — every key/category/display_name there has to
match an in-memory adapter.

---

## 2. Per-module services

The `/shop`, `/eat`, `/ride`, `/trips`, `/tickets`, `/market`,
`/book`, and `/compare` Next.js routes are thin wrappers around
service modules at [`apps/web/lib/services/`](../apps/web/lib/services/).
Each service fans a query out across the categories for its module
and returns a flat `NormalizedSearchResult[]`:

| Service | Categories fanned | Notes |
|---|---|---|
| [`eat.service.ts`](../apps/web/lib/services/eat.service.ts) | restaurants + delivery + grocery | Single flat array; client groups by category at render time |
| [`booking.service.ts`](../apps/web/lib/services/booking.service.ts) | beauty-wellness + medspa + fitness + general-booking + shopify-booking + home-services + pet-care | Supports optional `filter` (via `BOOK_SUB_FILTERS`): `all`, `beauty` (beauty-wellness + medspa), `fitness`, `general-booking` (general-booking + shopify-booking), `home-services`, `pet-care` |
| [`ride.service.ts`](../apps/web/lib/services/ride.service.ts) | rideshare | |
| [`trip-planner.service.ts`](../apps/web/lib/services/trip-planner.service.ts) | travel + hotel-direct + experiences | |
| [`tickets.service.ts`](../apps/web/lib/services/tickets.service.ts) | tickets | |
| [`shopping.service.ts`](../apps/web/lib/services/shopping.service.ts) | ecommerce | |
| [`marketplace.service.ts`](../apps/web/lib/services/marketplace.service.ts) | ecommerce | Marketplace/compare view |
| [`super-app.service.ts`](../apps/web/lib/services/super-app.service.ts) | all | Category metadata + routing helpers used by the hub grid |
| [`pricing.service.ts`](../apps/web/lib/services/pricing.service.ts) | n/a | `/compare` price-comparison computation |

Every service uses `Promise.allSettled` so a single misbehaving
adapter never breaks a whole fan-out. The pattern is intentionally
duplicated across services (rather than extracted into a single
`fanOut(categories, query)` helper) so each module can evolve its
category list independently.

---

## 3. API routes

Every module exposes a JSON search endpoint — the web app calls them
server-side from the route page, and the mobile app calls them via
[`apps/mobile/lib/super-app-api.ts`](../apps/mobile/lib/super-app-api.ts):

| Route | Returns | Notes |
|---|---|---|
| `GET /api/eat/search` | `{ results }` | q |
| `GET /api/shop/search` | `{ products }` | q |
| `GET /api/ride/search` | `{ rides }` | q |
| `GET /api/trips/search` | `{ trips }` | q |
| `GET /api/tickets/search` | `{ tickets }` | q |
| `GET /api/market/search` | `{ items }` | q |
| `GET /api/book/services` | `{ services }` | q + optional `filter` |
| `GET /api/compare` | `{ results }` | q |

Each route imports `@/lib/integrations/bootstrap` as a side-effect so
the registry is populated before the fan-out runs. Routes are public
(see §5) and handle their own auth where needed.

---

## 4. Mobile super-app hub

The mobile app doesn't duplicate the 89-adapter fan-out logic.
Instead it calls the web API and normalizes the response shape
client-side. See
[`apps/mobile/lib/super-app-api.ts`](../apps/mobile/lib/super-app-api.ts)
and
[`apps/mobile/lib/super-app-config.ts`](../apps/mobile/lib/super-app-config.ts).

- **Base URL:** `process.env.EXPO_PUBLIC_WEB_API_URL ?? 'http://localhost:3300'`
- **Category config:** `SUPER_APP_CONFIG` — 8 entries, each with
  `{ key, title, emoji, subtitle, route }`
- **Hub UI:** The `Explore` tab at
  [`apps/mobile/app/(tabs)/explore.tsx`](../apps/mobile/app/(tabs)/explore.tsx)
  renders the 8-card grid via `<ExploreGrid />`; tapping a card
  pushes to `/(super-app)/<key>` which uses the shared
  `<CategoryScreen />` component to render search input + result
  list for that category.
- **Why mirror instead of duplicate:** Keeping all adapter code on
  the server keeps Metro's bundle small, keeps credentials
  server-only, and means a new adapter lands in both web and mobile
  from a single web-app edit.

---

## 5. Auth gate

The Next.js proxy at
[`apps/web/lib/supabase/proxy.ts`](../apps/web/lib/supabase/proxy.ts)
gates routes behind Supabase auth, but the super-app consumer roots
are explicitly **anonymous-friendly** (per Feature Outline p. 14:
"book any merchant without installing their app").

`PUBLIC_PATHS` currently allows:

```
/                               (marketing)
/login /signup /forgot-password /reset-password /auth
/api                            (routes handle their own auth)
/shop /eat /ride /trips /tickets /market /book /compare /explore
```

Matching is **exact-or-prefix**: `/shop` matches `/shop` and
`/shop/anything` but **not** `/shopping-cart`. See
[`apps/web/lib/supabase/proxy.test.ts`](../apps/web/lib/supabase/proxy.test.ts)
for the 41 unit tests that pin this down.

---

## 6. Admin Integration Hub

Admins manage the provider roster from
[`/admin/integrations`](../apps/web/app/(admin)/admin/integrations/page.tsx).
The page reads `integration_providers` (plus a 24h error aggregation
from `integration_sync_log`) and lets admins:

- Toggle a provider `enabled = false` to remove it from search
  fan-out (runtime filter lands in a follow-up phase; the column
  persists now so the UI and downstream health views can rely on
  it)
- Leave freeform `admin_notes` (credential rotation dates, vendor
  contacts, outage postmortems)
- See a health badge per provider: `ok` / `degraded` (<10 errors)
  / `down` (≥10) / `disabled`

Schema lives in
[`db/migrations/006_integration_provider_admin.sql`](../db/migrations/006_integration_provider_admin.sql).
Server actions (`toggleIntegrationProviderAction`,
`setIntegrationProviderNotesAction`) live alongside the other admin
actions in
[`apps/web/app/actions/admin.ts`](../apps/web/app/actions/admin.ts)
and are gated by `assertAdmin`.

---

## 7. What's _not_ in this layer

These features are **first-party Orvo** and don't route through the
integration layer at all:

- Orvo-native business dashboards, availability, staff, intake forms
- Stripe Connect payouts to Orvo-native providers
- In-app messaging between Orvo users and Orvo businesses
- Reviews for Orvo-native businesses (third-party results use the
  vendor's own rating)
- Admin business-approval queue

If you're working on any of the above, you're in the original
MVP layer — see [`PLAN.md`](../PLAN.md).
