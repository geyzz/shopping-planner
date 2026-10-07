import { initNotifications } from '@/lib/notifications';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/theme/ThemeContext';
import * as Notifications from 'expo-notifications';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

function ThemedStack() {
  const { isDark, colors } = useAppTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.background,
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeProvider value={navTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 200,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="auth/login" options={{ animation: 'none' }} />
          <Stack.Screen name="screens/home" options={{ animation: 'none' }} />
          <Stack.Screen name="screens/calendar" options={{ animation: 'none' }} />
          <Stack.Screen name="screens/settings" options={{ animation: 'none' }} />
        </Stack>
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync();
    initNotifications();

    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/screens/notif');
    });

    return () => {
      sub.remove();
    };
  }, [router]);

  return (
    <AppThemeProvider>
      <ThemedStack />
    </AppThemeProvider>
  );
}