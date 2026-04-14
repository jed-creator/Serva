/**
 * Resend email client singleton.
 * Server-only — API key must stay out of the browser bundle.
 */
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  // Don't throw at import time — email is optional. Log and return a stub.
  // This keeps local dev working even if Resend isn't configured.
  console.warn('[email] RESEND_API_KEY not set — email delivery disabled');
}

export const resend = apiKey ? new Resend(apiKey) : null;

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
