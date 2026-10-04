import SettingsRow from '@/components/molecules/settings_row';
import BottomNavigation from '@/components/organisms/bottom_nav';
import Header from '@/components/organisms/header';
import ProfileSummary from '@/components/organisms/profile_summary';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const PROFILE_SETTINGS = [
  { id: 'edit_profile', label: 'Edit Profile', icon: 'user', path: '/screens/settings_screen/edit_profile' },
  { id: 'change_password', label: 'Change Password', icon: 'lock', path: '/screens/settings_screen/change_pass' },
];

const GENERAL_SETTINGS = [
  { id: 'notifications', label: 'Notifications', icon: 'bell', path: '/screens/notifications' },
  { id: 'appearance', label: 'Appearance', icon: 'sun', path: '/screens/settings_screen/appearance' },
  { id: 'about', label: 'About', icon: 'info', path: '/screens/about' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/settings');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const meta = user?.user_metadata;
        setName(meta?.first_name ?? '');
        setAvatarUrl(meta?.avatar_url ?? null);
      };

      fetchUser();
    }, [])
  );

  const handleNavigate = (path) => {
    router.push(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.screen}>
      <Header title="Settings" onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileSummary name={name} avatarUrl={avatarUrl} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Settings</Text>
          <View style={styles.sectionCard}>
            {PROFILE_SETTINGS.map((item, index) => (
              <View key={item.id}>
                <SettingsRow
                  title={item.label}
                  onPress={() => handleNavigate(item.path)}
                />
                {index < PROFILE_SETTINGS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <View style={styles.sectionCard}>
            {GENERAL_SETTINGS.map((item, index) => (
              <View key={item.id}>
                <SettingsRow
                  title={item.label}
                  onPress={() => handleNavigate(item.path)}
                />
                {index < GENERAL_SETTINGS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={colors.error} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </Pressable>
      </ScrollView>

      <BottomNavigation activeTab="settings" onTabPress={(path) => router.replace(path)} />
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: 160,
    },
    section: {
      marginTop: spacing.lg,
    },
    sectionTitle: {
      ...typography.label,
      fontSize: 14,
      color: colors.navy,
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    sectionCard: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: spacing.md - 4,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md - 4,
      marginTop: spacing.lg,
    },
    logoutButtonText: {
      color: colors.error,
      fontWeight: '700',
      fontSize: 14,
      marginLeft: spacing.sm,
    },
  });