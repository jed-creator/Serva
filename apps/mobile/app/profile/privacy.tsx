import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { OrvoTheme } from '@/constants/orvo-theme';
import {
  listUserRequests,
  requestExport,
  requestDeletion,
  type PrivacyRequest,
} from '@/lib/services/privacy';

const STATUS_LABELS: Record<PrivacyRequest['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

/**
 * /profile/privacy — GDPR-style export + delete request UI. Mirrors
 * the web `/profile/privacy`. The actual export ZIP / deletion run
 * is built by a background worker (out of scope for Phase 8); this
 * screen just queues the request and lists prior requests with their
 * current status.
 */
export default function PrivacyScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<'export' | 'delete' | null>(
    null,
  );
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setRequests(await listUserRequests(user.id));
  }, [user]);

  useEffect(() => {
    setLoading(true);
    load().then(() => setLoading(false));
  }, [load]);

  const handleExport = async () => {
    if (!user) return;
    setSubmitting('export');
    try {
      await requestExport(user.id);
      await load();
      Alert.alert(
        'Export queued',
        "We'll email you when your data export is ready.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert("Couldn't queue export", message);
    } finally {
      setSubmitting(null);
    }
  };

  const handleDelete = () => {
    if (!user) return;
    Alert.alert(
      'Delete your account?',
      "We'll email you to confirm before any data is removed. Nothing is deleted instantly.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Queue deletion',
          style: 'destructive',
          onPress: async () => {
            setSubmitting('delete');
            try {
              await requestDeletion(user.id);
              await load();
              Alert.alert(
                'Deletion queued',
                "You'll receive a confirmation email shortly.",
              );
            } catch (err) {
              const message =
                err instanceof Error ? err.message : 'Unknown error';
              Alert.alert("Couldn't queue deletion", message);
            } finally {
              setSubmitting(null);
            }
          },
        },
      ],
    );
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: 'Privacy' }} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={OrvoTheme.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Download your data</Text>
            <Text style={styles.cardBody}>
              Get a copy of every Orvo row tied to your account — profile,
              bookings, reviews, loyalty, wallet, preferences, and household
              memberships.
            </Text>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnPrimary,
                submitting === 'export' && styles.btnDisabled,
              ]}
              disabled={submitting === 'export'}
              onPress={handleExport}
            >
              <Text style={styles.btnPrimaryText}>
                {submitting === 'export' ? 'Queuing…' : 'Request export'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delete your account</Text>
            <Text style={styles.cardBody}>
              Queue an account deletion. We&apos;ll email you to confirm
              before any data is removed — nothing is deleted instantly.
            </Text>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnDestructive,
                submitting === 'delete' && styles.btnDisabled,
              ]}
              disabled={submitting === 'delete'}
              onPress={handleDelete}
            >
              <Text style={styles.btnDestructiveText}>
                {submitting === 'delete'
                  ? 'Queuing…'
                  : 'Request account deletion'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionHeader}>Your privacy requests</Text>
          {requests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptySub}>
                You haven&apos;t made any privacy requests yet.
              </Text>
            </View>
          ) : (
            <View style={styles.requestList}>
              {requests.map((req) => (
                <View key={req.id} style={styles.requestRow}>
                  <View style={styles.requestText}>
                    <Text style={styles.requestKind}>
                      {req.kind === 'export'
                        ? 'Data export'
                        : 'Account deletion'}
                    </Text>
                    <Text style={styles.requestDate}>
                      Requested {fmt(req.requested_at)}
                    </Text>
                  </View>
                  <Text style={styles.statusBadge}>
                    {STATUS_LABELS[req.status]}
                  </Text>
                </View>
              ))}
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
  card: {
    backgroundColor: OrvoTheme.muted,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: OrvoTheme.foreground,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 13,
    color: OrvoTheme.mutedForeground,
    marginBottom: 14,
    lineHeight: 18,
  },
  btn: {
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: OrvoTheme.primary,
  },
  btnPrimaryText: {
    color: OrvoTheme.primaryForeground,
    fontSize: 14,
    fontWeight: '600',
  },
  btnDestructive: {
    backgroundColor: OrvoTheme.background,
    borderWidth: 1,
    borderColor: OrvoTheme.destructive,
  },
  btnDestructiveText: {
    color: OrvoTheme.destructive,
    fontSize: 14,
    fontWeight: '600',
  },
  btnDisabled: { opacity: 0.6 },
  sectionHeader: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 4,
  },
  emptyCard: {
    backgroundColor: OrvoTheme.muted,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: OrvoTheme.mutedForeground,
    textAlign: 'center',
  },
  requestList: {
    backgroundColor: OrvoTheme.muted,
    borderRadius: 12,
    overflow: 'hidden',
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: OrvoTheme.border,
  },
  requestText: { flex: 1, marginRight: 12 },
  requestKind: {
    fontSize: 14,
    color: OrvoTheme.foreground,
    fontWeight: '600',
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: OrvoTheme.foreground,
    backgroundColor: OrvoTheme.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
