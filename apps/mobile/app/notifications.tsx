import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { OrvoTheme } from '@/constants/orvo-theme';

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_booking_id: string | null;
  created_at: string;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications((data ?? []) as NotificationRow[]);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    load().then(() => setLoading(false));
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleTap = async (n: NotificationRow) => {
    if (!n.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', n.id);
    }
    if (n.related_booking_id) {
      router.push({
        pathname: '/booking/[id]',
        params: { id: n.related_booking_id },
      });
    }
  };

  const fmt = (iso: string) => {
    const delta = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(delta / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Notifications' }} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={OrvoTheme.accent} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptySub}>
            You&apos;ll see booking updates and reminders here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {notifications.map((n) => (
            <Pressable
              key={n.id}
              style={[styles.card, !n.is_read && styles.unread]}
              onPress={() => handleTap(n)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Text style={styles.timestamp}>{fmt(n.created_at)}</Text>
              </View>
              <Text style={styles.cardMessage}>{n.message}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: OrvoTheme.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: OrvoTheme.foreground,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    color: OrvoTheme.mutedForeground,
    textAlign: 'center',
  },
  list: { padding: 16, gap: 8 },
  card: {
    backgroundColor: OrvoTheme.muted,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  unread: {
    backgroundColor: OrvoTheme.accent + '14',
    borderLeftWidth: 3,
    borderLeftColor: OrvoTheme.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: OrvoTheme.foreground,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
  },
  cardMessage: {
    fontSize: 14,
    color: OrvoTheme.mutedForeground,
    lineHeight: 20,
  },
});
