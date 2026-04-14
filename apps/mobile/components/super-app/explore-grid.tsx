/**
 * Explore hub grid — shows one card per super-app category in a
 * 2-column layout. Tapping a card pushes to that category's screen.
 *
 * Mirrors the web app's `/explore` hub page (see
 * `apps/web/app/(super-app)/explore/page.tsx`). The card titles and
 * emoji come from `SUPER_APP_CONFIG` so the two stay in sync with a
 * single edit point.
 */
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { OrvoTheme } from '@/constants/orvo-theme';
import { SUPER_APP_CONFIG, SUPER_APP_ORDER } from '@/lib/super-app-config';

export function ExploreGrid() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>Orvo</Text>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>
          Every Orvo category, one search. Browse without signing in — log in
          only when you book, save, or check out.
        </Text>

        <View style={styles.grid}>
          {SUPER_APP_ORDER.map((key) => {
            const config = SUPER_APP_CONFIG[key];
            if (!config) return null;
            return (
              <Pressable
                key={key}
                style={styles.card}
                onPress={() => router.push(config.route as never)}
              >
                <Text style={styles.emoji}>{config.emoji}</Text>
                <Text style={styles.cardTitle}>{config.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={3}>
                  {config.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: OrvoTheme.background },
  content: { padding: 20, paddingBottom: 40 },
  brand: {
    fontSize: 22,
    fontWeight: '700',
    color: OrvoTheme.primary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: OrvoTheme.foreground,
  },
  subtitle: {
    fontSize: 15,
    color: OrvoTheme.mutedForeground,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: OrvoTheme.muted,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 160,
  },
  emoji: { fontSize: 32 },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: OrvoTheme.foreground,
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: OrvoTheme.mutedForeground,
    marginTop: 4,
    lineHeight: 16,
  },
});
