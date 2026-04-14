/**
 * Zod schemas for business forms (onboarding + profile editor).
 */
import { z } from 'zod';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const addressSchema = z.object({
  line1: z.string().min(1, { error: 'Street address is required.' }),
  line2: z.string().optional().or(z.literal('')),
  city: z.string().min(1, { error: 'City is required.' }),
  state: z.string().min(1, { error: 'State is required.' }),
  postal_code: z.string().min(1, { error: 'Postal code is required.' }),
  country: z.string().min(1, { error: 'Country is required.' }).default('US'),
});

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { error: 'Use HH:MM (24-hour).' });

export const operatingHoursSchema = z
  .object({
    mon_open: timeString.optional().or(z.literal('')),
    mon_close: timeString.optional().or(z.literal('')),
    tue_open: timeString.optional().or(z.literal('')),
    tue_close: timeString.optional().or(z.literal('')),
    wed_open: timeString.optional().or(z.literal('')),
    wed_close: timeString.optional().or(z.literal('')),
    thu_open: timeString.optional().or(z.literal('')),
    thu_close: timeString.optional().or(z.literal('')),
    fri_open: timeString.optional().or(z.literal('')),
    fri_close: timeString.optional().or(z.literal('')),
    sat_open: timeString.optional().or(z.literal('')),
    sat_close: timeString.optional().or(z.literal('')),
    sun_open: timeString.optional().or(z.literal('')),
    sun_close: timeString.optional().or(z.literal('')),
  })
  .partial();

export const businessOnboardingSchema = z.object({
  name: z
    .string()
    .min(2, { error: 'Business name must be at least 2 characters.' })
    .max(255),
  category_id: z.string().uuid({ error: 'Please select a category.' }),
  description: z.string().max(2000).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.email({ error: 'Invalid email.' }).optional().or(z.literal('')),
  website: z
    .url({ error: 'Invalid URL.' })
    .optional()
    .or(z.literal('')),
  // Address (inline, not nested object — FormData is flat)
  address_line1: z.string().min(1, { error: 'Street address is required.' }),
  address_line2: z.string().optional().or(z.literal('')),
  address_city: z.string().min(1, { error: 'City is required.' }),
  address_state: z.string().min(1, { error: 'State is required.' }),
  address_postal_code: z
    .string()
    .min(1, { error: 'Postal code is required.' }),
  address_country: z.string().default('US'),
});

export type BusinessOnboardingInput = z.infer<typeof businessOnboardingSchema>;

export function buildSlug(name: string): string {
  const base = slugify(name);
  // Add a short random suffix to reduce collision risk
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
