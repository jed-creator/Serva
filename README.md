# Orvo

**Universal Booking & Payments Marketplace**

Orvo is a two-sided marketplace connecting consumers with local service businesses (salons, personal trainers, therapists, dog walkers, tutors, and more) for instant booking and payment.

## Architecture

Monorepo with three apps sharing a Supabase backend:

- **`apps/web`** — Business dashboard + admin panel (Next.js 14 + TypeScript + Tailwind + shadcn/ui)
- **`apps/mobile`** — Consumer app for iOS & Android (React Native + Expo)
- **`packages/shared`** — Shared types, Zod schemas, utility functions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo |
| Web | Next.js 14 + TypeScript |
| Backend | Next.js API Routes + tRPC |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe Connect |
| Search | Supabase Full-Text + PostGIS |
| File Storage | Supabase Storage |
| Email | Resend |
| SMS | Twilio |
| Push | Expo Notifications |
| Hosting | Vercel |
| Monitoring | Sentry |

## Development Status

This project is being built in two layers:

1. **Original MVP** — first-party two-sided marketplace (business
   dashboard, Stripe Connect, intake forms, in-app booking for
   Orvo-native providers). Built against the 108-step Build Guide in
   `docs/`. See [`PLAN.md`](./PLAN.md).
2. **Super-app expansion** — universal search-and-book layer that
   fans a single query out across 89 third-party providers (OpenTable,
   Uber, Expedia, Ticketmaster, Shopify, …) in 16 integration
   categories. Consumers can book any of them without installing the
   third-party app. See [`docs/SUPER_APP.md`](./docs/SUPER_APP.md)
   for architecture and
   [`docs/FEATURE_OUTLINE_COVERAGE.md`](./docs/FEATURE_OUTLINE_COVERAGE.md)
   for a Feature Outline → code mapping.

## Local Development

```bash
# Install all workspace dependencies
npm install

# Run the web app (Next.js)
npm run dev --workspace=@orvo/web

# Run the mobile app (Expo)
npm run start --workspace=@orvo/mobile
```

## Documentation

Source specification documents live in `/docs`:
- `Orvo - Step by Step Build Guide.pdf` — The 108-step implementation guide
- `Orvo - MVP Development Roadmap.pdf` — Timeline and budget
- `Orvo - Technical Specification.pdf` — Feature specification
- `Orvo - Technical Architecture.pdf` — Long-term architecture vision
- `Orvo - Business Plan.pdf`, `Orvo - Pitch Deck.pdf` — Business context
