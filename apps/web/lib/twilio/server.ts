/**
 * Twilio SMS client for Serva.
 * Server-only — auth token stays out of the browser bundle.
 *
 * Twilio ships an official Node SDK, but to keep deps light we just
 * call the REST API directly.
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export interface SmsResult {
  ok: boolean;
  sid?: string;
  error?: string;
}

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[sms] Twilio env vars missing — skipping send');
    return { ok: false, error: 'Twilio not configured' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const params = new URLSearchParams();
  params.set('From', fromNumber);
  params.set('To', to);
  params.set('Body', body);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = (await res.json()) as { sid?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: data.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, sid: data.sid };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export interface ReminderSmsParams {
  customerName: string;
  businessName: string;
  serviceName: string;
  startTime: string;
}

export function buildReminderSms(p: ReminderSmsParams): string {
  const when = new Date(p.startTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return `Serva reminder: ${p.serviceName} at ${p.businessName} on ${when}. Reply STOP to opt out.`;
}
