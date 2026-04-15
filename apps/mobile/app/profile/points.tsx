import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { OrvoTheme } from '@/constants/orvo-theme';
import {
  getBalance,
  getHistory,
  type PointsLedgerEntry,
} from '@/lib/services/orvo-points';

/**
 * /profile/points — read-only Orvo Points dashboard. Mirrors the web
 * `app/(dashboard)/profile/points/page.tsx`. Earns/redemptions only
 * happen server-side, so this screen never writes.
 */
export default function PointsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<PointsLedgerEntry[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const [bal, hist] = await Promise.all([
      getBalance(user.id),
      getHistory(user.id, 100),
    ]);
    setBalance(bal);
    setHistory(hist);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    load().then(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: 'Orvo Points' }} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={OrvoTheme.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current balance</Text>
            <Text style={styles.balanceValue}>
              {balance.toLocaleString()}
            </Text>
            <Text style={styles.balanceUnit}>points</Text>
          </View>

          <Text style={styles.sectionHeader}>History</Text>

          {history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptySub}>
                Complete a booking or post a review to earn your first points.
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.map((entry) => {
                const isEarn = entry.amount >= 0;
                return (
                  <View key={entry.id} style={styles.historyRow}>
                    <View style={styles.historyText}>
                      <Text style={styles.historyReason}>{entry.reason}</Text>
                      <Text style={styles.historyDate}>
                        {fmt(entry.created_at)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.historyAmount,
                        isEarn ? styles.amountEarn : styles.amountRedeem,
                      ]}
                    >
                      {isEarn ? '+' : ''}
                      {entry.amount.toLocaleString()}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
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
  balanceCard: {
    backgroundColor: OrvoTheme.muted,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: '700',
    color: OrvoTheme.primary,
  },
  balanceUnit: {
    fontSize: 13,
    color: OrvoTheme.mutedForeground,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  emptyCard: {
    backgroundColor: OrvoTheme.muted,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: OrvoTheme.foreground,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: OrvoTheme.mutedForeground,
    textAlign: 'center',
  },
  historyList: {
    backgroundColor: OrvoTheme.muted,
    borderRadius: 12,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: OrvoTheme.border,
  },
  historyText: { flex: 1, marginRight: 12 },
  historyReason: {
    fontSize: 14,
    color: OrvoTheme.foreground,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountEarn: { color: OrvoTheme.success },
  amountRedeem: { color: OrvoTheme.destructive },
});
