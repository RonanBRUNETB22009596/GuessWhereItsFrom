import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="game/[themeId]" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="game/results" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
    </Stack>
  );
}
