# Orvo — Launch Guide

Phase 10 manual deployment instructions. Code/config is already in place;
this file walks you through the steps only you can do (browser dashboards,
account approvals, etc.).

## Overview

| # | Step | Time | Who |
|---|------|------|-----|
| 100 | Deploy web to Vercel | 10 min | You |
| 101 | Connect custom domain | 10 min + DNS | You |
| 102 | EAS Build mobile | 30 min | You |
| 103 | TestFlight iOS | 1-2 hrs (Apple review) | You |
| 104 | Google Play internal testing | 2-4 hrs | You |
| 105 | Submit to App Store | 24-48 hrs (Apple review) | You |
| 106 | Submit to Google Play | 2-4 hrs | You |
| 107 | Analytics dashboard | 20 min | You |
| 108 | Launch checklist | 30 min | Both |

---

## Step 100 — Deploy web to Vercel

1. Go to **https://vercel.com/new**
2. Click **Import Git Repository** → select `jed-creator/Orvo`
3. Vercel auto-detects Next.js. Configure the project:
   - **Framework preset:** Next.js (auto)
   - **Root directory:** `apps/web` ← IMPORTANT (click Edit, change from `./`)
   - **Build command:** (default, `next build`)
   - **Install command:** `npm install --workspaces`
4. **Environment variables** — click "Environment Variables" and add every
   key from your local `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET            (leave blank for now, fill after Step 100b)
   RESEND_API_KEY
   RESEND_FROM_EMAIL
   TWILIO_ACCOUNT_SID
   TWILIO_AUTH_TOKEN
   TWILIO_PHONE_NUMBER
   NEXT_PUBLIC_APP_URL              (set to https://your-vercel-url.vercel.app for now)
   CRON_SECRET                      (generate any random string — used to secure the hourly cron)
   ```
5. Click **Deploy**. Wait 3-5 minutes.
6. When build completes you'll get `https://orvo-xxx.vercel.app`. Open it
   and verify the landing page loads.

### Step 100b — Configure Stripe webhook

Now that we have a public URL:

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint**
3. **Endpoint URL:** `https://your-vercel-url.vercel.app/api/stripe/webhook`
4. **Listen to:** select these events:
   - `account.updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Back in Vercel: Settings → Environment Variables → edit `STRIPE_WEBHOOK_SECRET`
8. Paste the `whsec_...` value and redeploy (Deployments → three dots → Redeploy)

---

## Step 101 — Custom domain on Vercel

**Skip if you haven't bought a domain yet.** Otherwise:

1. Buy a domain from any registrar (`orvo.app`, `getserva.com`, etc.)
2. In Vercel: Project → Settings → Domains → Add domain
3. Enter your domain. Vercel shows you the DNS records to set.
4. Log into your registrar and add the CNAME / A records shown.
5. Wait for DNS propagation (5 min to 24 hrs).
6. Update `NEXT_PUBLIC_APP_URL` env var in Vercel to `https://yourdomain.com` and redeploy.

---

## Step 102 — EAS Build for mobile

EAS (Expo Application Services) is how you build iOS/Android binaries
without owning a Mac for iOS or installing Android Studio.

1. **Sign up for Expo:** https://expo.dev (free for development builds)
2. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```
3. **Log in:**
   ```bash
   cd apps/mobile
   eas login
   ```
4. **Configure project (first time only):**
   ```bash
   eas init --non-interactive
   ```
   This creates a project on Expo's servers and adds the project ID to
   `app.json`.
5. **Build a development preview (iOS simulator, Android internal APK):**
   ```bash
   eas build --platform ios --profile preview
   eas build --platform android --profile preview
   ```
   Each build takes 10-20 min in EAS's cloud. When done, you get download links.

---

## Step 103 — TestFlight iOS

**Prerequisite:** You need an Apple Developer account ($99/year) — this was
deferred from Phase 1 Step 11.

1. Enroll at https://developer.apple.com/enroll
2. Wait 24-48 hrs for approval
3. Once approved, link your Apple Developer account to Expo:
   ```bash
   eas credentials
   ```
4. Trigger a production build:
   ```bash
   eas build --platform ios --profile production
   ```
5. EAS will ask for your Apple credentials and automatically provision
   certificates.
6. When the build finishes (20-30 min), submit to TestFlight:
   ```bash
   eas submit --platform ios --latest
   ```
7. In App Store Connect (https://appstoreconnect.apple.com), go to TestFlight
   → add yourself as an internal tester → install on your iPhone via the
   TestFlight app.

---

## Step 104 — Google Play internal testing

**Prerequisite:** Google Play Developer account ($25 one-time) — deferred
from Step 11.

1. Enroll at https://play.google.com/console
2. Create a new app in Play Console. Package name: `com.orvo.mobile`
   (or similar — make sure it matches `app.json` `android.package`).
3. Upload an AAB:
   ```bash
   eas build --platform android --profile production
   eas submit --platform android --latest
   ```
4. In Play Console → Testing → Internal testing → create release, select
   the uploaded AAB, add testers by email.

---

## Step 105 — Submit iOS to App Store

1. In App Store Connect, prepare your app listing:
   - **Screenshots** (required for iPhone 6.9" display — at least 3)
   - **App description**
   - **Keywords**
   - **Category:** Lifestyle or Utilities
   - **Privacy policy URL** (host yours on Vercel)
   - **Support URL**
2. Submit for review
3. Apple typically reviews within 24-48 hrs
4. If approved, you can release immediately or schedule

---

## Step 106 — Submit to Google Play

1. In Play Console → Production → Create release
2. Upload the AAB (or promote from internal testing)
3. Fill out store listing (similar to App Store)
4. Submit for review — Google is usually faster than Apple (2-8 hrs)

---

## Step 107 — Analytics

**Simple option — Vercel Analytics:**
1. In Vercel: Project → Analytics → Enable Web Analytics
2. Install the package:
   ```bash
   cd apps/web && npm install @vercel/analytics
   ```
3. Wrap your root layout with `<Analytics />` (one line of code)

**Advanced option — PostHog:** sign up at https://posthog.com, add the SDK
to both web and mobile, track key events (signup, booking_created, payment).

---

## Step 108 — Launch checklist

Print this out or put it in Notion. Check each before going live.

### Product readiness
- [ ] Web app deployed to Vercel (custom domain if available)
- [ ] iOS app approved in TestFlight, tested on real device
- [ ] Android app in Play Store internal testing, tested on real device
- [ ] Email delivery verified (send a test signup → receive verification email)
- [ ] SMS delivery verified (Twilio phone receives test message)
- [ ] Push notifications verified (install via TestFlight/Play, receive a test push)
- [ ] Stripe webhook firing correctly (trigger test event from Stripe dashboard)
- [ ] Hourly reminder cron runs (check `/api/cron/send-reminders` logs in Vercel)

### Legal / admin
- [ ] Terms of Service drafted and hosted
- [ ] Privacy Policy drafted and hosted
- [ ] Business entity formed (LLC or C-Corp)
- [ ] Stripe Connect platform onboarding complete (your platform account)
- [ ] Bank account linked to Stripe for platform fee payouts

### Seed inventory
- [ ] At least 5 real businesses onboarded and approved
- [ ] Each has at least 3 services + availability + photos
- [ ] Test consumer account can complete an end-to-end booking

### Observability
- [ ] Sentry (or equivalent) capturing errors
- [ ] Vercel Analytics / PostHog receiving events
- [ ] A dashboard bookmark showing daily signups + bookings

### Growth prep
- [ ] Landing page with clear value prop + app store badges
- [ ] Social media accounts reserved (IG, Twitter/X, LinkedIn, TikTok)
- [ ] First-week outreach list (local businesses to personally invite)
- [ ] Beta signup form live (or App Store pre-order)

---

## Done?

If every box is checked, ship it. 🚀 Tell early users, monitor Sentry for
errors, and iterate fast on the first 10 signups.
