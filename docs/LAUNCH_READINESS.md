# Orvo — Launch Readiness Audit

**Date:** 2026-04-14
**Audited by:** Claude Code (Opus 4.6)
**Audited from:** `feat/super-app-expansion` worktree, but findings apply to `main` (most issues pre-date this branch)
**Corresponds to:** [`LAUNCH.md`](../LAUNCH.md) Steps 100–108

This document is a one-shot audit of what's actually wired up vs. what `LAUNCH.md` *says* is wired up. It was produced after Phase 9 verification of the super-app expansion shipped, as a proactive check before Bridget begins the LAUNCH.md operator playbook.

---

## Resolution status (updated 2026-04-14)

This PR (`chore/launch-readiness`) addresses **4 of 5** non-strategic items:

| Item | Status | Notes |
|---|---|---|
| Blocker 1 — mobile app identifiers | ✅ **Fixed in this PR** | `apps/mobile/app.json` now sets `name: "Orvo"`, `slug: "orvo"`, `scheme: "orvo"`, `ios.bundleIdentifier: "com.orvo.mobile"`, `android.package: "com.orvo.mobile"` |
| Blocker 2 — no payment flow | 🟢 **Deferred — by design** | Bridget's call: launch as a free MVP. Payment processing will be wired up after the user base is established. Webhook handler is dead code waiting for the future PaymentIntent path. |
| Blocker 3 — no Terms / Privacy pages | 🟡 **Scaffolded with placeholders** | `apps/web/app/terms/page.tsx` and `apps/web/app/privacy/page.tsx` exist as Lorem ipsum stubs. Bridget must replace the body content with lawyer-reviewed text before submitting to App Store / Play Store. |
| Important 1 — no `.env.example` | ✅ **Fixed in this PR** | `apps/web/.env.example` lists all 12 required keys with comments. `apps/web/.gitignore` updated to allow `.env.example` while still ignoring `.env*`. |
| Important 2 — stale `serva_*` Stripe metadata | ✅ **Fixed in this PR** | Renamed `serva_business_id`, `serva_owner_id`, `serva_booking_id` → `orvo_*` in `apps/web/app/actions/stripe.ts` and `apps/web/app/api/stripe/webhook/route.ts`. |

**Also fixed:** `apps/web/app/(dashboard)/calendar/page.tsx` had a `react-hooks/purity` lint error on `main` (`Date.now()` called inside a server component). Same module-level helper extraction that was applied in the super-app branch is applied here so this PR can ship to `main` independently with a clean lint baseline.

The original audit content is preserved below for reference.

---

## TL;DR

| Severity | Count | Items |
|---|---:|---|
| 🔴 **Blocker** | 3 | Mobile app identifiers · No payment flow · No Terms / Privacy pages |
| 🟡 **Important** | 2 | No `.env.example` for web · Stale `serva_*` Stripe metadata keys |
| 🟢 **Verified working** | 7 | Cron · Stripe Connect onboarding · Webhook signature check · EAS profiles · React Compiler · Push stub · Cron auth |

**Bottom line:** LAUNCH.md is accurate about the *operator* steps (Vercel, Apple, Google), but the codebase has 3 silent blockers that will cause Bridget's launch attempt to fail mid-flight. The biggest one is that **the booking flow never collects payment** — the Stripe webhook is waiting for events that nothing in the codebase ever creates.

---

## 🔴 Blockers

### Blocker 1 — Mobile app identifiers are placeholders

**File:** [`apps/mobile/app.json`](../apps/mobile/app.json)

**Current state:**

```json
{
  "expo": {
    "name": "mobile",
    "slug": "mobile",
    "scheme": "mobile",
    "ios": { "supportsTablet": true },
    "android": { "adaptiveIcon": {...}, "edgeToEdgeEnabled": true }
  }
}
```

**Missing:**

1. **`ios.bundleIdentifier`** — required to upload to App Store Connect. Without this, `eas build --platform ios --profile production` will either fail or produce a build that App Store Connect rejects.
2. **`android.package`** — required to upload to Play Console. LAUNCH.md Step 104 instructs Bridget to use `com.orvo.mobile` but the value is not actually set in `app.json`.
3. **Display branding** — `name`, `slug`, and `scheme` are all the literal string `"mobile"`. The app would appear as "mobile" on the home screen and TestFlight.

**Recommended fix (deterministic, no design call needed):**

```json
{
  "expo": {
    "name": "Orvo",
    "slug": "orvo",
    "scheme": "orvo",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.orvo.mobile"
    },
    "android": {
      "package": "com.orvo.mobile",
      "adaptiveIcon": { ... }
    }
  }
}
```

⚠️ **Once a bundle ID / package is published to a store, it cannot be changed.** Pick the right name now.

---

### Blocker 2 — Booking flow never collects payment

**Files:**
- [`apps/mobile/app/book/[serviceId].tsx`](../apps/mobile/app/book/[serviceId].tsx) — creates bookings
- [`apps/web/app/api/stripe/webhook/route.ts`](../apps/web/app/api/stripe/webhook/route.ts) — waits for payment events that never come

**What's wired:**
- Stripe Connect onboarding (`apps/web/app/actions/stripe.ts`) — businesses can connect their Stripe Express account ✅
- Webhook handler at `/api/stripe/webhook` — verifies signatures, listens for `account.updated`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` ✅
- `bookings` table has `payment_status` enum ✅

**What's missing:**
- **Nothing in the codebase ever calls `stripe.paymentIntents.create()`.** I grep'd: zero matches across `apps/web` and `apps/mobile`.
- The mobile booking flow at `apps/mobile/app/book/[serviceId].tsx:99-112` inserts a row into `bookings` with `payment_status: 'pending'` and immediately redirects the user to a confirmation page. No payment sheet is ever opened.
- The Stripe webhook reads `pi.metadata.serva_booking_id` (lines 60, 80), but since no PaymentIntent is ever created, this metadata is also never set.

**Net effect:** Bookings get created but money is never collected. The webhook handler is dead code waiting for events that don't exist.

**This is a strategic call for Bridget — pick one:**

| Option | What it means | Effort |
|---|---|---|
| **A. Launch as free MVP** | Bookings are scheduled in-app; payment is collected out-of-band (cash on arrival, Square at the counter, separate invoice). The Stripe Connect onboarding becomes "set up your payouts for when we add payments later." | **0** — ship as-is, but document this clearly to providers and consumers |
| **B. Wire payment before launch** | Add a server action `createPaymentIntentAction(bookingId)` that creates a PaymentIntent on the connected account; install `@stripe/stripe-react-native` in the mobile app; present a Payment Sheet after intake form completion; only navigate to the confirmation page after `payment_intent.succeeded`. | **Medium** — ~1 day of focused work + testing with Stripe test keys |
| **C. Use Stripe Checkout (hosted)** | Server creates a Checkout Session, mobile app opens it via `expo-web-browser`, user pays, Stripe redirects back to a deep link. Simpler than Option B but bounces the user out of the app. | **Small** — ~half a day |

> **My read:** Option A is the fastest path to "in stores with real users", and you can layer payments on later. The risk is provider reluctance to onboard if they can't see money flowing through Orvo. Option C is the next-fastest if you need money flowing on day one.

---

### Blocker 3 — No Terms of Service or Privacy Policy pages

**Required by:**
- LAUNCH.md launch checklist (line 215): "Terms of Service drafted and hosted" + "Privacy Policy drafted and hosted"
- LAUNCH.md Step 105 (line 167): "Privacy policy URL (host yours on Vercel)" — **App Store will reject submissions without one**
- Google Play Store also requires a Privacy Policy URL in the listing

**Current state:**

- No `apps/web/app/terms/page.tsx` or `apps/web/app/privacy/page.tsx`
- No `apps/web/app/(public)/legal/**` or similar
- No `TERMS.md`, `PRIVACY.md` at the repo root
- The `(dashboard)/profile/privacy/` page exists but it's the user's *privacy settings* (export/delete), not the company's legal policy

**Recommended fix:**

1. Create `apps/web/app/(public)/terms/page.tsx` and `apps/web/app/(public)/privacy/page.tsx`
2. Use a generated baseline (e.g., [Termly](https://termly.io), [Iubenda](https://iubenda.com)) — these are templated to your business model and can be free for small operators
3. Have a real lawyer review before any non-trivial scale (especially the payment terms once Blocker 2 is resolved)
4. Add `Privacy Policy` and `Terms of Service` links to the web app footer
5. Use the live URL (`https://orvo.app/privacy`, etc.) in App Store Connect and Play Console listings

This is also a strategic call — the **content** of these documents depends on your business model, jurisdiction, and how you handle data. I shouldn't generate them without legal review.

---

## 🟡 Important (highly recommended, not strictly blocking)

### Important 1 — No `.env.example` for `apps/web`

**Current state:**

- LAUNCH.md Step 100 (line 32) tells Bridget to copy keys from `apps/web/.env.local` into Vercel
- But there's no `apps/web/.env.example` or `apps/web/.env.local.example` checked into the repo
- A new contributor (or future Bridget on a new machine) has no template

**Risk:** Bridget misses a key when configuring Vercel, finds out via 500 errors after deploy. The keys actually used in code are scattered across:

| Key | Used in |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `apps/web/lib/supabase/server.ts`, `client.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same |
| `SUPABASE_SERVICE_ROLE_KEY` | `apps/web/lib/supabase/server.ts` (admin client) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (consumer payment sheet — currently unused, see Blocker 2) |
| `STRIPE_SECRET_KEY` | `apps/web/lib/stripe/server.ts` |
| `STRIPE_WEBHOOK_SECRET` | `apps/web/app/api/stripe/webhook/route.ts:25` |
| `RESEND_API_KEY` | `apps/web/lib/email/client.ts` |
| `RESEND_FROM_EMAIL` | same |
| `TWILIO_ACCOUNT_SID` | `apps/web/lib/twilio/server.ts` |
| `TWILIO_AUTH_TOKEN` | same |
| `TWILIO_PHONE_NUMBER` | same |
| `NEXT_PUBLIC_APP_URL` | `apps/web/app/actions/stripe.ts:21` |
| `CRON_SECRET` | `apps/web/app/api/cron/send-reminders/route.ts:36` |

**Fix:** Create `apps/web/.env.example` with all 13 keys, blank values, and a comment per key explaining what it's for. Trivial — ~50 lines. Should be done.

---

### Important 2 — Stale `serva_*` keys in Stripe metadata

**Files:**
- [`apps/web/app/actions/stripe.ts:55-58`](../apps/web/app/actions/stripe.ts) — sets `serva_business_id`, `serva_owner_id`
- [`apps/web/app/api/stripe/webhook/route.ts:60,80`](../apps/web/app/api/stripe/webhook/route.ts) — reads `serva_booking_id`

**Why this exists:** Commit `1c8f251 refactor: rename Serva to Orvo across entire codebase` missed these. The keys are *internally consistent* — both ends use `serva_*` — so the Stripe Connect onboarding flow still works.

**Why it matters:**

1. **Cosmetically wrong** — when Bridget or a support engineer opens the Stripe Dashboard and looks at a Connect account, the metadata says `serva_business_id` instead of `orvo_business_id`. Confusing.
2. **Functionally wrong for `serva_booking_id`** — that key is *read* by the webhook but never *set* anywhere (because no PaymentIntent creation exists, see Blocker 2). When payment is wired up (Blocker 2 fix), the new code should set `orvo_booking_id`, but the webhook still reads `serva_booking_id` — they'd mismatch.

**Fix:** Rename all four keys to `orvo_*`. Trivial 4-line change. Best done at the same time as Blocker 2 so the new payment-creation code uses the new key from the start.

---

## 🟢 Verified working

| # | What | Where |
|---|---|---|
| 1 | Vercel cron schedule (hourly) | [`apps/web/vercel.json`](../apps/web/vercel.json) |
| 2 | Cron handler verifies `Authorization: Bearer CRON_SECRET` | [`apps/web/app/api/cron/send-reminders/route.ts:36-39`](../apps/web/app/api/cron/send-reminders/route.ts) |
| 3 | Stripe webhook signature verification via `STRIPE_WEBHOOK_SECRET` | [`apps/web/app/api/stripe/webhook/route.ts:24-45`](../apps/web/app/api/stripe/webhook/route.ts) |
| 4 | Stripe Connect Express onboarding flow | [`apps/web/app/actions/stripe.ts`](../apps/web/app/actions/stripe.ts) |
| 5 | EAS build profiles (development, preview, production) | [`apps/mobile/eas.json`](../apps/mobile/eas.json) |
| 6 | Expo `typedRoutes` + `reactCompiler` enabled | [`apps/mobile/app.json`](../apps/mobile/app.json) |
| 7 | Push notification helper (Expo SDK) | `apps/web/lib/push/expo.ts` (called from cron handler) |

The reminder cron flow is end-to-end real: it queries bookings 23–24h out, sends email via Resend, SMS via Twilio, push via Expo, creates an in-app notification, and marks `reminder_24h_sent = true`.

---

## Recommended order of operations

If Bridget wants to ship as soon as possible:

1. **Decide on Blocker 2 strategy** (free MVP, full payment, or Checkout). This unblocks the rest of the launch sequence.
2. **Fix Blocker 1** (mobile app identifiers) — ~10 min, deterministic, no design call. Do this in any branch that's safe to touch `apps/mobile/app.json`.
3. **Fix Important 1** (`.env.example`) — ~15 min, pure addition, zero risk.
4. **Fix Important 2** (`serva_*` → `orvo_*`) — bundle with the Blocker 2 fix so the new payment code uses the new key from the start.
5. **Draft Terms + Privacy** (Blocker 3) — use a generator, get legal review for content. The page-rendering boilerplate is ~30 min once the text exists.
6. **Then proceed with LAUNCH.md** Steps 100–108.

If Bridget wants to ship the super-app PR independently and tackle launch later:

1. The super-app PR (`feat/super-app-expansion` → `main`) doesn't depend on any of these issues being fixed. It can merge as-is.
2. Open follow-up PRs for each blocker afterward.
3. Then do LAUNCH.md.

---

## What I did NOT touch in this audit

- **Did not apply any code changes.** All findings are diagnostic. The fixes for Blocker 1 and Important 1 are deterministic enough that I could apply them without a design decision, but I want explicit user authorization before touching `apps/mobile/app.json` (which affects store identifiers permanently) and before adding new files.
- **Did not exhaustively audit Phase 3-7 mobile features.** I confirmed the booking creation flow has no payment integration, but did not verify intake forms, geo-location, calendar UI, reviews submission, etc. Those are presumed working based on the Phase 9 verification (29 Playwright tests passing).
- **Did not audit Sentry / observability wiring.** LAUNCH.md Step 107 mentions Sentry as optional. I did not check whether any error reporting is hooked up. (Quick check: there's no `@sentry/nextjs` or `@sentry/react-native` in any `package.json` I read.)
- **Did not audit Vercel Analytics.** Same as above — LAUNCH.md offers it as optional. Not installed.

---

## Reproduction

This audit was produced by:

1. Reading `LAUNCH.md` end-to-end
2. Verifying each prerequisite file/handler exists and is correctly wired:
   - `apps/mobile/eas.json`, `app.json`
   - `apps/web/vercel.json`
   - `apps/web/app/api/cron/send-reminders/route.ts`
   - `apps/web/app/api/stripe/webhook/route.ts`
   - `apps/web/app/actions/stripe.ts`
   - `apps/mobile/app/book/[serviceId].tsx`
3. Grepping for `paymentIntents.create`, `serva_`, `orvo_`, `bundleIdentifier`, `android.package`, `terms`, `privacy` across `apps/`
4. Globbing for env example files, terms/privacy pages, legal documents

No commands modified the working tree. All findings are based on read-only inspection.
