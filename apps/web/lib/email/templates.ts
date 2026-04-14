/**
 * Email templates — minimal inline-styled HTML for maximum email-client
 * compatibility. These get rendered into Resend payloads.
 *
 * Each template returns { subject, html, text } so we can include a plain-
 * text fallback for email clients that don't render HTML.
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const BRAND_PRIMARY = '#1A1F36';
const BRAND_ACCENT = '#4A6CF7';

function layout(innerHtml: string, preview: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Orvo</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#18181b;">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">${preview}</div>
    <div style="padding:40px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${BRAND_PRIMARY};padding:24px;color:#ffffff;">
            <div style="font-size:22px;font-weight:600;letter-spacing:-0.02em;">Orvo</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 24px;">
            ${innerHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;border-top:1px solid #e4e4e7;color:#71717a;font-size:12px;text-align:center;">
            Orvo — Universal Booking Marketplace<br>
            <a href="https://orvo.app" style="color:${BRAND_ACCENT};text-decoration:none;">orvo.app</a>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export interface BookingEmailParams {
  customerName: string;
  businessName: string;
  serviceName: string;
  startTime: string;
  totalCents: number;
  bookingId: string;
}

export function bookingConfirmedTemplate(
  p: BookingEmailParams,
): EmailTemplate {
  const subject = `Your booking at ${p.businessName} is confirmed`;
  const inner = `
    <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND_PRIMARY};">Booking confirmed</h1>
    <p style="margin:0 0 16px;line-height:1.6;">Hi ${p.customerName || 'there'},</p>
    <p style="margin:0 0 20px;line-height:1.6;">${p.businessName} confirmed your booking. Here are the details:</p>
    <div style="border:1px solid #e4e4e7;border-radius:8px;padding:16px;margin:0 0 20px;">
      <div style="margin-bottom:8px;"><strong>Service:</strong> ${p.serviceName}</div>
      <div style="margin-bottom:8px;"><strong>When:</strong> ${formatDateTime(p.startTime)}</div>
      <div><strong>Total:</strong> ${formatPrice(p.totalCents)}</div>
    </div>
    <p style="margin:0 0 20px;line-height:1.6;color:#71717a;font-size:14px;">We'll send a reminder 24 hours before your appointment.</p>
  `;
  return {
    subject,
    html: layout(inner, `Your booking at ${p.businessName} is confirmed`),
    text: `Your booking at ${p.businessName} is confirmed.

Service: ${p.serviceName}
When: ${formatDateTime(p.startTime)}
Total: ${formatPrice(p.totalCents)}

Booking ID: ${p.bookingId}

— Orvo`,
  };
}

export function bookingCancelledTemplate(
  p: BookingEmailParams & { reason?: string },
): EmailTemplate {
  const subject = `Your booking at ${p.businessName} was cancelled`;
  const inner = `
    <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND_PRIMARY};">Booking cancelled</h1>
    <p style="margin:0 0 16px;line-height:1.6;">Hi ${p.customerName || 'there'},</p>
    <p style="margin:0 0 20px;line-height:1.6;">Your booking at ${p.businessName} for ${p.serviceName} on ${formatDateTime(p.startTime)} has been cancelled.</p>
    ${p.reason ? `<p style="margin:0 0 20px;line-height:1.6;"><strong>Reason:</strong> ${p.reason}</p>` : ''}
    <p style="margin:0 0 20px;line-height:1.6;color:#71717a;font-size:14px;">If you were charged, a refund will be processed automatically.</p>
  `;
  return {
    subject,
    html: layout(inner, `Your booking at ${p.businessName} was cancelled`),
    text: `Your booking at ${p.businessName} was cancelled.

Service: ${p.serviceName}
When: ${formatDateTime(p.startTime)}
${p.reason ? `Reason: ${p.reason}\n` : ''}
— Orvo`,
  };
}

export function bookingCompletedTemplate(
  p: BookingEmailParams,
): EmailTemplate {
  const subject = `Thanks for visiting ${p.businessName}`;
  const inner = `
    <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND_PRIMARY};">How was it?</h1>
    <p style="margin:0 0 16px;line-height:1.6;">Hi ${p.customerName || 'there'},</p>
    <p style="margin:0 0 20px;line-height:1.6;">Thanks for booking ${p.serviceName} at ${p.businessName}. We hope you had a great experience!</p>
    <p style="margin:0 0 20px;line-height:1.6;">Would you take a moment to leave a review? It helps other customers find great providers.</p>
  `;
  return {
    subject,
    html: layout(inner, 'How was your visit?'),
    text: `Thanks for booking ${p.serviceName} at ${p.businessName}.

We hope you had a great experience! Please consider leaving a review.

— Orvo`,
  };
}
