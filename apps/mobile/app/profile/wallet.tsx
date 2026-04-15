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
  type WalletLedgerEntry,
} from '@/lib/services/wallet';

const CURRENCY = 'USD';

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: CURRENCY,
  }).format(cents / 100);

/**
 * /profile/wallet — read-only Orvo wallet credit dashboard. Mirrors
 * the web `/profile/wallet`. Credits/debits are written by Orvo's
 * server flows (refunds, referral bonuses) so the user surface is
 * read-only.
 */
export default function WalletScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<WalletLedgerEntry[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const [bal, hist] = await Promise.all([
      getBalance(user.id, CURRENCY),
      getHistory(user.id, CURRENCY, 100),
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
      <Stack.Screen options={{ headerShown: true, title: 'Wallet' }} />

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
            <Text style={styles.balanceLabel}>Available credit</Text>
            <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
            <Text style={styles.balanceUnit}>{CURRENCY}</Text>
          </View>

          <Text style={styles.sectionHeader}>History</Text>

          {history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No wallet activity</Text>
              <Text style={styles.emptySub}>
                Refunds, referral bonuses, and goodwill credits will show up
                here.
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.map((entry) => {
                const isCredit = entry.amount_cents >= 0;
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
                        isCredit ? styles.amountCredit : styles.amountDebit,
                      ]}
                    >
                      {isCredit ? '+' : '−'}
                      {formatCurrency(Math.abs(entry.amount_cents))}
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
  amountCredit: { color: OrvoTheme.success },
  amountDebit: { color: OrvoTheme.destructive },
});
