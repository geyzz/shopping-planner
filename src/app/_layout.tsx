import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/theme/ThemeContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

function ThemedStack() {
  // Adjust to whatever your context exposes (isDark, theme, resolvedScheme, etc.)
  const { isDark } = useAppTheme();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppThemeProvider>
      <ThemedStack />
    </AppThemeProvider>
  );
}