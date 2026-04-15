/**
 * Notification preferences (Phase 8.5) — mobile read/write helpers.
 *
 * Mirrors `apps/web/lib/services/notification-preferences.service.ts`.
 * Unlike points/wallet, RLS lets a user upsert their own rows
 * directly, so the mobile screen can toggle preferences via the
 * anon-key client without bouncing through a server endpoint.
 *
 * The DB stores rows sparsely (only opt-out rows, plus any explicit
 * opt-in flips). `getPreferences` merges the sparse set with
 * DEFAULT_ENABLED = true so the UI sees the full matrix.
 */
import { supabase } from '@/lib/supabase';

export type NotificationChannel = 'push' | 'email' | 'sms';

export const NOTIFICATION_CATEGORIES = [
  'eat',
  'ride',
  'book',
  'trips',
  'tickets',
  'shop',
  'market',
  'compare',
  'promos',
  'system',
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = [
  'push',
  'email',
  'sms',
];

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  eat: 'Eat',
  ride: 'Ride',
  book: 'Book',
  trips: 'Trips',
  tickets: 'Tickets',
  shop: 'Shop',
  market: 'Marketplace',
  compare: 'Compare',
  promos: 'Promotions',
  system: 'System',
};

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  push: 'Push',
  email: 'Email',
  sms: 'SMS',
};

export interface PreferenceRow {
  category: NotificationCategory;
  channel: NotificationChannel;
  enabled: boolean;
}

export async function getPreferences(
  userId: string,
): Promise<PreferenceRow[]> {
  const { data } = await supabase
    .from('notification_preferences')
    .select('category, channel, enabled')
    .eq('user_id', userId);

  const overrides = new Map<string, boolean>();
  for (const row of (data ?? []) as PreferenceRow[]) {
    overrides.set(`${row.category}:${row.channel}`, row.enabled);
  }

  const matrix: PreferenceRow[] = [];
  for (const category of NOTIFICATION_CATEGORIES) {
    for (const channel of NOTIFICATION_CHANNELS) {
      const key = `${category}:${channel}`;
      matrix.push({
        category,
        channel,
        enabled: overrides.get(key) ?? true,
      });
    }
  }
  return matrix;
}

export async function setPreference(
  userId: string,
  category: NotificationCategory,
  channel: NotificationChannel,
  enabled: boolean,
): Promise<void> {
  const { error } = await supabase.from('notification_preferences').upsert(
    {
      user_id: userId,
      category,
      channel,
      enabled,
    },
    { onConflict: 'user_id,category,channel' },
  );
  if (error) throw error;
}
