/**
 * Zod schemas for service CRUD forms.
 * Prices are in dollars in the form, converted to integer cents before insert.
 */
import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2, { error: 'Service name is required.' }).max(255),
  description: z.string().max(2000).optional().or(z.literal('')),
  price_dollars: z.coerce
    .number({ error: 'Price must be a number.' })
    .min(0, { error: 'Price cannot be negative.' })
    .max(100000, { error: 'Price seems too high.' }),
  price_type: z.enum(['fixed', 'starting_at', 'hourly', 'free']).default('fixed'),
  duration_minutes: z.coerce
    .number({ error: 'Duration must be a number.' })
    .int()
    .min(5, { error: 'Duration must be at least 5 minutes.' })
    .max(1440, { error: 'Duration must be less than 24 hours.' }),
  buffer_minutes: z.coerce
    .number()
    .int()
    .min(0)
    .max(240, { error: 'Buffer must be less than 4 hours.' })
    .default(0),
  deposit_required: z.coerce.boolean().default(false),
  deposit_dollars: z.coerce.number().min(0).optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
