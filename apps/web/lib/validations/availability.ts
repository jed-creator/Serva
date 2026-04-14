/**
 * Availability validation schemas.
 * For MVP we use a single weekly schedule per business (one default staff row).
 */
import { z } from 'zod';

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { error: 'Use HH:MM (24-hour).' });

/**
 * The form has 7 days of (working, start_time, end_time) triples.
 * When working is unchecked, the times are ignored.
 */
export const availabilityFormSchema = z.object({
  // Each day is 0-6, key format: `day_${n}_working`, `day_${n}_start`, `day_${n}_end`
});

export interface DayRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export function parseAvailabilityForm(formData: FormData): {
  rules: DayRule[];
  errors: string[];
} {
  const rules: DayRule[] = [];
  const errors: string[] = [];

  for (let d = 0; d < 7; d++) {
    const working = formData.get(`day_${d}_working`) === 'on';
    if (!working) continue;

    const start = formData.get(`day_${d}_start`)?.toString() ?? '';
    const end = formData.get(`day_${d}_end`)?.toString() ?? '';

    const parsedStart = timeString.safeParse(start);
    const parsedEnd = timeString.safeParse(end);

    if (!parsedStart.success || !parsedEnd.success) {
      errors.push(`Day ${d}: invalid time format.`);
      continue;
    }

    if (end <= start) {
      errors.push(`Day ${d}: end time must be after start time.`);
      continue;
    }

    rules.push({
      day_of_week: d,
      start_time: `${start}:00`,
      end_time: `${end}:00`,
    });
  }

  return { rules, errors };
}
