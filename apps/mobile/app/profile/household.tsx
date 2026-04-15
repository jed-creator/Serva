import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { OrvoTheme } from '@/constants/orvo-theme';
import {
  getOwnedHousehold,
  listMembers,
  createHousehold,
  addMember,
  removeMember,
  type Household,
  type HouseholdMember,
  type HouseholdRole,
} from '@/lib/services/household';

const ROLE_LABELS: Record<HouseholdRole, string> = {
  owner: 'Owner',
  adult: 'Adult',
  child: 'Child',
};

/**
 * /profile/household — owner-side household management. If the user
 * doesn't own a household yet, shows the create form; otherwise shows
 * the member list with add/remove actions. Mirrors the web
 * `/profile/household`.
 *
 * Phase 8 uses raw user UUIDs for member adds — a full invite-by-email
 * flow lives in a future phase.
 */
export default function HouseholdScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);

  const [name, setName] = useState('');
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'adult' | 'child'>(
    'adult',
  );

  const load = useCallback(async () => {
    if (!user) return;
    const h = await getOwnedHousehold(user.id);
    setHousehold(h);
    if (h) {
      setMembers(await listMembers(h.id));
    } else {
      setMembers([]);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    load().then(() => setLoading(false));
  }, [load]);

  const handleCreate = async () => {
    if (!user) return;
    if (!name.trim()) {
      Alert.alert('Name required', 'Pick a name for your household.');
      return;
    }
    setSubmitting(true);
    try {
      await createHousehold(user.id, name.trim());
      setName('');
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert("Couldn't create household", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!household) return;
    if (!newMemberId.trim()) {
      Alert.alert('User ID required', 'Paste an Orvo user ID to add.');
      return;
    }
    setSubmitting(true);
    try {
      await addMember(household.id, newMemberId.trim(), newMemberRole);
      setNewMemberId('');
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert("Couldn't add member", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = (member: HouseholdMember) => {
    if (!household) return;
    Alert.alert(
      'Remove member?',
      `${member.user_id} will lose access to this household.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(household.id, member.user_id);
              await load();
            } catch (err) {
              const message =
                err instanceof Error ? err.message : 'Unknown error';
              Alert.alert("Couldn't remove member", message);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: 'Household' }} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={OrvoTheme.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {!household ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create a household</Text>
              <Text style={styles.cardBody}>
                A household lets you share Orvo Points, wallet credit, and
                bookings with the people you live with.
              </Text>
              <Text style={styles.label}>Household name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="The Smiths"
                placeholderTextColor={OrvoTheme.mutedForeground}
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.btnPrimary,
                  submitting && styles.btnDisabled,
                ]}
                disabled={submitting}
                onPress={handleCreate}
              >
                <Text style={styles.btnPrimaryText}>
                  {submitting ? 'Creating…' : 'Create household'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{household.name}</Text>
                <Text style={styles.cardBody}>
                  You are the owner. Created{' '}
                  {new Date(household.created_at).toLocaleDateString()}.
                </Text>

                <Text style={styles.sectionHeader}>
                  Members ({members.length})
                </Text>
                <View style={styles.memberList}>
                  {members.map((member) => {
                    const isOwner = member.role === 'owner';
                    return (
                      <View key={member.id} style={styles.memberRow}>
                        <View style={styles.memberText}>
                          <Text style={styles.memberId}>{member.user_id}</Text>
                          <Text style={styles.memberMeta}>
                            {ROLE_LABELS[member.role]} · joined{' '}
                            {new Date(
                              member.created_at,
                            ).toLocaleDateString()}
                          </Text>
                        </View>
                        {isOwner ? (
                          <Text style={styles.youBadge}>You</Text>
                        ) : (
                          <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => handleRemove(member)}
                          >
                            <Text style={styles.removeText}>Remove</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Add a member</Text>
                <Text style={styles.cardBody}>
                  Paste the Orvo user ID of the person you want to add.
                  Email-based invites are coming in a later phase.
                </Text>

                <Text style={styles.label}>User ID</Text>
                <TextInput
                  style={styles.input}
                  value={newMemberId}
                  onChangeText={setNewMemberId}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  placeholderTextColor={OrvoTheme.mutedForeground}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Text style={styles.label}>Role</Text>
                <View style={styles.segment}>
                  {(['adult', 'child'] as const).map((role) => {
                    const active = newMemberRole === role;
                    return (
                      <Pressable
                        key={role}
                        style={[
                          styles.segmentItem,
                          active && styles.segmentItemActive,
                        ]}
                        onPress={() => setNewMemberRole(role)}
                      >
                        <Text
                          style={[
                            styles.segmentText,
                            active && styles.segmentTextActive,
                          ]}
                        >
                          {ROLE_LABELS[role]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[
                    styles.btn,
                    styles.btnPrimary,
                    submitting && styles.btnDisabled,
                  ]}
                  disabled={submitting}
                  onPress={handleAddMember}
                >
                  <Text style={styles.btnPrimaryText}>
                    {submitting ? 'Adding…' : 'Add member'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
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
  label: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 46,
    borderRadius: 10,
    backgroundColor: OrvoTheme.background,
    borderWidth: 1,
    borderColor: OrvoTheme.border,
    paddingHorizontal: 14,
    fontSize: 14,
    color: OrvoTheme.foreground,
    marginBottom: 12,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: OrvoTheme.background,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: OrvoTheme.border,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentItemActive: { backgroundColor: OrvoTheme.muted },
  segmentText: {
    fontSize: 14,
    color: OrvoTheme.mutedForeground,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: OrvoTheme.primary,
    fontWeight: '600',
  },
  btn: {
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: OrvoTheme.primary },
  btnPrimaryText: {
    color: OrvoTheme.primaryForeground,
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
    marginTop: 4,
  },
  memberList: {
    backgroundColor: OrvoTheme.background,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: OrvoTheme.border,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: OrvoTheme.border,
  },
  memberText: { flex: 1, marginRight: 12 },
  memberId: {
    fontSize: 12,
    color: OrvoTheme.foreground,
    fontWeight: '500',
    fontFamily: 'Menlo',
  },
  memberMeta: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
    marginTop: 2,
  },
  youBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: OrvoTheme.border,
  },
  removeText: {
    fontSize: 12,
    color: OrvoTheme.destructive,
    fontWeight: '600',
  },
});
