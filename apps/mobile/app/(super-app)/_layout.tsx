/**
 * Stack layout for super-app category screens (shop, eat, ride, etc.).
 * Route group name is stripped from the URL — `(super-app)/shop.tsx`
 * routes to `/shop`. Each category screen sets its own title via
 * `<Stack.Screen options={...} />`.
 */
import { Stack } from 'expo-router';
import { OrvoTheme } from '@/constants/orvo-theme';

export default function SuperAppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: OrvoTheme.background },
        headerTitleStyle: { color: OrvoTheme.foreground, fontWeight: '600' },
        headerTintColor: OrvoTheme.accent,
        headerShadowVisible: false,
      }}
    />
  );
}
