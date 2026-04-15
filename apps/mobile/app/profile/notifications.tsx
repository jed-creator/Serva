import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { OrvoTheme } from '@/constants/orvo-theme';
import {
  getPreferences,
  setPreference,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  CATEGORY_LABELS,
  CHANNEL_LABELS,
  type NotificationCategory,
  type NotificationChannel,
  type PreferenceRow,
} from '@/lib/services/notification-preferences';

/**
 * /profile/notifications — 10 categories × 3 channels (push/email/sms)
 * opt-in matrix. Each row renders one category with three switches.
 * The `system` category is always on (transactional sends like booking
 * confirmations); switches are disabled for that row.
 *
 * Toggling a switch optimistically flips local state, then writes the
 * row through RLS. On failure we revert the local cell and surface a
 * one-shot Alert.
 */
export default function NotificationsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState<PreferenceRow[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const rows = await getPreferences(user.id);
    setMatrix(rows);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    load().then(() => setLoading(false));
  }, [load]);

  const lookup = (
    category: NotificationCategory,
    channel: NotificationChannel,
  ) =>
    matrix.find(
      (row) => row.category === category && row.channel === channel,
    )?.enabled ?? true;

  const handleToggle = async (
    category: NotificationCategory,
    channel: NotificationChannel,
    nextValue: boolean,
  ) => {
    if (!user) return;
    if (category === 'system') return;

    // Optimistic update.
    setMatrix((prev) =>
      prev.map((row) =>
        row.category === category && row.channel === channel
          ? { ...row, enabled: nextValue }
          : row,
      ),
    );

    try {
      await setPreference(user.id, category, channel, nextValue);
    } catch (err) {
      // Revert + surface error.
      setMatrix((prev) =>
        prev.map((row) =>
          row.category === category && row.channel === channel
            ? { ...row, enabled: !nextValue }
            : row,
        ),
      );
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert("Couldn't save preference", message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{ headerShown: true, title: 'Notifications' }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={OrvoTheme.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.intro}>
            Choose which channels you want each Orvo category to use. System
            messages (booking confirmations, security alerts) are always on.
          </Text>

          {/* Header row */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cellCategory, styles.headerText]}>
              Category
            </Text>
            {NOTIFICATION_CHANNELS.map((channel) => (
              <Text
                key={channel}
                style={[styles.cellChannel, styles.headerText]}
              >
                {CHANNEL_LABELS[channel]}
              </Text>
            ))}
          </View>

          {NOTIFICATION_CATEGORIES.map((category) => {
            const isSystem = category === 'system';
            return (
              <View
                key={category}
                style={[styles.row, isSystem && styles.systemRow]}
              >
                <Text style={styles.cellCategory}>
                  {CATEGORY_LABELS[category]}
                </Text>
                {NOTIFICATION_CHANNELS.map((channel) => {
                  const enabled = isSystem ? true : lookup(category, channel);
                  return (
                    <View key={channel} style={styles.cellChannel}>
                      <Switch
                        value={enabled}
                        disabled={isSystem}
                        trackColor={{
                          false: OrvoTheme.border,
                          true: OrvoTheme.accent,
                        }}
                        thumbColor={OrvoTheme.background}
                        onValueChange={(next) =>
                          handleToggle(category, channel, next)
                        }
                      />
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: OrvoTheme.background },
  content: { padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intro: {
    fontSize: 13,
    color: OrvoTheme.mutedForeground,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: OrvoTheme.border,
    backgroundColor: OrvoTheme.muted,
  },
  headerRow: {
    backgroundColor: OrvoTheme.background,
    borderTopWidth: 1,
    borderTopColor: OrvoTheme.border,
  },
  systemRow: { opacity: 0.6 },
  headerText: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  cellCategory: {
    flex: 1.4,
    fontSize: 14,
    color: OrvoTheme.foreground,
    fontWeight: '500',
  },
  cellChannel: {
    flex: 1,
    alignItems: 'center',
  },
});
