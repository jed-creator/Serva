import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { OrvoTheme } from '@/constants/orvo-theme';
import {
  getSettings,
  upsertSettings,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  type AccessibilitySettings,
  type ThemePreference,
} from '@/lib/services/accessibility';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const FONT_SCALE_STEPS = [0.75, 0.9, 1.0, 1.15, 1.3, 1.5, 1.75, 2.0];

/**
 * /profile/accessibility — single form mapped 1:1 to the
 * accessibility_settings row. Mirrors the web `/profile/accessibility`.
 *
 * Mobile picks discrete font-scale steps (matched to the web slider's
 * 0.75–2.0 range) instead of a true range slider — there's no
 * cross-platform RN range input and a discrete step list is friendlier
 * on touch anyway.
 */
export default function AccessibilityScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(
    DEFAULT_ACCESSIBILITY_SETTINGS,
  );
  const [savedFlash, setSavedFlash] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const next = await getSettings(user.id);
    setSettings(next);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    load().then(() => setLoading(false));
  }, [load]);

  const updateField = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const next = await upsertSettings(user.id, settings);
      setSettings(next);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert("Couldn't save settings", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{ headerShown: true, title: 'Accessibility' }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={OrvoTheme.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.intro}>
            Tune how Orvo looks and feels. Settings apply across web and
            mobile the next time you sign in.
          </Text>

          {savedFlash && (
            <View style={styles.savedBanner}>
              <Text style={styles.savedText}>Settings saved.</Text>
            </View>
          )}

          {/* Theme */}
          <Text style={styles.label}>Theme</Text>
          <View style={styles.segment}>
            {THEME_OPTIONS.map((opt) => {
              const active = settings.theme === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => updateField('theme', opt.value)}
                  style={[
                    styles.segmentItem,
                    active && styles.segmentItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Font scale */}
          <Text style={styles.label}>
            Text size ({settings.font_scale.toFixed(2)}×)
          </Text>
          <View style={styles.scaleList}>
            {FONT_SCALE_STEPS.map((step) => {
              const active = Math.abs(settings.font_scale - step) < 0.001;
              return (
                <Pressable
                  key={step}
                  onPress={() => updateField('font_scale', step)}
                  style={[
                    styles.scaleItem,
                    active && styles.scaleItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.scaleText,
                      active && styles.scaleTextActive,
                    ]}
                  >
                    {step.toFixed(2)}×
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Reduced motion */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Reduce motion</Text>
              <Text style={styles.toggleSub}>
                Minimize transitions and animations.
              </Text>
            </View>
            <Switch
              value={settings.reduced_motion}
              onValueChange={(v) => updateField('reduced_motion', v)}
              trackColor={{
                false: OrvoTheme.border,
                true: OrvoTheme.accent,
              }}
              thumbColor={OrvoTheme.background}
            />
          </View>

          {/* High contrast */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>High contrast</Text>
              <Text style={styles.toggleSub}>
                Use higher-contrast colors throughout the app.
              </Text>
            </View>
            <Switch
              value={settings.high_contrast}
              onValueChange={(v) => updateField('high_contrast', v)}
              trackColor={{
                false: OrvoTheme.border,
                true: OrvoTheme.accent,
              }}
              thumbColor={OrvoTheme.background}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            disabled={saving}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>
              {saving ? 'Saving…' : 'Save settings'}
            </Text>
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  savedBanner: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  savedText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: OrvoTheme.foreground,
    marginBottom: 8,
    marginTop: 8,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: OrvoTheme.muted,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentItemActive: {
    backgroundColor: OrvoTheme.background,
  },
  segmentText: {
    fontSize: 14,
    color: OrvoTheme.mutedForeground,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: OrvoTheme.primary,
    fontWeight: '600',
  },
  scaleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  scaleItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: OrvoTheme.muted,
    borderRadius: 8,
  },
  scaleItemActive: {
    backgroundColor: OrvoTheme.accent,
  },
  scaleText: {
    fontSize: 13,
    color: OrvoTheme.foreground,
    fontWeight: '500',
  },
  scaleTextActive: {
    color: OrvoTheme.accentForeground,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OrvoTheme.muted,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  toggleText: { flex: 1, marginRight: 12 },
  toggleTitle: {
    fontSize: 15,
    color: OrvoTheme.foreground,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleSub: {
    fontSize: 13,
    color: OrvoTheme.mutedForeground,
  },
  saveBtn: {
    height: 50,
    backgroundColor: OrvoTheme.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: {
    color: OrvoTheme.primaryForeground,
    fontSize: 15,
    fontWeight: '600',
  },
});
