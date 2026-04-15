import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { OrvoTheme } from '@/constants/orvo-theme';
import { getBalance as getPointsBalance } from '@/lib/services/orvo-points';
import { getBalance as getWalletBalance } from '@/lib/services/wallet';

interface HubLink {
  href:
    | '/profile/points'
    | '/profile/wallet'
    | '/profile/notifications'
    | '/profile/accessibility'
    | '/profile/privacy'
    | '/profile/household';
  title: string;
  subtitle: string;
}

const LINKS: HubLink[] = [
  {
    href: '/profile/points',
    title: 'Orvo Points',
    subtitle: 'Loyalty balance and history',
  },
  {
    href: '/profile/wallet',
    title: 'Wallet',
    subtitle: 'Credit balance and ledger',
  },
  {
    href: '/profile/notifications',
    title: 'Notifications',
    subtitle: 'Channels and category opt-ins',
  },
  {
    href: '/profile/accessibility',
    title: 'Accessibility',
    subtitle: 'Theme, text size, motion, contrast',
  },
  {
    href: '/profile/privacy',
    title: 'Privacy',
    subtitle: 'Export or delete your data',
  },
  {
    href: '/profile/household',
    title: 'Household',
    subtitle: 'Members and roles',
  },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const [walletBalanceCents, setWalletBalanceCents] = useState<number | null>(
    null,
  );

  const loadSummary = useCallback(async () => {
    if (!user) return;
    const [pts, wal] = await Promise.all([
      getPointsBalance(user.id),
      getWalletBalance(user.id, 'USD'),
    ]);
    setPointsBalance(pts);
    setWalletBalanceCents(wal);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [loadSummary]),
  );

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your account</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? '—'}</Text>
          <View style={styles.divider} />
          <Text style={styles.label}>Member since</Text>
          <Text style={styles.value}>
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : '—'}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Points</Text>
            <Text style={styles.summaryValue}>
              {pointsBalance === null
                ? '—'
                : pointsBalance.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Wallet</Text>
            <Text style={styles.summaryValue}>
              {walletBalanceCents === null
                ? '—'
                : formatCurrency(walletBalanceCents)}
            </Text>
          </View>
        </View>

        <View style={styles.linkList}>
          {LINKS.map((link) => (
            <Pressable
              key={link.href}
              style={({ pressed }) => [
                styles.linkRow,
                pressed && styles.linkRowPressed,
              ]}
              onPress={() => router.push(link.href)}
            >
              <View style={styles.linkText}>
                <Text style={styles.linkTitle}>{link.title}</Text>
                <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: OrvoTheme.background },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: OrvoTheme.foreground,
    marginBottom: 20,
  },
  card: {
    backgroundColor: OrvoTheme.muted,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: { fontSize: 15, color: OrvoTheme.foreground, fontWeight: '500' },
  divider: {
    height: 1,
    backgroundColor: OrvoTheme.border,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: OrvoTheme.muted,
    padding: 16,
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '600',
    color: OrvoTheme.primary,
  },
  linkList: {
    backgroundColor: OrvoTheme.muted,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: OrvoTheme.border,
  },
  linkRowPressed: {
    backgroundColor: OrvoTheme.border,
  },
  linkText: { flex: 1 },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: OrvoTheme.foreground,
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 13,
    color: OrvoTheme.mutedForeground,
  },
  chevron: {
    fontSize: 22,
    color: OrvoTheme.mutedForeground,
    marginLeft: 8,
  },
  signOutBtn: {
    height: 48,
    backgroundColor: OrvoTheme.muted,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: OrvoTheme.destructive,
    fontSize: 15,
    fontWeight: '600',
  },
});
