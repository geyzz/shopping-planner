import AppLogo from '@/components/atoms/app_logo';
import Button from '@/components/atoms/button';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EmailVerifiedPage() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session && mounted) {
        setHasSession(true);
        router.replace('/screens/home');
      }
    });

    // Listen for auth state change
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && mounted) {
        setHasSession(true);
        router.replace('/screens/home');
      }
    });

    // Check if Supabase passed session tokens or code in deep link
    const handleUrl = async (url) => {
      if (!url) return;
      try {
        // 1. Check query parameters (?code=... or ?token_hash=...)
        const queryString = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
        if (queryString) {
          const queryParams = new URLSearchParams(queryString);
          const code = queryParams.get('code');
          if (code) {
            const { data } = await supabase.auth.exchangeCodeForSession(code);
            if (data?.session && mounted) {
              setHasSession(true);
              router.replace('/screens/home');
              return;
            }
          }

          const tokenHash = queryParams.get('token_hash');
          const type = queryParams.get('type') || 'signup';
          if (tokenHash) {
            const { data } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
            if (data?.session && mounted) {
              setHasSession(true);
              router.replace('/screens/home');
              return;
            }
          }
        }

        // 2. Check hash fragment (#access_token=...&refresh_token=...)
        const hash = url.includes('#') ? url.split('#')[1] : '';
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            const { data } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (data?.session && mounted) {
              setHasSession(true);
              router.replace('/screens/home');
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Deep link handling error:', err);
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', (event) => handleUrl(event.url));
    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
      subscription.remove();
    };
  }, [router]);

  const handleProceed = () => {
    if (hasSession) {
      router.replace('/screens/home');
    } else {
      router.replace('/auth/login');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <AppLogo height={Math.round((screenHeight || 800) * 0.03)} />
        </View>

        <View style={styles.iconCircle}>
          <Feather name="check" size={36} color={colors.gold || '#D4AF37'} />
        </View>

        <Text style={styles.title}>Email Verified!</Text>
        <Text style={styles.message}>
          Your email address has been successfully confirmed. Your Plan_.ed account is now ready to use.
        </Text>

        <View style={styles.buttonWrapper}>
          <Button
            title={hasSession ? 'Go to Home' : 'Proceed to Login'}
            onPress={handleProceed}
            variant="gold"
          />
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.xl + 4,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    logoContainer: {
      marginBottom: spacing.lg,
      alignItems: 'center',
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.card || '#F5F2EB',
      borderWidth: 2,
      borderColor: colors.gold || '#D4AF37',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      ...typography.heading,
      fontSize: 22,
      fontWeight: '700',
      color: colors.navy,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    message: {
      ...typography.body,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.xs,
    },
    buttonWrapper: {
      width: '100%',
    },
  });
