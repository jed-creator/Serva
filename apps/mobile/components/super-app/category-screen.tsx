/**
 * Reusable super-app category screen.
 *
 * Every category (shop, eat, ride, trips, tickets, market, book,
 * compare) has a one-line route file under `app/(super-app)/` that
 * imports this component and passes a config key. The screen runs a
 * fan-out search against `/api/<category>/search` via
 * `super-app-api.ts` and renders results in a `FlatList`.
 *
 * The scaffold is intentionally minimal — real per-category UX (seat
 * maps, itinerary builder, dietary filters, etc.) lands in Phase 6+
 * per the Feature Outline. This is the mobile counterpart to
 * `apps/web/app/(<category>)/<category>/page.tsx`.
 */
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import { OrvoTheme } from '@/constants/orvo-theme';
import { searchCategory } from '@/lib/super-app-api';
import type { NormalizedSearchResult } from '@/lib/super-app-types';
import { SUPER_APP_CONFIG } from '@/lib/super-app-config';

interface CategoryScreenProps {
  categoryKey: string;
}

export function CategoryScreen({ categoryKey }: CategoryScreenProps) {
  const config = SUPER_APP_CONFIG[categoryKey];
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NormalizedSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Kick off an empty-query search on mount so the screen shows
  // whatever the adapters return for "no filter" (currently nothing
  // from stubs — but the reference adapters may return mock data).
  useEffect(() => {
    void runSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey]);

  async function runSearch(text: string) {
    setLoading(true);
    setSearched(true);
    const data = await searchCategory(categoryKey, text);
    setResults(data);
    setLoading(false);
  }

  if (!config) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Unknown category: {categoryKey}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: config.title }} />

      <View style={styles.header}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${config.title.toLowerCase()}…`}
          placeholderTextColor={OrvoTheme.mutedForeground}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => void runSearch(query)}
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={OrvoTheme.accent} />
        </View>
      ) : !searched ? null : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No results yet. Try a different search, or check back once
            real adapters are connected.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => `${item.provider}-${item.id}-${idx}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ResultCard result={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function ResultCard({ result }: { result: NormalizedSearchResult }) {
  const priceLabel =
    typeof result.priceCents === 'number'
      ? `$${(result.priceCents / 100).toFixed(2)}${
          result.currency && result.currency !== 'USD' ? ` ${result.currency}` : ''
        }`
      : null;

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        if (result.externalUrl) {
          void Linking.openURL(result.externalUrl);
        }
      }}
    >
      <Text style={styles.provider}>{result.provider}</Text>
      <Text style={styles.cardTitle}>{result.title}</Text>
      {result.subtitle && (
        <Text style={styles.cardSubtitle}>{result.subtitle}</Text>
      )}
      {result.description && (
        <Text style={styles.cardDesc} numberOfLines={2}>
          {result.description}
        </Text>
      )}
      <View style={styles.cardFooter}>
        {priceLabel && <Text style={styles.price}>{priceLabel}</Text>}
        {typeof result.rating === 'number' && (
          <Text style={styles.rating}>
            ★ {result.rating.toFixed(1)}
            {typeof result.reviewCount === 'number' ? (
              <Text style={styles.reviewCount}>
                {' '}
                ({result.reviewCount})
              </Text>
            ) : null}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: OrvoTheme.background },
  header: { padding: 20, paddingBottom: 12, gap: 8 },
  emoji: { fontSize: 36 },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: OrvoTheme.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: OrvoTheme.mutedForeground,
    marginBottom: 8,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: OrvoTheme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: OrvoTheme.foreground,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: OrvoTheme.mutedForeground,
    textAlign: 'center',
  },
  list: { padding: 20, paddingTop: 0, gap: 12 },
  card: {
    backgroundColor: OrvoTheme.muted,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  provider: {
    fontSize: 11,
    fontWeight: '600',
    color: OrvoTheme.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: OrvoTheme.foreground,
    marginTop: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: OrvoTheme.mutedForeground,
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 14,
    color: OrvoTheme.mutedForeground,
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: OrvoTheme.foreground,
  },
  rating: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
  },
  reviewCount: {
    color: OrvoTheme.mutedForeground,
    fontWeight: '400',
  },
});
